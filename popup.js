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
        authURL += `&response_type=token`;
        authURL += `&response_mode=fragment`;
        authURL += `&redirect_uri=${encodeURIComponent('https://mmpefenajbmfcmgfadibmkmancoljggp.chromiumapp.org/provider_cb')}`;
        authURL += `&scope=${encodeURIComponent(Scopes.join(' '))}`;

    // Launch the web flow to login the user
    chrome.identity.launchWebAuthFlow({
        'url': authURL,
        'interactive': true
    }, redirect_url => {
        // Get the data from the redirect url
        let data = redirect_url.split('#')[1];

        // Split the data into pairs
        var pairsArray = data.split('&');
        
        // Object that will store the key value pairs
        var pairsKeyValuePair = {};

        // Store the data into a key value pair object
        for (pair in pairsArray) {
            var split = pairsArray[pair].split('=');
            pairsKeyValuePair[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
        }

        // Save the token in storage so it can be used later
        chrome.storage.sync.set({ 
            'access_token' : pairsKeyValuePair['access_token'] 
        }, null);
    });
}