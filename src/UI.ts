import type { Direction, ActionType, Side, Mode, GameSnapshot } from './types';
import { TextRenderer } from './TextRenderer';
import { Game } from './Game';
import { AudioEngine } from './Audio';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface NavigateResult {
  text: string;
  roomChanged: boolean;
  movementChanged: boolean;
  transitionOut?: string;
  transitionIn?: string;
}

export interface UICallbacks {
  onNavigate: (dir: Direction) => NavigateResult;
  onAct: (action: ActionType, itemId?: string) => string;
  onUseItemOnRoom: (invItemId: string, targetId: string) => string;
  onSave: () => void;
  onPickSide: (side: Side) => void;
  onPickMode: (mode: Mode) => void;
  onNewGame: () => void;
}

export function buildModeSelect(container: HTMLElement, callbacks: UICallbacks): void {
  container.innerHTML = `
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Escape Game</h1>
        <p class="side-select-subtitle">Two paths in.</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" data-mode="solo">
            <span class="side-btn-icon">○</span>
            <span class="side-btn-label">Solo</span>
            <span class="side-btn-desc">Alone in the dark</span>
          </button>
          <button class="side-btn reckoner-btn" data-mode="together">
            <span class="side-btn-icon">◇</span>
            <span class="side-btn-label">Together</span>
            <span class="side-btn-desc">Two halves, one mind</span>
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = (btn as HTMLElement).dataset.mode as Mode | undefined;
      if (mode) callbacks.onPickMode(mode);
    });
  });
}

export function buildSideSelect(container: HTMLElement, callbacks: UICallbacks): void {
  container.innerHTML = `
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Escape Game</h1>
        <p class="side-select-subtitle">Choose your perspective</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" data-side="dreamer">
            <span class="side-btn-icon">◈</span>
            <span class="side-btn-label">Dreamer</span>
            <span class="side-btn-desc">Feel the memory</span>
          </button>
          <button class="side-btn reckoner-btn" data-side="reckoner">
            <span class="side-btn-icon">▣</span>
            <span class="side-btn-label">Reckoner</span>
            <span class="side-btn-desc">Record the truth</span>
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const side = (btn as HTMLElement).dataset.side as Side | undefined;
      if (side) callbacks.onPickSide(side);
    });
  });
}

