import type {
  GameState, GameSnapshot, Chapter, Room, Perspective, Movement,
  Direction, ActionType, Side, Mode, RenderMode, SideEffect
} from './types';

const SAVE_KEY_PREFIX = 'egz_save_';

const EMPTY_PERSPECTIVE: Perspective = { entry: '', look: '', items: [] };

function keyFor(mode: Mode, side: Side, chapterId: string): string {
  if (mode === 'together') return `${SAVE_KEY_PREFIX}together_${side}_${chapterId}`;
  return `${SAVE_KEY_PREFIX}solo_${chapterId}`;
}

export class Game {
  state: GameState;
  chapter: Chapter;
  mode: Mode;
  private roomToMovement: Map<string, number>;

  constructor(mode: Mode, side: Side, chapter: Chapter) {
    this.mode = mode;
    this.chapter = chapter;
    this.roomToMovement = Game.buildRoomToMovement(chapter);

    if (mode === 'solo' && (!chapter.movements || chapter.movements.length === 0)) {
      throw new Error(`Solo chapter "${chapter.id}" must declare movements.`);
    }

    let startSide = side;
    let startRoom = chapter.starts[side] ?? Object.keys(chapter.rooms)[0]!;
    let startMovement = this.roomToMovement.get(startRoom) ?? 0;

    if (mode === 'solo' && chapter.movements && chapter.movements.length > 0) {
      const first = chapter.movements[0]!;
      startMovement = 0;
      startRoom = first.rooms[0] ?? startRoom;
      // state.side stays a Side; render mode is derived from movement.mode.
      // We still seed state.side to something sensible for inventory etc.
      if (first.mode === 'dreamer' || first.mode === 'reckoner') {
        startSide = first.mode;
      }
    }

    this.state = {
      side: startSide,
      chapterId: chapter.id,
      currentRoom: startRoom,
      currentMovement: startMovement,
      inventory: [],
      journal: [],
      flags: {},
      roomStates: {},
      completed: false,
    };
    this.markRoomVisited(this.state.currentRoom);
  }

  private static buildRoomToMovement(chapter: Chapter): Map<string, number> {
    const map = new Map<string, number>();
    if (!chapter.movements) return map;
    chapter.movements.forEach((mv, i) => {
      for (const roomId of mv.rooms) map.set(roomId, i);
    });
    return map;
  }

  getCurrentMovement(): Movement | null {
    if (!this.chapter.movements) return null;
    return this.chapter.movements[this.state.currentMovement] ?? null;
  }

  getMovementForRoom(roomId: string): number | null {
    const idx = this.roomToMovement.get(roomId);
    return idx === undefined ? null : idx;
  }

  getRoom(id: string): Room {
    const room = this.chapter.rooms[id];
    if (!room) throw new Error(`Room not found: ${id}`);
    return room;
  }

  getCurrentRoom(): Room {
    return this.getRoom(this.state.currentRoom);
  }

  getCurrentRenderMode(): RenderMode {
    if (this.mode === 'together') return this.state.side;
    const mv = this.getCurrentMovement();
    return mv?.mode ?? this.state.side;
  }

  getPerspective(): Perspective {
    const room = this.getCurrentRoom();
    return this.pickPerspective(room);
  }

  private pickPerspective(room: Room): Perspective {
    const renderMode = this.getCurrentRenderMode();
    const direct = room[renderMode];
    if (direct) return direct;
    // Fallback: any perspective the room declares. Better to render something
    // than crash if a chapter author forgot to provide the matching mode.
    return room.dreamer ?? room.reckoner ?? room.neutral ?? EMPTY_PERSPECTIVE;
  }

  // Visit every perspective declared on a room. Used by inventory and item
  // lookups that need to find an item regardless of which side originally
  // declared it.
  private allPerspectives(room: Room): Perspective[] {
    const out: Perspective[] = [];
    if (room.dreamer) out.push(room.dreamer);
    if (room.reckoner) out.push(room.reckoner);
    if (room.neutral) out.push(room.neutral);
    return out;
  }

  private getEffectiveText(persp: Perspective, field: 'entry' | 'look'): string {
    if (persp.conditions) {
      for (const c of persp.conditions) {
        if (this.state.flags[c.flag] === c.value) return c.text;
      }
    }
    return persp[field];
  }

