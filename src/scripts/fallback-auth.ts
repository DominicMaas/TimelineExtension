import { AuthMessage} from './common/messages/auth-message';
import { Message } from './common/messages/message';

// Send the auth message and close the window on callback
Message.sendMessageWithResult(new AuthMessage(window.location.href), () => window.close);