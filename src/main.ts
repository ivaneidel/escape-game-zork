import type { Side, Direction, ActionType } from './types';
import { Game } from './Game';
import { AudioEngine } from './Audio';
import { GameUI, buildSideSelect, type UICallbacks } from './UI';
import { Ch01 } from './chapters/Ch01';
import './style.css';

const CHAPTERS = { ch01: Ch01 };

function start() {
  const app = document.getElementById('app')!;
  const audio = new AudioEngine();

  const callbacks: UICallbacks = {
    onPickSide: (side: Side) => {
      const existing = Game.load(side, CHAPTERS);
      if (existing && !existing.state.completed) {
        showResumePrompt(app, side, existing, audio);
        return;
      }
      Game.clearSave(side, 'ch01');
      startGame(app, side, audio);
    },
    onNewGame: () => {
      buildSideSelect(app, callbacks);
    },
    onSave: () => {
      // handled in GameUI
    },
    onNavigate: () => '',
    onAct: () => '',
    onUseItemOnRoom: () => '',
  };

  buildSideSelect(app, callbacks);
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
    Game.clearSave(side, 'ch01');
    startGame(app, side, audio);
  });
}

function startGame(app: HTMLElement, side: Side, audio: AudioEngine) {
  const game = new Game(side, Ch01);
  startGameWithExisting(app, side, game, audio);
}

function startGameWithExisting(app: HTMLElement, _side: Side, game: Game, audio: AudioEngine) {
  audio.init().then(() => {
    audio.setAmbient(game.getPerspective()?.ambient ?? 'default');
  }).catch(() => {
    // Audio blocked by browser — game still works
  });

  const callbacks: UICallbacks = {
    onNavigate: (dir: Direction) => {
      const result = game.navigate(dir);
      if (result.roomChanged) {
        audio.setAmbient(game.getPerspective()?.ambient ?? 'default');
        game.save();
      }
      return result.text;
    },
    onAct: (action: ActionType, itemId?: string) => {
      const result = game.act(action, itemId);
      game.save();
      return result.text;
    },
    onUseItemOnRoom: (invItemId: string, targetId: string) => {
      const result = game.useInventoryItemOnRoom(invItemId, targetId);
      game.save();
      return result.text;
    },
    onSave: () => {
      game.save();
    },
    onPickSide: () => {},
    onNewGame: () => {},
  };

  const ui = new GameUI(app, game, audio, callbacks);

  if (!game.state.roomStates[game.state.currentRoom]?.visited && game.chapter.prologue) {
    ui.showPrologue(game.chapter.prologue);
  }
}

start();