  private getEffectiveItems(persp: Perspective): typeof persp.items {
    const removed = this.state.roomStates[this.state.currentRoom]?.itemsRemoved ?? [];
    return persp.items.filter(i => !removed.includes(i.id));
  }

  navigate(dir: Direction): {
    text: string;
    roomChanged: boolean;
    movementChanged: boolean;
    previousMovement: Movement | null;
    currentMovement: Movement | null;
  } {
    const room = this.getCurrentRoom();
    const exit = room.exits.find(e => e.direction === dir);
    const noChange = {
      roomChanged: false,
      movementChanged: false,
      previousMovement: this.getCurrentMovement(),
      currentMovement: this.getCurrentMovement(),
    };
    if (!exit) return { text: this.getCantGoText(dir), ...noChange };
    if (exit.blockedBy && !this.state.flags[exit.blockedBy]) {
      return { text: exit.blocked ?? 'The way is blocked.', ...noChange };
    }

    const previousMovementIdx = this.state.currentMovement;
    const previousMovement = this.getCurrentMovement();
    this.state.currentRoom = exit.roomId;
    this.markRoomVisited(exit.roomId);

    // Movement transition: if the new room belongs to a different movement,
    // advance currentMovement and (in solo) sync the rendering side.
    const newMovementIdx = this.roomToMovement.get(exit.roomId);
    let movementChanged = false;
    if (newMovementIdx !== undefined && newMovementIdx !== previousMovementIdx) {
      this.state.currentMovement = newMovementIdx;
      movementChanged = true;
      if (this.mode === 'solo') {
        const mv = this.chapter.movements?.[newMovementIdx];
        // Keep state.side aligned with the movement's render mode when the
        // movement is a side (dreamer/reckoner). For neutral movements,
        // state.side is left as-is — render mode is derived from the movement.
        if (mv?.mode === 'dreamer' || mv?.mode === 'reckoner') {
          this.state.side = mv.mode;
        }
      }
    }

    const persp = this.getPerspective();
    const text = persp.entry
      ? `\n${persp.entry}\n`
      : this.getEffectiveText(persp, 'entry');

    return {
      text,
      roomChanged: true,
      movementChanged,
      previousMovement,
      currentMovement: this.getCurrentMovement(),
    };
  }

  private getCantGoText(dir: Direction): string {
    const map: Record<Direction, string> = {
      north: 'a solid wall',
      south: 'a solid wall',
      east: 'a solid wall',
      west: 'a solid wall',
    };
    return `You can't go that way. There's ${map[dir]}.`;
  }

