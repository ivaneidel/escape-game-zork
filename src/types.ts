export type Side = 'dreamer' | 'reckoner';

// What a room renders as right now. Side plus a 'neutral' tone for
// real-world bookends that belong to neither half.
export type RenderMode = Side | 'neutral';

export type Mode = 'solo' | 'together';

export type Direction = 'north' | 'south' | 'east' | 'west';

export type ActionType = 'look' | 'open' | 'take' | 'push' | 'examine' | 'use' | 'note';

export interface FlagCondition {
  flag: string;
  value: boolean | string | number;
}

export interface JournalEntry {
  id: string;
  label: string;
  body: string;
  addedInMovement?: number;
}

export interface SideEffect {
  setFlags?: Record<string, string | number | boolean>;
  showText?: string;
  addItem?: string;
  removeItem?: string;
  enableExit?: { direction: Direction; roomId: string };
  complete?: boolean;
  addJournalEntry?: JournalEntry;
  // Diegetic movement advance. Sets currentMovement and currentRoom,
  // syncs state.side for dreamer/reckoner modes. The UI fires the transition
  // overlay when an action result reports movementChanged.
  advanceToMovement?: { movementId?: string; targetRoom: string };
}

export interface ActionHandler {
  (ctx: ActionContext): ActionResult;
}

export interface ActionContext {
  flags: Record<string, string | number | boolean>;
  inventory: string[];
  journal: JournalEntry[];
  roomId: string;
  itemId?: string;
}

export interface ActionResult {
  text: string;
  effects?: SideEffect[];
}

export interface ItemActionMap {
  open?: ActionHandler;
  take?: ActionHandler;
  push?: ActionHandler;
  examine?: ActionHandler;
  use?: ActionHandler;
  note?: ActionHandler;
}

// Device modals (MP puzzle primitives). When an item declares a device, the
// action named in device.invoke is owned by the device — tapping it opens a
// modal lock. The legacy onAction[invoke] handler is ignored for that action.
// See 011-mp-puzzle-primitives.md.
export interface CombinationDevice {
  kind: 'combination';
  invoke: ActionType;
  digits: number;
  correct: string;
  prompt?: string;
  labels?: string[];
  onSolve: ActionHandler;
}

export interface SlotAssignDevice {
  kind: 'slot-assign';
  invoke: ActionType;
  slots: { id: string; label: string }[];
  options: { id: string; label: string }[];
  correct: Record<string, string>;
  multiOption?: boolean;
  prompt?: string;
  onSolve: ActionHandler;
}

export type Device = CombinationDevice | SlotAssignDevice;

export interface Item {
  id: string;
  name: string;
  examine: string;
  notice?: string;
  actions: ActionType[];
  takeable: boolean;
  inventory: { label: string; examine: string };
  onAction?: ItemActionMap;
  device?: Device;
}

export interface DescriptionCondition {
  flag: string;
  value: string | number | boolean;
  text: string;
}

export interface Perspective {
  entry: string;
  look: string;
  ambient?: string;
  items: Item[];
  conditions?: DescriptionCondition[];
}

export interface RoomExit {
  direction: Direction;
  roomId: string;
  blocked?: string;
  blockedBy?: string;
}

export interface Room {
  id: string;
  name: string;
  exits: RoomExit[];
  dreamer?: Perspective;
  reckoner?: Perspective;
  neutral?: Perspective;
}

export interface Trigger {
  id: string;
  when: FlagCondition[];
  then: SideEffect[];
  once: boolean;
  // If set, the trigger only fires when state.side matches. Used to author
  // per-side chapter-complete gates in MP chapters (one trigger per side).
  side?: Side;
}

export interface Movement {
  id: string;
  title: string;
  // In solo mode this drives perspective rendering per room.
  // In together mode this is ignored — side is fixed by the player's pick.
  mode?: RenderMode;
  rooms: string[];
  transitionIn?: string;
  transitionOut?: string;
}

export interface Chapter {
  id: string;
  title: string;
  starts: Record<Side, string>;
  rooms: Record<string, Room>;
  triggers: Trigger[];
  cast: Record<string, string>;
  prologue: string;
  epilogue: string;
  completionFlag: string;
  // Optional. Required for solo chapters; ignored for together chapters
  // that don't author them.
  movements?: Movement[];
  // When true, a Journal chip appears in the inventory bar and chapter
  // handlers can append entries via SideEffect.addJournalEntry.
  usesJournal?: boolean;
  // Bump when chapter content changes in ways that invalidate older saves.
  // Saves carry this stamp; mismatching saves are discarded on load.
  // Defaults to 1 if unset (both in chapter and save).
  contentVersion?: number;
  // Which action buttons appear in the action bar for this chapter.
  // If unset, the full default set renders.
  actionSet?: ActionType[];
}

export interface RoomState {
  visited: boolean;
  itemsRemoved: string[];
}

export interface GameState {
  side: Side;
  chapterId: string;
  currentRoom: string;
  currentMovement: number;
  inventory: string[];
  journal: JournalEntry[];
  flags: Record<string, string | number | boolean>;
  roomStates: Record<string, RoomState>;
  completed: boolean;
}

export interface GameSnapshot {
  roomName: string;
  roomId: string;
  side: Side;
  renderMode: RenderMode;
  description: string;
  items: { id: string; name: string; actions: ActionType[]; takeable: boolean }[];
  focusedItem: { id: string; name: string; examine: string; actions: ActionType[] } | null;
  focusedIsInventory: boolean;
  inventory: { id: string; label: string }[];
  exits: Direction[];
  actions: ActionType[];
  completed: boolean;
  cast: Record<string, string>;
  hasJournal: boolean;
  journal: JournalEntry[];
}
