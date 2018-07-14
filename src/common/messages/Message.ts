/**
 * Base message class that all others messages extend.
 */
class Message {
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
}