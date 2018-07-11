// Run when document has loaded
document.body.onload = Init();

// Code to run when the document has loaded
function Init() {
    // Get the access token (may be null if not logged in)
    chrome.storage.sync.get('access_token', function(data) {
        // Only run this code if an access token exists
        if (data.access_token !== null) {
            alert(data.access_token);
            CreateOrUpdateActivity(data.access_token);
        }
    }); 
}

// Create or update the activity
function CreateOrUpdateActivity(accessToken) {
    // Activity Id
    let activityId = encodeURIComponent(location.href.replace(/\//g, '_'));

    // Create the url
    let url = 'https://graph.microsoft.com/v1.0/me/activities/';
        url += activityId;

    // Perform a fetch
    fetch(url, { 
        body: JSON.stringify({
            'appActivityId': activityId,
        }),
        cache: 'no-cache', 
        headers: {
            'authorization': `Bearer ${accessToken}`,
            'content-type': 'application/json',
        },
        method: 'PUT'
    }).then(data => {
        console.log(data);
    });
}