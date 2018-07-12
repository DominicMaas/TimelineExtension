// Run when document has loaded
(document.readyState == 'complete' || document.readyState == 'interactive') 
    ? CreateOrUpdateActivity() : document.addEventListener('DOMContentLoaded', CreateOrUpdateActivity);


// Create or update the activity
function CreateOrUpdateActivity() {

    // Activity data
    let title = (document.querySelector('meta[property="og:title"],meta[name="og:title"]') === null) ? document.title : document.querySelector('meta[property="og:title"],meta[name="og:title"]').content;
    let url = (document.querySelector('link[rel~="canonical"][href]') === null) ? ((document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]') === null) ? document.location.toString() : document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]').content) : document.querySelector('link[rel~="canonical"][href]').href;
    let origin = new URL(activityDescription).hostname;
    let image = (document.querySelector('meta[property="og:image"],meta[name="og:image"]') === null) ? '' : document.querySelector('meta[property="og:image"],meta[name="og:image"]').content;

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
