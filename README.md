This extension is no longer being developed, and the login backend has been shutdown. Please use the official Microsoft Extension: https://chrome.google.com/webstore/detail/web-activities/eiipeonhflhoiacfbniealbdjoeoglid

---



# Timeline Support - Web Extension

A web extension that integrates Windows Timeline support into popular browsers.

![Timeline Image](extension/images/store/timeline.png)

## Introduction

Timeline Support is a web extension that integrates Windows Timeline support into popular browsers. This is done by publishing your browsing history as activities to the Microsoft Graph (so a Microsoft Account is required to use this extension). Personal Microsoft Accounts are confirmed to work, work and school accounts should work.

See frequently asked questions [here](FAQ.md).

## Browser Support

|Browser|Supported|Download|Note|
|--|--|--|--|
|Google Chrome|Yes|[Chrome Web Store](https://chrome.google.com/webstore/detail/windows-timeline-support/meokcjmjkobffcgldbjjklmaaediikdj)|Fully Supported|
|Firefox|Yes|[Firefox Addons](https://addons.mozilla.org/en-GB/firefox/addon/timeline-support/)|Fully Supported|
|Microsoft Edge|No|n/a|Pending news on the new Microsoft Edge. Will most likely use a customised version of the Chrome Extension.|
|Vivaldi|Yes|[Chrome Web Store](https://chrome.google.com/webstore/detail/windows-timeline-support/meokcjmjkobffcgldbjjklmaaediikdj)|Supported Icon Assets. Chrome OAuth Base.|
|Opera|Yes|[Chrome Web Store](https://chrome.google.com/webstore/detail/windows-timeline-support/meokcjmjkobffcgldbjjklmaaediikdj)| Supported Icon Assets. Download from Chrome Web Store on supported Opera versions.|
|Safari|No| n/a | No support is planned. The costs and effort to port the extension (and then deal with Apple Support) is not worth it.|

## Setup

1. Clone the repository and open it.
2. Run `npm install`.
3. Run `npm run build` to build files or `npm run watch` for debugging.
4. Open browser, load unpacked extension in the `extension` folder.

## Translating
Extension translation is done via the usual web extension method. Simply create a folder under `extension/_locales` for your language, then copy the `messages.json` file from the `en` folder as a template into your new folder. Once complete, create a pull request.


## Version History

### 1.0.4

* New UI design.
* Added about page.
* Renamed extension to "Timeline Support" due to take-down request.
* Updated packages.

### 1.0.3

* Fixed issue that broke login for Opera users.
* Added new authentication system for generic browsers (Opera, Firefox Mobile) so they can login.

### 1.0.2

* Fixed scaling issue for Firefox Mobile.
* Fix issue where websites would be stored in your feed while in private mode.
* Added recent activities button.
* Added Opera icon assets.
* Fixed an issue where timeline activities would not appear or take a while to appear.

### 1.0.1

* Initial public beta.

## Screenshots

![Signed In](extension/images/store/signed-in.png)

![Signed Out](extension/images/store/signed-out.png)

## Credits

- **Dominic Maas** - *Initial work and lead* - [Twitter](https://twitter.com/dominicjmaas)
- **Daniel Aleksandersen** - *Firefox port, icon and lots of other misc changes* - [Homepage](https://www.daniel.priv.no/)
- **Mikael** - *Swedish translation* - [GitHub](https://github.com/dwm1909)

See also the list of [contributors](https://github.com/DominicMaas/TimelineExtension/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
