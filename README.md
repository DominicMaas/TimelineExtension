# Windows Timeline for Chrome
Windows Timeline extension for Google Chrome.

## Introduction
This extension syncs your Google Chrome history to Windows Timeline, which in theory (when Timeline support is enabled on Microsoft Launcher), would allow you to continue your browsing on mobile from desktop. This extension uses the Microsoft Graph to sync user activities.

## Why?
I recently switched back to Google Chrome (from Microsoft Edge) on my Surface (due to lacking 1Password X support), I was looking around for an extension that would perform similar user activity syncing like Microsoft Edge. I did find one, but it was a paid Windows Store app and a free chrome extension (both required).

I figured that it shouldn't be too difficult to implement, so I created this repository.

## Progress
Before I can publish to the Google Chrome store, these things need to be fixed.

- [ ] Make the UI Pretty.
- [ ] Handle refresh tokens so the user does not have to login when the access token expires.
- [ ] Better error checking.
- [ ] Icons and assets.