# Safe Transaction Hash Verifier Extension Extension

A Chrome browser extension for verifying Safe multi-signature wallet transactions. This extension allows users to independently calculate and verify transaction hashes for Ethereum Safe (formerly Gnosis Safe) transactions.

## Features

- Calculate and verify Safe transaction hashes
- Decode transaction payload
- Support for various Safe versions (1.0.0 to 1.3.0)
- Support for nested Safe transactions
- Security warnings for potentially risky transactions
- Support for multiple Ethereum networks
- Browser extension that integrates with Safe web interface

## Installation

1. Download the latest release from the repository
2. In Chrome, go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Build

1. Clone the repo
2. Go to extension
3. Run: `npm run build`
4. In Chrome, go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the extension/build directory

## Usage

1. Navigate to a Safe transaction page
2. Click the extension icon or use the keyboard shortcut (Ctrl+B/Command+B)
3. The extension will automatically detect and verify the transaction details

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build the extension:

```bash
npm run build
```

Package the extension:

```bash
npm run build:extension
```

## Inspiration

This project is inspired by and builds upon [safe-tx-hashes-util](https://github.com/pcaversaccio/safe-tx-hashes-util) created by [pcaversaccio](https://github.com/pcaversaccio). The original utility provided a foundation for transaction hash verification that has been expanded into this browser extension for easier access and integration.

# Safe Transaction Hash Verifier Extension - Development Guide

This directory contains the source code for the Chrome extension. For general project information, see the [main README](../README.md).

## Development Environment

### Requirements

- Node.js 16+
- npm 7+
- Chrome browser (for testing)

## Build Commands

| Command                   | Description                                                                       |
| ------------------------- | --------------------------------------------------------------------------------- |
| `npm install`             | Install dependencies                                                              |
| `npm run dev`             | Run in development mode with hot reloading                                        |
| `npm run build`           | Build the extension for production (outputs to `dist/`)                           |
| `npm run build:extension` | Package the extension as a ZIP file for store submission (outputs to `dist-zip/`) |

## Extension Structure

- `public/` - Static assets
- `src/` - Source code
  - `background/` - Background script
  - `content/` - Content scripts
  - `popup/` - Extension popup UI
  - `utils/` - Utility functions for hash calculations

## Testing

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` directory
5. Make sure to reload the extension after code changes

## Debugging

- Background script: Inspect from the extensions page
- Content script: Inspect from the page where the extension is running
- Popup: Right-click the extension icon and select "Inspect popup"

## Version Compatibility

The extension supports Safe versions:

- 1.0.0
- 1.1.0
- 1.1.1
- 1.2.0
- 1.3.0
