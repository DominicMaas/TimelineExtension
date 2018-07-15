import { Message } from './message';
import { MessageType } from './message-type';

/**
 * Send an error message to the user
 */
export class ErrorMessage extends Message {
    public Title: string;
    public Description: string;

    /**
     * Construct error message
     */
    constructor(title: string, description: string) {
        // Set the message type
        super(MessageType.Error);

        // Set parameters
        this.Title = title;
        this.Description = description;
    }
}
