/* jslint esversion: 8 */
const apiMap = {
  'benefits_claims': 'https://api.va.gov/v0/benefits_claims',
  'appeals': 'https://api.va.gov/v0/appeals',
  'rated_disabilities': 'https://api.va.gov/v0/rated_disabilities',
  'user': 'https://api.va.gov/v0/user',
  'maintenance_windows': 'https://api.va.gov/v0/maintenance_windows/',
  'backend_statuses': 'https://api.va.gov/v0/backend_statuses',
  'vamc_ehr': 'https://www.va.gov/data/cms/vamc-ehr.json',
  'forms': 'https://api.va.gov/v0/forms' // Updated forms API endpoint
};

// Rest of the main.js content remains unchanged
document.addEventListener('DOMContentLoaded', () => {
  const tabList = document.getElementById('apiTabs');
  const tabContent = document.getElementById('apiTabContent');

  function populateAllTabs(apiData) {
    tabList.innerHTML = '';
    tabContent.innerHTML = '';
    populateBenefitsClaimsTab(apiData, tabList, tabContent);
    populateClaimTabs(apiData, tabList, tabContent);
    populateUserTab(apiData, tabList, tabContent);
    populateOtherTabs(apiData, tabList, tabContent);
    populateFormsTab(apiData, tabList, tabContent);
    populateAboutTab(tabList, tabContent);
  }

  chrome.storage.local.get({ apiData: {} }, (data) => {
    populateAllTabs(data.apiData);
  });

  document.getElementById('refreshBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'refreshAPIs' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Message sent, no immediate response expected');
      }
      if (response && response.type === 'apiDataReady') {
        console.log('Refreshed API data:', response.apiData);
        populateAllTabs(response.apiData);
      } else if (response && response.type === 'apiDataError') {
        console.error('Refresh error:', response.error);
        populateAllTabs({});
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
        populateAllTabs({});
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
      populateAllTabs(message.apiData);
    } else if (message.type === 'apiDataError') {
      console.error('Initial fetch error:', message.error);
      populateAllTabs({});
    }
  });
});