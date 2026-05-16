import type { Direction, ActionType, Side, Mode, GameSnapshot, Device } from './types';
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

export interface ActResult {
  text: string;
  movementChanged: boolean;
  transitionOut?: string;
  transitionIn?: string;
  launchDevice?: { itemId: string; device: Device };
}

export interface DeviceSolveResult {
  text: string;
  correct: boolean;
  movementChanged: boolean;
  transitionOut?: string;
  transitionIn?: string;
}

export interface UICallbacks {
  onNavigate: (dir: Direction) => NavigateResult;
  onAct: (action: ActionType, itemId?: string) => ActResult;
  onUseItemOnRoom: (invItemId: string, targetId: string) => ActResult;
  onSolveDevice: (itemId: string, input: string | Record<string, string>) => DeviceSolveResult;
  onSave: () => void;
  onPickSide: (side: Side) => void;
  onPickMode: (mode: Mode) => void;
  onNewGame: () => void;
  onChapterComplete: () => void;
  // Fired after a movement-change overlay has been dismissed and the UI has
  // swapped in the new room's text/font. main.ts uses this to kick the new
  // ambient (the audio change is deferred until the player taps through).
  onMovementApplied?: () => void;
  // If the just-finished chapter has a successor (solo), main.ts sets this so
  // the chapter-complete overlay can offer a direct continue path instead of
  // dumping the player back at the mode-select.
  nextChapterTitle?: string;
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
        <div id="action-bar"></div>
      </div>
      <div id="inventory-bar">
        <span class="inv-label" id="inv-label">🎒</span>
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
  private epilogueShown = false;
  private inputLocked = false;
  private itemOrderCache: { roomId: string; order: string[] } | null = null;
  private lastFocusedItemId: string | null = null;

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

    // SP carries only the journal — the backpack label implies an inventory
    // the player never accumulates. Hide it in solo mode.
    if (this.game.mode === 'solo') {
      const invLabel = document.getElementById('inv-label');
      if (invLabel) invLabel.style.display = 'none';
    }

