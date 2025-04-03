/* jslint esversion: 8 */
const apiMap = {
  'benefits_claims': 'https://api.va.gov/v0/benefits_claims',
  'appeals': 'https://api.va.gov/v0/appeals',
  'rated_disabilities': 'https://api.va.gov/v0/rated_disabilities',
  'user': 'https://api.va.gov/v0/user',
  'maintenance_windows': 'https://api.va.gov/v0/maintenance_windows/',
  'backend_statuses': 'https://api.va.gov/v0/backend_statuses',
  'vamc_ehr': 'https://www.va.gov/data/cms/vamc-ehr.json'
};

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({ apiData: {} }, (data) => {
    populateTabs(data.apiData);
  });

  document.getElementById('refreshBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'refreshAPIs' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Message sent, no immediate response expected');
      }
      if (response && response.type === 'apiDataReady') {
        console.log('Refreshed API data:', response.apiData);
        populateTabs(response.apiData);
      } else if (response && response.type === 'apiDataError') {
        console.error('Refresh error:', response.error);
        populateTabs({});
      }
    });
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'clearData' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Message sent, no immediate response expected');
      }
      if (response && response.status === 'cleared') {
        console.log('Canvas cleared');
        populateTabs({});
      }
    });
  });

  document.getElementById('exportPdfBtn').addEventListener('click', () => {
    chrome.storage.local.get({ apiData: {} }, (data) => {
      exportSinglePdf(data.apiData);
    });
  });

  document.getElementById('exportAllPdfBtn').addEventListener('click', () => {
    chrome.storage.local.get({ apiData: {} }, (data) => {
      exportAllPdfs(data.apiData);
    });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'apiDataReady') {
      console.log('Received initial API data:', message.apiData);
      populateTabs(message.apiData);
    } else if (message.type === 'apiDataError') {
      console.error('Initial fetch error:', message.error);
      populateTabs({});
    }
  });
});

