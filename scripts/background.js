// Browser branding
if (navigator.userAgent.includes('Vivaldi')) {
    var browserName = 'Vivaldi';
    var browserIcon = 'https://vivaldi.com/assets/vivaldi-logo-32.png';
}
else if (navigator.userAgent.includes('Chrome')) {
    var browserName = 'Google Chrome';
    var browserIcon = 'https://www.google.com/images/icons/product/chrome-32.png';
}
else if (navigator.userAgent.includes('Firefox')) {
    var browserName = 'Firefox';
    var browserIcon = 'https://www.mozilla.org/media/img/logos/firefox/logo-quantum.png';
}


// Get and monitor access token for changes
var accessToken;

function UpdateAccessToken() {
    // Get the access token (may be null if not logged in)
    chrome.storage.local.get('access_token', function(data) {
        // Only run this code if an access token exists
        if (data.access_token !== null) {
            accessToken = data.access_token;
        }
    });

}

UpdateAccessToken();
chrome.storage.onChanged.addListener(UpdateAccessToken);


// Submit collected activity data to Microsoft
function SendActivityBeacon(webActivity) {

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
    
    console.log(data);

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
        console.debug(response);
        response.text().then(function(text){console.debug(text)});
    });

}


function HandleMessages(request, sender, sendResponse) {
    console.debug('Message received');

    if (request.type == 'WebActivity' && request.payload) {
        SendActivityBeacon(request.payload);
    }
}

chrome.runtime.onMessage.addListener(HandleMessages);

