var settingsToggle = false;
var accessToken;

// Get the access token (may be null if not logged in)
chrome.storage.local.get('access_token', function(data) {
    // Only run this code if an access token exists


    if (data.access_token !== null) {
        accessToken = data.access_token;
        toggleLoginState();
    }
});


function toggleLoginState() {
    document.getElementById('section-login-pending').style.display = accessToken ? 'none' : 'block';
    document.getElementById('section-login-completed').style.display = accessToken ? 'block' : 'none';
}

// Run when document has loaded
document.addEventListener('DOMContentLoaded', function() {

    // login/logout views
    toggleLoginState();

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
});