function populateTabs(apiData) {
  const tabList = document.getElementById('apiTabs');
  const tabContent = document.getElementById('apiTabContent');
  tabList.innerHTML = '';
  tabContent.innerHTML = '';

  const benefitsTabId = 'benefits_claims';
  const benefitsUrl = apiMap[benefitsTabId];
  const benefitsClaimsData = apiData[benefitsUrl];

  const benefitsTabName = 'benefits-claims';
  const benefitsTabHtml = `
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="${benefitsTabName}-tab" data-bs-toggle="tab" data-bs-target="#${benefitsTabName}" type="button" role="tab" aria-controls="${benefitsTabName}" aria-selected="true">BENEFITS CLAIMS</button>
    </li>`;
  let benefitsContentHtml = `
    <div class="tab-pane fade show active" id="${benefitsTabName}" role="tabpanel" aria-labelledby="${benefitsTabName}-tab">
      <hr>
      <button class="btn btn-outline-secondary btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#rawData_${benefitsTabId}" aria-expanded="false" aria-controls="rawData_${benefitsTabId}">
        Show Raw Data
      </button>
      <div class="collapse" id="rawData_${benefitsTabId}">
        <pre id="data_${benefitsTabId}">Queried API: ${benefitsUrl}\n${benefitsClaimsData ? `${benefitsClaimsData.data}\n\nLast updated: ${benefitsClaimsData.timestamp}` : 'No data available. Click "Refresh" to fetch.'}</pre>
      </div>`;

  if (benefitsClaimsData) {
    try {
      const parsedData = JSON.parse(benefitsClaimsData.data);
      const claims = parsedData.data || [];

      if (claims.length > 0) {
        benefitsContentHtml += `
          <h3 class="mt-3">Claim Overview</h3>
          <div class="table-responsive">
            <table class="table table-striped table-bordered mt-2" id="claimOverviewTable" style="width: 100%;">
              <thead class="thead-dark">
                <tr>
                  <th scope="col" class="sortable" data-sort="id">ID <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="type">Type <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="claimType">Claim Type <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="claimTypeCode">Claim Type Code <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="closeDate">Close Date <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                </tr>
              </thead>
              <tbody>`;
        claims.forEach(claim => {
          const attrs = claim.attributes || {};
          benefitsContentHtml += `
            <tr>
              <td>${claim.id || 'N/A'}</td>
              <td>${claim.type || 'N/A'}</td>
              <td>${attrs.claimType || 'N/A'}</td>
              <td>${attrs.claimTypeCode || 'N/A'}</td>
              <td>${attrs.closeDate || 'N/A'}</td>
              <td>${attrs.status || 'N/A'}</td>
            </tr>`;
        });
        benefitsContentHtml += `
              </tbody>
            </table>
          </div>`;

        benefitsContentHtml += `
          <h3 class="mt-3">Attributes</h3>
          <div class="table-responsive">
            <table class="table table-striped table-bordered mt-2" id="attributesTable" style="width: 100%;">
              <thead class="thead-dark">
                <tr>
                  <th scope="col" class="sortable" data-sort="baseEndProductCode">Base End Product Code <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="claimDate">Claim Date <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="phaseChangeDate">Phase Change Date <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="phaseType">Phase Type <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="claimType">Claim Type <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="claimTypeCode">Claim Type Code <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="closeDate">Close Date <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="decisionLetterSent">Decision Letter Sent <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="developmentLetterSent">Development Letter Sent <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="documentsNeeded">Documents Needed <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="endProductCode">End Product Code <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="evidenceWaiverSubmitted5103">Evidence Waiver Submitted 5103 <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="lighthouseId">Lighthouse ID <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                </tr>
              </thead>
              <tbody>`;
        claims.forEach(claim => {
          const attrs = claim.attributes || {};
          const phaseDates = attrs.claimPhaseDates || {};
          benefitsContentHtml += `
            <tr>
              <td>${attrs.baseEndProductCode || 'N/A'}</td>
              <td>${attrs.claimDate || 'N/A'}</td>
              <td>${phaseDates.phaseChangeDate || 'N/A'}</td>
              <td>${phaseDates.phaseType || 'N/A'}</td>
              <td>${attrs.claimType || 'N/A'}</td>
              <td>${attrs.claimTypeCode || 'N/A'}</td>
              <td>${attrs.closeDate || 'N/A'}</td>
              <td>${attrs.decisionLetterSent !== undefined ? attrs.decisionLetterSent : 'N/A'}</td>
              <td>${attrs.developmentLetterSent !== undefined ? attrs.developmentLetterSent : 'N/A'}</td>
              <td>${attrs.documentsNeeded !== undefined ? attrs.documentsNeeded : 'N/A'}</td>
              <td>${attrs.endProductCode || 'N/A'}</td>
              <td>${attrs.evidenceWaiverSubmitted5103 !== undefined ? attrs.evidenceWaiverSubmitted5103 : 'N/A'}</td>
              <td>${attrs.lighthouseId || 'N/A'}</td>
              <td>${attrs.status || 'N/A'}</td>
            </tr>`;
        });
        benefitsContentHtml += `
              </tbody>
            </table>
          </div>`;

        benefitsContentHtml += `
          <h3 class="mt-3">Claim Details</h3>
          <div class="table-responsive">
            <table class="table table-striped table-bordered mt-2" id="claimDetailsTable" style="width: 100%;">
              <thead class="thead-dark">
                <tr>
                  <th scope="col" class="sortable" data-sort="decisionLetterSent">Decision Letter Sent <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="developmentLetterSent">Development Letter Sent <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="documentsNeeded">Documents Needed <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="endProductCode">End Product Code <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="evidenceWaiverSubmitted5103">Evidence Waiver Submitted 5103 <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="lighthouseId">Lighthouse ID <span class="sort-arrow"></span></th>
                </tr>
              </thead>
              <tbody>`;
        claims.forEach(claim => {
          const attrs = claim.attributes || {};
          benefitsContentHtml += `
            <tr>
              <td>${attrs.decisionLetterSent !== undefined ? attrs.decisionLetterSent : 'N/A'}</td>
              <td>${attrs.developmentLetterSent !== undefined ? attrs.developmentLetterSent : 'N/A'}</td>
              <td>${attrs.documentsNeeded !== undefined ? attrs.documentsNeeded : 'N/A'}</td>
              <td>${attrs.endProductCode || 'N/A'}</td>
              <td>${attrs.evidenceWaiverSubmitted5103 !== undefined ? attrs.evidenceWaiverSubmitted5103 : 'N/A'}</td>
              <td>${attrs.lighthouseId || 'N/A'}</td>
            </tr>`;
        });
        benefitsContentHtml += `
              </tbody>
            </table>
          </div>`;
      }
    } catch (e) {
      console.error('Error parsing benefits_claims for tables:', e);
      benefitsContentHtml += `<p class="text-danger mt-3">Error parsing benefits claims data</p>`;
    }
  }
  benefitsContentHtml += `</div>`;
  tabList.insertAdjacentHTML('beforeend', benefitsTabHtml);
  tabContent.insertAdjacentHTML('beforeend', benefitsContentHtml);

  if (benefitsClaimsData && benefitsClaimsData.data) {
    try {
      const parsedData = JSON.parse(benefitsClaimsData.data);
      const claimIds = parsedData.data.map(item => item.id);
      claimIds.forEach(id => {
        const claimUrl = `https://api.va.gov/v0/benefits_claims/${id}`;
        const tabId = `claim-${id}`;
        const tabName = `claim-${id}`;
        const tabHtml = `
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="${tabName}-tab" data-bs-toggle="tab" data-bs-target="#${tabName}" type="button" role="tab" aria-controls="${tabName}" aria-selected="false">Claim ${id}</button>
          </li>`;

        let contentHtml = `
          <div class="tab-pane fade" id="${tabName}" role="tabpanel" aria-labelledby="${tabName}-tab">
            <hr>
            <button class="btn btn-outline-secondary btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#rawData_${tabId}" aria-expanded="false" aria-controls="rawData_${tabId}">
              Show Raw Data
            </button>
            <div class="collapse" id="rawData_${tabId}">
              <pre id="data_${tabId}">Queried API: ${claimUrl}\n${apiData[claimUrl] ? `${apiData[claimUrl].data}\n\nLast updated: ${apiData[claimUrl].timestamp}` : 'No data available. Click "Refresh" to fetch.'}</pre>
            </div>`;

        if (apiData[claimUrl]) {
          try {
            const parsedClaimData = JSON.parse(apiData[claimUrl].data);
            const claimData = parsedClaimData.data || {};
            const attrs = claimData.attributes || {};

            contentHtml += `
              <h3 class="mt-3">Claim Summary</h3>
              <div class="table-responsive">
                <table class="table table-striped table-bordered mt-2" id="claimSummaryTable_${id}" style="width: 100%;">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col" class="sortable" data-sort="id">ID <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="claimTypeCode">Claim Type Code <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="claimDate">Claim Date <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="claimType">Claim Type <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="closeDate">Close Date <span class="sort-arrow"></span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${claimData.id || 'N/A'}</td>
                      <td>${attrs.claimTypeCode || 'N/A'}</td>
                      <td>${attrs.claimDate || 'N/A'}</td>
                      <td>${attrs.claimType || 'N/A'}</td>
                      <td>${attrs.closeDate || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>`;

            const contentions = attrs.contentions || [];
            if (contentions.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Contentions</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="contentionsTable_${id}" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="name">Name <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              contentions.forEach(contention => {
                contentHtml += `
                  <tr>
                    <td>${contention.name || 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }

            contentHtml += `
              <h3 class="mt-3">Claim Details</h3>
              <div class="table-responsive">
                <table class="table table-striped table-bordered mt-2" id="claimDetailsTable_${id}" style="width: 100%;">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col" class="sortable" data-sort="decisionLetterSent">Decision Letter Sent <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="developmentLetterSent">Development Letter Sent <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="documentsNeeded">Documents Needed <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="endProductCode">End Product Code <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="evidenceWaiverSubmitted5103">Evidence Waiver Submitted 5103 <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="errors">Errors <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="jurisdiction">Jurisdiction <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="lighthouseId">Lighthouse ID <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="maxEstClaimDate">Max Est Claim Date <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="minEstClaimDate">Min Est Claim Date <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="submitterApplicationCode">Submitter Application Code <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="submitterRoleCode">Submitter Role Code <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="tempJurisdiction">Temp Jurisdiction <span class="sort-arrow"></span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${attrs.decisionLetterSent !== undefined ? attrs.decisionLetterSent : 'N/A'}</td>
                      <td>${attrs.developmentLetterSent !== undefined ? attrs.developmentLetterSent : 'N/A'}</td>
                      <td>${attrs.documentsNeeded !== undefined ? attrs.documentsNeeded : 'N/A'}</td>
                      <td>${attrs.endProductCode || 'N/A'}</td>
                      <td>${attrs.evidenceWaiverSubmitted5103 !== undefined ? attrs.evidenceWaiverSubmitted5103 : 'N/A'}</td>
                      <td>${attrs.errors && attrs.errors.length > 0 ? attrs.errors.join(', ') : 'N/A'}</td>
                      <td>${attrs.jurisdiction || 'N/A'}</td>
                      <td>${attrs.lighthouseId || 'N/A'}</td>
                      <td>${attrs.maxEstClaimDate || 'N/A'}</td>
                      <td>${attrs.minEstClaimDate || 'N/A'}</td>
                      <td>${attrs.status || 'N/A'}</td>
                      <td>${attrs.submitterApplicationCode || 'N/A'}</td>
                      <td>${attrs.submitterRoleCode || 'N/A'}</td>
                      <td>${attrs.tempJurisdiction || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>`;

            const supportingDocs = attrs.supportingDocuments || [];
            if (supportingDocs.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Supporting Documents</h3>
                <button id="downloadAllDocs_${id}" class="btn btn-primary btn-sm mb-2">Download All Documents</button>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="supportingDocsTable_${id}" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="documentId">Document ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="documentTypeLabel">Document Type Label <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="originalFileName">Original File Name <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="trackedItemId">Tracked Item ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="uploadDate">Upload Date <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              supportingDocs.forEach(doc => {
                const documentId = (doc.documentId || 'N/A').toUpperCase().replace(/[{}]/g, '');
                const downloadUrl = `https://eauth.va.gov/VONAPP2/wss-document-services-web-3.7/rest/documents/documentId/%7B${documentId}%7D/documentName/${documentId}.pdf`;
                contentHtml += `
                  <tr>
                    <td><a href="${downloadUrl}" target="_blank">${documentId}</a></td>
                    <td>${doc.documentTypeLabel || 'N/A'}</td>
                    <td>${doc.originalFileName || 'N/A'}</td>
                    <td>${doc.trackedItemId || 'N/A'}</td>
                    <td>${doc.uploadDate || 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }

            const trackedItems = attrs.trackedItems || [];
            if (trackedItems.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Tracked Items</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="trackedItemsTable_${id}" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="closedDate">Closed Date <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="description">Description <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="displayName">Display Name <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="overdue">Overdue <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="receivedDate">Received Date <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="requestedDate">Requested Date <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="suspenseDate">Suspense Date <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="id">ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="uploadsAllowed">Uploads Allowed <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              trackedItems.forEach(item => {
                contentHtml += `
                  <tr>
                    <td>${item.closedDate || 'N/A'}</td>
                    <td>${item.description || 'N/A'}</td>
                    <td>${item.displayName || 'N/A'}</td>
                    <td>${item.overdue !== undefined ? item.overdue : 'N/A'}</td>
                    <td>${item.receivedDate || 'N/A'}</td>
                    <td>${item.requestedDate || 'N/A'}</td>
                    <td>${item.status || 'N/A'}</td>
                    <td>${item.suspenseDate || 'N/A'}</td>
                    <td>${item.id || 'N/A'}</td>
                    <td>${item.uploadsAllowed !== undefined ? item.uploadsAllowed : 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }
          } catch (e) {
            console.error(`Error parsing claim ${id} for tables:`, e);
            contentHtml += `<p class="text-danger mt-3">Error parsing claim data</p>`;
          }
        }
        contentHtml += `</div>`;
        tabList.insertAdjacentHTML('beforeend', tabHtml);
        tabContent.insertAdjacentHTML('beforeend', contentHtml);

        // Add event listener for the "Download All Documents" button
        if (supportingDocs.length > 0) {
          document.getElementById(`downloadAllDocs_${id}`).addEventListener('click', () => {
            supportingDocs.forEach(doc => {
              const documentId = (doc.documentId || 'N/A').toUpperCase().replace(/[{}]/g, '');
              const downloadUrl = `https://eauth.va.gov/VONAPP2/wss-document-services-web-3.7/rest/documents/documentId/%7B${documentId}%7D/documentName/${documentId}.pdf`;
              window.open(downloadUrl, '_blank');
            });
          });
        }
      });
    } catch (e) {
      console.error('Error parsing benefits_claims for claim IDs:', e);
    }
  }

  // Add remaining base API tabs (including VAMC EHR)
  for (const [tabId, url] of Object.entries(apiMap)) {
    if (tabId !== 'benefits_claims') {
      const tabName = tabId.replace(/_/g, '-');
      const tabHtml = `
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="${tabName}-tab" data-bs-toggle="tab" data-bs-target="#${tabName}" type="button" role="tab" aria-controls="${tabName}" aria-selected="false">${tabId.replace(/_/g, ' ').toUpperCase()}</button>
        </li>`;
      let contentHtml = `
        <div class="tab-pane fade" id="${tabName}" role="tabpanel" aria-labelledby="${tabName}-tab">
          <hr>
          <button class="btn btn-outline-secondary btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#rawData_${tabId}" aria-expanded="false" aria-controls="rawData_${tabId}">
            Show Raw Data
          </button>
          <div class="collapse" id="rawData_${tabId}">
            <pre id="data_${tabId}">${tabId === 'vamc_ehr' ? 'Loading VAMC EHR data...' : `Queried API: ${url}\n${apiData[url] ? `${apiData[url].data}\n\nLast updated: ${apiData[url].timestamp}` : 'No data available. Click "Refresh" to fetch.'}`}</pre>
          </div>`;

      if (tabId === 'vamc_ehr') {
        // Predefine tables with placeholders
        contentHtml += `
          <h3 class="mt-3">Entity Count</h3>
          <div class="table-responsive">
            <table class="table table-striped table-bordered mt-2" id="vamcEhrCountTable" style="width: 100%;">
              <thead class="thead-dark">
                <tr>
                  <th scope="col" class="sortable" data-sort="count">Count <span class="sort-arrow"></span></th>
                </tr>
              </thead>
              <tbody id="vamcEhrCountBody">
                <tr><td>Loading...</td></tr>
              </tbody>
            </table>
          </div>
          <h3 class="mt-3">Entities</h3>
          <div class="table-responsive">
            <table class="table table-striped table-bordered mt-2" id="vamcEhrEntitiesTable" style="width: 100%;">
              <thead class="thead-dark">
                <tr>
                  <th scope="col" class="sortable" data-sort="title">Title <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="fieldFacilityLocatorApiId">Facility Locator API ID <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="regionTitle">Region Title <span class="sort-arrow"></span></th>
                  <th scope="col" class="sortable" data-sort="fieldVamcEhrSystem">VAMC EHR System <span class="sort-arrow"></span></th>
                </tr>
              </thead>
              <tbody id="vamcEhrEntitiesBody">
                <tr><td colspan="4">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>`;

        tabContent.insertAdjacentHTML('beforeend', contentHtml);

        // Fetch and update VAMC EHR data
        fetch(url)
          .then(response => response.json())
          .then(data => {
            const rawData = JSON.stringify(data, null, 2);
            const timestamp = new Date().toISOString();
            document.getElementById(`data_${tabId}`).textContent = `Queried URL: ${url}\n${rawData}\n\nLast updated: ${timestamp}`;

            const nodeQuery = data.data?.nodeQuery || {};
            // Update Entity Count
            const countBody = document.getElementById('vamcEhrCountBody');
            countBody.innerHTML = `<tr><td>${nodeQuery.count !== undefined ? nodeQuery.count : 'N/A'}</td></tr>`;

            // Update Entities
            const entities = nodeQuery.entities || [];
            const entitiesBody = document.getElementById('vamcEhrEntitiesBody');
            entitiesBody.innerHTML = '';
            entities.forEach(entity => {
              const regionPage = entity.fieldRegionPage?.entity || {};
              entitiesBody.insertAdjacentHTML('beforeend', `
                <tr>
                  <td>${entity.title || 'N/A'}</td>
                  <td>${entity.fieldFacilityLocatorApiId || 'N/A'}</td>
                  <td>${regionPage.title || 'N/A'}</td>
                  <td>${regionPage.fieldVamcEhrSystem || 'N/A'}</td>
                </tr>`);
            });

            attachSortingListeners('vamcEhrCountTable');
            attachSortingListeners('vamcEhrEntitiesTable');
          })
          .catch(e => {
            console.error('Error fetching vamc_ehr JSON:', e);
            document.getElementById(`data_${tabId}`).textContent = `Queried URL: ${url}\nError fetching data: ${e.message}`;
            document.getElementById('vamcEhrCountBody').innerHTML = `<tr><td>Error</td></tr>`;
            document.getElementById('vamcEhrEntitiesBody').innerHTML = `<tr><td colspan="4">Error</td></tr>`;
          });
      } else {
        // Other tabs use pre-fetched apiData
        if (tabId === 'backend_statuses' && apiData[url]) {
          try {
            const parsedData = JSON.parse(apiData[url].data);
            const statuses = parsedData.data?.attributes?.statuses || [];
            if (statuses.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Backend Statuses</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="backendStatusesTable" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="service">Service <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="service_id">Service ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="last_incident_timestamp">Last Incident Timestamp <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              statuses.forEach(status => {
                contentHtml += `
                  <tr>
                    <td>${status.service || 'N/A'}</td>
                    <td>${status.service_id || 'N/A'}</td>
                    <td>${status.status || 'N/A'}</td>
                    <td>${status.last_incident_timestamp || 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }
          } catch (e) {
            console.error('Error parsing backend_statuses for table:', e);
            contentHtml += `<p class="text-danger mt-3">Error parsing statuses data</p>`;
          }
        }

        if (tabId === 'maintenance_windows' && apiData[url]) {
          try {
            const parsedData = JSON.parse(apiData[url].data);
            const windows = parsedData.data || [];
            if (windows.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Maintenance Windows</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="maintenanceWindowsTable" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="id">ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="external_service">External Service <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="start_time">Start Time <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="end_time">End Time <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="description">Description <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              windows.forEach(window => {
                const attrs = window.attributes || {};
                contentHtml += `
                  <tr>
                    <td>${window.id || 'N/A'}</td>
                    <td>${attrs.external_service || 'N/A'}</td>
                    <td>${attrs.start_time || 'N/A'}</td>
                    <td>${attrs.end_time || 'N/A'}</td>
                    <td>${attrs.description || 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }
          } catch (e) {
            console.error('Error parsing maintenance_windows for table:', e);
            contentHtml += `<p class="text-danger mt-3">Error parsing maintenance windows data</p>`;
          }
        }

        if (tabId === 'rated_disabilities' && apiData[url]) {
          try {
            const parsedData = JSON.parse(apiData[url].data);
            const attrs = parsedData.data?.attributes || {};
            contentHtml += `
              <h3 class="mt-3">Combined Ratings</h3>
              <div class="table-responsive">
                <table class="table table-striped table-bordered mt-2" id="combinedRatingsTable" style="width: 100%;">
                  <thead class="thead-dark">
                    <tr>
                      <th scope="col" class="sortable" data-sort="combined_disability_rating">Combined Disability Rating <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="combined_effective_date">Combined Effective Date <span class="sort-arrow"></span></th>
                      <th scope="col" class="sortable" data-sort="legal_effective_date">Legal Effective Date <span class="sort-arrow"></span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${attrs.combined_disability_rating || 'N/A'}</td>
                      <td>${attrs.combined_effective_date || 'N/A'}</td>
                      <td>${attrs.legal_effective_date || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>`;

            const ratings = attrs.individual_ratings || [];
            if (ratings.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Individual Ratings</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="ratedDisabilitiesTable" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="decision">Decision <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="effective_date">Effective Date <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="rating_end_date">Rating End Date <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="rating_percentage">Rating Percentage <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="diagnostic_type_code">Diagnostic Type Code <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="hyph_diagnostic_type_code">Hyph Diagnostic Type Code <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="diagnostic_type_name">Diagnostic Type Name <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="diagnostic_text">Diagnostic Text <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="disability_rating_id">Disability Rating ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="static_ind">Static Ind <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              ratings.forEach(rating => {
                contentHtml += `
                  <tr>
                    <td>${rating.decision || 'N/A'}</td>
                    <td>${rating.effective_date || 'N/A'}</td>
                    <td>${rating.rating_end_date || 'N/A'}</td>
                    <td>${rating.rating_percentage !== null ? rating.rating_percentage : 'N/A'}</td>
                    <td>${rating.diagnostic_type_code || 'N/A'}</td>
                    <td>${rating.hyph_diagnostic_type_code || 'N/A'}</td>
                    <td>${rating.diagnostic_type_name || 'N/A'}</td>
                    <td>${rating.diagnostic_text || 'N/A'}</td>
                    <td>${rating.disability_rating_id || 'N/A'}</td>
                    <td>${rating.static_ind !== undefined ? rating.static_ind : 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }
          } catch (e) {
            console.error('Error parsing rated_disabilities for tables:', e);
            contentHtml += `<p class="text-danger mt-3">Error parsing rated disabilities data</p>`;
          }
        }

        if (tabId === 'appeals' && apiData[url]) {
          try {
            const parsedData = JSON.parse(apiData[url].data);
            const appeals = parsedData.data || [];
            if (appeals.length > 0) {
              contentHtml += `
                <h3 class="mt-3">Appeal Summary</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="appealSummaryTable" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="id">ID <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="updated">Updated <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="incompleteHistory">Incomplete History <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="active">Active <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="description">Description <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="location">Location <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="aoj">AOJ <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="programArea">Program Area <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="statusType">Status Type <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              appeals.forEach(appeal => {
                const attrs = appeal.attributes || {};
                contentHtml += `
                  <tr>
                    <td>${appeal.id || 'N/A'}</td>
                    <td>${attrs.updated || 'N/A'}</td>
                    <td>${attrs.incompleteHistory !== undefined ? attrs.incompleteHistory : 'N/A'}</td>
                    <td>${attrs.active !== undefined ? attrs.active : 'N/A'}</td>
                    <td>${attrs.description || 'N/A'}</td>
                    <td>${attrs.location || 'N/A'}</td>
                    <td>${attrs.aoj || 'N/A'}</td>
                    <td>${attrs.programArea || 'N/A'}</td>
                    <td>${attrs.status?.type || 'N/A'}</td>
                  </tr>`;
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;

              contentHtml += `
                <h3 class="mt-3">Events</h3>
                <div class="table-responsive">
                  <table class="table table-striped table-bordered mt-2" id="eventsTable" style="width: 100%;">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col" class="sortable" data-sort="type">Type <span class="sort-arrow"></span></th>
                        <th scope="col" class="sortable" data-sort="date">Date <span class="sort-arrow"></span></th>
                      </tr>
                    </thead>
                    <tbody>`;
              appeals.forEach(appeal => {
                const events = appeal.attributes?.events || [];
                events.forEach(event => {
                  contentHtml += `
                    <tr>
                      <td>${event.type || 'N/A'}</td>
                      <td>${event.date || 'N/A'}</td>
                    </tr>`;
                });
              });
              contentHtml += `
                    </tbody>
                  </table>
                </div>`;
            }
          } catch (e) {
            console.error('Error parsing appeals for tables:', e);
            contentHtml += `<p class="text-danger mt-3">Error parsing appeals data</p>`;
          }
        }

        if (tabId !== 'vamc_ehr') {
          contentHtml += `</div>`;
          tabContent.insertAdjacentHTML('beforeend', contentHtml);
        }
      }

      tabList.insertAdjacentHTML('beforeend', tabHtml);
    }
  }

  // Attach sorting listeners for all tables except vamc_ehr (handled in fetch)
  const tableIds = [
    'claimOverviewTable', 'attributesTable', 'claimDetailsTable',
    'ratedDisabilitiesTable', 'combinedRatingsTable',
    'backendStatusesTable', 'maintenanceWindowsTable',
    'appealSummaryTable', 'eventsTable'
  ];
  const claimIds = benefitsClaimsData && benefitsClaimsData.data ? JSON.parse(benefitsClaimsData.data).data.map(item => item.id) : [];
  claimIds.forEach(id => {
    tableIds.push(`claimSummaryTable_${id}`, `contentionsTable_${id}`, `claimDetailsTable_${id}`, `supportingDocsTable_${id}`, `trackedItemsTable_${id}`);
  });

  tableIds.forEach(tableId => {
    attachSortingListeners(tableId);
  });
}

function attachSortingListeners(tableId) {
  const sortableHeaders = document.querySelectorAll(`#${tableId} .sortable`);
  sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const table = th.closest('table');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const index = Array.from(th.parentNode.children).indexOf(th);
      const sortKey = th.dataset.sort;
      const isAsc = th.classList.toggle('asc');
      th.classList.toggle('desc', !isAsc);
      const sortOrder = isAsc ? 1 : -1;

      rows.sort((a, b) => {
        let aVal = a.cells[index].textContent.trim();
        let bVal = b.cells[index].textContent.trim();
        if (sortKey === 'rating_percentage' || (sortKey === 'id' && tableId.includes('trackedItems')) || sortKey === 'count') {
          aVal = aVal === 'N/A' ? -1 : parseInt(aVal);
          bVal = bVal === 'N/A' ? -1 : parseInt(bVal);
          return sortOrder * (aVal - bVal);
        } else if (['decisionLetterSent', 'developmentLetterSent', 'documentsNeeded', 'evidenceWaiverSubmitted5103', 'overdue', 'uploadsAllowed', 'active', 'incompleteHistory', 'combined_disability_rating'].includes(sortKey)) {
          aVal = aVal === 'true' ? 1 : (aVal === 'false' ? 0 : (aVal === 'N/A' ? -1 : parseInt(aVal)));
          bVal = bVal === 'true' ? 1 : (bVal === 'false' ? 0 : (bVal === 'N/A' ? -1 : parseInt(bVal)));
          return sortOrder * (aVal - bVal);
        } else {
          return sortOrder * aVal.localeCompare(bVal);
        }
      });

      rows.forEach(row => tbody.appendChild(row));
      th.querySelector('.sort-arrow').textContent = isAsc ? '\u2191' : '\u2193';
      th.parentNode.querySelectorAll('.sortable').forEach(otherTh => {
        if (otherTh !== th) {
          otherTh.classList.remove('asc', 'desc');
          otherTh.querySelector('.sort-arrow').textContent = '';
        }
      });
    });
  });
}

function exportSinglePdf(apiData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yOffset = 10;

  doc.setFontSize(16);
  doc.text('VA.gov API Responses', 10, yOffset);
  yOffset += 10;

  for (const [tabId, url] of Object.entries(apiMap)) {
    const tabName = tabId.replace(/_/g, ' ').toUpperCase();
    const content = apiData[url] ? `Queried API: ${url}\n${apiData[url].data}\n\nLast updated: ${apiData[url].timestamp}` : `Queried API: ${url}\nNo data available.`;
    yOffset = addTabContent(doc, tabName, content, yOffset);
  }

  const benefitsClaimsData = apiData['https://api.va.gov/v0/benefits_claims'];
  if (benefitsClaimsData && benefitsClaimsData.data) {
    try {
      const parsedData = JSON.parse(benefitsClaimsData.data);
      const claimIds = parsedData.data.map(item => item.id);
      claimIds.forEach(id => {
        const claimUrl = `https://api.va.gov/v0/benefits_claims/${id}`;
        const tabName = `Claim ${id}`;
        const content = apiData[claimUrl] ? `Queried API: ${claimUrl}\n${apiData[claimUrl].data}\n\nLast updated: ${apiData[claimUrl].timestamp}` : `Queried API: ${claimUrl}\nNo data available.`;
        yOffset = addTabContent(doc, tabName, content, yOffset);
      });
    } catch (e) {
      console.error('Error parsing benefits_claims for PDF export:', e);
    }
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  doc.save(`benefits_claims_${dateStr}.pdf`);
}

function exportAllPdfs(apiData) {
  const { jsPDF } = window.jspdf;
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');

  for (const [tabId, url] of Object.entries(apiMap)) {
    const doc = new jsPDF();
    let yOffset = 10;
    doc.setFontSize(16);
    doc.text('VA.gov API Response', 10, yOffset);
    yOffset += 10;

    const tabName = tabId.replace(/_/g, ' ').toUpperCase();
    const content = apiData[url] ? `Queried API: ${url}\n${apiData[url].data}\n\nLast updated: ${apiData[url].timestamp}` : `Queried API: ${url}\nNo data available.`;
    yOffset = addTabContent(doc, tabName, content, yOffset);
    doc.save(`${tabId}_${dateStr}.pdf`);
  }

  const benefitsClaimsData = apiData['https://api.va.gov/v0/benefits_claims'];
  if (benefitsClaimsData && benefitsClaimsData.data) {
    try {
      const parsedData = JSON.parse(benefitsClaimsData.data);
      const claimIds = parsedData.data.map(item => item.id);
      claimIds.forEach(id => {
        const doc = new jsPDF();
        let yOffset = 10;
        doc.setFontSize(16);
        doc.text('VA.gov API Response', 10, yOffset);
        yOffset += 10;

        const claimUrl = `https://api.va.gov/v0/benefits_claims/${id}`;
        const tabName = `Claim ${id}`;
        const content = apiData[claimUrl] ? `Queried API: ${claimUrl}\n${apiData[claimUrl].data}\n\nLast updated: ${apiData[claimUrl].timestamp}` : `Queried API: ${claimUrl}\nNo data available.`;
        yOffset = addTabContent(doc, tabName, content, yOffset);
        doc.save(`benefits_claims_${id}_${dateStr}.pdf`);
      });
    } catch (e) {
      console.error('Error parsing benefits_claims for PDF export:', e);
    }
  }
}

function addTabContent(doc, tabName, content, yOffset) {
  doc.setFontSize(12);
  doc.text(tabName, 10, yOffset);
  yOffset += 5;

  doc.setFontSize(10);
  const lines = doc.splitTextToSize(content, 180);
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 0; i < lines.length; i++) {
    if (yOffset + 10 > pageHeight - 10) {
      doc.addPage();
      yOffset = 10;
    }
    doc.text(lines[i], 10, yOffset);
    yOffset += 5;
  }
  yOffset += 5;
  return yOffset;
}