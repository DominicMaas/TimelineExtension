/**
 * Message used to send activity request to the background page.
 */
class ActivityMessage extends Message {
    Title : string;
    Description: string;
    OriginUrl : string;
    BackgroundImage : string;
    IconImage: string;

    /**
     * Construct an activity message.
     * @param title The title of this activity 
     * @param description The description of this activity (url)
     * @param originUrl Origin url, 
     * @param backgroundImage Background image of the card
     * @param iconImage Application icon on the card
     */
    constructor(title : string, description : string, originUrl : string, backgroundImage : string, iconImage : string) { 
         // Set the message type
         super(MessageType.Activity); 
        
        // Set message parameters
        this.Title = title;
        this.Description = description;
        this.OriginUrl = originUrl;
        this.BackgroundImage = backgroundImage;
        this.IconImage = iconImage;     
    }
}

/**
 * 
 */
class LoginMessage extends Message {

}

/**
 * 
 */
class LogoutMessage extends Message {
    Reason: string;
}

/**
 * 
 */
class GetRemoteDevicesMessage extends Message {

}

/**
 * 
 */
class PushToRemoteDeviceMessage extends Message {
    Url: string;
    DeviceId: string;

    constructor() {
        super();
    }
}