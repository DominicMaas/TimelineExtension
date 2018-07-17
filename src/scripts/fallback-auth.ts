import { Message } from './common/messages/message';

// Send the auth message and close the window on callback
Message.sendMessageWithResult(null, () => window.close);
