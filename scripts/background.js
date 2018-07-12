// Scopes required for this extension
const scopes = ['UserActivity.ReadWrite.CreatedByApp', 'offline_access'];

// Redirect url for auth login
const redirectURL = chrome.identity.getRedirectURL();

// Access token for the users Microsoft Account
var accessToken;

// Some features are browser specific (such as branding and client id)
if (navigator.userAgent.includes('Vivaldi')) {
    // Branding
    var browserName = 'Vivaldi';
    var browserIcon = 'https://vivaldi.com/assets/vivaldi-logo-32.png';

     // Client Id
     var clientId = '';
}
else if (navigator.userAgent.includes('Chrome')) {
    // Branding
    var browserName = 'Google Chrome';
    var browserIcon = 'https://www.google.com/images/icons/product/chrome-32.png';

     // Client Id
     var clientId = '70c5f06f-cef4-4541-a705-1adeea3fa58f';
}
else if (navigator.userAgent.includes('Firefox')) {
    // Branding
    var browserName = 'Firefox';
    var browserIcon = 'https://www.mozilla.org/media/img/logos/firefox/logo-quantum.png';

    // Client Id
    var clientId = '6a421ae0-f2b1-4cf9-84e0-857dc0a4c9a3';
}

// Get the access token (may be null if not logged in)
chrome.storage.local.get('access_token', function(data) {
    // Only run this code if an access token exists
    if (data.access_token !== null) {
        accessToken = data.access_token;
    }
});

// Submit collected activity data to Microsoft
function SendActivityBeacon(webActivity, secondAttempt) {

    if (!accessToken) {
        console.error('Unauthorized, no auth token set.');
        return false;
    }

    // Get the current date time and time zone
    let date = new Date().toISOString();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Grab the activity id (url with // replaced with _)
    let activityId = encodeURIComponent(webActivity.activityDescription.replace(/\//g, '_'));

    // Create the microsoft graph activity url
    let url = `https://graph.microsoft.com/v1.0/me/activities/${activityId}`;

    let data = JSON.stringify({
        'appActivityId': activityId,
        'activitySourceHost': webActivity.activityOriginUrl,
        'userTimezone': timeZone,
        'appDisplayName': browserName,
        'activationUrl': webActivity.activityDescription,
        'fallbackUrl': webActivity.activityDescription,
        'visualElements': {
            'attribution': {
                'iconUrl': browserIcon,
                'alternateText': webActivity.activityOriginUrl,
                'addImageQuery': 'false'
            },
            'description': webActivity.activityDescription,
            'displayText': webActivity.activityTitle,
            'content': {
                '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                'type': 'AdaptiveCard',
                'backgroundImage': webActivity.backgroundImage,
                'body':
                [{
                    'type': 'Container',
                    'items': [{
                        'type': 'TextBlock',
                        'text': webActivity.activityTitle,
                        'weight': 'bolder',
                        'size': 'large',
                        'wrap': true,
                        'maxLines': 3
                    },{
                        'type': 'TextBlock',
                        'text': webActivity.activityDescription,
                        'size': 'default',
                        'wrap': true,
                        'maxLines': 3
                    }]
                }]
            }
        },
        "historyItems":[
            {
                "userTimezone": timeZone,
                "startedDateTime": date,
                "lastActiveDateTime": date,
            }
        ]
    });
    
    // Perform a fetch
    fetch(url, {
        body: data,
        cache: 'no-cache', 
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'PUT'
    }).then(function(response) {
        // The user is not allowed to access this resource
        if (response.status === 401) {
            console.debug("Returned 401, attempting to login the user again...");

            // Get a new token
            Login(true);

            // Retry recording activity once
            if (!secondAttempt) {
                SendActivityBeacon(webActivity, true);
            }
        }

        console.debug(response);
        response.text().then(function(text){console.debug(text)});
    });

}

// Open the Microsoft account login dialog, let the user login,
// grab the token and then store it for later use.
function Login(silent) {
    // Build the request url
    let authURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        authURL += `?client_id=${clientId}`;
        authURL += `&response_type=token`;
        authURL += `&response_mode=fragment`;
        authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
        authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;

    // If refreshing a token, don't display UI
    if (silent)
        authURL += `&prompt=none`;

    // Launch the web flow to login the user
    // COMPAT: Firefox requires promise, Chrome requires callback.
    if (typeof browser === 'undefined' || !browser) {
        chrome.identity.launchWebAuthFlow({
            'url': authURL,
            'interactive': !silent
        }, ValidateLogin);
    } else {
        browser.identity.launchWebAuthFlow({
            'url': authURL,
            'interactive': !silent
        }).then(ValidateLogin);
    }
}

function Logout() {
    chrome.storage.local.remove('access_token');

    // Update the local variable
    accessToken = undefined;
}

// Take in the redirect url and grab the access 
// token from it.
function ValidateLogin(redirect_url) {
    console.log(redirect_url);

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

    // If there is an error, log it
    if (pairsKeyValuePair["error"] != null)
        console.error(pairsKeyValuePair["error_description"]);
    
    // Save the token in storage so it can be used later
    chrome.storage.local.set({ 
        'access_token' : pairsKeyValuePair['access_token'] 
    }, null);

    // Update the local variable
    accessToken = pairsKeyValuePair['access_token'];
}

// Handle messages sent to this background script. Handles either
// activity or login requests.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Send a web activity request to the Microsoft Graph.
    if (request.type == 'WebActivity' && request.payload) {
        SendActivityBeacon(request.payload);
    }

    // The user has requested a login, open the login dialog 
    else if (request.type == 'Login') {
        Login(false);
    }
    // The user has requested a logout
    else if (request.type == 'Logout') {
        Logout();
    }
});
