# Code Mobile

A lightweight VS Code extension that makes the editor usable on phones.

## What it does

When you access VS Code via `code tunnel` on your phone, the UI is cramped — status bar, activity bar, minimap, and breadcrumbs all fight for space. This extension fixes that.

**Enable Mobile Mode** and it will:

- ✂️ **Hide the status bar** — frees ~24px at the bottom
- ✂️ **Hide the activity bar** — frees ~48px on the left  
- ✂️ **Disable minimap, breadcrumbs, line numbers** — more content area
- 🔧 **Add toolbar icons** in the editor title bar for:
  - **Terminal** toggle
  - **Source Control** (diffs)
  - **Sidebar** toggle

## Usage

1. Install the extension on your remote machine (via tunnel)
2. Open the command palette → **Code Mobile: Enable Mobile Mode**
3. Use the toolbar icons (top-right of editor) for quick access to Terminal and Diffs
4. To revert: **Code Mobile: Disable Mobile Mode**

The extension auto-detects when you're accessing VS Code from the web and offers to enable mobile mode.

## With Claude Code & Copilot

This extension pairs perfectly with Claude Code and GitHub Copilot:

- Use Claude Code's **maximize button** (⛶) to make the chat full-screen
- Open Claude sessions from the sidebar → they open in the editor area at full width
- Copilot Chat works the same way
- All sessions, history, permissions are handled natively — this extension just fixes the layout

## Building

```bash
npm install
npm run build
npm run package  # creates .vsix
```

## Install on remote

```bash
code tunnel --install-extension code-mobile-0.1.0.vsix
```
