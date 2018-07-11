// Run when document has loaded
document.body.onload = Init();

// Code to run when the document has loaded
function Init() {
    // Get the access token (may be null if not logged in)
    chrome.storage.sync.get('access_token', function(data) {
        // Only run this code if an access token exists
        if (data.access_token !== null) {
            CreateOrUpdateActivity(data.access_token);
        }
    }); 
}

// Create or update the activity
function CreateOrUpdateActivity(accessToken) {
    // Activity Id
    let activityId = encodeURIComponent(location.href.replace(/\//g, '_'));

    // Create the url
    let url = 'https://graph.microsoft.com/beta/me/activities/';
        url += activityId;

    // Get the current date time
    let date = new Date().toISOString();
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Activity data
    let activityTitle = (document.querySelector('meta[property="og:title"],meta[name="og:title"]') === null) ? document.title : document.querySelector('meta[property="og:title"],meta[name="og:title"]').content;
    let activityDescription = location.href;
    let activityOriginUrl = location.origin.replace(/(^\w+:|^)\/\//, '');
    let backgroundImage = (document.querySelector('meta[property="og:image"],meta[name="og:image"]') === null) ? '' : document.querySelector('meta[property="og:image"],meta[name="og:image"]').content;

    if (navigator.userAgent.includes('Chrome')) {
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
