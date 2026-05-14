export type Side = 'dreamer' | 'reckoner';

export type Direction = 'north' | 'south' | 'east' | 'west';

export type ActionType = 'look' | 'open' | 'take' | 'push' | 'read' | 'use';

export interface FlagCondition {
  flag: string;
  value: boolean | string | number;
}

export interface SideEffect {
  setFlags?: Record<string, string | number | boolean>;
  showText?: string;
  addItem?: string;
  removeItem?: string;
  enableExit?: { direction: Direction; roomId: string };
  complete?: boolean;
}

export interface ActionHandler {
  (ctx: ActionContext): ActionResult;
}

export interface ActionContext {
  flags: Record<string, string | number | boolean>;
  inventory: string[];
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
  read?: ActionHandler;
  use?: ActionHandler;
}

export interface Item {
  id: string;
  name: string;
  examine: string;
  notice?: string;
  actions: ActionType[];
  takeable: boolean;
  inventory: { label: string; examine: string };
  onAction?: ItemActionMap;
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
  dreamer: Perspective;
  reckoner: Perspective;
}

export interface Trigger {
  id: string;
  when: FlagCondition[];
  then: SideEffect[];
  once: boolean;
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
}

export interface RoomState {
  visited: boolean;
  itemsRemoved: string[];
}

export interface GameState {
  side: Side;
  chapterId: string;
  currentRoom: string;
  inventory: string[];
  flags: Record<string, string | number | boolean>;
  roomStates: Record<string, RoomState>;
  completed: boolean;
}

export interface GameSnapshot {
  roomName: string;
  roomId: string;
  side: Side;
  description: string;
  items: { id: string; name: string; actions: ActionType[]; takeable: boolean }[];
  focusedItem: { id: string; name: string; examine: string; actions: ActionType[] } | null;
  focusedIsInventory: boolean;
  inventory: { id: string; label: string }[];
  exits: Direction[];
  actions: ActionType[];
  completed: boolean;
  cast: Record<string, string>;
}
