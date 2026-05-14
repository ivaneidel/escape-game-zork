import type { Chapter, ActionContext } from '../types';

// SP Chapter 1 — First Light.
// Tomás Vasari, Trieste, autumn 1988, dreams into Andrei Voronin's life —
// parallel mid-1960s Soviet-adjacent space programme, spring 1965.
//
// Structure: Prologue (neutral) → M1 Window (dreamer) → M2 Desk (reckoner)
// → M3 Apartment (dreamer, two rooms) → M4 Briefing (reckoner) → Coda (neutral).
//
// The journal carries clues across modes. The chapter completes when Tomás
// reads his journal in the coda and notices the rhythm alignment.

export const Sp01: Chapter = {
  id: 'sp01',
  title: 'First Light',
  starts: {
    dreamer: 'tomas-desk-prologue',
    reckoner: 'tomas-desk-prologue',
  },
  cast: {
    protagonist: 'Tomás',
    cosmonaut: 'Andrei',
    wife: 'Yelena',
    daughter: 'Nina',
    superior: 'Drozdov',
  },
  usesJournal: true,
  contentVersion: 2,

  prologue: `Six weeks since the dreams clarified. You have not told anyone.

A translation you have not made progress on. Coffee gone cold. The radio is playing something you didn't tune — strings, faintly, drifting.

Outside, the courtyard is dark. Across the well, a single lit window. Never the same person at it.

You are tired. The desk is warm. The journal is open.`,

  epilogue: `The lamp is off. The journal is closed. The window opposite is dark.

You did not see the lit window go out.`,

  completionFlag: 'sp01.complete',

  movements: [
    {
      id: 'prologue',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-prologue'],
      transitionOut: `You lean back. The chair creaks. The radio drifts. The lamp is the last thing you see.`,
    },
    {
      id: 'm1-window',
      title: 'The Window',
      mode: 'dreamer',
      rooms: ['capsule'],
      transitionIn: `Pressure in your ears. A breathing that is not yours. Far below, a surface that will not resolve.`,
      transitionOut: `You wake. The room is dark. Your hand is on the journal. You write.`,
    },
    {
      id: 'm2-desk',
      title: 'The Desk',
      mode: 'reckoner',
      rooms: ['cosmonaut-office'],
      transitionIn: `Morning. You sit down to translate. The German sentence is the same one. Then it isn't. Then it is a Cyrillic file, a wooden desk, a radiator clanking. The light through the window is the wrong light.`,
      transitionOut: `You return to yourself slowly. Your hand has stopped on the page. The radiator clanks once more, somewhere. You write for a long time.`,
    },
    {
      id: 'm3-apartment',
      title: 'The Apartment',
      mode: 'dreamer',
      rooms: ['apt-kitchen', 'apt-living-room'],
      transitionIn: `That same night, late, in your clothes. The dream finds you in the doorway of a flat that is not yours. The kettle is on. A child is singing.`,
      transitionOut: `You wake at the kitchen window. Your kitchen. The kettle is not on. You have not eaten. You write.`,
    },
    {
      id: 'm4-briefing',
      title: 'The Briefing',
      mode: 'reckoner',
      rooms: ['briefing-room'],
      transitionIn: `Afternoon. Sixteen hundred hours. A windowless room. The door is closed and locked behind you. You sit at a table that is not yours.`,
      transitionOut: `You come back to yourself at the kitchen window. It is nearly dark. You have not eaten. You write for a long time.`,
    },
    {
      id: 'coda',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-coda'],
      transitionIn: `The desk. The radio is off. The journal is full — six new pages since yesterday. You sit.`,
    },
  ],

  rooms: {
    // ─── PROLOGUE ────────────────────────────────────────────────────────────

    'tomas-desk-prologue': {
      id: 'tomas-desk-prologue',
      name: "Your Desk",
      exits: [
        { direction: 'north', roomId: 'capsule' },
      ],
      neutral: {
        entry: `A small flat, fourth floor. The desk by the window. The typewriter open to a page you have read four times. The journal lies beside it, six weeks old. The radio plays something you do not recognise.

You are tired. There is nowhere to go but to sleep.`,
        look: `Your desk. Your typewriter. The unwashed cup. The journal, open to an early entry. The window onto the courtyard. The translation that has not moved.

The d-pad will take you forward when you are ready.`,
        items: [
          {
            id: 'typewriter',
            name: 'the typewriter',
            examine: `Olivetti, portable, beige. A page of German you have been wrestling with. The sentence will not come.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `The paragraph describes a man returning to a house he has not lived in for ten years. You have translated and untranslated the same phrase four times.`,
              }),
            },
          },
          {
            id: 'journal-prologue',
            name: 'your journal',
            examine: `A hardcover notebook, half full. Six weeks of brief entries.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `You read back over the last entries. Most of them are short. One of them ends, mid-sentence: "I don't know who he is." You read it twice. The window's reflection is yours. So far.`,
              }),
            },
          },
          {
            id: 'radio',
            name: 'the radio',
            examine: `A small set on the bookshelf. Strings, faintly. The station drifts.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `You did not pick this station. You leave it.`,
              }),
            },
          },
          {
            id: 'courtyard-window',
            name: 'the window',
            examine: `Four floors down to a small courtyard. Across the well, one lit window. A curtain moves. No one is there.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `You watch the lit window. Whoever lives there has not come into view in six weeks.`,
              }),
            },
          },
        ],
      },
    },

    // ─── M1 — THE WINDOW ────────────────────────────────────────────────────

    'capsule': {
      id: 'capsule',
      name: 'A Small Chamber',
      exits: [
        { direction: 'north', roomId: 'cosmonaut-office', blockedBy: 'm1.window-read' },
      ],
      dreamer: {
        entry: `Curved walls. One small round window. Pressure in the ears. The breathing — his breathing — slow and trained, the discipline of a man not allowed to startle.

Beyond the window, something that is not sky.`,
        look: `The chamber is small. His gloved hands rest on a panel of switches and dials in Cyrillic. He is counting. The numbers come slowly. One number, said three times, settled on.

A small sticker on the panel. Beyond the window, the surface will not resolve.`,
        items: [
          {
            id: 'window',
            name: 'the window',
            examine: `Curved glass. Cold. A number is etched into the inside of the lower rim, where no observer would ever look.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['m1.window-read']) {
                  return { text: `Seven. Three. One. Four. The same number, settled on.` };
                }
                return {
                  text: `He counts it three times before settling. Seven. Three. One. Four.\n\nYou write it down without thinking.`,
                  effects: [
                    { setFlags: { 'm1.window-read': true } },
                    {
                      addJournalEntry: {
                        id: 'number-7314',
                        label: 'A number etched in the window',
                        body: `7 3 1 4. Inside the lower rim of the curved glass. He counted it three times and settled on it. Nobody else could see where it was etched.`,
                      },
                    },
                    { enableExit: { direction: 'north', roomId: 'cosmonaut-office' } },
                  ],
                };
              },
            },
          },
          {
            id: 'sticker',
            name: 'a small sticker',
            examine: `On the panel, beside his thumb. A stylised bird in flight.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['m1.sticker-noted']) {
                  return { text: `The same bird. Still in flight.` };
                }
                return {
                  text: `A stylised bird. Decorative. Unofficial. You note it.`,
                  effects: [
                    { setFlags: { 'm1.sticker-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'bird-sticker',
                        label: 'A stylised bird on the panel',
                        body: `A bird in flight, stylised. Unofficial. Someone put it there.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'panel',
            name: 'the panel',
            examine: `Switches you somehow know how to use. Dials in Cyrillic. A toggle that should not be in the position it is in.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `You read the panel the way he reads it: by hand. The toggle is wrong. He notices and does not correct it.`,
              }),
            },
          },
          {
            id: 'gloves',
            name: 'his gloves',
            examine: `Heavy. Not yours. Inside them, his hands. Steady.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `His hands. You will, later, be told to know him by them.`,
              }),
            },
          },
          {
            id: 'surface-below',
            name: 'the surface below',
            examine: `Beyond the window. It will not resolve. Sometimes earth. Sometimes water. Sometimes a face you almost recognise.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `You watch the surface. It shifts. The dream will not let you see it clearly.`,
              }),
            },
          },
        ],
      },
    },

    // ─── M2 — THE DESK ──────────────────────────────────────────────────────

    'cosmonaut-office': {
      id: 'cosmonaut-office',
      name: "A Cosmonaut's Office",
      exits: [
        { direction: 'south', roomId: 'apt-kitchen', blockedBy: 'm2.ready' },
      ],
      reckoner: {
        entry: `A narrow institutional room. A wooden desk. A steam radiator clanking. Through the window: a forest road, the corner of a hangar, a flagpole, a wind sock. The light is cold.

His hands set out the morning's papers. The schedule. The medical fitness report. The mission file. A blank signature confirmation form. Two photographs — one framed, one face-down beside the inkwell. A sealed envelope in Drozdov's hand.`,
        look: `Three documents on the desk: the week's schedule, a medical fitness report, a mission file with much of it redacted. A signature confirmation form, blank. Two photographs — the framed one of Yelena and Nina at the lake; the second, face-down. A sealed envelope from Drozdov.

The radiator clanks. He no longer notices.`,
        items: [
          {
            id: 'schedule',
            name: 'the schedule',
            examine: `Typewritten, on a single sheet of carbon paper.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Today, 13 April 1965 — a Tuesday.\n\n09:00 — medical review.\n11:30 — document signing.\n16:00 — briefing (room number redacted).\n\nTomorrow blank. Friday: "See cosmodrome."`,
              }),
            },
          },
          {
            id: 'medical-report',
            name: 'the medical fitness report',
            examine: `His own. Typewritten, signed and stamped by the flight surgeon.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Standard panel. Cleared. One value annotated in pencil in the margin — a small "watch this" in a hand that is not the surgeon's and not Andrei's.\n\nHe reads it twice. He does not say anything.`,
              }),
            },
          },
          {
            id: 'mission-file',
            name: 'the mission file',
            examine: `A buff folder, partially redacted. Most of it sealed against this morning's reading.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `The codename: redacted except for a single Cyrillic letter — В.\nDuration: redacted.\nRisk profile: redacted.\n\nEquipment list intact. Support roster intact. Weather contingencies intact. Almost everything that matters: not.`,
              }),
            },
          },
          {
            id: 'photograph-framed',
            name: 'the framed photograph',
            examine: `A small wooden frame on the corner of the desk.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Yelena and a girl of seven at a lake, summer, two years ago. On the back, in Yelena's hand: "Nina, the lake, '63."`,
              }),
            },
          },
          {
            id: 'photograph-second',
            name: 'the second photograph',
            examine: `A small photograph beside the inkwell.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['photograph.flipped']) {
                  return { text: `Still turned over. The same face. The same pencil mark.` };
                }
                return {
                  text: `You turn it over. A man in flight gear, late thirties, mid-laugh. In pencil beneath, in a hand that is not Andrei's: K., 1962.\n\nWho hides this on his own desk?`,
                  effects: [
                    { setFlags: { 'photograph.flipped': true } },
                    {
                      addJournalEntry: {
                        id: 'k-1962',
                        label: 'A face-down photograph',
                        body: `A man in flight gear, late thirties, mid-laugh. In pencil beneath the photograph: "K., 1962." He keeps it face-down on his own desk. He does not frame it.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'envelope',
            name: "Drozdov's envelope",
            examine: `Sealed. Two words written across it in pencil, in Drozdov's hand: "Burn after."`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['m2.envelope-read']) {
                  return { text: `The same two lines. The same rhythm.` };
                }
                return {
                  text: `Inside, two lines in Drozdov's hand:\n\n"Read before the briefing. Burn after."\n"The callsign you will hear has the rhythm of: ____-__, ____-__, ____."\n\nThree beats. The first two each have two syllables. The third has one. He has not written the syllables themselves.`,
                  effects: [
                    { setFlags: { 'm2.envelope-read': true } },
                    {
                      addJournalEntry: {
                        id: 'envelope-rhythm',
                        label: 'A masked callsign — its rhythm',
                        body: `Drozdov has written, but not said, the callsign. He gave only its rhythm. Three beats. Two syllables, two syllables, one. ____-__, ____-__, ____.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'form',
            name: 'the signature confirmation form',
            examine: `A typewritten form. The line for the confirmation code is blank.`,
            actions: ['read', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Standard procedural language. Sign, countersign, file. A four-digit code, given orally beforehand, is required at the bottom.`,
              }),
              use: (ctx: ActionContext) => {
                if (ctx.flags['m2.form-signed']) {
                  return { text: `The form is signed. There is nothing more to do with it.` };
                }
                const hasNumber = ctx.journal.some(j => j.id === 'number-7314');
                if (!hasNumber) {
                  return { text: `You do not know the code yet. His hand will not write what you do not yet know.` };
                }
                return {
                  text: `You write 7 3 1 4 in the blank, slowly, in his hand. The form is signed. He signs it without hesitation. He has known the number for weeks.`,
                  effects: [
                    { setFlags: { 'm2.form-signed': true } },
                  ],
                };
              },
            },
          },
          {
            id: 'typewriter-soviet',
            name: 'the typewriter',
            examine: `Soviet make. Cyrillic. Carriage clean. He uses it daily.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `He types more than he speaks. The keys are softer than they look.`,
              }),
            },
          },
          {
            id: 'radiator',
            name: 'the radiator',
            examine: `Steam. Clanks at uneven intervals.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `He does not notice it. You do.`,
              }),
            },
          },
        ],
      },
    },

    // ─── M3 — THE APARTMENT ─────────────────────────────────────────────────

    'apt-kitchen': {
      id: 'apt-kitchen',
      name: 'The Kitchen',
      exits: [
        { direction: 'east', roomId: 'apt-living-room' },
        { direction: 'north', roomId: 'briefing-room', blockedBy: 'm3.ready' },
      ],
      dreamer: {
        entry: `The kitchen. Evening. Yelena at the counter, her hands floured. Nina at the table, drawing. The kettle on the stove sings a note that is almost the right note. A clock on the wall whose numerals seem to slide.

The window black. The wall calendar to your left. A door behind you that, somewhere, someone has knocked on.`,
        look: `Yelena at the counter, working bread. Nina at the table, drawing and humming. The wall calendar with one Tuesday circled. The kettle. The clock you cannot read. The door behind you, closed.`,
        items: [
          {
            id: 'yelena',
            name: 'Yelena',
            examine: `She is making something — bread, or what becomes bread. Her hands are sure. Her voice, when she speaks, is a half-step too high. The dream cannot quite hold her right.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `She says, without turning: "You're late again." Andrei does not respond. You hear her smile.`,
              }),
            },
          },
          {
            id: 'nina',
            name: 'Nina',
            examine: `Seven years old. A pencil in her hand. A drawing forming under it. She is humming, then quietly singing.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['m3.phrase-heard']) {
                  return { text: `She is still singing. The same three syllables, three beats, a fall. She has not looked up.` };
                }
                return {
                  text: `She sings it three times before stopping: "LOR-ka, LOR-ka, LOR." Three beats and a fall. Then she says, eyes still on the page: "It's the song he taught me."\n\nShe does not look up. Andrei has not spoken yet.`,
                  effects: [
                    { setFlags: { 'm3.phrase-heard': true } },
                    {
                      addJournalEntry: {
                        id: 'ninas-phrase',
                        label: "Nina's phrase",
                        body: `She sang it three times: "LOR-ka, LOR-ka, LOR." Three beats and a fall. She said: it's the song he taught me. She would not say who.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'calendar',
            name: 'the wall calendar',
            examine: `April 1965. One Tuesday circled in pencil. Two weeks from today.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['m3.date-noted']) {
                  return { text: `The same Tuesday. April 27.` };
                }
                return {
                  text: `April 1965. Today, April 13, a Tuesday. The Tuesday two weeks from now — April 27 — is circled. Faintly. In pencil. By a hand you cannot identify.`,
                  effects: [
                    { setFlags: { 'm3.date-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'circled-date',
                        label: 'A date circled on the kitchen calendar',
                        body: `April 27, 1965. Tuesday. Two weeks from today. Pencilled in. Andrei did not mention it. Yelena did not mention it either.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'kettle',
            name: 'the kettle',
            examine: `On the stove. It sings a note that is almost the right note.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Yelena says it's fine. You stand near the stove and it is, almost, fine.`,
              }),
            },
          },
          {
            id: 'clock',
            name: 'the clock',
            examine: `On the wall. The numerals slide. You cannot read it.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `The dream will not let you have the time.`,
              }),
            },
          },
          {
            id: 'drawing',
            name: "Nina's drawing",
            examine: `A small house. A tall man. A smaller man. A much smaller figure between them.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `When you look back, the smaller man has moved. He is on the other side of the figure now.\n\nNina is humming.`,
              }),
            },
          },
          {
            id: 'kitchen-door',
            name: 'the door',
            examine: `Behind you. Closed. Somewhere, someone has knocked on it.`,
            actions: ['open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              open: () => ({
                text: `Yelena gets there first. She opens it. The corridor is empty. She returns to the counter as if nothing happened. The kettle has stopped singing.\n\nYou close the door yourself.`,
              }),
            },
          },
        ],
      },
    },

    'apt-living-room': {
      id: 'apt-living-room',
      name: 'The Living Room',
      exits: [
        { direction: 'west', roomId: 'apt-kitchen' },
      ],
      dreamer: {
        entry: `The living room. A low shelf with three photographs. The window black. Through it, somewhere, the same kettle still singing — or you imagine it.`,
        look: `Three frames on the shelf. The middle one catches your attention. The window dark. The kettle, somewhere, still on.`,
        items: [
          {
            id: 'shelf',
            name: 'the shelf',
            examine: `Three photographs. The middle one is the one that holds you.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `One is the lake — Yelena and Nina, the same photograph as on his desk. One is an older couple, a wedding in sepia. The middle one is a man.`,
              }),
            },
          },
          {
            id: 'middle-photo',
            name: 'the middle photograph',
            examine: `A man in flight gear, late thirties, mid-laugh.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['photograph.flipped'] && !ctx.flags['m3.man-recognized']) {
                  return {
                    text: `It is the same man. The pencil mark on the back of the photograph on Andrei's desk: K., 1962. Here he is full-face, framed, eyes bright. Nina knows his face.\n\nYou stop. Then you write.`,
                    effects: [
                      { setFlags: { 'm3.man-recognized': true } },
                      {
                        addJournalEntry: {
                          id: 'man-recognized',
                          label: 'The man on the shelf is K.',
                          body: `The man whose face Andrei keeps face-down in his office is the same man Yelena keeps framed on the shelf. Nina knows his face. Andrei does not say his name aloud, not once.`,
                        },
                      },
                    ],
                  };
                }
                if (ctx.flags['photograph.flipped']) {
                  return { text: `The same man. The same brightness in his eyes. The frame, dustless.` };
                }
                return {
                  text: `A man you do not know — flight gear, late thirties, mid-laugh. The back of the frame is blank. Yelena keeps it dustless.`,
                };
              },
            },
          },
          {
            id: 'wedding-photo',
            name: 'the wedding photograph',
            examine: `Sepia. A couple from another era. The bride is laughing.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `You think it is Yelena's parents. Or someone else's. The dream does not say.`,
              }),
            },
          },
          {
            id: 'lake-photo',
            name: 'the lake photograph',
            examine: `Yelena, Nina, the lake. The same photograph that sits on his desk.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Or close enough. The dream may be reusing it. Or it may be the same one. You cannot tell.`,
              }),
            },
          },
        ],
      },
    },

    // ─── M4 — THE BRIEFING ──────────────────────────────────────────────────

    'briefing-room': {
      id: 'briefing-room',
      name: 'A Briefing Room',
      exits: [
        { direction: 'south', roomId: 'tomas-desk-coda', blockedBy: 'm4.ready' },
      ],
      reckoner: {
        entry: `Windowless. A long table. A wall map of the southern hemisphere with a route marked in red. A small scale model on the side table, under a cloth. The cloth stays on.

Drozdov at the head of the table. Two officers seated — one introduced earlier this week, the other not. The door has been closed and locked behind you. You sit.`,
        look: `Drozdov is reading from a folder. The second officer has not spoken and has not looked up. The map is annotated in two hands. The model under the cloth is shaped, but the cloth stays on.

On the table in front of you: the briefing acceptance form, a blank line where the callsign should be written.`,
        items: [
          {
            id: 'briefing-document',
            name: 'the briefing document',
            examine: `Drozdov reads from it. You can read along.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['m4.briefing-heard']) {
                  return { text: `The same callsign. The same date. The same three beats.` };
                }
                const hasRhythm = ctx.journal.some(j => j.id === 'envelope-rhythm');
                const hasPhrase = ctx.journal.some(j => j.id === 'ninas-phrase');
                const effects: Array<{
                  setFlags?: Record<string, string | number | boolean>;
                  addJournalEntry?: { id: string; label: string; body: string };
                }> = [
                  { setFlags: { 'm4.briefing-heard': true } },
                ];
                if (hasRhythm && hasPhrase) {
                  effects.push({
                    addJournalEntry: {
                      id: 'alignment',
                      label: 'The callsign — and what Nina sang',
                      body: `Drozdov said it aloud. LOR-ka, LOR-ka, LOR. The same three beats as the masked rhythm Drozdov wrote. The same three beats as Nina's song. Nina knows the callsign. Or she taught it to him. Or someone did.`,
                    },
                  });
                }
                effects.push({
                  addJournalEntry: {
                    id: 'mission-date',
                    label: 'The mission date',
                    body: `April 27, 1965. Tuesday. The same Tuesday circled on the kitchen calendar.`,
                  },
                });
                return {
                  text: `Drozdov reads: "Operational callsign — LOR-ka, LOR-ka, LOR. Departure window opens 27 April. Risk profile remains outside standard tolerances. Secrecy reiterated."\n\nThree beats. A fall. ${hasRhythm && hasPhrase ? `The rhythm in your journal goes still. The rhythm Nina was singing goes still. You write the alignment.` : `You write what you have.`}`,
                  effects,
                };
              },
            },
          },
          {
            id: 'the-map',
            name: 'the wall map',
            examine: `Southern hemisphere. A route marked in red, terminating at a parallel of latitude you cannot place.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `The route is annotated in two different hands. One of them is Drozdov's. The other is not.`,
              }),
            },
          },
          {
            id: 'the-model',
            name: 'a model under cloth',
            examine: `On the side table. Shaped, under the cloth. You cannot tell what.`,
            actions: ['open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              open: () => ({
                text: `Drozdov says, without looking up: "Not today." The cloth stays on.`,
              }),
            },
          },
          {
            id: 'drozdov',
            name: 'Major Drozdov',
            examine: `Fifties. Quiet. Reads everything twice. He is reading now.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `He reads the document, then reads it again. He has been Andrei's superior for eleven years. Andrei trusts him almost completely.`,
              }),
            },
          },
          {
            id: 'silent-officer',
            name: 'the second officer',
            examine: `He has not spoken. He has not looked up.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Mid-forties. A uniform you cannot quite identify. He has a folder of his own that he does not open.`,
              }),
            },
          },
          {
            id: 'briefing-form',
            name: 'the briefing form',
            examine: `An acceptance form. A blank line where the callsign should be written.`,
            actions: ['read', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Standard acceptance language. Once signed, the mission is his.`,
              }),
              use: (ctx: ActionContext) => {
                if (ctx.flags['m4.form-signed']) {
                  return { text: `The form is signed. There is nothing more to do with it.` };
                }
                if (!ctx.flags['m4.briefing-heard']) {
                  return { text: `He will not sign before he hears Drozdov read it aloud. The pen stays in his hand.` };
                }
                const hasAlignment = ctx.journal.some(j => j.id === 'alignment');
                if (!hasAlignment) {
                  return { text: `Andrei does not yet know the callsign well enough to write it. The pen stays in his hand.` };
                }
                return {
                  text: `He writes the callsign on the blank line: LOR-ka, LOR-ka, LOR. He signs. Drozdov countersigns without looking at him.\n\nAt the door, Drozdov stops. Quietly, only to Andrei: "You'll know him by his hands."\n\nThen the door is open and Andrei is in the corridor and the briefing is over.`,
                  effects: [
                    { setFlags: { 'm4.form-signed': true } },
                    {
                      addJournalEntry: {
                        id: 'drozdovs-parting',
                        label: "Drozdov's parting word",
                        body: `At the door, only to Andrei: "You'll know him by his hands." Drozdov said it the way he says everything. Andrei wrote it down later. So have you.`,
                      },
                    },
                  ],
                };
              },
            },
          },
        ],
      },
    },

    // ─── CODA ───────────────────────────────────────────────────────────────

    'tomas-desk-coda': {
      id: 'tomas-desk-coda',
      name: 'Your Desk',
      exits: [],
      neutral: {
        entry: `Your desk. The radio is off. The journal is full — six new pages since yesterday. The window is dark. The lit window opposite is dark too. You sit. You have not eaten.`,
        look: `Your desk. The closed journal. The typewriter with the same German page in it. The window onto the courtyard, dark.

The journal is the only thing here that has changed.`,
        items: [
          {
            id: 'journal-coda',
            name: 'your journal',
            examine: `Full now. The last entry sits open beneath your hand.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (ctx: ActionContext) => {
                if (ctx.flags['sp01.complete']) {
                  return { text: `It is closed now. You leave it closed.` };
                }
                return {
                  text: `You read back what you wrote.

The masked rhythm in Drozdov's envelope. The phrase Nina was singing at the kitchen table. The callsign Drozdov read aloud.

They are the same three beats. You did not see that until just now.

You underline both. You sit with it for a long time.

You stand. You walk to the window. In the unlit glass, for one beat, the room behind you is not your room. It is a narrow institutional room with a wooden desk, a radiator clanking, a forest road through the window. Then the reflection settles, and it is your kitchen.

You turn off the lamp.

The lit window opposite is dark now. You did not see it go out.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'the-alignment',
                        label: 'You did not see it until just now',
                        body: `The rhythm. Three places, the same three beats. You did not see it until you closed the journal and stood up.`,
                      },
                    },
                    { setFlags: { 'sp01.complete': true } },
                    { complete: true },
                  ],
                };
              },
            },
          },
          {
            id: 'typewriter-coda',
            name: 'the typewriter',
            examine: `The same page. The same paragraph. You have not touched it in a day.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `The German is still there. The paragraph is still there. The man is still returning to the house.`,
              }),
            },
          },
          {
            id: 'coda-window',
            name: 'the window',
            examine: `The courtyard, dark. The window opposite, dark. Your reflection, faint.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: () => ({
                text: `Your reflection. The lamp behind you. Your face. The journal lies behind you, full of a stranger's day.`,
              }),
            },
          },
        ],
      },
    },
  },

  triggers: [
    {
      id: 'm2-ready',
      when: [
        { flag: 'm2.form-signed', value: true },
        { flag: 'm2.envelope-read', value: true },
      ],
      then: [{ setFlags: { 'm2.ready': true } }],
      once: true,
    },
    {
      id: 'm3-ready',
      when: [
        { flag: 'm3.phrase-heard', value: true },
        { flag: 'm3.date-noted', value: true },
      ],
      then: [{ setFlags: { 'm3.ready': true } }],
      once: true,
    },
    {
      id: 'm4-ready',
      when: [
        { flag: 'm4.form-signed', value: true },
      ],
      then: [{ setFlags: { 'm4.ready': true } }],
      once: true,
    },
  ],
};
