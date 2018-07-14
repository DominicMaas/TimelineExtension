// @ts-check

// Scopes required for this extension
// UserActivity.ReadWrite.CreatedByApp - Timeline Support
// Device.Read - Read devices connected to Microsoft account (project rome)
// Device.Command - Launch url on another device
// offline_access - refresh tokens
const scopes = ['UserActivity.ReadWrite.CreatedByApp', 'Device.Read', 'Device.Command', 'offline_access'];

// Redirect url for auth login
const redirectURL = chrome.identity.getRedirectURL();

// Access and refresh token for the users Microsoft Account
var accessToken;
var refreshToken;

// Client branding
if (navigator.userAgent.includes('Vivaldi')) {
    var browserName = 'Vivaldi';
    var browserIcon = 'https://timeline.dominicmaas.co.nz/assets/browsers/vivaldi-32.png';
}
else if (navigator.userAgent.includes('Chrome')) {
    var browserName = 'Google Chrome';
    var browserIcon = 'https://timeline.dominicmaas.co.nz/assets/browsers/chrome-32.png';
}
else if (navigator.userAgent.includes('Firefox')) {
    var browserName = 'Firefox';
    var browserIcon = 'https://timeline.dominicmaas.co.nz/assets/browsers/firefox.png';
}

// Client Id
if (navigator.userAgent.includes('Firefox')) {
    // Mozilla Add-Ons Catalog – (Firefox, Tor Browser)
    var clientId = '6a421ae0-f2b1-4cf9-84e0-857dc0a4c9a3';
}
else if (navigator.userAgent.includes('Chrome')) {
    // Chrome Web Store – (Google Chrome, Chromium, Vivaldi, others)
    var clientId = '70c5f06f-cef4-4541-a705-1adeea3fa58f';
}
else {
    console.error('Unrecognized web browser, unknown client ID.');
}

chrome.storage.local.get(['access_token', 'refresh_token'], function(data) {
    // Get the access token (may be null if not logged in)
    if (data.access_token !== null) {
        accessToken = data.access_token;
    }
    // Get the refresh token (may be null if not logged in)
    if (data.refresh_token !== null) {
        refreshToken = data.refresh_token;
    }
});


/**
 * Submit collected activity data to Microsoft
 * @param {*} webActivity The activity to post
 * @param {boolean} secondAttempt If this is the second attempt at posting the activity
 */