function buildLayout(): { app: HTMLElement; header: HTMLElement; textPane: HTMLElement; itemList: HTMLElement; focusLine: HTMLElement; dpad: HTMLElement; actionBar: HTMLElement; inventoryBar: HTMLElement; saveBtn: HTMLElement; muteBtn: HTMLElement } {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div id="game-layout">
      <div id="header">
        <span id="header-title"></span>
        <span id="header-side"></span>
        <button id="save-btn" class="header-btn" title="Save">⎔</button>
        <button id="mute-btn" class="header-btn" title="Toggle sound">♫</button>
      </div>
      <div id="text-pane"></div>
      <div id="item-list"></div>
      <div id="focus-line"></div>
      <div id="controls">
        <div id="dpad">
          <button class="dpad-btn" data-dir="north">▲</button>
          <div class="dpad-row">
            <button class="dpad-btn" data-dir="west">◄</button>
            <div class="dpad-center"></div>
            <button class="dpad-btn" data-dir="east">►</button>
          </div>
          <button class="dpad-btn" data-dir="south">▼</button>
        </div>
        <div id="action-bar">
          <button class="action-btn" data-action="look">LOOK</button>
          <button class="action-btn" data-action="open">OPEN</button>
          <button class="action-btn" data-action="take">TAKE</button>
          <button class="action-btn" data-action="push">PUSH</button>
          <button class="action-btn" data-action="read">READ</button>
          <button class="action-btn" data-action="use">USE</button>
        </div>
      </div>
      <div id="inventory-bar">
        <span class="inv-label">🎒</span>
        <div id="inv-items"></div>
      </div>
    </div>
  `;

  return {
    app,
    header: document.getElementById('header-title')!,
    textPane: document.getElementById('text-pane')!,
    itemList: document.getElementById('item-list')!,
    focusLine: document.getElementById('focus-line')!,
    dpad: document.getElementById('dpad')!,
    actionBar: document.getElementById('action-bar')!,
    inventoryBar: document.getElementById('inv-items')!,
    saveBtn: document.getElementById('save-btn')!,
    muteBtn: document.getElementById('mute-btn')!,
  };
}

interface FocusState {
  itemId: string | null;
  isInventory: boolean;
}

export class GameUI {
  private textRenderer: TextRenderer;
  private game: Game;
  private audio: AudioEngine;
  private callbacks: UICallbacks;
  private snapshot!: GameSnapshot;

  private headerEl: HTMLElement;
  private headerSide: HTMLElement;
  private textPaneEl: HTMLElement;
  private itemListEl: HTMLElement;
  private focusLineEl: HTMLElement;
  private dpadEl: HTMLElement;
  private actionBarEl: HTMLElement;
  private inventoryBarEl: HTMLElement;
  private saveBtnEl: HTMLElement;
  private muteBtnEl: HTMLElement;

  private focus: FocusState = { itemId: null, isInventory: false };
  private usePending: string | null = null;

  constructor(_container: HTMLElement, game: Game, audio: AudioEngine, callbacks: UICallbacks) {
    this.game = game;
    this.audio = audio;
    this.callbacks = callbacks;

    const els = buildLayout();
    this.headerEl = els.header;
    this.headerSide = document.getElementById('header-side')!;
    this.textPaneEl = els.textPane;
    this.itemListEl = els.itemList;
    this.focusLineEl = els.focusLine;
    this.dpadEl = els.dpad;
    this.actionBarEl = els.actionBar;
    this.inventoryBarEl = els.inventoryBar;
    this.saveBtnEl = els.saveBtn;
    this.muteBtnEl = els.muteBtn;

    this.textRenderer = new TextRenderer(this.textPaneEl);
    this.snapshot = this.game.getSnapshot();

    const layout = document.getElementById('game-layout');
    if (layout) layout.dataset.side = this.snapshot.renderMode;

    this.wireEvents();
    this.render();
  }

  private wireEvents(): void {
    this.dpadEl.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const dir = (e.currentTarget as HTMLElement).dataset.dir as Direction | undefined;
        if (!dir) return;
        this.audio.playSfx('footstep');
        const result = this.callbacks.onNavigate(dir);
        this.usePending = null;
        if (result.movementChanged) {
          await this.showMovementTransition(result.transitionOut, result.transitionIn);
        }
        this.refreshFromGame();
        this.showResultText(result.text);
      });
    });

    this.actionBarEl.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action as ActionType | undefined;
        if (!action) return;
        this.handleAction(action);
      });
    });

    this.saveBtnEl.addEventListener('click', () => {
      this.callbacks.onSave();
      this.showResultText('Game saved.');
    });

    this.muteBtnEl.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      this.muteBtnEl.textContent = muted ? '♪' : '♫';
      this.showResultText(muted ? 'Sound off.' : 'Sound on.');
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('item-chip')) {
        const itemId = target.dataset.itemId;
        if (!itemId) return;
        if (this.usePending) {
          const text = this.callbacks.onUseItemOnRoom(this.usePending, itemId);
          this.usePending = null;
          this.refreshFromGame();
          this.showResultText(text);
          return;
        }
        this.focusItem(itemId);
      }
      if (target.classList.contains('inv-chip')) {
        const itemId = target.dataset.itemId;
        if (!itemId) return;
        this.focusInventoryItem(itemId);
      }
      if (target.classList.contains('journal-chip')) {
        this.showJournalViewer();
      }
    });
  }

  private showJournalViewer(): void {
    const entries = this.snapshot.journal;
    const overlay = document.createElement('div');
    overlay.className = 'journal-viewer';
    const body = entries.length === 0
      ? `<div class="journal-empty">The journal is open. No entries yet.</div>`
      : entries.map((e, i) => `
          <details class="journal-entry"${i === entries.length - 1 ? ' open' : ''}>
            <summary>${escapeHtml(e.label)}</summary>
            <div class="journal-body">${escapeHtml(e.body)}</div>
          </details>
        `).join('');
    overlay.innerHTML = `
      <div class="journal-frame">
        <div class="journal-header">
          <span class="journal-title">Journal</span>
          <button class="journal-close" type="button" aria-label="Close">✕</button>
        </div>
        <div class="journal-list">${body}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const dismiss = () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 250);
    };
    overlay.querySelector('.journal-close')!.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });
  }

  private handleAction(action: ActionType): void {
    this.audio.playSfx('click');

    if (action === 'look') {
      this.focus = { itemId: null, isInventory: false };
      this.usePending = null;
      this.refreshFromGame();
      this.textRenderer.clear();
      const lookText = this.game.getLookTextForCurrentRoom();
      this.showResultText(lookText);
      return;
    }

    if (action === 'use' && this.focus.isInventory && this.focus.itemId) {
      this.usePending = this.focus.itemId;
      this.showResultText('Use it on what? Tap an item in the room.');
      return;
    }

    const itemId = this.focus.itemId ?? undefined;
    const text = this.callbacks.onAct(action, itemId);
    this.refreshFromGame();
    this.showResultText(text);

    if (action === 'take' && this.focus.itemId) {
      this.focus = { itemId: null, isInventory: false };
      this.refreshFromGame();
      this.renderItemList();
      this.renderInventory();
      this.renderFocusLine();
    }
  }

  private focusItem(itemId: string): void {
    const item = this.game.getItem(itemId);
    if (!item) return;
    this.focus = { itemId, isInventory: false };
    this.usePending = null;
    this.renderFocusLine();
    this.renderActions();
    this.showResultText(`\n── ${item.name} ──\n${item.examine}`);
  }

  private focusInventoryItem(itemId: string): void {
    const item = this.game.getInventoryItem(itemId);
    if (!item) return;
    this.focus = { itemId, isInventory: true };
    this.usePending = null;
    this.renderFocusLine();
    this.renderActions();
    this.showResultText(`\n── ${item.label} (inventory) ──\n${item.examine}`);
  }

  private refreshFromGame(): void {
    this.snapshot = this.game.getSnapshot();
    this.renderHeader();
    this.renderInventory();
    this.renderDpad();
    this.renderActions();
    this.renderItemList();
  }

  private render(): void {
    this.renderHeader();
    this.renderDpad();
    this.renderActions();
    this.renderItemList();
    this.renderInventory();
    this.renderFocusLine();

    this.textRenderer.clear();
    this.showResultText(this.snapshot.description);
  }

  private renderHeader(): void {
    this.headerEl.textContent = this.snapshot.roomName;
    const mode = this.snapshot.renderMode;
    if (mode === 'neutral') {
      this.headerSide.textContent = '';
    } else {
      this.headerSide.textContent = '· ' + (mode === 'dreamer' ? 'Dreamer' : 'Reckoner');
    }
    const layout = document.getElementById('game-layout');
    if (layout) layout.dataset.side = mode;
  }

  private renderItemList(): void {
    const items = this.snapshot.items;
    if (items.length === 0) {
      this.itemListEl.innerHTML = '<span class="no-items">Nothing of note here.</span>';
      return;
    }
    this.itemListEl.innerHTML = items.map(i =>
      `<button class="item-chip" data-item-id="${i.id}">${i.name}</button>`
    ).join('');
  }

  private renderFocusLine(): void {
    if (!this.focus.itemId) {
      this.focusLineEl.textContent = '';
      return;
    }
    if (this.focus.isInventory) {
      const item = this.game.getInventoryItem(this.focus.itemId);
      this.focusLineEl.textContent = item ? `» ${item.label} (inventory)` : '';
    } else {
      const item = this.game.getItem(this.focus.itemId);
      this.focusLineEl.textContent = item ? `» ${item.name}` : '';
    }
  }

  private renderActions(): void {
    this.actionBarEl.querySelectorAll('.action-btn').forEach(btn => {
      const action = (btn as HTMLElement).dataset.action as ActionType;
      const valid = this.isActionValid(action);
      btn.classList.toggle('disabled', !valid);

      if (action === 'take' && this.focus.itemId && !this.focus.isInventory) {
        const item = this.game.getItem(this.focus.itemId);
        if (item && this.game.state.inventory.includes(item.id)) {
          btn.classList.add('disabled');
        }
      }
    });
  }

  private isActionValid(action: ActionType): boolean {
    if (action === 'look') return true;
    if (!this.focus.itemId) return false;

    if (this.focus.isInventory) {
      if (action === 'use') return true;
      return false;
    }

    const item = this.game.getItem(this.focus.itemId);
    if (!item) return false;

    if (action === 'take') return item.takeable && !this.game.state.inventory.includes(item.id);
    if (action === 'open' || action === 'push' || action === 'read') return item.actions.includes(action);
    if (action === 'use') return item.actions.includes('use');

    return false;
  }

  private renderDpad(): void {
    const exits = this.snapshot.exits;
    this.dpadEl.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = (btn as HTMLElement).dataset.dir as Direction;
      btn.classList.toggle('disabled', !exits.includes(dir));
    });
  }

  private renderInventory(): void {
    const items = this.snapshot.inventory;
    const journalChip = this.snapshot.hasJournal
      ? `<button class="journal-chip" type="button">📓 Journal</button>`
      : '';
    if (items.length === 0 && !this.snapshot.hasJournal) {
      this.inventoryBarEl.innerHTML = '<span class="no-items">empty</span>';
      return;
    }
    const itemChips = items.map(i =>
      `<button class="inv-chip" data-item-id="${i.id}">${i.label}</button>`
    ).join('');
    this.inventoryBarEl.innerHTML = journalChip + itemChips;
  }

  private showResultText(text: string): void {
    if (!text) return;
    this.textRenderer.skip();
    this.textRenderer.show(text, true);
  }

  async showPrologue(text: string): Promise<void> {
    this.textRenderer.clear();
    await this.textRenderer.show(text);
  }

  showEpilogue(text: string): void {
    this.textRenderer.clear();
    this.textRenderer.appendHtml(`<div class="epilogue">${text}</div>`);
  }

  showMovementTransition(outText?: string, inText?: string): Promise<void> {
    return new Promise(resolve => {
      const parts = [outText, inText].filter((s): s is string => Boolean(s && s.trim()));
      if (parts.length === 0) {
        resolve();
        return;
      }
      const body = parts.join('\n\n· · ·\n\n');
      const overlay = document.createElement('div');
      overlay.className = 'movement-transition';
      overlay.innerHTML = `
        <div class="transition-text"></div>
        <div class="transition-hint">tap to continue</div>
      `;
      const textEl = overlay.querySelector('.transition-text') as HTMLElement;
      textEl.textContent = body;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visible'));

      let dismissed = false;
      const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        overlay.classList.remove('visible');
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 500);
      };
      overlay.addEventListener('click', dismiss);
    });
  }
}
