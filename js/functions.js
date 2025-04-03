/* jslint esversion: 8 */
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