import { Message } from './message';
import { MessageType } from './message-type';

/**
 * Open the login UI allowing the user to login
 */
export class LoginMessage extends Message {

    /**
     * Construct a login message
     */
    constructor() {
        // Set the message type
        super(MessageType.Login);
    }
}