    this.wireEvents();
    this.render();
  }

  private wireEvents(): void {
    this.dpadEl.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (this.inputLocked) return;
        const dir = (e.currentTarget as HTMLElement).dataset.dir as Direction | undefined;
        if (!dir) return;
        this.audio.playSfx('footstep');
        const result = this.callbacks.onNavigate(dir);
        this.usePending = null;
        if (result.movementChanged) {
          await this.runMovementSequence(result.text, result.transitionOut, result.transitionIn);
        } else {
          this.refreshFromGame();
          await this.showResultText(result.text);
        }
        this.maybeShowEpilogue();
      });
    });

    this.buildActionBar();
    this.actionBarEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.action-btn') as HTMLElement | null;
      if (!btn) return;
      const action = btn.dataset.action as ActionType | undefined;
      if (!action) return;
      this.handleAction(action);
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

    document.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('item-chip')) {
        if (this.inputLocked) return;
        const itemId = target.dataset.itemId;
        if (!itemId) return;
        if (this.usePending) {
          const result = this.callbacks.onUseItemOnRoom(this.usePending, itemId);
          this.usePending = null;
          if (result.movementChanged) {
            await this.runMovementSequence(result.text, result.transitionOut, result.transitionIn);
            this.focus = { itemId: null, isInventory: false };
          } else {
            this.refreshFromGame();
            await this.showResultText(result.text);
          }
          this.maybeShowEpilogue();
          return;
        }
        this.focusItem(itemId);
      }
      if (target.classList.contains('inv-chip')) {
        if (this.inputLocked) return;
        const itemId = target.dataset.itemId;
        if (!itemId) return;
        this.focusInventoryItem(itemId);
      }
      if (target.classList.contains('journal-chip')) {
        if (this.inputLocked) return;
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

  private async handleAction(action: ActionType): Promise<void> {
    this.audio.playSfx('click');

    if (action === 'look') {
      this.focus = { itemId: null, isInventory: false };
      this.usePending = null;
      this.refreshFromGame();
      // Append, don't clear. The text pane grows; transitions clear by overlaying.
      const lookText = this.game.getLookTextForCurrentRoom();
      await this.showResultText(lookText);
      return;
    }

    if (action === 'use' && this.focus.isInventory && this.focus.itemId) {
      this.usePending = this.focus.itemId;
      this.showResultText('Use it on what? Tap an item in the room.');
      return;
    }

    const itemId = this.focus.itemId ?? undefined;
    const result = this.callbacks.onAct(action, itemId);
    if (result.launchDevice) {
      // Device interception: the engine returned a device spec instead of a
      // text result. Launch the modal; the modal's submit path applies the
      // engine effects and routes back through runMovementSequence /
      // showResultText as if a normal handler had returned them.
      await this.showDeviceModal(result.launchDevice.itemId, result.launchDevice.device);
      this.maybeShowEpilogue();
      return;
    }
    if (result.movementChanged) {
      // Keep the old room's font/items on screen until the player taps
      // through the overlay. The transition is supposed to feel like a
      // crossing, not a swap.
      await this.runMovementSequence(result.text, result.transitionOut, result.transitionIn);
      this.focus = { itemId: null, isInventory: false };
    } else {
      this.refreshFromGame();
      await this.showResultText(result.text);
    }
    this.maybeShowEpilogue();

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
    this.lastFocusedItemId = itemId;
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

    const roomId = this.snapshot.roomId;
    // Shuffle order is computed once per room visit and kept until the
    // player moves elsewhere. Items appearing or disappearing mid-visit are
    // inserted next to the parent item (the one the player just focused).
    if (!this.itemOrderCache || this.itemOrderCache.roomId !== roomId) {
      const shuffled = items.map(i => i.id);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      this.itemOrderCache = { roomId, order: shuffled };
      this.lastFocusedItemId = null;
      // Reset horizontal scroll so the new room's chips start at the left
      // edge instead of inheriting the previous room's scroll offset.
      this.itemListEl.scrollLeft = 0;
    }
    const order = this.itemOrderCache.order;
    const newItems = items.filter(i => !order.includes(i.id));
    if (newItems.length > 0) {
      // Insert new items immediately after the last item the player focused,
      // so OPEN→reveal puts the new chip adjacent to its parent.
      const parentIdx = this.lastFocusedItemId
        ? order.indexOf(this.lastFocusedItemId)
        : -1;
      if (parentIdx >= 0) {
        this.itemOrderCache.order = [
          ...order.slice(0, parentIdx + 1),
          ...newItems.map(i => i.id),
          ...order.slice(parentIdx + 1),
        ];
      } else {
        this.itemOrderCache.order = [...order, ...newItems.map(i => i.id)];
      }
    }
    // Re-derive ordered list against the updated cache so newly-inserted
    // items appear in their correct neighbor position.
    const finalOrder = this.itemOrderCache.order;
    const finalList = finalOrder
      .map(id => items.find(i => i.id === id))
      .filter((i): i is typeof items[number] => Boolean(i));

    this.itemListEl.innerHTML = finalList.map(i =>
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

  private buildActionBar(): void {
    const labels: Record<ActionType, string> = {
      look: 'LOOK',
      open: 'OPEN',
      take: 'TAKE',
      push: 'PUSH',
      examine: 'EXAMINE',
      use: 'USE',
      note: 'NOTE',
    };
    const actions = this.snapshot.actions ?? ['look', 'open', 'take', 'examine', 'use', 'note'];
    this.actionBarEl.innerHTML = actions
      .map(a => `<button class="action-btn" data-action="${a}">${labels[a]}</button>`)
      .join('');
    this.actionBarEl.dataset.count = String(actions.length);
  }

  private renderActions(): void {
    // All buttons always tappable. Invalid taps get a graceful "nothing
    // happens" from the engine. Removing the lit/unlit telegraph forces the
    // player to think instead of pattern-matching.
    this.actionBarEl.querySelectorAll('.action-btn').forEach(btn => {
      btn.classList.remove('disabled');
    });
  }

  private renderDpad(): void {
    // Same as renderActions — always live. Engine returns "can't go that
    // way" when the direction isn't an exit.
    this.dpadEl.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.classList.remove('disabled');
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

  private setInputLocked(locked: boolean): void {
    this.inputLocked = locked;
    const layout = document.getElementById('game-layout');
    if (layout) layout.classList.toggle('input-locked', locked);
  }

  // Movement-crossing sequence. Locks input up front, lets the current text
  // finish, fades in the overlay, waits for the tap, then clears the pane and
  // swaps font/items/audio so the new movement only "arrives" after the player
  // has chosen to step through.
  //
  // Between "text typed" and "overlay fades in" the player gets an explicit
  // tap-to-continue beat. Otherwise the overlay starts fading in the instant
  // the last character lands, and the final sentence of the action's result
  // text reads as a flash. The crossing should require commitment.
  private async runMovementSequence(resultText: string, transitionOut?: string, transitionIn?: string): Promise<void> {
    this.setInputLocked(true);
    await this.showResultText(resultText);
    await this.waitForTapToContinue();
    await this.showMovementTransition(transitionOut, transitionIn);
    this.textRenderer.clear();
    this.refreshFromGame();
    this.callbacks.onMovementApplied?.();
    await this.showResultText(this.snapshot.description);
    this.setInputLocked(false);
  }

  // Shows a transient "tap to continue" hint above the in-game layout and
  // resolves on the next document click. Used to gate movement-crossing
  // overlays so the player can read the final line of the action result.
  private waitForTapToContinue(): Promise<void> {
    return new Promise(resolve => {
      const hint = document.createElement('div');
      hint.className = 'tap-to-continue';
      hint.textContent = 'tap to continue';
      document.body.appendChild(hint);
      requestAnimationFrame(() => hint.classList.add('visible'));

      let done = false;
      const dismiss = () => {
        if (done) return;
        done = true;
        document.removeEventListener('click', dismiss, true);
        hint.classList.remove('visible');
        setTimeout(() => hint.remove(), 200);
        resolve();
      };
      // Use capture-phase so this fires before any other click handler the
      // page might (re)attach. The whole #game-layout is pointer-events:none
      // during input lock, so clicks land on body/app safely.
      document.addEventListener('click', dismiss, true);
    });
  }

  private async showResultText(text: string): Promise<void> {
    if (!text) return;
    this.textRenderer.skip();
    await this.textRenderer.show(text, true);
  }

  async showPrologue(text: string): Promise<void> {
    this.textRenderer.clear();
    await this.textRenderer.show(text);
  }

  showEpilogue(text: string): void {
    this.textRenderer.clear();
    this.textRenderer.appendHtml(`<div class="epilogue">${text}</div>`);
  }

  private async maybeShowEpilogue(): Promise<void> {
    if (this.epilogueShown || !this.snapshot.completed) return;
    this.epilogueShown = true;
    const epilogue = this.game.chapter.epilogue ?? '';
    // Silence is part of the ending. Carrying ambient under the
    // chapter-complete card breaks the frame, so cut it the moment we know
    // the chapter is over.
    this.audio.stopAmbient();
    // Same beat as movement crossings: let the closing text settle, then
    // wait for an explicit tap before the chapter-complete overlay arrives.
    // Lock input so stray taps on the now-stale layout don't fire actions.
    this.setInputLocked(true);
    await this.waitForTapToContinue();
    this.showChapterComplete(this.game.chapter.title, epilogue);
  }

  private showChapterComplete(title: string, epilogue: string): void {
    const next = this.callbacks.nextChapterTitle;
    const buttonLabel = next ? `Continue → ${next}` : 'Return';
    const overlay = document.createElement('div');
    overlay.className = 'chapter-complete';
    overlay.innerHTML = `
      <div class="cc-frame">
        <div class="cc-label">Chapter complete</div>
        <div class="cc-title"></div>
        <div class="cc-epilogue"></div>
        <button class="cc-button" type="button"></button>
      </div>
    `;
    (overlay.querySelector('.cc-title') as HTMLElement).textContent = title;
    (overlay.querySelector('.cc-epilogue') as HTMLElement).textContent = epilogue;
    (overlay.querySelector('.cc-button') as HTMLElement).textContent = buttonLabel;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
    overlay.querySelector('.cc-button')!.addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.remove();
        this.callbacks.onChapterComplete();
      }, 500);
    });
  }

  // Device modal — the cross-device puzzle primitive. See 011.
  // The modal owns its local input state; on Submit it asks the engine
  // whether the input is correct. Correct → runs onSolve effects, returns
  // result through the standard movement-sequence / show-result paths.
  // Wrong → shake feedback, modal stays open.
  private showDeviceModal(itemId: string, device: Device): Promise<void> {
    return new Promise(resolve => {
      this.setInputLocked(true);
      const overlay = document.createElement('div');
      overlay.className = 'device-modal';
      const prompt = device.prompt ?? '';
      overlay.innerHTML = `
        <div class="device-frame">
          <div class="device-header">
            <span class="device-title">${escapeHtml(prompt)}</span>
            <button class="device-close" type="button" aria-label="Cancel">✕</button>
          </div>
          <div class="device-body"></div>
          <div class="device-feedback" aria-live="polite"></div>
          <div class="device-footer">
            <button class="device-submit" type="button" disabled>Submit</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visible'));

      const bodyEl = overlay.querySelector('.device-body') as HTMLElement;
      const submitBtn = overlay.querySelector('.device-submit') as HTMLButtonElement;
      const feedbackEl = overlay.querySelector('.device-feedback') as HTMLElement;
      const frameEl = overlay.querySelector('.device-frame') as HTMLElement;

      // Body builders return a getter that produces current input.
      let getInput: () => string | Record<string, string> | null;
      let isComplete: () => boolean;

      if (device.kind === 'combination') {
        ({ getInput, isComplete } = this.buildCombinationBody(bodyEl, device));
      } else {
        ({ getInput, isComplete } = this.buildSlotAssignBody(bodyEl, device));
      }

      const refreshSubmit = () => {
        submitBtn.disabled = !isComplete();
      };
      bodyEl.addEventListener('click', () => refreshSubmit());
      bodyEl.addEventListener('input', () => refreshSubmit());

      let done = false;
      const close = () => {
        if (done) return;
        done = true;
        overlay.classList.remove('visible');
        setTimeout(() => {
          overlay.remove();
          this.setInputLocked(false);
          resolve();
        }, 200);
      };

      overlay.querySelector('.device-close')!.addEventListener('click', close);

      submitBtn.addEventListener('click', async () => {
        const input = getInput();
        if (input == null) return;
        const result = this.callbacks.onSolveDevice(itemId, input);
        if (!result.correct) {
          feedbackEl.textContent = 'Not quite.';
          frameEl.classList.remove('shake');
          // re-add on next frame to retrigger the animation
          requestAnimationFrame(() => frameEl.classList.add('shake'));
          return;
        }
        // Correct. Close modal first, then flow the result text + any
        // movement transition through the standard rendering paths.
        done = true;
        overlay.classList.remove('visible');
        await new Promise<void>(r => setTimeout(() => { overlay.remove(); r(); }, 200));
        this.setInputLocked(false);
        if (result.movementChanged) {
          await this.runMovementSequence(result.text, result.transitionOut, result.transitionIn);
          this.focus = { itemId: null, isInventory: false };
        } else {
          this.refreshFromGame();
          await this.showResultText(result.text);
        }
        resolve();
      });
    });
  }

  private buildCombinationBody(host: HTMLElement, device: Extract<Device, { kind: 'combination' }>): {
    getInput: () => string;
    isComplete: () => boolean;
  } {
    const digits = new Array(device.digits).fill(0);
    const render = () => {
      const cols = digits.map((d, i) => {
        const label = device.labels?.[i] ?? '';
        return `
          <div class="combo-col">
            <button class="combo-up" data-i="${i}" type="button">▲</button>
            <div class="combo-digit" data-i="${i}">${d}</div>
            <button class="combo-down" data-i="${i}" type="button">▼</button>
            ${label ? `<div class="combo-label">${escapeHtml(label)}</div>` : ''}
          </div>
        `;
      }).join('');
      host.innerHTML = `<div class="combo-grid">${cols}</div>`;
    };
    render();

    host.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const upBtn = target.closest('.combo-up') as HTMLElement | null;
      const downBtn = target.closest('.combo-down') as HTMLElement | null;
      if (upBtn) {
        const i = parseInt(upBtn.dataset.i!);
        digits[i] = (digits[i] + 1) % 10;
        render();
      }
      if (downBtn) {
        const i = parseInt(downBtn.dataset.i!);
        digits[i] = (digits[i] + 9) % 10;
        render();
      }
    });

    return {
      getInput: () => digits.join(''),
      isComplete: () => true, // combination is always "complete" — every digit has a value
    };
  }

  private buildSlotAssignBody(host: HTMLElement, device: Extract<Device, { kind: 'slot-assign' }>): {
    getInput: () => Record<string, string> | null;
    isComplete: () => boolean;
  } {
    // slot.id -> option.id (or undefined)
    const assignments: Record<string, string | undefined> = {};
    let activeSlot: string | null = null;

    const render = () => {
      const usedOptionIds = new Set(
        Object.values(assignments).filter((v): v is string => Boolean(v))
      );

      const slotsHtml = device.slots.map(slot => {
        const assigned = assignments[slot.id];
        const assignedLabel = assigned
          ? device.options.find(o => o.id === assigned)?.label ?? assigned
          : '—';
        const cls = activeSlot === slot.id ? 'slot-card active' : 'slot-card';
        return `
          <button class="${cls}" data-slot-id="${slot.id}" type="button">
            <span class="slot-label">${escapeHtml(slot.label)}</span>
            <span class="slot-value">${escapeHtml(assignedLabel)}</span>
          </button>
        `;
      }).join('');

      let optionsHtml = '';
      if (activeSlot) {
        const opts = device.options.map(opt => {
          const taken = !device.multiOption && usedOptionIds.has(opt.id)
            && assignments[activeSlot!] !== opt.id;
          return `
            <button class="slot-opt${taken ? ' taken' : ''}" data-opt-id="${opt.id}" type="button"${taken ? ' disabled' : ''}>
              ${escapeHtml(opt.label)}
            </button>
          `;
        }).join('');
        optionsHtml = `
          <div class="slot-options-panel">
            <div class="slot-options-hint">Pick one for "${escapeHtml(device.slots.find(s => s.id === activeSlot)!.label)}":</div>
            <div class="slot-options-list">${opts}</div>
            ${assignments[activeSlot] ? `<button class="slot-clear" type="button">Clear this slot</button>` : ''}
          </div>
        `;
      }

      host.innerHTML = `
        <div class="slot-grid">${slotsHtml}</div>
        ${optionsHtml}
      `;
    };
    render();

    host.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const slotBtn = target.closest('.slot-card') as HTMLElement | null;
      const optBtn = target.closest('.slot-opt:not(.taken)') as HTMLElement | null;
      const clearBtn = target.closest('.slot-clear') as HTMLElement | null;
      if (slotBtn) {
        const id = slotBtn.dataset.slotId!;
        activeSlot = activeSlot === id ? null : id;
        render();
      } else if (optBtn && activeSlot) {
        assignments[activeSlot] = optBtn.dataset.optId!;
        activeSlot = null;
        render();
      } else if (clearBtn && activeSlot) {
        delete assignments[activeSlot];
        render();
      }
    });

    return {
      getInput: () => {
        const out: Record<string, string> = {};
        for (const slot of device.slots) {
          const v = assignments[slot.id];
          if (!v) return null;
          out[slot.id] = v;
        }
        return out;
      },
      isComplete: () => device.slots.every(s => Boolean(assignments[s.id])),
    };
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
