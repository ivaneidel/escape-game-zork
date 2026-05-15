import type { Side, Mode, Direction, ActionType } from './types';
import { Game } from './Game';
import { AudioEngine } from './Audio';
import { GameUI, buildSideSelect, buildModeSelect, type UICallbacks } from './UI';
import { Ch01 } from './chapters/Ch01';
import { Sp01 } from './chapters/Sp01';
import './style.css';

const CHAPTERS_TOGETHER = { ch01: Ch01 };
const CHAPTERS_SOLO = { sp01: Sp01 };

// Completion history persists across contentVersion bumps. Save invalidations
// throw away in-progress state but leave behind "you finished this once."
const COMPLETION_KEY = 'egz_completion_history';

interface CompletionHistory {
  solo: Record<string, { completedAt: number }>;
  together: Record<string, { completedAt: number }>;
}

function loadCompletionHistory(): CompletionHistory {
  try {
    const raw = localStorage.getItem(COMPLETION_KEY);
    if (!raw) return { solo: {}, together: {} };
    const data = JSON.parse(raw) as Partial<CompletionHistory>;
    return { solo: data.solo ?? {}, together: data.together ?? {} };
  } catch {
    return { solo: {}, together: {} };
  }
}

function markChapterCompleted(mode: Mode, chapterId: string): void {
  const history = loadCompletionHistory();
  history[mode][chapterId] = { completedAt: Date.now() };
  try {
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function start() {
  const app = document.getElementById('app')!;
  const audio = new AudioEngine();
  bootModeSelect(app, audio);
}

function bootModeSelect(app: HTMLElement, audio: AudioEngine) {
  const callbacks: UICallbacks = {
    onPickMode: (mode: Mode) => {
      if (mode === 'together') {
        buildSideSelect(app, callbacks);
        return;
      }
      // Solo path.
      const existing = Game.load('solo', 'dreamer', CHAPTERS_SOLO);
      if (existing && !existing.state.completed) {
        showResumePrompt(app, existing.state.side, existing, audio);
        return;
      }
      const history = loadCompletionHistory();
      if (history.solo['sp01']) {
        showSoloReplayPrompt(app, audio);
        return;
      }
      Game.clearSave('solo', 'dreamer', 'sp01');
      startSoloGame(app, audio);
    },
    onPickSide: (side: Side) => {
      const existing = Game.load('together', side, CHAPTERS_TOGETHER);
      if (existing && !existing.state.completed) {
        showResumePrompt(app, side, existing, audio);
        return;
      }
      Game.clearSave('together', side, 'ch01');
      startGame(app, side, audio);
    },
    onNewGame: () => {
      bootModeSelect(app, audio);
    },
    onSave: () => {},
    onNavigate: () => ({ text: '', roomChanged: false, movementChanged: false }),
    onAct: () => ({ text: '', movementChanged: false }),
    onUseItemOnRoom: () => ({ text: '', movementChanged: false }),
    onChapterComplete: () => {},
  };

  buildModeSelect(app, callbacks);
}

function startSoloGame(app: HTMLElement, audio: AudioEngine) {
  // state.side is a seed; in solo mode rendering is driven by movement.mode.
  const game = new Game('solo', 'dreamer', Sp01);
  startGameWithExisting(app, game.state.side, game, audio);
}

function showResumePrompt(app: HTMLElement, side: Side, game: Game, audio: AudioEngine) {
  const chapterTitle = game.chapter.title;
  const roomName = game.getCurrentRoom().name;
  app.innerHTML = `
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Resume Game</h1>
        <p class="side-select-subtitle">You have a saved game in ${chapterTitle} (${roomName})</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" id="resume-yes">
            <span class="side-btn-label">Continue</span>
            <span class="side-btn-desc">Pick up where you left off</span>
          </button>
          <button class="side-btn reckoner-btn" id="resume-no">
            <span class="side-btn-label">New Game</span>
            <span class="side-btn-desc">Start over from the beginning</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('resume-yes')!.addEventListener('click', () => {
    startGameWithExisting(app, side, game, audio);
  });
  document.getElementById('resume-no')!.addEventListener('click', () => {
    Game.clearSave(game.mode, side, game.chapter.id);
    if (game.mode === 'solo') {
      startSoloGame(app, audio);
    } else {
      startGame(app, side, audio);
    }
  });
}

function showSoloReplayPrompt(app: HTMLElement, audio: AudioEngine) {
  const title = Sp01.title;
  app.innerHTML = `
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">${title}</h1>
        <p class="side-select-subtitle">You have walked through this one already.</p>
        <div class="side-select-buttons">
          <button class="side-btn dreamer-btn" id="replay-yes">
            <span class="side-btn-label">Play again</span>
            <span class="side-btn-desc">Start over from the beginning</span>
          </button>
          <button class="side-btn reckoner-btn" id="replay-back">
            <span class="side-btn-label">Back</span>
            <span class="side-btn-desc">Choose another path</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('replay-yes')!.addEventListener('click', () => {
    Game.clearSave('solo', 'dreamer', 'sp01');
    startSoloGame(app, audio);
  });
  document.getElementById('replay-back')!.addEventListener('click', () => {
    bootModeSelect(app, audio);
  });
}

function startGame(app: HTMLElement, side: Side, audio: AudioEngine) {
  const game = new Game('together', side, Ch01);
  startGameWithExisting(app, side, game, audio);
}

function startGameWithExisting(app: HTMLElement, _side: Side, game: Game, audio: AudioEngine) {
  audio.init().then(() => {
    audio.setAmbient(game.getPerspective()?.ambient ?? `${game.getCurrentRenderMode()}-default`);
  }).catch(() => {
    // Audio blocked by browser — game still works
  });

  const callbacks: UICallbacks = {
    onNavigate: (dir: Direction) => {
      const result = game.navigate(dir);
      if (result.roomChanged) {
        audio.setAmbient(game.getPerspective()?.ambient ?? `${game.getCurrentRenderMode()}-default`);
        game.save();
      }
      return {
        text: result.text,
        roomChanged: result.roomChanged,
        movementChanged: result.movementChanged,
        transitionOut: result.previousMovement?.transitionOut,
        transitionIn: result.currentMovement?.transitionIn,
      };
    },
    onAct: (action: ActionType, itemId?: string) => {
      const result = game.act(action, itemId);
      if (result.roomChanged) {
        audio.setAmbient(game.getPerspective()?.ambient ?? `${game.getCurrentRenderMode()}-default`);
      }
      game.save();
      return {
        text: result.text,
        movementChanged: result.movementChanged,
        transitionOut: result.previousMovement?.transitionOut,
        transitionIn: result.currentMovement?.transitionIn,
      };
    },
    onUseItemOnRoom: (invItemId: string, targetId: string) => {
      const result = game.useInventoryItemOnRoom(invItemId, targetId);
      if (result.roomChanged) {
        audio.setAmbient(game.getPerspective()?.ambient ?? `${game.getCurrentRenderMode()}-default`);
      }
      game.save();
      return {
        text: result.text,
        movementChanged: result.movementChanged,
        transitionOut: result.previousMovement?.transitionOut,
        transitionIn: result.currentMovement?.transitionIn,
      };
    },
    onSave: () => {
      game.save();
    },
    onPickSide: () => {},
    onPickMode: () => {},
    onNewGame: () => {},
    onChapterComplete: () => {
      markChapterCompleted(game.mode, game.chapter.id);
      Game.clearSave(game.mode, game.state.side, game.chapter.id);
      bootModeSelect(app, audio);
    },
  };

  const ui = new GameUI(app, game, audio, callbacks);

  if (!game.state.roomStates[game.state.currentRoom]?.visited && game.chapter.prologue) {
    ui.showPrologue(game.chapter.prologue);
  }
}

start();
