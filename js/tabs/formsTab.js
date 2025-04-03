/* jslint esversion: 8 */
function populateFormsTab(apiData, tabList, tabContent) {
    const tabId = 'forms';
    const url = apiMap[tabId];
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
          <pre id="data_${tabId}">Queried API: ${url}\n${apiData[url] ? `${apiData[url].data}\n\nLast updated: ${apiData[url].timestamp}` : 'No data available. Click "Refresh" to fetch.'}</pre>
        </div>`;
  
    if (apiData[url]) {
      try {
        const parsedData = JSON.parse(apiData[url].data);
        const forms = parsedData.data || [];
  
        if (forms.length > 0) {
          contentHtml += `
            <h3 class="mt-3">Available Forms</h3>
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="formsTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="form_name">Form Name <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="title">Title <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="url">Download URL <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="first_issued_on">First Issued On <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="last_revision_on">Last Revision On <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="pages">Pages <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="va_form_administration">VA Form Administration <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>`;
  
          forms.forEach(form => {
            const attrs = form.attributes || {};
            contentHtml += `
              <tr>
                <td>${attrs.form_name || 'N/A'}</td>
                <td>${attrs.title || 'N/A'}</td>
                <td>${attrs.url ? `<a href="${attrs.url}" target="_blank">${attrs.url}</a>` : 'N/A'}</td>
                <td>${attrs.first_issued_on || 'N/A'}</td>
                <td>${attrs.last_revision_on || 'N/A'}</td>
                <td>${attrs.pages !== undefined ? attrs.pages : 'N/A'}</td>
                <td>${attrs.va_form_administration || 'N/A'}</td>
              </tr>`;
          });
  
          contentHtml += `
                </tbody>
              </table>
            </div>`;
        } else {
          contentHtml += `<p class="mt-3">No forms available.</p>`;
        }
  
        // Attach sorting listeners
        attachSortingListeners(`formsTable_${tabId}`);
      } catch (e) {
        console.error('Error parsing forms data for table:', e);
        contentHtml += `<p class="text-danger mt-3">Error parsing forms data</p>`;
      }
    }
  
    contentHtml += `</div>`;
    tabList.insertAdjacentHTML('beforeend', tabHtml);
    tabContent.insertAdjacentHTML('beforeend', contentHtml);
  }