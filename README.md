# Snapp Blocker Extension

Block shops on Snappfood and Snapp Market and never see them again.

Bad experience with a shop? Block it from its page, optionally with a reason. It stays greyed out everywhere it shows up afterwards, so you don't order from it again by accident six months later.

## What it does

- Adds a block button on any shop page on `snappfood.ir` and `snapp.market`
- Marks blocked shops in search results and listings instead of letting them blend in
- Keeps a searchable list in the toolbar popup, split per platform, with the reason and date you blocked it
- Stores everything in `chrome.storage` — no account, no server

## Install

Grab the zip from [Releases](https://github.com/omidnikrah/snapp-blocker-extension/releases/latest), unzip it, then load it at `chrome://extensions` with "Load unpacked".

## Develop

```bash
bun install
bun run dev
```
