import { ActivityMessage } from './common/messages/activity-message';
import { Message } from './common/messages/message';

let minimumTimeOnPage = 8;

// Only run in main frame (primary document)
if (window.parent.location === window.location) {

    // Get minimum time on page time
    (chrome.storage.sync || chrome.storage.local).get('min_sec_loaded', (data) => {
        if (data.min_sec_loaded) {
            minimumTimeOnPage = data.min_sec_loaded;
        }

        // Run when document has loaded
        (document.readyState === 'complete' || document.readyState === 'interactive')
            ? CreateOrUpdateActivity() : document.addEventListener('DOMContentLoaded', CreateOrUpdateActivity);
    });
}

// Create or update the activity
function CreateOrUpdateActivity() {
    // Activity data
    const title = (document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]') === null) ? document.title
        : (document.querySelector('meta[property="og:title"][content],meta[name="og:title"][content]') as HTMLMetaElement).content;

    const url = (document.querySelector('link[rel~="canonical"][href]') === null)
        ? ((document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]') === null) ? document.location.toString()
        : (document.querySelector('meta[property="og:url"][content],meta[name="og:url"][content]') as HTMLMetaElement).content)
        : (document.querySelector('link[rel~="canonical"][href]') as HTMLLinkElement).href;

    const origin = new URL(url).hostname;

    const image = (document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]') === null) ? ''
        : (document.querySelector('meta[property="og:image"][content],meta[name="og:image"][content]') as HTMLMetaElement).content;

    const icon = (document.querySelector('link[rel~="icon"][type="image/png"][sizes="24x24"][href],link[rel~="icon"][sizes~="24x24"][href],link[rel~="icon"][href]') === null) ? ''
        : (document.querySelector('link[rel~="icon"][type="image/png"][sizes="24x24"][href],link[rel~="icon"][sizes~="24x24"][href],link[rel~="icon"][href]') as HTMLLinkElement).href;

    // Build the message
    const message = new ActivityMessage(title, url, origin, image, icon);

    setTimeout((activityMessage) => {
        // send activity data to background script
        Message.sendMessage(activityMessage);
    }, (minimumTimeOnPage * 1000), message);
}
