// Only run in main frame (primary document)
if (window.parent.location == window.location) {
    // Run when document has loaded
    (document.readyState == 'complete' || document.readyState == 'interactive') 
        ? CreateOrUpdateActivity() : document.addEventListener('DOMContentLoaded', CreateOrUpdateActivity);
}

// Create or update the activity
function CreateOrUpdateActivity() {
    // Activity data
    let title = (document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]') === null) ? document.title : document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]').content;
    let url = (document.querySelector('link[rel~="canonical"][href]') === null) ? ((document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]') === null) ? document.location.toString() : document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]').content) : document.querySelector('link[rel~="canonical"][href]').href;
    let origin = location.origin.replace(/(^\w+:|^)\/\//, '');
    let image = (document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]') === null) ? '' : document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]').content;

    // Build the activity message to send to the 
    // background thread.
    let activityMessage = {
        type: 'WebActivity',
        payload: {
            activityTitle: title,
            activityDescription: url,
            activityOriginUrl: origin,
            backgroundImage: image
        }
    }

    // send activity data to background script
    chrome.runtime.sendMessage(activityMessage);
}
