import { GetRemoteDevicesMessage } from './common/messages/get-remote-devices-message';
import { LoginMessage } from './common/messages/login-message';
import { LogoutMessage } from './common/messages/logout-message';
import { Message } from './common/messages/message';
import { OpenOnRemoteDeviceMessage } from './common/messages/open-on-remote-device-message';

let settingsToggle: boolean = false;
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

    // Set some initial views and states
    UpdateLoginState();
    updateMinimumTimeOnPage();

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
            // If the message was not successful, say why
            if (!data.success) {
                document.getElementById('remote-status').innerText = data.reason;
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

    // When the user toggles the settings button
    attachClickEvent('toggle-settings', () => {
        // Set the styles
        document.getElementById('section-home').style.display = settingsToggle ? 'block' : 'none';
        document.getElementById('section-settings').style.display = settingsToggle ? 'none' : 'block';

        // https://github.com/danklammer/bytesize-icons
        document.getElementById('toggle-settings').innerHTML = settingsToggle
        ? '<svg id="i-settings" viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M13 2 L13 6 11 7 8 4 4 8 7 11 6 13 2 13 2 19 6 19 7 21 4 24 8 28 11 25 13 26 13 30 19 30 19 26 21 25 24 28 28 24 25 21 26 19 30 19 30 13 26 13 25 11 28 8 24 4 21 7 19 6 19 2 Z" /><circle cx="16" cy="16" r="4" /></svg>'
        : '<svg id="i-home" viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20 L12 30 4 30 4 12 16 2 28 12 28 30 20 30 20 20 Z" /></svg>';

        // Toggle internal variable
        settingsToggle = !settingsToggle;
    });

    // When the user closes the devices pane
    attachClickEvent('exit-remote', () => {
        document.getElementById('section-main').style.display = 'block';
        document.getElementById('section-remote').style.display = 'none';
    })

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
