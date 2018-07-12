var settingsToggle = false;

// Run when document has loaded
document.addEventListener('DOMContentLoaded', function() {

    // Get the login button and bind the click event
    document.getElementById('toggle-settings').addEventListener('click', function() {

        document.getElementById('section-login').style.display = settingsToggle ? 'block' : 'none';
        document.getElementById('section-settings').style.display = settingsToggle ? 'none' : 'block';

        document.getElementById('toggle-settings').textContent = settingsToggle ? 'Settings' : 'Back';

        settingsToggle = !settingsToggle;
    });

    // Get the login button and bind the click event
    document.getElementById('login').addEventListener('click', function() {
        // Create the login message
        let loginMessage = { type: 'Login' };
        // Send the login request to the background script
        chrome.runtime.sendMessage(loginMessage);
    });
});
