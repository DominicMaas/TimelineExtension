export class Helpers {

    /**
     * Wrapper around the chrome and general implementation of *.i18n.getMessage.
     * @param messageName The message to get
     */
    public static GetLocalizedString(messageName: string, substitutions?: any): string {
        if (typeof browser === 'undefined' || !browser) {
            return chrome.i18n.getMessage(messageName, substitutions);
        } else {
            return browser.i18n.getMessage(messageName, substitutions);
        }
    }

    /**
     * Localize by replacing __MSG_***__ tags
     */
    public static LocalizeHtmlPage() {
        // Get all objects
        const objects = document.getElementsByTagName('html');

        // Loop through all the objects
        for (let j = 0; j < objects.length; j++) {
            const obj = objects[j];

            const valStrH = obj.innerHTML.toString();
            const valNewH = valStrH.replace(/__MSG_(\w+)__/g, (match, v1) => {
                // Wrap in a try catch as Microsoft Edge throws an exception if the
                // message does not exist
                try {
                    // Use the string helper to get the string
                    return v1 ? Helpers.GetLocalizedString(v1) : "";
                } catch {
                    return "";
                }
            });

            if (valNewH !== valStrH) {
                // This has to use innerHTML
                obj.innerHTML = valNewH;
            }
        }
    }
}
