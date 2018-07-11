// Run when document has loaded
(document.readyState == 'complete' || document.readyState == 'interactive') 
    ? Init() : document.addEventListener('DOMContentLoaded', Init);

// Code to run when the document has loaded
function Init() {
    // Get the access token (may be null if not logged in)
    chrome.storage.local.get('access_token', function(data) {
        // Only run this code if an access token exists
        if (data.access_token !== null) {
            CreateOrUpdateActivity(data.access_token);
        }
    }); 
}

// Create or update the activity
function CreateOrUpdateActivity(accessToken) {
    // Grab the activity id (url with // replaced with _)
    let activityId = encodeURIComponent(location.href.replace(/\//g, '_'));

    // Create the microsoft graph activity url
    let url = `https://graph.microsoft.com/beta/me/activities/${activityId}`;

    // Get the current date time and time zone
    let date = new Date().toISOString();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Activity data
    let activityTitle = (document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]') === null) ? document.title : document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]').content;
    let activityDescription = (document.querySelector('link[rel~="canonical"][href]') === null) ? ((document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]') === null) ? document.location : document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]').content) : document.querySelector('link[rel~="canonical"][href]').href;
    let activityOriginUrl = location.origin.replace(/(^\w+:|^)\/\//, '');
    let backgroundImage = (document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]') === null) ? '' : document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]').content;

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
    
    // Perform a fetch
    fetch(url, { 
        body: JSON.stringify({
            'appActivityId': activityId,
            'activitySourceHost': location.origin,
            'userTimezone': timeZone,
            'appDisplayName': browserName,
            'activationUrl': location.href,
            'fallbackUrl': location.href,
            'visualElements': {
                'attribution': {
                    'iconUrl': browserIcon,
                    'alternateText': activityOriginUrl,
                    'addImageQuery': 'false'
                },
                'description': activityDescription,
                'displayText': activityTitle,
                'content': {
                    '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                    'type': 'AdaptiveCard',
                    'backgroundImage': backgroundImage,
                    'body':
                    [{
                        'type': 'Container',
                        'items': [{
                            'type': 'TextBlock',
                            'text': activityTitle,
                            'weight': 'bolder',
                            'size': 'large',
                            'wrap': true,
                            'maxLines': 3
                        },{
                            'type': 'TextBlock',
                            'text': activityDescription,
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
        }),
        cache: 'no-cache', 
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'PUT'
    }).then(data => {
        console.log(data.json());
    });
}
