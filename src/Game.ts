import type {
  GameState, GameSnapshot, Chapter, Room, Perspective,
  Direction, ActionType, Side, SideEffect
} from './types';

const SAVE_KEY_PREFIX = 'egz_save_';

export class Game {
  state: GameState;
  chapter: Chapter;

  constructor(side: Side, chapter: Chapter) {
    this.chapter = chapter;
    this.state = {
      side,
      chapterId: chapter.id,
      currentRoom: chapter.starts[side] ?? Object.keys(chapter.rooms)[0]!,
      inventory: [],
      flags: {},
      roomStates: {},
      completed: false,
    };
    this.markRoomVisited(this.state.currentRoom);
  }

  getRoom(id: string): Room {
    const room = this.chapter.rooms[id];
    if (!room) throw new Error(`Room not found: ${id}`);
    return room;
  }

  getCurrentRoom(): Room {
    return this.getRoom(this.state.currentRoom);
  }

  getPerspective(): Perspective {
    const room = this.getCurrentRoom();
    return this.state.side === 'dreamer' ? room.dreamer : room.reckoner;
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

  navigate(dir: Direction): { text: string; roomChanged: boolean } {
    const room = this.getCurrentRoom();
    const exit = room.exits.find(e => e.direction === dir);
    if (!exit) return { text: this.getCantGoText(dir), roomChanged: false };
    if (exit.blockedBy && !this.state.flags[exit.blockedBy]) {
      return { text: exit.blocked ?? 'The way is blocked.', roomChanged: false };
    }
    this.state.currentRoom = exit.roomId;
    this.markRoomVisited(exit.roomId);
    const persp = this.getPerspective();
    if (persp.entry) {
      return { text: `\n${persp.entry}\n`, roomChanged: true };
    }
    return { text: this.getEffectiveText(persp, 'entry'), roomChanged: true };
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
      || this.chapter.rooms[this.state.currentRoom]?.dreamer.items.find(i => i.id === itemId)
      || this.chapter.rooms[this.state.currentRoom]?.reckoner.items.find(i => i.id === itemId);

    if (!item) {
      return { text: `You don't see that here.` };
    }

    if (action === 'take') {
      return this.handleTake(item);
    }

    if (action === 'read') {
      if (item.onAction?.read) {
        const ctx = { flags: this.state.flags, inventory: this.state.inventory, roomId: this.state.currentRoom, itemId: item.id };
        const result = item.onAction.read(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: item.examine };
    }

    if (action === 'open') {
      if (item.onAction?.open) {
        const ctx = { flags: this.state.flags, inventory: this.state.inventory, roomId: this.state.currentRoom, itemId: item.id };
        const result = item.onAction.open(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: `You can't open the ${item.name}.` };
    }

    if (action === 'push') {
      if (item.onAction?.push) {
        const ctx = { flags: this.state.flags, inventory: this.state.inventory, roomId: this.state.currentRoom, itemId: item.id };
        const result = item.onAction.push(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: `Pushing the ${item.name} does nothing.` };
    }

    if (action === 'use') {
      if (item.onAction?.use) {
        const ctx = { flags: this.state.flags, inventory: this.state.inventory, roomId: this.state.currentRoom, itemId: item.id };
        const result = item.onAction.use(ctx);
        this.applyEffects(result.effects);
        return { text: result.text };
      }
      return { text: `Using the ${item.name} does nothing.` };
    }

    return { text: `You can't do that with the ${item.name}.` };
  }

  useInventoryItemOnRoom(invItemId: string, targetItemId: string): { text: string } {
    const room = this.getCurrentRoom();
    const combined = room.dreamer.items.find(i => i.id === targetItemId)
      || room.reckoner.items.find(i => i.id === targetItemId);
    if (!combined) return { text: `You don't see that here.` };

    const handlerKey = `use_${invItemId}` as const;
    if (combined.onAction?.[handlerKey as keyof typeof combined.onAction]) {
      const handler = combined.onAction[handlerKey as keyof typeof combined.onAction] as
        ((ctx: { flags: Record<string, string | number | boolean>; inventory: string[]; roomId: string; itemId?: string }) => { text: string; effects?: SideEffect[] }) | undefined;
      if (handler) {
        const ctx = { flags: this.state.flags, inventory: this.state.inventory, roomId: this.state.currentRoom, itemId: targetItemId };
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
      if (e.complete) {
        this.state.completed = true;
      }
    }
    this.checkTriggers();
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
    const room = this.getCurrentRoom();
    const item = room.dreamer.items.find(i => i.id === itemId)
      || room.reckoner.items.find(i => i.id === itemId);
    if (item?.inventory) return { id: item.id, ...item.inventory, actions: item.actions };
    return null;
  }

  getSnapshot(): GameSnapshot {
    const room = this.getCurrentRoom();
    const persp = this.getPerspective();
    const effectiveItems = this.getEffectiveItems(persp);
    return {
      roomName: room.name,
      roomId: room.id,
      side: this.state.side,
      description: this.getEntryText(),
      items: effectiveItems.map(i => ({ id: i.id, name: i.name, actions: i.actions, takeable: i.takeable })),
      focusedItem: null,
      focusedIsInventory: false,
      inventory: this.state.inventory.map(id => {
        const item = room.dreamer.items.find(i => i.id === id) || room.reckoner.items.find(i => i.id === id);
        if (item?.inventory) return { id: item.id, label: item.inventory.label };
        return { id, label: id };
      }),
      exits: room.exits.filter(e => !e.blockedBy || this.state.flags[e.blockedBy]).map(e => e.direction),
      actions: ['look', 'open', 'take', 'push', 'read', 'use'],
      completed: this.state.completed,
      cast: this.chapter.cast,
    };
  }

  save(): void {
    const key = `${SAVE_KEY_PREFIX}${this.state.side}_${this.state.chapterId}`;
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

  static load(side: Side, chapters: Record<string, Chapter>): Game | null {
    for (const [cid, chapter] of Object.entries(chapters)) {
      const key = `${SAVE_KEY_PREFIX}${side}_${cid}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw) as { state: GameState; chapterId: string };
          const game = new Game(side, chapter);
          game.state = data.state;
          return game;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
    return null;
  }

  static clearSave(side: Side, chapterId: string): void {
    const key = `${SAVE_KEY_PREFIX}${side}_${chapterId}`;
    localStorage.removeItem(key);
  }

  getRoomItems(roomId: string): { id: string; name: string; examine: string; actions: ActionType[]; takeable: boolean }[] {
    const room = this.getRoom(roomId);
    const persp = this.state.side === 'dreamer' ? room.dreamer : room.reckoner;
    const removed = this.state.roomStates[roomId]?.itemsRemoved ?? [];
    return persp.items.filter(i => !removed.includes(i.id)).map(i => ({
      id: i.id, name: i.name, examine: i.examine, actions: i.actions, takeable: i.takeable,
    }));
  }
}
