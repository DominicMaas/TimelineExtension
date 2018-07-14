// @ts-check

var settingsToggle = false;
var minimumTimeOnPage = 8;
var accessToken;

// Get local preferences
chrome.storage.local.get('access_token', function(data) {
    if (data.access_token !== null) {
        accessToken = data.access_token;
        UpdateLoginState();
    }
});

// Get synced preferences
(chrome.storage.sync || chrome.storage.local).get('min_sec_loaded', function(data) {
    if (data.min_sec_loaded) {
        minimumTimeOnPage = data.min_sec_loaded;
        updateMinimumTimeOnPage();
    }
});

function updateMinimumTimeOnPage() {
    document.getElementById('setting-timeout').value = minimumTimeOnPage;
}

function setMinimumTimeOnPage(value) {
    (chrome.storage.sync || chrome.storage.local).set({
        'min_sec_loaded' : value
    }, null);
    minimumTimeOnPage = value;
}

// Update the UI to reflect the internal login state.
function UpdateLoginState() {
    document.getElementById('section-login-pending').style.display = accessToken ? 'none' : 'block';
    document.getElementById('section-login-completed').style.display = accessToken ? 'block' : 'none';
}

// Run when document has loaded
document.addEventListener('DOMContentLoaded', function() {

    // Set some initial views and states
    UpdateLoginState();
    updateMinimumTimeOnPage();

    // settings toggle visible views
    document.getElementById('toggle-settings').addEventListener('click', function() {

        document.getElementById('section-home').style.display = settingsToggle ? 'block' : 'none';
        document.getElementById('section-settings').style.display = settingsToggle ? 'none' : 'block';

        // https://github.com/danklammer/bytesize-icons
        document.getElementById('toggle-settings').innerHTML = settingsToggle 
        ? '<svg id="i-settings" viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M13 2 L13 6 11 7 8 4 4 8 7 11 6 13 2 13 2 19 6 19 7 21 4 24 8 28 11 25 13 26 13 30 19 30 19 26 21 25 24 28 28 24 25 21 26 19 30 19 30 13 26 13 25 11 28 8 24 4 21 7 19 6 19 2 Z" /><circle cx="16" cy="16" r="4" /></svg>' 
        : '<svg id="i-home" viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20 L12 30 4 30 4 12 16 2 28 12 28 30 20 30 20 20 Z" /></svg>';

        settingsToggle = !settingsToggle;
    });

    // When the user clicks on the devices button
    document.getElementById('view-devices').addEventListener('click', function() {
        // Update UI
        document.getElementById('section-main').style.display = 'none';
        document.getElementById('section-remote').style.display = 'block';

        // We are loading
        document.getElementById('remote-status').innerText = 'Loading...';

        // Send a message to get data
        let remoteMessage = { type: 'RemoteDevices' };
        
        // Get a list of user devices.
        chrome.runtime.sendMessage(remoteMessage, function(data) {
            if (data.success) {
                // We have loaded
                document.getElementById('remote-status').innerText = '';
                document.getElementById('devices-holder').innerHTML = '';

                let devicesHolder = document.getElementById('devices-holder');

                // List devices
                for (let index = 0; index < data.payload.length; index++) {              
                    // Get the device
                    let device = data.payload[index];
                    
                    console.log(device);

                    // Update UI
                    devicesHolder.insertAdjacentHTML('beforeend', '<a id="remote-device-'+device.id+'" class="remote-device"><p>'+device.Name+'</p></div>');

                    // Attach click event
                    document.getElementById('remote-device-' + device.id).addEventListener('click', function() {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

                            // Get the active tab
                            var activeTab = tabs[0];
                            
                            // Create the navigate message
                            let remoteNavigate = { type: 'RemoteNavigate', payload: { id: device.id, url: activeTab.url } };
                            // Send the navigate request to the background
                            chrome.runtime.sendMessage(remoteNavigate);
                            // close the popout (for screen readers)
                            window.close();
                         });
                    });
                }
            } else {
                // Say why the request failed
                document.getElementById('remote-status').innerText = data.reason;
            }      
        });
    });

    // When the user closes the devices pane
    document.getElementById('exit-remote').addEventListener('click', function() {
        document.getElementById('section-main').style.display = 'block';
        document.getElementById('section-remote').style.display = 'none';
    });

    // login flow
    document.getElementById('login').addEventListener('click', function() {
        // Create the login message
        let loginMessage = { type: 'Login' };
        // Send the login request to the background script
        chrome.runtime.sendMessage(loginMessage);
        // close the popout (for screen readers)
        window.close();
    });

    // log out flow
    document.getElementById('logout').addEventListener('click', function() {
        // Create the login message
        let logoutMessage = { type: 'Logout' };
        // Send the login request to the background script
        chrome.runtime.sendMessage(logoutMessage);
        // close the popout
        window.close();
    });

    // When the user changes the timeout field
    document.getElementById('setting-timeout').addEventListener('change', function() {
        setMinimumTimeOnPage(document.getElementById('setting-timeout').value);
    });
});