import * as vscode from 'vscode';

// ─────────────────────────────────────────────────────────────────────────────
// Code Mobile — A lightweight extension that makes VS Code usable on phones.
//
// What it does:
//   1. Hides status bar + activity bar to free screen space
//   2. Adds toolbar icons (editor title bar) for Terminal, Diffs, Sidebar
//   3. Auto-detects web mode and prompts to enable
//
// That's it. No reimplementation of anything — Claude Code and Copilot
// extensions work natively. We just fix the layout.
// ─────────────────────────────────────────────────────────────────────────────

/** Settings we override in mobile mode (and their original values for restore) */
const MOBILE_SETTINGS: Record<string, unknown> = {
  'workbench.statusBar.visible': false,
  'workbench.activityBar.location': 'hidden',
  'editor.minimap.enabled': false,
  'breadcrumbs.enabled': false,
  'editor.scrollbar.verticalScrollbarSize': 6,
  'editor.scrollbar.horizontalScrollbarSize': 6,
  'editor.glyphMargin': false,
  'editor.folding': false,
  'editor.lineNumbers': 'off',
  'window.commandCenter': false,
};

let savedSettings: Record<string, unknown> = {};

export function activate(ctx: vscode.ExtensionContext) {
  console.log('[CodeMobile] Activating...');

  // ── Register commands ──────────────────────────────────────────────────────
  ctx.subscriptions.push(
    vscode.commands.registerCommand('codeMobile.enableMobileMode', () => enableMobileMode(ctx)),
    vscode.commands.registerCommand('codeMobile.disableMobileMode', () => disableMobileMode(ctx)),
    vscode.commands.registerCommand('codeMobile.toggleTerminal', toggleTerminal),
    vscode.commands.registerCommand('codeMobile.openDiffs', openDiffs),
    vscode.commands.registerCommand('codeMobile.toggleSidebar', toggleSidebar),
    vscode.commands.registerCommand('codeMobile.openClaude', openClaude),
    vscode.commands.registerCommand('codeMobile.openCopilot', openCopilot),
  );

  // ── Auto-detect web mode ──────────────────────────────────────────────────
  const isWeb = vscode.env.uiKind === vscode.UIKind.Web;
  const wasEnabled = ctx.globalState.get<boolean>('mobileModeEnabled', false);

  if (isWeb && !wasEnabled) {
    // First time on web — prompt
    vscode.window
      .showInformationMessage(
        '📱 Mobile detected! Enable mobile-optimized layout?',
        'Enable Mobile Mode',
        'Not now',
      )
      .then((choice) => {
        if (choice === 'Enable Mobile Mode') {
          enableMobileMode(ctx);
        }
      });
  } else if (wasEnabled) {
    // Re-apply on reload (settings persist, but context key needs re-setting)
    vscode.commands.executeCommand('setContext', 'codeMobile.mobileMode', true);
  }
}

export function deactivate() {
  // Nothing to clean up
}

// ─────────────────────────────────────────────────────────────────────────────
// Enable / Disable
// ─────────────────────────────────────────────────────────────────────────────

async function enableMobileMode(ctx: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration();

  // Save current values so we can restore later
  const backup: Record<string, unknown> = {};
  for (const [key] of Object.entries(MOBILE_SETTINGS)) {
    backup[key] = config.get(key);
  }
  await ctx.globalState.update('savedSettings', backup);
  await ctx.globalState.update('mobileModeEnabled', true);

  // Apply mobile settings
  for (const [key, value] of Object.entries(MOBILE_SETTINGS)) {
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  // Set context key — this controls whether toolbar icons are visible
  await vscode.commands.executeCommand('setContext', 'codeMobile.mobileMode', true);

  // Clean up the layout
  await vscode.commands.executeCommand('workbench.action.closeSidebar');

  vscode.window.showInformationMessage(
    '📱 Mobile Mode enabled! Use toolbar icons for Terminal & Diffs.',
  );
}

async function disableMobileMode(ctx: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const backup = ctx.globalState.get<Record<string, unknown>>('savedSettings', {});

  // Restore original settings
  for (const [key] of Object.entries(MOBILE_SETTINGS)) {
    const original = backup[key];
    if (original !== undefined) {
      await config.update(key, original, vscode.ConfigurationTarget.Global);
    } else {
      // Remove override — fall back to default
      await config.update(key, undefined, vscode.ConfigurationTarget.Global);
    }
  }

  await ctx.globalState.update('mobileModeEnabled', false);
  await vscode.commands.executeCommand('setContext', 'codeMobile.mobileMode', false);

  vscode.window.showInformationMessage('🖥️ Mobile Mode disabled. Layout restored.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-access actions
// ─────────────────────────────────────────────────────────────────────────────

async function toggleTerminal(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.togglePanel');
}

async function openDiffs(): Promise<void> {
  // Focus the Source Control view (built-in git diff viewer)
  await vscode.commands.executeCommand('workbench.view.scm');
}

async function toggleSidebar(): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.toggleSidebarVisibility');
}

async function openClaude(): Promise<void> {
  // Try known Claude Code commands (the command ID may vary by version)
  try {
    await vscode.commands.executeCommand('claude.openInNewTab');
  } catch {
    try {
      await vscode.commands.executeCommand('claude-dev.plusButtonClicked');
    } catch {
      // Fallback: try to focus the Claude Code sidebar view
      try {
        await vscode.commands.executeCommand('workbench.action.focusAuxiliaryBar');
      } catch {
        vscode.window.showWarningMessage('Could not find Claude Code. Is the extension installed?');
      }
    }
  }
}

async function openCopilot(): Promise<void> {
  try {
    await vscode.commands.executeCommand('workbench.action.chat.open');
  } catch {
    try {
      await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
    } catch {
      vscode.window.showWarningMessage('Could not open Copilot Chat. Is the extension installed?');
    }
  }
}
