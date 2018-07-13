var settingsToggle = false;
var minimumTimeOnPage = 8;
var accessToken;

// Get local preferences
chrome.storage.local.get('access_token', function(data) {
    if (data.access_token !== null) {
        accessToken = data.access_token;
        UpdateLoginState();
    }
});

// Get synced preferences
(chrome.storage.sync || chrome.storage.local).get('min_sec_loaded', function(data) {
    if (data.min_sec_loaded) {
        minimumTimeOnPage = data.min_sec_loaded;
        updateMinimumTimeOnPage();
    }
});

function updateMinimumTimeOnPage() {
    document.getElementById('setting-timeout').value = minimumTimeOnPage;
}

function setMinimumTimeOnPage(value) {
    (chrome.storage.sync || chrome.storage.local).set({
        'min_sec_loaded' : value
    }, null);
    minimumTimeOnPage = value;
}

// Update the UI to reflect the internal login state.
function UpdateLoginState() {
    document.getElementById('section-login-pending').style.display = accessToken ? 'none' : 'block';
    document.getElementById('section-login-completed').style.display = accessToken ? 'block' : 'none';
}

// Run when document has loaded
document.addEventListener('DOMContentLoaded', function() {

    // Set some initial views and states
    UpdateLoginState();
    updateMinimumTimeOnPage();

    // settings toggle visible views
    document.getElementById('toggle-settings').addEventListener('click', function() {

        document.getElementById('section-login').style.display = settingsToggle ? 'block' : 'none';
        document.getElementById('section-settings').style.display = settingsToggle ? 'none' : 'block';

        document.getElementById('toggle-settings').textContent = settingsToggle ? 'Settings' : 'Back';

        settingsToggle = !settingsToggle;
    });

    // login flow
    document.getElementById('login').addEventListener('click', function() {
        // Create the login message
        let loginMessage = { type: 'Login' };
        // Send the login request to the background script
        chrome.runtime.sendMessage(loginMessage);
        // close the popout (for screen readers)
        window.close();
    });

    // log out flow
    document.getElementById('logout').addEventListener('click', function() {
        // Create the login message
        let logoutMessage = { type: 'Logout' };
        // Send the login request to the background script
        chrome.runtime.sendMessage(logoutMessage);
        // close the popout
        window.close();
    });

    // When the user changes the timeout field
    document.getElementById('setting-timeout').addEventListener('change', function() {
        setMinimumTimeOnPage(document.getElementById('setting-timeout').value);
    });
});