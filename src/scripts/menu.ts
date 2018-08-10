import * as AdaptiveCards from "adaptivecards";
import { Helpers } from './common/helpers';
import { GetActivitiesMessage } from './common/messages/get-activities-message';
import { GetRemoteDevicesMessage } from './common/messages/get-remote-devices-message';
import { LoginMessage } from './common/messages/login-message';
import { LogoutMessage } from './common/messages/logout-message';
import { Message } from './common/messages/message';
import { OpenOnRemoteDeviceMessage } from './common/messages/open-on-remote-device-message';

let minimumTimeOnPage: number = 8;
let accessToken: string;

// Get local preferences
chrome.storage.local.get('access_token', (data) => {
    if (data.access_token !== null) {
        accessToken = data.access_token;
        UpdateLoginState();
    }
});

// Get synced preferences
(chrome.storage.sync || chrome.storage.local).get('min_sec_loaded', (data) => {
    if (data.min_sec_loaded) {
        minimumTimeOnPage = data.min_sec_loaded;
        updateMinimumTimeOnPage();
    }
});

function updateMinimumTimeOnPage() {
    (document.getElementById('setting-timeout') as HTMLInputElement).value = minimumTimeOnPage.toString();
}

function setMinimumTimeOnPage(value: number) {
    (chrome.storage.sync || chrome.storage.local).set({
        min_sec_loaded : value
    }, null);
    minimumTimeOnPage = value;
}

// Update the UI to reflect the internal login state.
function UpdateLoginState() {
    document.getElementById('section-login-pending').style.display = accessToken ? 'none' : 'block';
    document.getElementById('section-login-completed').style.display = accessToken ? 'block' : 'none';
}

// Run when document has loaded
document.addEventListener('DOMContentLoaded', () => {
    // Translate the page
    Helpers.LocalizeHtmlPage();

    // Set some initial views and states
    UpdateLoginState();
    updateMinimumTimeOnPage();

    // When the user clicks on the activities button
    attachClickEvent('view-activities', () => {
        // Update UI
        document.getElementById('section-main').style.display = 'none';
        document.getElementById('section-activities').style.display = 'block';

        // We are loading
        document.getElementById('activity-status').innerText = 'Loading...';
        document.getElementById('activity-status').style.display = 'block';

        // Send a message to get activities
        Message.sendMessageWithResult<any>(new GetActivitiesMessage(), (data) => {
            // If the message was not successful, say why
            if (!data.success) {
                document.getElementById('activity-status').innerText = data.reason;
                return;
            }

            // If the array is empty
            if (data.payload.length === 0) {
                document.getElementById('activity-status').innerText = 'No recent activities.';
                return;
            }

            // We have loaded
            document.getElementById('activity-status').innerText = '';
            document.getElementById('activity-status').style.display = 'none';
            document.getElementById('activities-holder').innerHTML = '';

            // Get the div that holds all the activities
            const activitiesHolder = document.getElementById('activities-holder');

            // Loop through all the activities
            data.payload.forEach((activity) => {
                // Create an AdaptiveCard instance
                const adaptiveCard = new AdaptiveCards.AdaptiveCard();

                // Host Config defines the style and behavior of a card
                adaptiveCard.hostConfig = new AdaptiveCards.HostConfig({
                    containerStyles: {
                        default: {
                            backgroundColor: "#FF37474F",
                            foregroundColors: {
                                default: {
                                    default: "#FFEEEEEE",
                                    subtle: "#FFEEEEEE"
                                }
                            }
                        }
                    },
                    fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
                });

                // Set the version so the card wil render
                activity.visualElements.content.version = "1.0";

                // Parse the card payload
                adaptiveCard.parse(activity.visualElements.content);

                // Render the card to an HTML element:
                const renderedCard = adaptiveCard.render();

                // Insert the card
                activitiesHolder.insertAdjacentHTML('beforeend', '<a class="activity-card" target="_blank" href="' + activity.activationUrl + '">' + renderedCard.outerHTML + '</a>');
            });
        });
    });

    // When the user clicks on the devices button
    attachClickEvent('view-devices', () => {
        // Update UI
        document.getElementById('section-main').style.display = 'none';
        document.getElementById('section-remote').style.display = 'block';

        // We are loading
        document.getElementById('remote-status').innerText = 'Loading...';
        document.getElementById('remote-status').style.display = 'block';

        // Send a message to get the devices
        Message.sendMessageWithResult<any>(new GetRemoteDevicesMessage(), (data) => {
            console.log(data);
            // If the message was not successful, say why
            if (!data.success) {
                document.getElementById('remote-status').innerText = data.reason;
                return;
            }

            // If the array is empty
            if (data.payload.length === 0) {
                document.getElementById('remote-status').innerText = 'No devices.';
                return;
            }

            // We have loaded
            document.getElementById('remote-status').innerText = '';
            document.getElementById('remote-status').style.display = 'none';
            document.getElementById('devices-holder').innerHTML = '';

            // Get the div that holds all the devices
            const devicesHolder = document.getElementById('devices-holder');

            // Loop through all the devices
            data.payload.forEach((device) => {
                // Get the description
                const description = device.Model == null ? device.Platform + ' Device' : device.Model;

                // Update UI
                devicesHolder.insertAdjacentHTML('beforeend', '<a id="remote-device-' + device.id + '" class="inline-button"><div class="status-icon ' + device.Status + '"></div><p>' + device.Name + '<p class="description">' + description + '</p></p></a>');

                // Attach click event to item
                attachClickEvent('remote-device-' + device.id, () => {
                    // Query for the active tab in this window
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        // Send the message and then close the popup
                        Message.sendMessage(new OpenOnRemoteDeviceMessage(device.id, tabs[0].url));
                        window.close();
                    });
                });
            });
        });
    });

    // When the user clicks the settings button
    attachClickEvent('settings', () => {
        document.getElementById('section-main').style.display = 'none';
        document.getElementById('section-settings').style.display = 'block';
    });

    // When the user closes the settings pane
    attachClickEvent('exit-settings', () => {
        document.getElementById('section-main').style.display = 'block';
        document.getElementById('section-settings').style.display = 'none';
    });

    // When the user clicks on the about button
    attachClickEvent('about', () => {
        document.getElementById('section-main').style.display = 'none';
        document.getElementById('section-about').style.display = 'block';
    });

    // When the user closes the about pane
    attachClickEvent('exit-about', () => {
        document.getElementById('section-main').style.display = 'block';
        document.getElementById('section-about').style.display = 'none';
    });

    // When the user closes the devices pane
    attachClickEvent('exit-remote', () => {
        document.getElementById('section-main').style.display = 'block';
        document.getElementById('section-remote').style.display = 'none';
    });

    // When the user closes the activities pane
    attachClickEvent('exit-activities', () => {
        document.getElementById('section-main').style.display = 'block';
        document.getElementById('section-activities').style.display = 'none';
    });

    // login flow
    attachClickEvent('login', () => {
        // Send the message and close
        Message.sendMessage(new LoginMessage());
        window.close();
    });

    // log out flow
    attachClickEvent('logout', () => {
        // Send the message and close
        Message.sendMessage(new LogoutMessage('User initiated logout'));
        window.close();
    });

    // When the user changes the timeout field
    document.getElementById('setting-timeout').addEventListener('change', () => {
        setMinimumTimeOnPage(Number((document.getElementById('setting-timeout') as HTMLInputElement).value));
    });
});

function attachClickEvent(elementName: string, callback: (ev: MouseEvent) => any) {
    document.getElementById(elementName).addEventListener('click', callback);
}
