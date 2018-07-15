import { Message } from './message';
import { MessageType } from './message-type';

/**
 * Send a link to a remote device and open it.
 */
export class OpenOnRemoteDeviceMessage extends Message {
    public DeviceId: string;
    public Url: string;

    /**
     * Construct a open on remote device message
     * @param deviceId The device Id in which to open the message on
     * @param url The url to open
     */
    constructor(deviceId: string, url: string) {
        // Set the message type
        super(MessageType.OpenOnRemoteDevice);

        // Set message parameters
        this.DeviceId = deviceId;
        this.Url = url;
    }
}