  act(action: ActionType, itemId?: string): { text: string } {
    const persp = this.getPerspective();
    const effectiveItems = this.getEffectiveItems(persp);

    if (action === 'look') {
      return { text: this.getLookText(persp, effectiveItems) };
    }

    if (!itemId) {
      return { text: 'Nothing to do that with.' };
    }

    const item = effectiveItems.find(i => i.id === itemId)
      || this.findItemInRoom(this.state.currentRoom, itemId);

    if (!item) {
      return { text: `You don't see that here.` };
    }

    if (action === 'take') {
      return this.handleTake(item);
    }

    if (action === 'read') {
      if (item.onAction?.read) {
        const ctx = this.makeContext(item.id);
        const result = item.onAction.read(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: item.examine };
    }

    if (action === 'open') {
      if (item.onAction?.open) {
        const ctx = this.makeContext(item.id);
        const result = item.onAction.open(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: `You can't open the ${item.name}.` };
    }

    if (action === 'push') {
      if (item.onAction?.push) {
        const ctx = this.makeContext(item.id);
        const result = item.onAction.push(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: `Pushing the ${item.name} does nothing.` };
    }

    if (action === 'use') {
      if (item.onAction?.use) {
        const ctx = this.makeContext(item.id);
        const result = item.onAction.use(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: `Using the ${item.name} does nothing.` };
    }

    return { text: `You can't do that with the ${item.name}.` };
  }

  useInventoryItemOnRoom(invItemId: string, targetItemId: string): { text: string } {
    const combined = this.findItemInRoom(this.state.currentRoom, targetItemId);
    if (!combined) return { text: `You don't see that here.` };

    const handlerKey = `use_${invItemId}` as const;
    if (combined.onAction?.[handlerKey as keyof typeof combined.onAction]) {
      const handler = combined.onAction[handlerKey as keyof typeof combined.onAction] as
        ((ctx: { flags: Record<string, string | number | boolean>; inventory: string[]; roomId: string; itemId?: string }) => { text: string; effects?: SideEffect[] }) | undefined;
      if (handler) {
        const ctx = this.makeContext(targetItemId);
        const result = handler(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
    }

    return { text: `Using ${invItemId} on the ${targetItemId} doesn't work.` };
  }

  private handleTake(item: { id: string; name: string; takeable: boolean; inventory: { label: string; examine: string } }): { text: string } {
    if (!item.takeable) return { text: `You can't take the ${item.name}.` };
    if (this.state.inventory.includes(item.id)) return { text: `You already have the ${item.name}.` };
    this.state.inventory.push(item.id);
    if (!this.state.roomStates[this.state.currentRoom]) {
      this.state.roomStates[this.state.currentRoom] = { visited: true, itemsRemoved: [] };
    }
    this.state.roomStates[this.state.currentRoom]!.itemsRemoved.push(item.id);
    return { text: `Taken.` };
  }

  private applyEffects(effects?: SideEffect[]): void {
    if (!effects) return;
    for (const e of effects) {
      if (e.setFlags) {
        Object.assign(this.state.flags, e.setFlags);
      }
      if (e.addItem && !this.state.inventory.includes(e.addItem)) {
        this.state.inventory.push(e.addItem);
      }
      if (e.removeItem) {
        const rs = this.state.roomStates[this.state.currentRoom];
        if (rs && !rs.itemsRemoved.includes(e.removeItem)) {
          rs.itemsRemoved.push(e.removeItem);
        }
      }
      if (e.enableExit) {
        const room = this.getRoom(this.state.currentRoom);
        const exit = room.exits.find(x => x.direction === e.enableExit!.direction);
        if (exit) delete exit.blockedBy;
      }
      if (e.addJournalEntry) {
        const entry = e.addJournalEntry;
        if (!this.state.journal.some(j => j.id === entry.id)) {
          this.state.journal.push({
            ...entry,
            addedInMovement: entry.addedInMovement ?? this.state.currentMovement,
          });
        }
      }
      if (e.complete) {
        this.state.completed = true;
      }
    }
    this.checkTriggers();
  }

  private makeContext(itemId?: string) {
    return {
      flags: this.state.flags,
      inventory: this.state.inventory,
      journal: this.state.journal,
      roomId: this.state.currentRoom,
      itemId,
    };
  }

  private checkTriggers(): void {
    for (const trigger of this.chapter.triggers) {
      const fired = this.state.flags[`__trigger_${trigger.id}`];
      if (trigger.once && fired) continue;
      const allMet = trigger.when.every(c => this.state.flags[c.flag] === c.value);
      if (allMet) {
        this.state.flags[`__trigger_${trigger.id}`] = true;
        this.applyEffects(trigger.then);
      }
    }
  }

  private markRoomVisited(roomId: string): void {
    if (!this.state.roomStates[roomId]) {
      this.state.roomStates[roomId] = { visited: true, itemsRemoved: [] };
    } else {
      this.state.roomStates[roomId]!.visited = true;
    }
  }

  getLookTextForCurrentRoom(): string {
    const persp = this.getPerspective();
    const effectiveItems = this.getEffectiveItems(persp);
    return this.buildLookText(persp, effectiveItems);
  }

  private getLookText(persp: Perspective, items: { id: string; name: string }[]): string {
    return this.buildLookText(persp, items);
  }

  private buildLookText(persp: Perspective, items: { id: string; name: string }[]): string {
    let text = this.getEffectiveText(persp, 'look');
    if (items.length > 0) {
      const names = items.map(i => i.name);
      const last = names.pop()!;
      const list = names.length > 0 ? `${names.join(', ')}, and ${last}` : last;
      text += `\n\nYou can see: ${list}.`;
    }
    return text;
  }

  getEntryText(): string {
    const persp = this.getPerspective();
    const effectiveItems = this.getEffectiveItems(persp);
    let text = this.getEffectiveText(persp, 'entry');
    if (effectiveItems.length > 0) {
      const names = effectiveItems.map(i => i.name);
      const last = names.pop()!;
      const list = names.length > 0 ? `${names.join(', ')}, and ${last}` : last;
      text += `\n\nYou can see: ${list}.`;
    }
    return text;
  }

  getItem(itemId: string): { id: string; name: string; examine: string; actions: ActionType[]; takeable: boolean } | null {
    const persp = this.getPerspective();
    const items = this.getEffectiveItems(persp);
    const item = items.find(i => i.id === itemId);
    if (item) return { id: item.id, name: item.name, examine: item.examine, actions: item.actions, takeable: item.takeable };
    return null;
  }

  getInventoryItem(itemId: string): { id: string; label: string; examine: string; actions: ActionType[] } | null {
    if (!this.state.inventory.includes(itemId)) return null;
    // Inventory items may have come from any room visited so far; search all
    // rooms across all perspectives so we can still find them after the player
    // has moved on.
    for (const room of Object.values(this.chapter.rooms)) {
      const item = this.findItemInRoom(room.id, itemId);
      if (item?.inventory) return { id: item.id, ...item.inventory, actions: item.actions };
    }
    return null;
  }

  private findItemInRoom(roomId: string, itemId: string) {
    const room = this.chapter.rooms[roomId];
    if (!room) return undefined;
    for (const persp of this.allPerspectives(room)) {
      const item = persp.items.find(i => i.id === itemId);
      if (item) return item;
    }
    return undefined;
  }

  getSnapshot(): GameSnapshot {
    const room = this.getCurrentRoom();
    const persp = this.getPerspective();
    const effectiveItems = this.getEffectiveItems(persp);
    return {
      roomName: room.name,
      roomId: room.id,
      side: this.state.side,
      renderMode: this.getCurrentRenderMode(),
      description: this.getEntryText(),
      items: effectiveItems.map(i => ({ id: i.id, name: i.name, actions: i.actions, takeable: i.takeable })),
      focusedItem: null,
      focusedIsInventory: false,
      inventory: this.state.inventory.map(id => {
        // An inventory item may originate from a room other than the current
        // one, so search the whole chapter for its label.
        for (const r of Object.values(this.chapter.rooms)) {
          const item = this.findItemInRoom(r.id, id);
          if (item?.inventory) return { id: item.id, label: item.inventory.label };
        }
        return { id, label: id };
      }),
      exits: room.exits.filter(e => !e.blockedBy || this.state.flags[e.blockedBy]).map(e => e.direction),
      actions: ['look', 'open', 'take', 'push', 'read', 'use'],
      completed: this.state.completed,
      cast: this.chapter.cast,
      hasJournal: Boolean(this.chapter.usesJournal),
      journal: this.state.journal,
    };
  }

  save(): void {
    const key = keyFor(this.mode, this.state.side, this.state.chapterId);
    const data = {
      state: this.state,
      chapterId: this.chapter.id,
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.warn('Failed to save game state');
    }
  }

  static load(mode: Mode, side: Side, chapters: Record<string, Chapter>): Game | null {
    for (const [cid, chapter] of Object.entries(chapters)) {
      const key = keyFor(mode, side, cid);
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw) as { state: GameState; chapterId: string };
          const game = new Game(mode, data.state.side, chapter);
          game.state = data.state;
          // Older saves (pre-Step 3) had no currentMovement field.
          if (game.state.currentMovement === undefined) {
            game.state.currentMovement = game.roomToMovement.get(game.state.currentRoom) ?? 0;
          }
          // Older saves (pre-Step 5) had no journal field.
          if (!game.state.journal) {
            game.state.journal = [];
          }
          return game;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
    return null;
  }

  static clearSave(mode: Mode, side: Side, chapterId: string): void {
    localStorage.removeItem(keyFor(mode, side, chapterId));
  }

  getRoomItems(roomId: string): { id: string; name: string; examine: string; actions: ActionType[]; takeable: boolean }[] {
    const room = this.getRoom(roomId);
    const persp = this.pickPerspective(room);
    const removed = this.state.roomStates[roomId]?.itemsRemoved ?? [];
    return persp.items.filter(i => !removed.includes(i.id)).map(i => ({
      id: i.id, name: i.name, examine: i.examine, actions: i.actions, takeable: i.takeable,
    }));
  }
}
