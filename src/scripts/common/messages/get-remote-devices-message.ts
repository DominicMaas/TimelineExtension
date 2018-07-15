import { Message } from './message';
import { MessageType } from './message-type';

/**
 * Get a list of remote devices connected to this users account
 */
export class GetRemoteDevicesMessage extends Message {
    /**
     * Construct a get remote devices message
     */
    constructor() {
        // Set the message type
        super(MessageType.GetRemoteDevices);
    }
}
