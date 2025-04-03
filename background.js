/* jslint esversion: 8 */
const apiMap = {
  'benefits_claims': 'https://api.va.gov/v0/benefits_claims',
  'appeals': 'https://api.va.gov/v0/appeals',
  'rated_disabilities': 'https://api.va.gov/v0/rated_disabilities',
  'user': 'https://api.va.gov/v0/user',
  'maintenance_windows': 'https://api.va.gov/v0/maintenance_windows/',
  'backend_statuses': 'https://api.va.gov/v0/backend_statuses',
  'vamc_ehr': 'https://www.va.gov/data/cms/vamc-ehr.json',
  'forms': 'https://api.va.gov/v0/forms'
};

async function fetchAPIs(tabId) {
  const apiData = {};
  const apiUrls = Object.values(apiMap).filter(url => url !== apiMap['vamc_ehr']); // Exclude vamc_ehr, fetched on demand

  for (const url of apiUrls) {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      apiData[url] = {
        data: JSON.stringify(data, null, 2),
        timestamp: new Date().toISOString()
      };

      if (url === apiMap['benefits_claims'] && data.data) {
        const claims = data.data;
        for (const claim of claims) {
          const claimId = claim.id;
          const claimUrl = `https://api.va.gov/v0/benefits_claims/${claimId}`;
          try {
            const claimResponse = await fetch(claimUrl, { credentials: 'include' });
            if (!claimResponse.ok) {
              throw new Error(`HTTP error! status: ${claimResponse.status}`);
            }
            const claimData = await claimResponse.json();
            apiData[claimUrl] = {
              data: JSON.stringify(claimData, null, 2),
              timestamp: new Date().toISOString()
            };
          } catch (e) {
            console.error(`Error fetching claim ${claimId}:`, e);
            apiData[claimUrl] = {
              data: `Error: ${e.message}`,
              timestamp: new Date().toISOString()
            };
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching ${url}:`, e);
      apiData[url] = {
        data: `Error: ${e.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Store the API data
  chrome.storage.local.set({ apiData }, () => {
    // Wait for the tab to be fully loaded before sending the message
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting tab:', chrome.runtime.lastError);
        return;
      }
      if (tab.status === 'complete') {
        chrome.tabs.sendMessage(tabId, { type: 'apiDataReady', apiData }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
          }
        });
      } else {
        chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
          if (updatedTabId === tabId && changeInfo.status === 'complete') {
            chrome.tabs.sendMessage(tabId, { type: 'apiDataReady', apiData }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
              }
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'openTabAndFetch') {
    chrome.storage.local.get({ apiData: {} }, (data) => {
      const existingData = data.apiData || {};
      const apiUrls = Object.values(apiMap);
      const hasData = apiUrls.every(url => existingData[url] && existingData[url].data);
      chrome.tabs.create({ url: chrome.runtime.getURL('display.html') }, (tab) => {
        if (!hasData) {
          fetchAPIs(tab.id);
        } else {
          // Wait for the tab to be fully loaded before sending the message
          chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
            if (updatedTabId === tab.id && changeInfo.status === 'complete') {
              chrome.tabs.sendMessage(tab.id, { type: 'apiDataReady', apiData: existingData }, (response) => {
                if (chrome.runtime.lastError) {
                  console.error('Error sending message:', chrome.runtime.lastError);
                }
              });
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
        }
      });
    });
  } else if (message.type === 'refreshAPIs') {
    chrome.storage.local.get({ apiData: {} }, (data) => {
      const existingData = data.apiData || {};
      const apiUrls = Object.values(apiMap);
      const hasData = apiUrls.every(url => existingData[url] && existingData[url].data);
      if (!hasData) {
        chrome.runtime.sendMessage({ type: 'apiDataError', error: 'No tab to refresh' });
        return;
      }
      fetchAPIs(sender.tab.id);
    });
  } else if (message.type === 'clearData') {
    chrome.storage.local.set({ apiData: {} }, () => {
      sendResponse({ status: 'cleared' });
    });
    return true; // Keep the message channel open for sendResponse
  }
});