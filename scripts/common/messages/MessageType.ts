/**
 * A message type that can be sent in this extension
 */
enum MessageType {
    /**
     * Push a timeline activity to the Microsoft Graph.
     */
    Activity,

    /**
     * Start the 'push flow' which will send a url to another device and
     * open it on that device.
     */
    Push,

    /**
     * Start the logout flow, disconnect the users Microsoft Account 
     * and delete any cached tokens.
     */
    Logout,

    /**
     * Start the login flow allowing the user to connect their 
     * Microsoft Account.
     */
    Login
}