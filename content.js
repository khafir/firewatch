/* jslint esversion: 8 */
let lastUrl = location.href;
let hasSentMessage = false;

// Debounce function to limit how often checkUrl is called
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function checkUrl() {
  const currentUrl = location.href;
  console.log(`checkUrl called: currentUrl=${currentUrl}, lastUrl=${lastUrl}, hasSentMessage=${hasSentMessage}`);
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    hasSentMessage = false;
    console.log('URL changed, reset hasSentMessage');
  }

  if (currentUrl === 'https://www.va.gov/my-va/' && !hasSentMessage) {
    console.log('Sending openTabAndFetch message');
    chrome.runtime.sendMessage({ type: 'openTabAndFetch' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Message sent, no immediate response expected');
      }
    });
    hasSentMessage = true;
  }
}

// Wrap checkUrl with debounce (e.g., wait 100ms between calls)
const debouncedCheckUrl = debounce(checkUrl, 100);

checkUrl();

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    debouncedCheckUrl();
  });
});

observer.observe(document, { subtree: true, childList: true });