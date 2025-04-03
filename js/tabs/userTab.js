/* jslint esversion: 8 */
function populateUserTab(apiData, tabList, tabContent) {
    const tabId = 'user';
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
        const userData = parsedData.data || {};
        const attributes = userData.attributes || {};
        const profile = attributes.profile || {};
        const vaProfile = attributes.va_profile || {};
        const veteranStatus = attributes.veteran_status || {};
        const vet360Contact = attributes.vet360_contact_information || {};
        const session = attributes.session || {};
        const onboarding = attributes.onboarding || {};
  
        // Profile Information
        contentHtml += `
          <h3 class="mt-3">
            Profile Information
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#profileInfo_${tabId}" aria-expanded="true" aria-controls="profileInfo_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="profileInfo_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userProfileTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="email">Email <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="first_name">First Name <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="middle_name">Middle Name <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="last_name">Last Name <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="preferred_name">Preferred Name <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="birth_date">Birth Date <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="gender">Gender <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="zip">Zip Code <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="last_signed_in">Last Signed In <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${profile.email || 'N/A'}</td>
                    <td>${profile.first_name || 'N/A'}</td>
                    <td>${profile.middle_name || 'N/A'}</td>
                    <td>${profile.last_name || 'N/A'}</td>
                    <td>${profile.preferred_name || 'N/A'}</td>
                    <td>${profile.birth_date || 'N/A'}</td>
                    <td>${profile.gender || 'N/A'}</td>
                    <td>${profile.zip || 'N/A'}</td>
                    <td>${profile.last_signed_in || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Account Information
        contentHtml += `
          <h3 class="mt-3">
            Account Information
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#accountInfo_${tabId}" aria-expanded="true" aria-controls="accountInfo_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="accountInfo_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userAccountTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="account_uuid">Account UUID <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${attributes.account?.account_uuid || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Authentication Details
        contentHtml += `
          <h3 class="mt-3">
            Authentication Details
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#authDetails_${tabId}" aria-expanded="true" aria-controls="authDetails_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="authDetails_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userAuthTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">Level of Assurance (Current)</th>
                    <th scope="col">Level of Assurance (Highest)</th>
                    <th scope="col">Sign-In Service</th>
                    <th scope="col">Auth Broker</th>
                    <th scope="col">Client ID</th>
                    <th scope="col">Multifactor Enabled</th>
                    <th scope="col">Verified</th>
                    <th scope="col">Authn Context</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${attributes.loa?.current || 'N/A'}</td>
                    <td>${attributes.loa?.highest || 'N/A'}</td>
                    <td>${attributes.sign_in?.service_name || 'N/A'}</td>
                    <td>${attributes.sign_in?.auth_broker || 'N/A'}</td>
                    <td>${attributes.sign_in?.client_id || 'N/A'}</td>
                    <td>${attributes.multifactor !== undefined ? attributes.multifactor : 'N/A'}</td>
                    <td>${attributes.verified !== undefined ? attributes.verified : 'N/A'}</td>
                    <td>${attributes.authn_context || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Accessible Services
        contentHtml += `
          <h3 class="mt-3">
            Accessible Services
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#services_${tabId}" aria-expanded="true" aria-controls="services_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="services_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userServicesTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="service">Service <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>`;
        const services = attributes.services || [];
        services.forEach(service => {
          contentHtml += `
            <tr>
              <td>${service || 'N/A'}</td>
            </tr>`;
        });
        contentHtml += `
              </tbody>
            </table>
          </div>
        </div>`;
  
        // Claims Access
        contentHtml += `
          <h3 class="mt-3">
            Claims Access
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#claimsAccess_${tabId}" aria-expanded="true" aria-controls="claimsAccess_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="claimsAccess_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userClaimsTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">Appeals</th>
                    <th scope="col">COE</th>
                    <th scope="col">Communication Preferences</th>
                    <th scope="col">Connected Apps</th>
                    <th scope="col">Medical Copays</th>
                    <th scope="col">Military History</th>
                    <th scope="col">Payment History</th>
                    <th scope="col">Personal Information</th>
                    <th scope="col">Rating Info</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${attributes.claims?.appeals !== undefined ? attributes.claims.appeals : 'N/A'}</td>
                    <td>${attributes.claims?.coe !== undefined ? attributes.claims.coe : 'N/A'}</td>
                    <td>${attributes.claims?.communication_preferences !== undefined ? attributes.claims.communication_preferences : 'N/A'}</td>
                    <td>${attributes.claims?.connected_apps !== undefined ? attributes.claims.connected_apps : 'N/A'}</td>
                    <td>${attributes.claims?.medical_copays !== undefined ? attributes.claims.medical_copays : 'N/A'}</td>
                    <td>${attributes.claims?.military_history !== undefined ? attributes.claims.military_history : 'N/A'}</td>
                    <td>${attributes.claims?.payment_history !== undefined ? attributes.claims.payment_history : 'N/A'}</td>
                    <td>${attributes.claims?.personal_information !== undefined ? attributes.claims.personal_information : 'N/A'}</td>
                    <td>${attributes.claims?.rating_info !== undefined ? attributes.claims.rating_info : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Form 526 Required Identifiers
        contentHtml += `
          <h3 class="mt-3">
            Form 526 Required Identifiers
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#form526Identifiers_${tabId}" aria-expanded="true" aria-controls="form526Identifiers_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="form526Identifiers_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userForm526Table_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col">Participant ID</th>
                    <th scope="col">BIRLS ID</th>
                    <th scope="col">SSN</th>
                    <th scope="col">Birth Date</th>
                    <th scope="col">EDIPI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${attributes.claims?.form526_required_identifier_presence?.participant_id !== undefined ? attributes.claims.form526_required_identifier_presence.participant_id : 'N/A'}</td>
                    <td>${attributes.claims?.form526_required_identifier_presence?.birls_id !== undefined ? attributes.claims.form526_required_identifier_presence.birls_id : 'N/A'}</td>
                    <td>${attributes.claims?.form526_required_identifier_presence?.ssn !== undefined ? attributes.claims.form526_required_identifier_presence.ssn : 'N/A'}</td>
                    <td>${attributes.claims?.form526_required_identifier_presence?.birth_date !== undefined ? attributes.claims.form526_required_identifier_presence.birth_date : 'N/A'}</td>
                    <td>${attributes.claims?.form526_required_identifier_presence?.edipi !== undefined ? attributes.claims.form526_required_identifier_presence.edipi : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // User Identifiers
        contentHtml += `
          <h3 class="mt-3">
            User Identifiers
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#userIdentifiers_${tabId}" aria-expanded="true" aria-controls="userIdentifiers_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="userIdentifiers_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userIdentifiersTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="icn">ICN <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="birls_id">BIRLS ID <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="edipi">EDIPI <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="sec_id">SEC ID <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="logingov_uuid">LoginGov UUID <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="idme_uuid">ID.me UUID <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${attributes.icn || 'N/A'}</td>
                    <td>${attributes.birls_id || 'N/A'}</td>
                    <td>${attributes.edipi || 'N/A'}</td>
                    <td>${attributes.sec_id || 'N/A'}</td>
                    <td>${attributes.logingov_uuid || 'N/A'}</td>
                    <td>${attributes.idme_uuid || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // VA Profile
        contentHtml += `
          <h3 class="mt-3">
            VA Profile
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#vaProfile_${tabId}" aria-expanded="true" aria-controls="vaProfile_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="vaProfile_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userVaProfileTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="birth_date">Birth Date <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="family_name">Family Name <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="gender">Gender <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="is_cerner_patient">Cerner Patient <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="cerner_id">Cerner ID <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="va_patient">VA Patient <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="mhv_account_state">MHV Account State <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="active_mhv_ids">Active MHV IDs <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${vaProfile.status || 'N/A'}</td>
                    <td>${vaProfile.birth_date || 'N/A'}</td>
                    <td>${vaProfile.family_name || 'N/A'}</td>
                    <td>${vaProfile.gender || 'N/A'}</td>
                    <td>${vaProfile.is_cerner_patient !== undefined ? vaProfile.is_cerner_patient : 'N/A'}</td>
                    <td>${vaProfile.cerner_id || 'N/A'}</td>
                    <td>${vaProfile.va_patient !== undefined ? vaProfile.va_patient : 'N/A'}</td>
                    <td>${vaProfile.mhv_account_state || 'N/A'}</td>
                    <td>${vaProfile.active_mhv_ids ? vaProfile.active_mhv_ids.join(', ') : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // VA Facilities
        contentHtml += `
          <h3 class="mt-3">
            VA Facilities
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#vaFacilities_${tabId}" aria-expanded="true" aria-controls="vaFacilities_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="vaFacilities_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userVaFacilitiesTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  🙂<tr>
                    <th scope="col" class="sortable" data-sort="facility_id">Facility ID <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="is_cerner">Is Cerner <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>`;
        const facilities = vaProfile.facilities || [];
        facilities.forEach(facility => {
          contentHtml += `
            <tr>
              <td>${facility.facility_id || 'N/A'}</td>
              <td>${facility.is_cerner !== undefined ? facility.is_cerner : 'N/A'}</td>
            </tr>`;
        });
        contentHtml += `
              </tbody>
            </table>
          </div>
        </div>`;
  
        // Veteran Status
        contentHtml += `
          <h3 class="mt-3">
            Veteran Status
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#veteranStatus_${tabId}" aria-expanded="true" aria-controls="veteranStatus_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="veteranStatus_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userVeteranStatusTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="status">Status <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="is_veteran">Is Veteran <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="served_in_military">Served in Military <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${veteranStatus.status || 'N/A'}</td>
                    <td>${veteranStatus.is_veteran !== undefined ? veteranStatus.is_veteran : 'N/A'}</td>
                    <td>${veteranStatus.served_in_military !== undefined ? veteranStatus.served_in_military : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Contact Information
        contentHtml += `
          <h3 class="mt-3">
            Contact Information
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#contactInfo_${tabId}" aria-expanded="true" aria-controls="contactInfo_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="contactInfo_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userContactTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="email">Email <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="address_line1">Residential Address <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="address_line1">Mailing Address <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="mobile_phone">Mobile Phone <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="home_phone">Home Phone <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="work_phone">Work Phone <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="temporary_phone">Temporary Phone <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="fax_number">Fax Number <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${vet360Contact.email?.email_address || 'N/A'}</td>
                    <td data-sort-value="${vet360Contact.residential_address?.address_line1 || ''}">${vet360Contact.residential_address ? `${vet360Contact.residential_address.address_line1 || ''}${vet360Contact.residential_address.address_line2 ? ' ' + vet360Contact.residential_address.address_line2 : ''}${vet360Contact.residential_address.address_line3 ? ' ' + vet360Contact.residential_address.address_line3 : ''}, ${vet360Contact.residential_address.city || ''}, ${vet360Contact.residential_address.state_code || ''} ${vet360Contact.residential_address.zip_code || ''}${vet360Contact.residential_address.zip_code_suffix ? '-' + vet360Contact.residential_address.zip_code_suffix : ''}` : 'N/A'}</td>
                    <td data-sort-value="${vet360Contact.mailing_address?.address_line1 || ''}">${vet360Contact.mailing_address ? `${vet360Contact.mailing_address.address_line1 || ''}${vet360Contact.mailing_address.address_line2 ? ' ' + vet360Contact.mailing_address.address_line2 : ''}${vet360Contact.mailing_address.address_line3 ? ' ' + vet360Contact.mailing_address.address_line3 : ''}, ${vet360Contact.mailing_address.city || ''}, ${vet360Contact.mailing_address.state_code || ''} ${vet360Contact.mailing_address.zip_code || ''}${vet360Contact.mailing_address.zip_code_suffix ? '-' + vet360Contact.mailing_address.zip_code_suffix : ''}` : 'N/A'}</td>
                    <td>${vet360Contact.mobile_phone ? `${vet360Contact.mobile_phone.country_code || ''}${vet360Contact.mobile_phone.area_code || ''}${vet360Contact.mobile_phone.phone_number || ''}${vet360Contact.mobile_phone.extension ? ' ext. ' + vet360Contact.mobile_phone.extension : ''}` : 'N/A'}</td>
                    <td>${vet360Contact.home_phone ? `${vet360Contact.home_phone.country_code || ''}${vet360Contact.home_phone.area_code || ''}${vet360Contact.home_phone.phone_number || ''}${vet360Contact.home_phone.extension ? ' ext. ' + vet360Contact.home_phone.extension : ''}` : 'N/A'}</td>
                    <td>${vet360Contact.work_phone ? `${vet360Contact.work_phone.country_code || ''}${vet360Contact.work_phone.area_code || ''}${vet360Contact.work_phone.phone_number || ''}${vet360Contact.work_phone.extension ? ' ext. ' + vet360Contact.work_phone.extension : ''}` : 'N/A'}</td>
                    <td>${vet360Contact.temporary_phone ? `${vet360Contact.temporary_phone.country_code || ''}${vet360Contact.temporary_phone.area_code || ''}${vet360Contact.temporary_phone.phone_number || ''}${vet360Contact.temporary_phone.extension ? ' ext. ' + vet360Contact.temporary_phone.extension : ''}` : 'N/A'}</td>
                    <td>${vet360Contact.fax_number ? `${vet360Contact.fax_number.country_code || ''}${vet360Contact.fax_number.area_code || ''}${vet360Contact.fax_number.phone_number || ''}${vet360Contact.fax_number.extension ? ' ext. ' + vet360Contact.fax_number.extension : ''}` : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // In-Progress Forms
        contentHtml += `
          <h3 class="mt-3">
            In-Progress Forms
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#inProgressForms_${tabId}" aria-expanded="true" aria-controls="inProgressForms_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="inProgressForms_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userInProgressFormsTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="form_id">Form ID <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>`;
        const inProgressForms = attributes.in_progress_forms || [];
        inProgressForms.forEach(form => {
          contentHtml += `
            <tr>
              <td>${form || 'N/A'}</td>
            </tr>`;
        });
        contentHtml += `
              </tbody>
            </table>
          </div>
        </div>`;
  
        // Prefills Available
        contentHtml += `
          <h3 class="mt-3">
            Prefills Available
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#prefillsAvailable_${tabId}" aria-expanded="true" aria-controls="prefillsAvailable_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="prefillsAvailable_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userPrefillsTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="form">Form <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>`;
        const prefills = attributes.prefills_available || [];
        prefills.forEach(form => {
          contentHtml += `
            <tr>
              <td>${form || 'N/A'}</td>
            </tr>`;
        });
        contentHtml += `
              </tbody>
            </table>
          </div>
        </div>`;
  
        // Session Information
        contentHtml += `
          <h3 class="mt-3">
            Session Information
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#sessionInfo_${tabId}" aria-expanded="true" aria-controls="sessionInfo_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="sessionInfo_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userSessionTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="auth_broker">Auth Broker <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="ssoe">SSOE <span class="sort-arrow"></span></th>
                    <th scope="col" class="sortable" data-sort="transactionid">Transaction ID <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${session.auth_broker || 'N/A'}</td>
                    <td>${session.ssoe !== undefined ? session.ssoe : 'N/A'}</td>
                    <td>${session.transactionid || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Onboarding Status
        contentHtml += `
          <h3 class="mt-3">
            Onboarding Status
            <button class="btn btn-outline-secondary btn-sm ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#onboardingStatus_${tabId}" aria-expanded="true" aria-controls="onboardingStatus_${tabId}">
              Show/Hide
            </button>
          </h3>
          <div class="collapse show" id="onboardingStatus_${tabId}">
            <div class="table-responsive">
              <table class="table table-striped table-bordered mt-2" id="userOnboardingTable_${tabId}" style="width: 100%;">
                <thead class="thead-dark">
                  <tr>
                    <th scope="col" class="sortable" data-sort="show">Show Onboarding <span class="sort-arrow"></span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${onboarding.show !== undefined ? onboarding.show : 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>`;
  
        // Attach sorting listeners for the tables
        [
          `userProfileTable_${tabId}`,
          `userAccountTable_${tabId}`,
          `userAuthTable_${tabId}`,
          `userServicesTable_${tabId}`,
          `userClaimsTable_${tabId}`,
          `userForm526Table_${tabId}`,
          `userIdentifiersTable_${tabId}`,
          `userVaProfileTable_${tabId}`,
          `userVaFacilitiesTable_${tabId}`,
          `userVeteranStatusTable_${tabId}`,
          `userContactTable_${tabId}`,
          `userInProgressFormsTable_${tabId}`,
          `userPrefillsTable_${tabId}`,
          `userSessionTable_${tabId}`,
          `userOnboardingTable_${tabId}`
        ].forEach(tableId => {
          attachSortingListeners(tableId);
        });
      } catch (e) {
        console.error('Error parsing user data for tables:', e);
        contentHtml += `<p class="text-danger mt-3">Error parsing user data</p>`;
      }
    }
  
    contentHtml += `</div>`;
    tabList.insertAdjacentHTML('beforeend', tabHtml);
    tabContent.insertAdjacentHTML('beforeend', contentHtml);
  }