import { Message } from './message';
import { MessageType } from './message-type';

/**
 *  Auth message for manual callback
 */
export class AuthMessage extends Message {
    public QueryString: string;

    /**
     * Construct a message
     * @param queryString The url
     */
    constructor(queryString: string) {
        // Set the message type
        super(MessageType.AuthSubmit);

        // Set parameters
        this.QueryString = queryString;
    }
}