function SendActivityBeacon(webActivity, secondAttempt) {
    // Don't run if the user has not logged in
    if (!accessToken) {
        console.error('Unauthorized, no auth token set.');
        return false;
    }

    // Get the current date time and time zone
    let date = new Date().toISOString();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Encode the url
    let activityId = window.btoa(webActivity.activityDescription);

    // Create the microsoft graph activity url
    let url = `https://graph.microsoft.com/v1.0/me/activities/${activityId}`;

    // Get icon
    let icon = webActivity.iconUrl === '' ? browserIcon : webActivity.iconUrl;

    let data = JSON.stringify({
        'appActivityId': activityId,
        'activitySourceHost': webActivity.activityOriginUrl,
        'userTimezone': timeZone,
        'appDisplayName': browserName,
        'activationUrl': webActivity.activityDescription,
        'fallbackUrl': webActivity.activityDescription,
        'visualElements': {
            'attribution': {
                'iconUrl': icon,
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
    
    console.debug(data);

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
            console.debug("Returned 401, refreshing access token...");

            // Get a new token
            RefreshToken();

            // Retry recording activity once
            if (!secondAttempt) {
                SendActivityBeacon(webActivity, true);
            }
        }

        // Log the response
        response.text().then(function(text){console.debug(text)});
    });

}

// Open the Microsoft account login dialog, let the user login,
// grab the token and then store it for later use.

/**
 * Login the user into their Microsoft Account.
 */
function Login() {
    // Build the request url
    let authURL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        authURL += `?client_id=${clientId}`;
        authURL += `&response_type=code`;
        authURL += `&response_mode=query`;
        authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
        authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;

    // Launch the web flow to login the user
    // COMPAT: Firefox requires promise, Chrome requires callback.
    if (typeof browser === 'undefined' || !browser) {
        chrome.identity.launchWebAuthFlow({
            'url': authURL,
            'interactive': true
        }, ValidateLogin);
    } else {
        browser.identity.launchWebAuthFlow({
            'url': authURL,
            'interactive': true
        }).then(ValidateLogin);
    }
}

/**
 * Logout the user from their Microsoft Account and delete any cached resources.
 */
function Logout() {
    // Remove the stored values
    chrome.storage.local.remove('preferred_username');
    chrome.storage.local.remove('access_token');

    // Update the local variables
    accessToken = undefined;
    refreshToken = undefined;
}

/**
 * Callback for the Login method. Extracts the oauth code from the
 * redirect url, calls the azure function to get both an access and 
 * refresh token.
 * @param {string} redirect_url Url containing the oauth code
 */
function ValidateLogin(redirect_url) {
    // Get the data from the redirect url
    let data = redirect_url.split('?')[1];

    // Split the data into pairs
    var dataArray = data.split('&');
    
    // Object that will store the key value pairs
    var parameters = {};

    // Store the data into a key value pair object
    for (var pair in dataArray) {
        var split = dataArray[pair].split('=');
        parameters[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
    }

    // If the request was not successful, log it
    if (parameters['error'] != null) {
        // Log the error, TODO: show some type of error dialog.
        console.error(parameters['error_description']);

        // Clear any tokens that may be cached.
        Logout();
    } else {
        // Get the code
        let code = parameters['code'];

        // Call the wrapper service which will handle getting the access and refresh tokens
        // The code for this function is located in the 'auth-backend' branch.
        fetch('https://ge-functions.azurewebsites.net/api/get-token', {
            body: JSON.stringify({
                'client_id': clientId,
                'scope': scopes.join(' '),
                'code': code,
                'redirect_uri': redirectURL
            }),
            method: 'POST'
        }).then(function(response) {
            // Get the data as json and update the variables
            response.json().then(function(json) {
                // Handle Server Errors
                if (json.error !== null) {
                    // Save the token in storage so it can be used later
                    chrome.storage.local.set({ 
                        'access_token' : json.access_token,
                        'refresh_token': json.refresh_token
                    }, null);

                    // Update the local variable
                    accessToken = json.access_token;
                    refreshToken = json.refresh_token;
                } else {
                    // Log the error, TODO: show some type of error dialog.
                    console.error(json.error_description);

                    // Clear any tokens that may be cached.
                    Logout();
                }
            })
        });
    }
}

/**
 * Calls the refresh azure function which will return a new refresh and 
 * access token so we can continue accessing resources from the Microsoft Graph.
 */
function RefreshToken() {
    fetch('https://ge-functions.azurewebsites.net/api/refresh-token', {
        body: JSON.stringify({
            'client_id': clientId,
            'scope': scopes.join(' '),
            'refresh_token': refreshToken,
            'redirect_uri': redirectURL
            }),
            method: 'POST'
        }).then(function(response) {
            // Get the data as json and update the variables
            response.json().then(function(json) {
                // Handle Server Errors
                if (json.error !== null) {
                    // Save the token in storage so it can be used later
                    chrome.storage.local.set({ 
                        'access_token' : json.access_token,
                        'refresh_token': json.refresh_token
                    }, null);

                    // Update the local variable
                    accessToken = json.access_token;
                    refreshToken = json.refresh_token;
                } else {
                    // Log the error, TODO: show some type of error dialog.
                    console.error(json.error_description);

                    // Clear any tokens that may be cached.
                    Logout();
                }
            })
        });
}

function GetRemoteDevices(secondAttempt)
{
    return fetch('https://graph.microsoft.com/beta/me/devices/', {
        cache: 'no-cache', 
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'GET'
    }).then(function(response) {
        // The user is not allowed to access this resource
        if (response.status === 401) {
            console.debug("Returned 401, refreshing access token...");

            // Get a new token
            RefreshToken();

            // Retry recording activity once
            if (!secondAttempt) {
                return GetRemoteDevices(true);
            }
            else
            {
                return {
                    success : false,
                    reason: 'Could not authorize user. Please try again.',
                    payload: null
                }
            }
        }

        return response.json().then(function(json) {
            return {
                success : true,
                reason: '',
                payload: json.value
            }
        });
    });
}

function LaunchOnRemoteDevice(payload)
{
    console.log(payload);

    fetch('https://graph.microsoft.com/beta/me/devices/' + payload.id + '/commands', {
        body: '{"type":"LaunchUri","payload":{"uri":"'+payload.url+'"}}',
        cache: 'no-cache', 
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'POST'
    }).then(function(response) {
        // Log the response
        response.text().then(function(text){console.debug(text)});
    });
}

/**
 * Handle messages sent to this background script. Handles either
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (typeof request === 'undefined') {
        return;
    }

    // Send a web activity request to the Microsoft Graph.
    else if (request.type == 'WebActivity' && request.payload) {
        SendActivityBeacon(request.payload, false);
    }

    // The user has requested a login, open the login dialog 
    else if (request.type == 'Login') {
        Login();
    }

    // The user has requested a logout
    else if (request.type == 'Logout') {
        Logout();
    }

    else if (request.type == 'RemoteDevices') {
        GetRemoteDevices(false).then(function(data) {
            sendResponse(data);
        });
    }

    else if (request.type == 'RemoteNavigate' && request.payload) {
        LaunchOnRemoteDevice(request.payload);
    }

    return true;
});
