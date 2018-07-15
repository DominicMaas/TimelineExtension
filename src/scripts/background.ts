import { ActivityMessage } from './common/messages/activity-message';
import { ErrorMessage } from './common/messages/error-message';
import { Message } from './common/messages/message';
import { MessageType } from './common/messages/message-type';
import { OpenOnRemoteDeviceMessage } from './common/messages/open-on-remote-device-message';

// Scopes required for this extension
// UserActivity.ReadWrite.CreatedByApp - Timeline Support
// Device.Read - Read devices connected to Microsoft account (project rome)
// Device.Command - Launch url on another device
// offline_access - refresh tokens
const scopes = ['UserActivity.ReadWrite.CreatedByApp', 'Device.Read', 'Device.Command', 'offline_access'];

// Redirect url for auth login
const redirectURL = chrome.identity.getRedirectURL();

// Auth variables
let accessToken: string;
let refreshToken: string;
let clientId: string;

// Browser resources
let browserName: string;
let browserIcon: string;

// Client branding
if (navigator.userAgent.includes('Vivaldi')) {
    browserName = 'Vivaldi';
    browserIcon = 'https://timeline.dominicmaas.co.nz/assets/browsers/vivaldi-32.png';
} else if (navigator.userAgent.includes('Chrome')) {
    browserName = 'Google Chrome';
    browserIcon = 'https://timeline.dominicmaas.co.nz/assets/browsers/chrome-32.png';
} else if (navigator.userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    browserIcon = 'https://timeline.dominicmaas.co.nz/assets/browsers/firefox.png';
}

// Client Id
if (navigator.userAgent.includes('Firefox')) {
    // Mozilla Add-Ons Catalog – (Firefox, Tor Browser)
    clientId = '6a421ae0-f2b1-4cf9-84e0-857dc0a4c9a3';
} else if (navigator.userAgent.includes('Chrome')) {
    // Chrome Web Store – (Google Chrome, Chromium, Vivaldi, others)
    clientId = '70c5f06f-cef4-4541-a705-1adeea3fa58f';
} else {
    console.error('Unrecognized web browser, unknown client ID.');
}

