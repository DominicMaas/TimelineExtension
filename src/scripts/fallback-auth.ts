import { AuthMessage} from './common/messages/auth-message';
import { Message } from './common/messages/message';

// Run when document has loaded
(document.readyState === 'complete' || document.readyState === 'interactive')
? sendAuth() : document.addEventListener('DOMContentLoaded', sendAuth);

function sendAuth() {
    // Send the auth message and close the window on callback
    Message.sendMessage(new AuthMessage(window.location.href));
}
