import { Message } from './message';
import { MessageType } from './message-type';

/**
 * Message used to send activity request to the background page
 */
export class ActivityMessage extends Message {
    public Title: string;
    public Description: string;
    public OriginUrl: string;
    public BackgroundImage: string;
    public IconImage: string;

    /**
     * Construct an activity message
     * @param title The title of this activity
     * @param description The description of this activity (url)
     * @param originUrl Origin url
     * @param backgroundImage Background image of the card
     * @param iconImage Application icon on the card
     */
    constructor(title: string, description: string, originUrl: string, backgroundImage: string, iconImage: string) {
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
