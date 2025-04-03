/* jslint esversion: 8 */
function populateOtherTabs(apiData, tabList, tabContent) {
  for (const [tabId, url] of Object.entries(apiMap)) {
    if (tabId !== 'benefits_claims' && tabId !== 'user') { // Exclude 'user' tab
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

        fetch(url)
          .then(response => response.json())
          .then(data => {
            const rawData = JSON.stringify(data, null, 2);
            const timestamp = new Date().toISOString();
            document.getElementById(`data_${tabId}`).textContent = `Queried URL: ${url}\n${rawData}\n\nLast updated: ${timestamp}`;

            const nodeQuery = data.data?.nodeQuery || {};
            const countBody = document.getElementById('vamcEhrCountBody');
            countBody.innerHTML = `<tr><td>${nodeQuery.count !== undefined ? nodeQuery.count : 'N/A'}</td></tr>`;

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
      } else if (tabId === 'backend_statuses' && apiData[url]) {
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
      } else if (tabId === 'maintenance_windows' && apiData[url]) {
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
      } else if (tabId === 'rated_disabilities' && apiData[url]) {
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
      } else if (tabId === 'appeals' && apiData[url]) {
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

        // Attach sorting listeners
        if (tabId === 'backend_statuses') attachSortingListeners('backendStatusesTable');
        if (tabId === 'maintenance_windows') attachSortingListeners('maintenanceWindowsTable');
        if (tabId === 'rated_disabilities') {
          attachSortingListeners('combinedRatingsTable');
          attachSortingListeners('ratedDisabilitiesTable');
        }
        if (tabId === 'appeals') {
          attachSortingListeners('appealSummaryTable');
          attachSortingListeners('eventsTable');
        }
      }

      tabList.insertAdjacentHTML('beforeend', tabHtml);
    }
  }
}