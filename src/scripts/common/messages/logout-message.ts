import { Message } from './message';
import { MessageType } from './message-type';

/**
 * Logout the user and remove any cached tokens, also
 * provide a reason why the user was logged out
 */
export class LogoutMessage extends Message {
    public Reason: string;

    /**
     * Construct a logout message
     * @param reason Why the user was logged out
     */
    constructor(reason: string) {
        // Set the message type
        super(MessageType.Logout);

        // Set message parameters
        this.Reason = reason;
    }
}
