import type { Side, Mode, Direction, ActionType, Chapter } from './types';
import { Game } from './Game';
import { AudioEngine } from './Audio';
import { GameUI, buildSideSelect, buildModeSelect, type UICallbacks } from './UI';
import { Ch01 } from './chapters/Ch01';
import { Sp01 } from './chapters/Sp01';
import { Sp02 } from './chapters/Sp02';
import { Sp03 } from './chapters/Sp03';
import './style.css';

const CHAPTERS_TOGETHER = { ch01: Ch01 };
// Solo chapters in release order. Walked by the picker and by the
// chapter-complete "Continue" button to determine the successor.
const SOLO_ORDER: Chapter[] = [Sp01, Sp02, Sp03];


function getNextSoloChapter(chapterId: string): Chapter | null {
  const idx = SOLO_ORDER.findIndex(c => c.id === chapterId);
  if (idx < 0 || idx >= SOLO_ORDER.length - 1) return null;
  return SOLO_ORDER[idx + 1]!;
}

// Returns the first solo chapter with an in-progress (non-completed) save.
// Game.load by itself returns the first save it finds in the chapters map,
// which can be a completed save for an earlier chapter even when a later
// chapter is mid-play. This helper walks SOLO_ORDER and prefers in-progress.
function findInProgressSolo(): Game | null {
  for (const chapter of SOLO_ORDER) {
    const g = Game.load('solo', 'dreamer', { [chapter.id]: chapter });
    if (g && !g.state.completed) return g;
  }
  return null;
}

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
      // Solo path. In any non-production build (the dev server, or an
      // explicit `vite build -m dev` / `-m staging` / etc), jump straight to
      // a chapter picker. Production builds (`vite build` with default mode)
      // walk the linear path. The condition is written inline so Vite's
      // import.meta.env.MODE replacement reduces it to a literal boolean and
      // the production bundle dead-code-eliminates the picker entirely.
      if (import.meta.env.MODE !== 'production') {
        showDevChapterPicker(app, audio);
        return;
      }
      const existing = findInProgressSolo();
      if (existing) {
        showResumePrompt(app, existing.state.side, existing, audio);
        return;
      }
      const history = loadCompletionHistory();
      const nextChapter = SOLO_ORDER.find(c => !history.solo[c.id]);
      if (nextChapter) {
        Game.clearSave('solo', 'dreamer', nextChapter.id);
        startSoloGame(app, audio, nextChapter);
        return;
      }
      showSoloReplayPrompt(app, audio);
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

function startSoloGame(app: HTMLElement, audio: AudioEngine, chapter = Sp01) {
  // state.side is a seed; in solo mode rendering is driven by movement.mode.
  const game = new Game('solo', 'dreamer', chapter);
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
      // Restart the same chapter the player was abandoning, not Ch01 by default.
      const sameChapter = SOLO_ORDER.find(c => c.id === game.chapter.id) ?? Sp01;
      startSoloGame(app, audio, sameChapter);
    } else {
      startGame(app, side, audio);
    }
  });
}

// Dev-only chapter picker. Vite tree-shakes this out of production builds via
// the `import.meta.env.DEV` check in the caller, so no pre-release toggle is
// needed — the picker simply disappears when you ship.
function showDevChapterPicker(app: HTMLElement, audio: AudioEngine) {
  const history = loadCompletionHistory();
  const items = SOLO_ORDER.map(chapter => {
    const save = Game.load('solo', 'dreamer', { [chapter.id]: chapter });
    const completed = !!history.solo[chapter.id] || !!save?.state.completed;
    const inProgress = !!save && !save.state.completed;
    let status: string;
    if (inProgress) status = 'in progress — resume';
    else if (completed) status = 'completed — replay';
    else status = 'available';
    return { chapter, save, completed, inProgress, status };
  });

  app.innerHTML = `
    <div id="side-select">
      <div class="side-select-content">
        <h1 class="side-select-title">Chapters</h1>
        <p class="side-select-subtitle">Dev build — every chapter is open</p>
        <div class="side-select-buttons">
          ${items.map((item, i) => `
            <button class="side-btn dreamer-btn" data-idx="${i}">
              <span class="side-btn-label">${item.chapter.title}</span>
              <span class="side-btn-desc">${item.status}</span>
            </button>
          `).join('')}
          <button class="side-btn reckoner-btn" id="dev-back">
            <span class="side-btn-label">Back</span>
            <span class="side-btn-desc">Return to mode select</span>
          </button>
        </div>
      </div>
    </div>
  `;

  app.querySelectorAll<HTMLElement>('.side-btn[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx!);
      const item = items[idx]!;
      if (item.inProgress && item.save) {
        startGameWithExisting(app, item.save.state.side, item.save, audio);
      } else {
        Game.clearSave('solo', 'dreamer', item.chapter.id);
        startSoloGame(app, audio, item.chapter);
      }
    });
  });
  document.getElementById('dev-back')!.addEventListener('click', () => {
    bootModeSelect(app, audio);
  });
}

function showSoloReplayPrompt(app: HTMLElement, audio: AudioEngine) {
  // Replay the most recent completed chapter. Player can use it to revisit.
  const replayChapter = SOLO_ORDER[SOLO_ORDER.length - 1] ?? Sp01;
  const title = replayChapter.title;
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
    Game.clearSave('solo', 'dreamer', replayChapter.id);
    startSoloGame(app, audio, replayChapter);
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

  // On a movement crossing the audio change is held back until the UI signals
  // that the player has tapped through the transition overlay. Plain
  // room-to-room moves (same movement) still flip ambient immediately.
  const applyAmbient = () => {
    audio.setAmbient(game.getPerspective()?.ambient ?? `${game.getCurrentRenderMode()}-default`);
  };

  const callbacks: UICallbacks = {
    onNavigate: (dir: Direction) => {
      const result = game.navigate(dir);
      if (result.roomChanged && !result.movementChanged) {
        applyAmbient();
      }
      if (result.roomChanged) game.save();
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
      if (result.roomChanged && !result.movementChanged) {
        applyAmbient();
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
      if (result.roomChanged && !result.movementChanged) {
        applyAmbient();
      }
      game.save();
      return {
        text: result.text,
        movementChanged: result.movementChanged,
        transitionOut: result.previousMovement?.transitionOut,
        transitionIn: result.currentMovement?.transitionIn,
      };
    },
    onMovementApplied: () => {
      applyAmbient();
    },
    onSave: () => {
      game.save();
    },
    onPickSide: () => {},
    onPickMode: () => {},
    onNewGame: () => {},
    onChapterComplete: () => {
      markChapterCompleted(game.mode, game.chapter.id);
      // Intentionally keep the finished save (with state.completed=true) in
      // localStorage. It is the player's record that they finished this
      // chapter, alongside egz_completion_history. Replay flows explicitly
      // clear it when they need a fresh start.
      const next = game.mode === 'solo' ? getNextSoloChapter(game.chapter.id) : null;
      if (next) {
        Game.clearSave('solo', 'dreamer', next.id);
        startSoloGame(app, audio, next);
      } else {
        bootModeSelect(app, audio);
      }
    },
    nextChapterTitle: game.mode === 'solo'
      ? getNextSoloChapter(game.chapter.id)?.title
      : undefined,
  };

  const ui = new GameUI(app, game, audio, callbacks);

  if (!game.state.roomStates[game.state.currentRoom]?.visited && game.chapter.prologue) {
    ui.showPrologue(game.chapter.prologue);
  }
}

start();
