import { MessageType } from './message-type';

/**
 * Base message class that all others messages extend.
 */
export class Message {
    /**
     * Send a message to any listeners and expect data in return
     * @param message The message you want to send
     * @param callback Handle the data you are returned
     */
    public static sendMessageWithResult<T>(message: Message, callback: (data: T) => any) {
        if (typeof browser === 'undefined' || !browser) {
            browser.runtime.sendMessage(message).then((data) => callback(data as T));
        } else {
            chrome.runtime.sendMessage(message, (data) => callback(data as T));
        }
    }

    /**
     * Send a message to any listeners
     * @param message The message you want to send
     */
    public static sendMessage(message: Message) {
        if (typeof browser === 'undefined' || !browser) {
            browser.runtime.sendMessage(message);
        } else {
            chrome.runtime.sendMessage(message);
        }
    }

    /**
     * What type of message this item is
     */
    public Type: MessageType;

    /**
     * Construct the base parameters
     * @param type The type of message this is
     */
    constructor(type: MessageType) {
        this.Type = type;
    }
}
