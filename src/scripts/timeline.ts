
var minimumTimeOnPage = 8;

// Only run in main frame (primary document)
if (window.parent.location == window.location) {

    // Get minimum time on page time
    (chrome.storage.sync || chrome.storage.local).get('min_sec_loaded', function(data) {
        if (data.min_sec_loaded) {
            minimumTimeOnPage = data.min_sec_loaded;
        }

        // Run when document has loaded
        (document.readyState == 'complete' || document.readyState == 'interactive')
            ? CreateOrUpdateActivity() : document.addEventListener('DOMContentLoaded', CreateOrUpdateActivity);
    });
}

// Create or update the activity
function CreateOrUpdateActivity() {
    // Activity data
    let title = (document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]') === null) 
        ? document.title 
        : (<HTMLMetaElement> document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]')).content;
    
    let url = (document.querySelector('link[rel~="canonical"][href]') === null) 
        ? ((document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]') === null) 
        ? document.location.toString() 
        : (<HTMLMetaElement> document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]')).content) 
        : (<HTMLLinkElement> document.querySelector('link[rel~="canonical"][href]')).href;
    
    let origin = new URL(url).hostname;
    
    let image = (document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]') === null) 
    ? '' 
    : (<HTMLMetaElement> document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]')).content;
    
    let icon = (document.querySelector('link[rel~="icon"][type="image/png"][sizes="24x24"][href],link[rel~="icon"][sizes~="24x24"][href],link[rel~="icon"][href]') === null) 
    ? '' 
    : (<HTMLLinkElement> document.querySelector('link[rel~="icon"][type="image/png"][sizes="24x24"][href],link[rel~="icon"][sizes~="24x24"][href],link[rel~="icon"][href]')).href;
    
    // Build the activity message to send to the 
    // background thread.
    let activityMessage = {
        type: 'WebActivity',
        payload: {
            activityTitle: title,
            activityDescription: url,
            activityOriginUrl: origin,
            backgroundImage: image,
            iconUrl: icon
        }
    }

    setTimeout(function(activityMessage) {
        // send activity data to background script
        chrome.runtime.sendMessage(activityMessage);
    }, (minimumTimeOnPage * 1000), activityMessage);
}