// Get stored tokens
chrome.storage.local.get(['access_token', 'refresh_token'], (data) => {
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
 * @param webActivity The activity to post
 * @param secondAttempt If this is the second attempt at posting the activity
 */
async function sendActivityAsync(webActivity: ActivityMessage, secondAttempt: boolean = false): Promise<void> {
    // Don't run if the user has not logged in
    if (!accessToken) {
        console.error('Unauthorized, no auth token set.');
        return;
    }

    // Get the current date time and time zone
    const date = new Date().toISOString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Encode the url
    const activityId = window.btoa(webActivity.Description);

    // Create the microsoft graph activity url
    const url = `https://graph.microsoft.com/v1.0/me/activities/${activityId}`;

    // Get icon
    const icon = webActivity.IconImage === '' ? browserIcon : webActivity.IconImage;

    // Build the data
    const data = JSON.stringify({
        activationUrl: webActivity.Description,
        activitySourceHost: webActivity.OriginUrl,
        appActivityId: activityId,
        appDisplayName: browserName,
        fallbackUrl: webActivity.Description,
        historyItems: [{
            lastActiveDateTime: date,
            startedDateTime: date,
            userTimezone: timeZone,
        }],
        userTimezone: timeZone,
        visualElements: {
            attribution: {
                addImageQuery: false,
                alternateText: webActivity.OriginUrl,
                iconUrl: icon
            },
            content: {
                $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                backgroundImage: webActivity.BackgroundImage,
                body:
                [{
                    items: [{
                        maxLines: 3,
                        size: 'large',
                        text: webActivity.Title,
                        type: 'TextBlock',
                        weight: 'bolder',
                        wrap: true,
                    }, {
                        maxLines: 3,
                        size: 'default',
                        text: webActivity.Description,
                        type: 'TextBlock',
                        wrap: true
                    }],
                    type: 'Container',
                }],
                type: 'AdaptiveCard'
            },
            description: webActivity.Description,
            displayText: webActivity.Title,
        }
    });

    // Call the url and get the response
    const response = await fetch(url, {
        body: data,
        cache: 'no-cache',
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'PUT'
    });

    // If we get a 401 in return, we need to refresh the token
    if (response.status === 401) {
        console.debug("Returned 401, refreshing access token...");

        // Attempt to refresh the token
        const refreshStatus = await refreshTokenAsync();

        // If the refresh is successful and this is our first try,
        // call the method again
        if (refreshStatus && !secondAttempt) {
            return await sendActivityAsync(webActivity, true);
        } else {
            console.error("Could not post activity to Windows Timeline: " + webActivity);
            return;
        }
    }

    const body = await response.json();
    console.debug(body);
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
            interactive: true,
            url: authURL
        }, ValidateLogin);
    } else {
        browser.identity.launchWebAuthFlow({
            interactive: true,
            url: authURL
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
 * @param redirectUrl Url containing the oauth code
 */
function ValidateLogin(redirectUrl: string) {
    // Get the data from the redirect url
    const data = redirectUrl.split('?')[1];

    // Split the data into pairs
    const dataArray = data.split('&');

    // Object that will store the key value pairs
    const parameters = {
        code: null,
        error: null,
        error_description: null
    };

    // Store the data into a key value pair object
    for (const pair in dataArray) {
        const split = dataArray[pair].split('=');
        parameters[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
    }

    // If the request was not successful, log it
    if (parameters.error != null) {
        // Log the error, TODO: show some type of error dialog.
        console.error(parameters.error_description);

        // Clear any tokens that may be cached.
        Logout();
    } else {
        // Get the code
        const urlCode = parameters.code;

        // Call the wrapper service which will handle getting the access and refresh tokens
        // The code for this function is located in the 'auth-backend' branch.
        fetch('https://ge-functions.azurewebsites.net/api/get-token', {
            body: JSON.stringify({
                client_id: clientId,
                code: urlCode,
                redirect_uri: redirectURL,
                scope: scopes.join(' '),
            }),
            method: 'POST'
        }).then((response) => {
            // Get the data as json and update the variables
            response.json().then((json) => {
                // Handle Server Errors
                if (json.error !== null) {
                    // Save the token in storage so it can be used later
                    chrome.storage.local.set({
                        access_token : json.access_token,
                        refresh_token: json.refresh_token
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
            });
        });
    }
}


/**
 * Calls the refresh azure function which will return a new refresh and
 * access token so we can continue accessing resources from the Microsoft Graph.
 */
async function refreshTokenAsync(): Promise<boolean> {
    // Perform a post request to update the stored token
    const response = await fetch('https://ge-functions.azurewebsites.net/api/refresh-token', {
        body: JSON.stringify({
            client_id: clientId,
            redirect_uri: redirectURL,
            refresh_token: refreshToken,
            scope: scopes.join(' ')
        }),
        method: 'POST'
    });

    // Grab the response body
    const body = await response.json();

    // If the error is not null, run this code
    if (body.error !== null) {
        // Show an error message to the user and logout
        Message.sendMessage(new ErrorMessage('Error refreshing token', body.error_description));
        Logout();
        return false;
    }

    // Save the token in storage so it can be used later
    chrome.storage.local.set({
        access_token : body.access_token,
        refresh_token: body.refresh_token
    }, null);

    // Update the local variable
    accessToken = body.access_token;
    refreshToken = body.refresh_token;

    // Everything was successful
    return true;
}

/**
 * Returns a list of devices that belong to the logged in users account
 * @param secondAttempt If this is the second attempt at calling this function
 */
async function getRemoteDevicesAsync(secondAttempt: boolean = false): Promise<any> {
    // Attempt to grab a list of the users devices
    const response = await fetch('https://graph.microsoft.com/beta/me/devices/', {
        cache: 'no-cache',
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'GET'
    });

    // If we get a 401 in return, we need to refresh the token
    if (response.status === 401) {
        console.debug("Returned 401, refreshing access token...");

        // Attempt to refresh the token
        const refreshStatus = await refreshTokenAsync();

        // If the refresh is successful and this is our first try,
        // call the method again
        if (refreshStatus && !secondAttempt) {
            return await getRemoteDevicesAsync(true);
        } else {
            return {
                payload: null,
                reason: 'Could not authorize user. Please try again.',
                success : false
            };
        }
    }

    // Grab the JSON body
    const body = await response.json();

    // Return the list of devices
    return {
        payload: body.value,
        reason: '',
        success : true
    };
}

function LaunchOnRemoteDevice(payload: OpenOnRemoteDeviceMessage) {
    fetch('https://graph.microsoft.com/beta/me/devices/' + payload.DeviceId + '/commands', {
        body: '{"type":"LaunchUri","payload":{"uri":"' + payload.Url + '"}}',
        cache: 'no-cache',
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'POST'
    }).then((response) => {
        // Log the response
        response.text().then((text) => { console.debug(text); });
    });
}

/**
 * Handle messages sent to this background script. Handles either
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (typeof request === 'undefined') {
        return;
    }

    // Send a web activity request to the Microsoft Graph.
    if ((request as Message).Type === MessageType.PublishActivity) {
        sendActivityAsync(request as ActivityMessage);
        return;
    }

    // The user has requested a login, open the login dialog
    if ((request as Message).Type === MessageType.Login) {
        Login();
        return;
    }

    // The user has requested a logout
    if ((request as Message).Type === MessageType.Logout) {
        Logout();
        return;
    }

    if ((request as Message).Type === MessageType.GetRemoteDevices) {
        getRemoteDevicesAsync().then((data) => {
            sendResponse(data);
        });

        return true;
    }

    if ((request as Message).Type === MessageType.OpenOnRemoteDevice) {
        LaunchOnRemoteDevice(request as OpenOnRemoteDeviceMessage);
        return;
    }
});
