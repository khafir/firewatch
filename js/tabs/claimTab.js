/* jslint esversion: 8 */
function populateClaimTabs(apiData, tabList, tabContent) {
  const benefitsClaimsData = apiData['https://api.va.gov/v0/benefits_claims'];
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

        // Define variables for tables that may or may not exist
        let hasSupportingDocs = false;
        let hasTrackedItems = false;
        let supportingDocs = []; // Define supportingDocs in a higher scope

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

            supportingDocs = attrs.supportingDocuments || [];
            if (supportingDocs.length > 0) {
              hasSupportingDocs = true;
              contentHtml += `
                <h3 class="mt-3">Supporting Documents</h3>
                <div class="d-flex align-items-center">
                  <button id="downloadAllDocs_${id}" class="btn btn-primary btn-sm mb-2">Download All Documents</button>
                  <span id="downloadLoading_${id}" class="ms-2 d-none">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Downloading...
                  </span>
                </div>
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
              hasTrackedItems = true;
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
        if (hasSupportingDocs) {
          const downloadButton = document.getElementById(`downloadAllDocs_${id}`);
          const loadingIndicator = document.getElementById(`downloadLoading_${id}`);
          downloadButton.addEventListener('click', async () => {
            // Show loading indicator and disable the button
            downloadButton.disabled = true;
            loadingIndicator.classList.remove('d-none');

            try {
              const zip = new JSZip();
              const promises = supportingDocs.map(async (doc, index) => {
                const documentId = (doc.documentId || 'N/A').toUpperCase().replace(/[{}]/g, '');
                const downloadUrl = `https://eauth.va.gov/VONAPP2/wss-document-services-web-3.7/rest/documents/documentId/%7B${documentId}%7D/documentName/${documentId}.pdf`;
                try {
                  const response = await fetch(downloadUrl, { credentials: 'include' });
                  if (!response.ok) {
                    throw new Error(`Failed to fetch document ${documentId}: ${response.statusText}`);
                  }
                  const blob = await response.blob();
                  zip.file(`document_${index + 1}_${documentId}.pdf`, blob);
                } catch (e) {
                  console.error(`Error fetching document ${documentId}:`, e);
                }
              });

              // Wait for all fetches to complete
              await Promise.all(promises);

              // Generate the ZIP file and trigger download
              const content = await zip.generateAsync({ type: 'blob' });
              saveAs(content, `claim_${id}_documents.zip`);
            } catch (e) {
              console.error('Error generating ZIP file:', e);
              alert('Failed to create ZIP file. Please try again.');
            } finally {
              // Hide loading indicator and re-enable the button
              loadingIndicator.classList.add('d-none');
              downloadButton.disabled = false;
            }
          });
        }

        // Attach sorting listeners only to tables that exist
        const tableIds = [`claimSummaryTable_${id}`, `contentionsTable_${id}`, `claimDetailsTable_${id}`];
        if (hasSupportingDocs) tableIds.push(`supportingDocsTable_${id}`);
        if (hasTrackedItems) tableIds.push(`trackedItemsTable_${id}`);
        tableIds.forEach(tableId => {
          attachSortingListeners(tableId);
        });
      });
    } catch (e) {
      console.error('Error parsing benefits_claims for claim IDs:', e);
    }
  }
}