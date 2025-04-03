/* jslint esversion: 8 */
function populateBenefitsClaimsTab(apiData, tabList, tabContent) {
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
  
    // Attach sorting listeners
    ['claimOverviewTable', 'attributesTable', 'claimDetailsTable'].forEach(tableId => {
      attachSortingListeners(tableId);
    });
  }