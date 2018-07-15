import { Message } from "./message";
import { MessageType } from "./message-type";

/**
 * Message used to send activity request to the background page
 */
export class ActivityMessage extends Message {
    Title : string;
    Description: string;
    OriginUrl : string;
    BackgroundImage : string;
    IconImage: string;

    /**
     * Construct an activity message
     * @param title The title of this activity 
     * @param description The description of this activity (url)
     * @param originUrl Origin url
     * @param backgroundImage Background image of the card
     * @param iconImage Application icon on the card
     */
    constructor(title : string, description : string, originUrl : string, backgroundImage : string, iconImage : string) { 
        // Set the message type
        super(MessageType.PublishActivity); 
        
        // Set message parameters
        this.Title = title;
        this.Description = description;
        this.OriginUrl = originUrl;
        this.BackgroundImage = backgroundImage;
        this.IconImage = iconImage;     
    }
}

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

/**
 * Logout the user and remove any cached tokens, also
 * provide a reason why the user was logged out
 */
export class LogoutMessage extends Message {
    Reason: string;

    /**
     * Construct a logout message
     * @param reason Why the user was logged out
     */
    constructor(reason : string) {
        // Set the message type
        super(MessageType.Logout);

        // Set message parameters
        this.Reason = reason;
    }
}

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

/**
 * Send a link to a remote device and open it.
 */
export class OpenOnRemoteDeviceMessage extends Message {  
    DeviceId: string;
    Url: string;

    /**
     * Construct a open on remote device message
     * @param deviceId The device Id in which to open the message on
     * @param url The url to open
     */
    constructor(deviceId : string, url : string) {
        // Set the message type
        super(MessageType.OpenOnRemoteDevice);

        // Set message parameters
        this.DeviceId = deviceId;
        this.Url = url;
    }
}