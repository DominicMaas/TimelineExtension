// Run when document has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the login button and bind the click event
    document.getElementById('login').addEventListener('click', function() {
        // Create the login message
        let loginMessage = { type: 'Login' };
        // Send the login request to the background script
        chrome.runtime.sendMessage(loginMessage);
    });
});