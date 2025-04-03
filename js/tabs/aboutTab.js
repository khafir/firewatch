/* jslint esversion: 8 */
function populateAboutTab(tabList, tabContent) {
    const tabName = 'about';
    const tabHtml = `
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="${tabName}-tab" data-bs-toggle="tab" data-bs-target="#${tabName}" type="button" role="tab" aria-controls="${tabName}" aria-selected="false">ABOUT</button>
      </li>`;
  
    const contentHtml = `
      <div class="tab-pane fade" id="${tabName}" role="tabpanel" aria-labelledby="${tabName}-tab">
        <hr>
        <h2 class="mt-3">About This Extension</h2>
        <p>
          This extension interacts with VA.gov APIs to fetch and display data, as well as download supporting documents for your claims. Below, we address common concerns about direct API interaction and the downloading of files.
        </p>
  
        <h3 class="mt-4">API Interaction Methodology</h3>
        <p>
          The APIs used by this extension are either directly exposed in the browser session after the user authenticates, or they accept user queries once the user has authenticated and the browser session has the authentication token. These methodologies do not require vulnerability exploitation or any authentication manipulation; they are accessible as part of the authenticated session and are simply not all advertised.
        </p>
        <p>
          In other words, the extension uses the same access mechanisms that the VA.gov website itself uses when you interact with it through your browser. It does not bypass security measures or exploit vulnerabilities—it leverages the permissions you already have as an authenticated user.
        </p>
  
        <h3 class="mt-4">Legal and Ethical Considerations</h3>
        <p>
          The use of these APIs to access your own data aligns with legal standards and your rights as a claimant. Specifically:
        </p>
        <ul>
          <li>
            <strong>38 U.S.C. § 5701 and 38 CFR § 1.500–1.527</strong>: These statutes and regulations codify the claimant's right of access to their records and information, as well as the VA's obligation to provide such access. As a claimant, you are entitled to access the data this extension retrieves.
          </li>
          <li>
            <strong>Van Buren v. United States, 593 U.S. ___ (2021), 141 S. Ct. 1648</strong>: This Supreme Court decision clarifies that policy-based violations do not violate the Computer Fraud and Abuse Act (CFAA) if the user natively has access to the given system. Since this extension operates within your authenticated session and accesses data you are authorized to view, it does not violate the CFAA.
          </li>
        </ul>
        <p>
          In summary, this extension operates within the bounds of your existing access rights and does not engage in unauthorized access or manipulation. It is designed to help you exercise your legal right to access your VA records in a more convenient way.
        </p>
      </div>`;
  
    tabList.insertAdjacentHTML('beforeend', tabHtml);
    tabContent.insertAdjacentHTML('beforeend', contentHtml);
  }