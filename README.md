# Windows Timeline Support - Web Extension

A web extension that integrates Windows Timeline support into popular browsers.

## Introduction

Windows Timeline Support is a web extension that integrates Windows Timeline support into popular browsers. This is done by publishing your browsing history as activities to the Microsoft Graph (so a Microsoft Account is required to use this extension). Personal Microsoft Accounts are confirmed to work, work and school accounts should work.

A list of known issues and planned features is located below. Before opening a new issue, check that it's not mentioned below and does not already exist.

## Browser Support

|Browser|Supported|Note
|--|--|--|
|Google Chrome|Yes|Fully Supported|
|Firefox|Yes|Fully Supported|
|Microsoft Edge|No|Microsoft Edge already has Windows Timeline integration|

## Known Issues

- **BLOCKING** Microsoft Account token renewal does not work. Users are required to log back into their accounts after a set period of time.

## Planned Features

- Improved error checking.
- Toggle switch for a built in ignore list (will include login urls, url shorteners etc.)
- Ability to add a custom ignore list.
- Project Rome support (push current tab to another device).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [Bytesize Icons](https://github.com/danklammer/bytesize-icons)
