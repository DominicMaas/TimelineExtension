import { MessageType } from "./message-type";

/**
 * Base message class that all others messages extend.
 */
export class Message {
    /**
     * What type of message this item is
     */
    Type : MessageType;

    /**
     * Construct the base parameters
     * @param type The type of message this is
     */
    constructor(type : MessageType) {
        this.Type = type;
    }

    /**
     * Send a message to any listeners and expect data in return
     * @param message The message you want to send
     * @param callback Handle the data you are returned
     */
    static sendMessageWithResult<T>(message: Message, callback: (data: T) => any) {
        chrome.runtime.sendMessage(message, data => callback(<T> data));
    }

    /**
     * Send a message to any listeners
     * @param message The message you want to send 
     */
    static sendMessage(message: Message) {
        chrome.runtime.sendMessage(message);
    }
}