// Microsoft graph client id 
const ClientID = '70c5f06f-cef4-4541-a705-1adeea3fa58f'; 

// Scopes that we need
const Scopes = ['UserActivity.ReadWrite.CreatedByApp', 'offline_access'];

// Run when document has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the login button and bind the click event
    document.getElementById('login').addEventListener('click', Login());
});

// Open the Microsoft account login dialog, let the user login,
// grab the token and then store it for later use.
function Login() {
    // Build the request url
    let authURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        authURL += `?client_id=${ClientID}`;
        authURL += `&response_type=code`;
        authURL += `&response_mode=query`;
        authURL += `&redirect_uri=${encodeURIComponent('https://mmpefenajbmfcmgfadibmkmancoljggp.chromiumapp.org/provider_cb')}`;
        authURL += `&scope=${encodeURIComponent(Scopes.join(' '))}`;

    // Launch the web flow to login the user
    chrome.identity.launchWebAuthFlow({
        'url': authURL,
        'interactive': true
    }, redirect_url => {
        let code = (redirect_url.match(/code=([^&]+)/))[1];
        alert(code);
    });
}