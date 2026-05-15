import type { Chapter, ActionContext, Item } from '../types';

// SP Chapter 1 — First Light (v2 expansion).
// Tomás Vasari, Trieste, autumn 1988, dreams into Andrei Voronin —
// parallel mid-1960s Soviet-adjacent space programme, spring 1965.
//
// v2 changes vs v1: ~14 rooms, ~70 items, action-triggered movement
// transitions, NOTE-only journal entries, decoys throughout, optional
// side rooms. See chapters/season-1/chapter-01/sp.md v2 section + 008
// Addendum B for the binding authoring principles.

// ─── helpers ────────────────────────────────────────────────────────────────

// Lightweight item factory for atmospheric decoys whose only interaction is
// a single read handler with no effects. Keeps the chapter file readable.
function atmoRead(id: string, name: string, examine: string, readText: string): Item {
  return {
    id,
    name,
    examine,
    actions: ['examine'],
    takeable: false,
    inventory: { label: '', examine: '' },
    onAction: {
      examine: () => ({ text: readText }),
    },
  };
}

// Inert decoy — focus shows examine, no actions defined. Use for things the
// player should only LOOK at.
function decoy(id: string, name: string, examine: string): Item {
  return {
    id,
    name,
    examine,
    actions: [],
    takeable: false,
    inventory: { label: '', examine: '' },
  };
}

export const Sp01: Chapter = {
  id: 'sp01',
  title: 'First Light',
  contentVersion: 5,
  actionSet: ['look', 'open', 'examine', 'use', 'note'],
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
      rooms: ['tomas-desk-prologue', 'tomas-kitchen-prologue'],
      transitionOut: `You turn off the lamp. The chair creaks. The radio drifts. The room is darker, then darker still.`,
    },
    {
      id: 'm1',
      title: 'The Window',
      mode: 'dreamer',
      rooms: ['capsule', 'tether-line'],
      transitionIn: `Pressure in your ears. A breathing that is not yours. Far below, a surface that will not resolve.`,
      transitionOut: `Something gives. The chamber lets you go. You wake. Your hand is on the journal.`,
    },
    {
      id: 'm2',
      title: 'The Desk',
      mode: 'reckoner',
      rooms: ['cosmonaut-office', 'office-corridor', 'parade-ground-window'],
      transitionIn: `Morning. You sit down to translate. The German sentence is the same one. Then it isn't. Then it is a Cyrillic file, a wooden desk, a radiator clanking. The light through the window is the wrong light.`,
      transitionOut: `You fold the envelope into his pocket. The trance slides sideways. Evening, somewhere. Your kitchen. Then his.`,
    },
    {
      id: 'm3',
      title: 'The Apartment',
      mode: 'dreamer',
      rooms: ['apt-kitchen', 'apt-living-room', 'apt-bedroom'],
      transitionIn: `Late, in your clothes. The dream finds you in the doorway of a flat that is not yours. The kettle is on. A child is singing.`,
      transitionOut: `Your hand on the coat is your hand again. The dream lets go. The room is your kitchen for a moment, then it is not. Then it is somewhere new.`,
    },
    {
      id: 'm4',
      title: 'The Briefing',
      mode: 'reckoner',
      rooms: ['briefing-anteroom', 'briefing-room'],
      transitionIn: `Afternoon. Sixteen hundred hours. A windowless corridor. A bench. A door that is closed and will, in a moment, be opened.`,
      transitionOut: `He hands the form across the table. Drozdov signs without looking up. At the door, quietly: "You'll know him by his hands." The trance breaks.`,
    },
    {
      id: 'coda',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-coda', 'tomas-kitchen-coda'],
      transitionIn: `You come back to yourself at the kitchen window. It is nearly dark. You have not eaten. You sit. You write for a long time.`,
    },
  ],

  rooms: {

    // ════════════════════════════════════════════════════════════════════════
    // PROLOGUE — Tomás's flat, evening
    // ════════════════════════════════════════════════════════════════════════

    'tomas-desk-prologue': {
      id: 'tomas-desk-prologue',
      name: 'Your Desk',
      exits: [
        { direction: 'east', roomId: 'tomas-kitchen-prologue' },
      ],
      neutral: {
        entry: `A small flat, fourth floor. The desk by the window. The typewriter open to a page you have read four times. The journal lies beside it, six weeks old.

The radio plays something you do not recognise. The lamp is warm under your hand. The chair behind you is empty. You are tired.`,
        look: `Your desk. Your typewriter. The unwashed cup. The journal, open to an early entry. The window onto the courtyard. The translation that has not moved.

The lamp is warm. The kitchen is east.`,
        items: [
          atmoRead(
            'typewriter-prologue',
            'the typewriter',
            'Olivetti, portable, beige. A page of German you have been wrestling with.',
            `The paragraph describes a man returning to a house he has not lived in for ten years. You have translated and untranslated the same phrase four times.`
          ),
          {
            id: 'journal-prologue',
            name: 'your journal',
            examine: `A hardcover notebook, half full. Six weeks of brief entries.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['prologue.journal-read']) {
                  return {
                    text: `The unfinished sentence is still there. "I don't know who he is." You don't, either.`,
                  };
                }
                return {
                  text: `You read back over the last entries. Most of them are short. One of them ends, mid-sentence: "I don't know who he is." You read it twice. The window's reflection is yours. So far.`,
                  effects: [{ setFlags: { 'prologue.journal-read': true } }],
                };
              },
              note: () => ({
                text: `You have nothing new to write yet. The page is waiting.`,
              }),
            },
          },
          atmoRead(
            'radio-prologue',
            'the radio',
            'A small set on the shelf above the desk. Strings, faintly. The station drifts.',
            `You did not pick this station. The signal isn't strong enough to be deliberate. You leave it.`
          ),
          {
            id: 'courtyard-window-prologue',
            name: 'the window',
            examine: `Four floors down to a small courtyard. Across the well, one lit window. A curtain moves. No one is there.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['prologue.window-watched']) {
                  return {
                    text: `The curtain stirs once and is still. Whoever they are, they are not for you tonight.`,
                  };
                }
                return {
                  text: `You watch the lit window. Whoever lives there has not come into view in six weeks. Tonight is no exception.`,
                  effects: [{ setFlags: { 'prologue.window-watched': true } }],
                };
              },
            },
          },
          {
            id: 'desk-lamp',
            name: 'the desk lamp',
            examine: `Warm under your hand. The bulb is the only thing keeping the desk distinct from the rest of the room.`,
            actions: ['use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              use: (ctx: ActionContext) => {
                if (ctx.flags['prologue.lamp-off']) {
                  return { text: `The lamp is already off. The room remains dark.` };
                }
                // Three small acts of letting-go before sleep will take him.
                // Each gate nudges toward the next thing rather than naming it.
                if (
                  !ctx.flags['prologue.journal-read'] ||
                  !ctx.flags['prologue.window-watched'] ||
                  !ctx.flags['prologue.letter-read']
                ) {
                  return { text: `Your hand is on the switch. Not yet. There are still things to do here.` };
                }
                return {
                  text: `You turn the lamp off.

The desk goes from a warm island to a flat shape. The chair behind you is still empty. You lean back. The radio is still on, somewhere. Close your eyes.`,
                  effects: [
                    { setFlags: { 'prologue.lamp-off': true } },
                    { advanceToMovement: { movementId: 'm1', targetRoom: 'capsule' } },
                  ],
                };
              },
            },
          },
          atmoRead(
            'coffee-cup-prologue',
            'the coffee cup',
            'Cold. A ring of grounds at the bottom. You don\'t remember pouring it.',
            `You don't drink it. You have no business drinking cold coffee at this hour.`
          ),
          atmoRead(
            'german-novel',
            'the German novel',
            'A hardback, half open, spine cracked. Untranslated for fifty years before someone decided it was worth doing.',
            `You skim a paragraph. A character is folding linen the way a much younger character used to fold it. The sentence is not the problem. The sentence after the sentence is the problem.`
          ),
          atmoRead(
            'postcard-on-desk',
            'a postcard',
            'From a former colleague who moved to Lisbon two years ago. The handwriting hasn\'t changed.',
            `"The light here is what you said it would be. Come visit when you can." You have not written back. You have not gone.`
          ),
        ],
      },
    },

    'tomas-kitchen-prologue': {
      id: 'tomas-kitchen-prologue',
      name: 'Your Kitchen',
      exits: [
        { direction: 'west', roomId: 'tomas-desk-prologue' },
      ],
      neutral: {
        entry: `The kitchen, such as it is. A small table, a stove with one working burner, a sink with a dish in it. The radio in here, actually — you keep forgetting that. The window onto the same courtyard, the same lit window opposite.`,
        look: `The table with the mail. The dish in the sink. The radio on the counter. The kitchen window. The hallway door, closed.

The desk is west.`,
        items: [
          atmoRead(
            'mail-stack',
            'the stack of mail',
            'A bill, a magazine, a letter from your sister Maria. The neighbour brought them up yesterday.',
            `You sort through it. The bill is the bill. The magazine is the magazine. Maria's letter you have read once already.`
          ),
          atmoRead(
            'neighbours-note',
            "the neighbour's note",
            'Folded once, on the table. The neighbour\'s small careful hand.',
            `"Brought your mail up. Come down for coffee sometime. — Signora R." You will not. You have not in eleven years.`
          ),
          {
            id: 'sister-letter',
            name: "Maria's letter",
            examine: 'From your sister, one city over. Two pages, both sides.',
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['prologue.letter-read']) {
                  return {
                    text: `Two pages, both sides. The paragraph about her son being well is still the only one that lands.`,
                  };
                }
                return {
                  text: `She is planning to visit in May. She has stopped asking when you will visit her. You read it once already. The paragraph about her son being well is the only one that lands.`,
                  effects: [{ setFlags: { 'prologue.letter-read': true } }],
                };
              },
            },
          },
          atmoRead(
            'kitchen-radio-prologue',
            'the radio',
            'On the counter. Same station. The signal is stronger here.',
            `You stand near it for a moment. The strings resolve into something almost recognisable, then drift again. You move on.`
          ),
          decoy(
            'dish-in-sink',
            'the dish',
            'Two days old. You will wash it tomorrow. You will not wash it tomorrow.'
          ),
          {
            id: 'kitchen-door-prologue',
            name: 'the hallway door',
            examine: `Closed. The corridor outside is empty at this hour.`,
            actions: ['open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              open: () => ({
                text: `You do not open it. There is no reason to.`,
              }),
            },
          },
          atmoRead(
            'kitchen-window-prologue',
            'the kitchen window',
            'Onto the same courtyard. Same lit window across the well.',
            `From this angle the lit window is more squared. A second curtain moves and is still.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M1 — The Window (dreamer)
    // ════════════════════════════════════════════════════════════════════════

    'capsule': {
      id: 'capsule',
      name: 'A Small Chamber',
      exits: [
        { direction: 'east', roomId: 'tether-line' },
      ],
      dreamer: {
        entry: `Curved walls. One small round window. Pressure in the ears. The breathing — his breathing — slow and trained, the discipline of a man not allowed to startle.

Beyond the window, something that is not sky.`,
        look: `The chamber is small. His gloved hands rest on a panel of switches and dials in Cyrillic. He is counting. A hatch east leads somewhere the dream does not name.

The window. The panel. A small sticker on the metal. A manual strapped to the bulkhead. Tally marks scratched into the inside of the door.`,
        items: [
          {
            id: 'window',
            name: 'the window',
            examine: `Curved glass. Cold. A number is etched into the inside of the lower rim, where no observer would ever look.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m1.window-read']) {
                  return { text: `Seven. Three. One. Four. The same number, settled on. His gaze still resting on it.` };
                }
                return {
                  text: `He counts it three times before settling. Seven. Three. One. Four.\n\nThe number sits in the lower rim, between the glass and the metal. No observer would ever look there. Nobody else could see where it is etched.`,
                  effects: [{ setFlags: { 'm1.window-read': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m1.window-read']) {
                  return { text: `You have not yet seen what is there to note.` };
                }
                if (ctx.journal.some(j => j.id === 'number-7314')) {
                  return { text: `It is already in your journal. Seven. Three. One. Four.` };
                }
                return {
                  text: `You write it down. Seven. Three. One. Four. Where no observer should look, but he does.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'number-7314',
                        label: 'A number etched in the window',
                        body: `7 3 1 4. Inside the lower rim of the curved glass. He counted it three times and settled on it. Nobody else could see where it was etched. Nobody else was looking.`,
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
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You read the panel the way he reads it: by hand. The toggle is wrong. He notices and does not correct it.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m1.window-read']) {
                  return { text: `His hand rests on the panel. He is not ready to act. He is counting.` };
                }
                return {
                  text: `He moves the toggle into the position it should be in. The chamber answers.

The breathing slows. The window's not-sky brightens. Something gives.`,
                  effects: [{ advanceToMovement: { movementId: 'm2', targetRoom: 'cosmonaut-office' } }],
                };
              },
            },
          },
          {
            id: 'hatch',
            name: 'the hatch',
            examine: `On the east bulkhead. A round, sealed hatch. He has been told not to open it.`,
            actions: ['open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              open: () => ({
                text: `The hatch is not sealed in the dream. It swings, slowly. He has been told not to.`,
              }),
            },
          },
          {
            id: 'sticker',
            name: 'a small sticker',
            examine: `On the panel, beside his thumb. A stylised bird in flight.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `A stylised bird. Decorative. Unofficial. Someone put it there.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'bird-sticker')) {
                  return { text: `The bird is already in your journal.` };
                }
                return {
                  text: `You sketch it: a bird in flight, stylised, unofficial.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'bird-sticker',
                        label: 'A stylised bird on the panel',
                        body: `A bird in flight, stylised. Unofficial. Someone put it there. Not regulation. Not approved. There it is.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'gloves',
            'his gloves',
            'Heavy. Not yours. Inside them, his hands. Steady.',
            `His hands. You will, later, be told to know him by them. For now they are just heavy and steady and not yours.`
          ),
          atmoRead(
            'surface-beyond',
            'the surface below',
            'Beyond the window. It will not resolve.',
            `Sometimes earth. Sometimes water. Sometimes a face you almost recognise.`
          ),
          atmoRead(
            'the-manual',
            'a manual',
            'Strapped to the bulkhead. Cyrillic, technical, well-used.',
            `He has not opened it in months. The strap is for emergencies. There are no emergencies today.`
          ),
          atmoRead(
            'tally-marks',
            'tally marks',
            'Scratched into the inside of the door. A count of something.',
            `Forty-seven marks. He has not been told to stop. He has not been told to start either.`
          ),
        ],
      },
    },

    'tether-line': {
      id: 'tether-line',
      name: 'A Corridor of Wires',
      exits: [
        { direction: 'west', roomId: 'capsule' },
      ],
      dreamer: {
        entry: `Beyond the hatch: a corridor of dream-logic. Wires that go where there should not be wires. The far end darker than it should be.`,
        look: `A short corridor outside the chamber. Wires running along the walls. The far end does not end where it should. A voice, somewhere, says a name.`,
        items: [
          atmoRead(
            'wires',
            'the wires',
            'Bundled, taped, running in directions a cable should not run.',
            `You follow one with your eyes. It goes into the wall and does not come out anywhere it should.`
          ),
          {
            id: 'the-voice',
            name: 'a voice, somewhere',
            examine: `Just at the threshold of hearing. A name, repeated.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You strain to hear. The first syllable is "Kon—". The rest never comes.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'voice-in-dream')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down what you can catch: "Kon—". The rest never came.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'voice-in-dream',
                        label: 'A voice in the corridor',
                        body: `A voice, just at the threshold of hearing, repeating a name. The first syllable was "Kon—". The rest never came.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'second-sticker',
            name: 'a second sticker',
            examine: `On a junction box. A different motif this time — a stylised fish, mid-dive.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `A fish, mid-dive. Stylised the same way the bird was. Same hand, perhaps.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'fish-sticker')) {
                  return { text: `Already noted.` };
                }
                return {
                  text: `You sketch the second motif: a fish, diving. The same hand as the bird.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'fish-sticker',
                        label: 'A second sticker — a fish',
                        body: `A stylised fish, mid-dive, on a junction box in the corridor. Same hand as the bird. Someone is leaving these. They are not regulation.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'far-end',
            'the far end',
            'The corridor does not end where it should.',
            `You count steps with your eyes and run out before the wall does. The dream is being lazy with distances.`
          ),
          atmoRead(
            'loose-cable',
            'a loose cable',
            'Drifts in the corridor air. Not plugged into anything.',
            `It moves slightly, as if there were a breeze. There is not.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M2 — The Desk (reckoner)
    // ════════════════════════════════════════════════════════════════════════

    'cosmonaut-office': {
      id: 'cosmonaut-office',
      name: "A Cosmonaut's Office",
      exits: [
        { direction: 'north', roomId: 'office-corridor' },
      ],
      reckoner: {
        entry: `A narrow institutional room. A wooden desk. A steam radiator clanking. Through the window: a forest road, the corner of a hangar, a flagpole, a wind sock. The light is cold.

His hands set out the morning's papers. The schedule. The medical fitness report. The mission file. A blank signature confirmation form. Two photographs — one framed, one face-down beside the inkwell. A sealed envelope in Drozdov's hand.`,
        look: `Three documents on the desk: the week's schedule, a medical fitness report, a mission file with much of it redacted. A signature confirmation form, blank. Two photographs — the framed one of Yelena and Nina at the lake; the second, face-down. A sealed envelope from Drozdov.

The typewriter. The radiator. A phone, the lunch tin, a poster on the wall. A door north to the corridor.`,
        items: [
          {
            id: 'schedule',
            name: 'the schedule',
            examine: `Typewritten, on a single sheet of carbon paper.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Today, 13 April 1965 — a Tuesday.\n\n09:00 — medical review.\n11:30 — document signing.\n16:00 — briefing (room number redacted).\n\nTomorrow blank. Friday: "See cosmodrome."`,
              }),
            },
          },
          {
            id: 'medical-report',
            name: 'the medical fitness report',
            examine: `His own. Typewritten, signed and stamped by the flight surgeon.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Standard panel. Cleared. One value annotated in pencil in the margin — a small "watch this" in a hand that is not the surgeon's and not Andrei's.\n\nHe reads it twice. He does not say anything.`,
              }),
            },
          },
          {
            id: 'mission-file',
            name: 'the mission file',
            examine: `A buff folder, partially redacted. Most of it sealed against this morning's reading.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The codename: redacted except for a single Cyrillic letter — В.\nDuration: redacted.\nRisk profile: redacted.\n\nEquipment list intact. Support roster intact. Weather contingencies intact. Almost everything that matters: not.`,
              }),
            },
          },
          {
            id: 'photograph-framed',
            name: 'the framed photograph',
            examine: `A small wooden frame on the corner of the desk.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Yelena and a girl of seven at a lake, summer, two years ago. On the back, in Yelena's hand: "Nina, the lake, '63."`,
              }),
            },
          },
          {
            id: 'photograph-second',
            name: 'the second photograph',
            examine: `A small photograph beside the inkwell.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['photograph.flipped']) {
                  return { text: `Still turned over. The same face. The same pencil mark beneath.` };
                }
                return {
                  text: `You turn it over. A man in flight gear, late thirties, mid-laugh. In pencil beneath, in a hand that is not Andrei's: K., 1962.\n\nWho hides this on his own desk?`,
                  effects: [{ setFlags: { 'photograph.flipped': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['photograph.flipped']) {
                  return { text: `You have not yet seen what is on it.` };
                }
                if (ctx.journal.some(j => j.id === 'k-1962')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down what you saw. K., 1962. Late thirties. Mid-laugh. Face-down on his own desk.`,
                  effects: [
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
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m2.envelope-read']) {
                  return { text: `The same two lines. The same rhythm. He has read it three times.` };
                }
                return {
                  text: `Inside, two lines in Drozdov's hand:\n\n"Read before the briefing. Burn after."\n"The callsign you will hear has the rhythm of: ____-__, ____-__, ____."\n\nThree beats. The first two each have two syllables. The third has one. He has not written the syllables themselves.`,
                  effects: [{ setFlags: { 'm2.envelope-read': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m2.envelope-read']) {
                  return { text: `You have not yet read the envelope. There is nothing to note about an envelope unread.` };
                }
                if (ctx.journal.some(j => j.id === 'envelope-rhythm')) {
                  return { text: `Already noted.` };
                }
                return {
                  text: `You write down the rhythm. Three beats. Two syllables, two syllables, one. The syllables he refused to write.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'envelope-rhythm',
                        label: 'A masked callsign — its rhythm',
                        body: `Drozdov wrote, but did not say, the callsign. He gave only its rhythm. Three beats. ____-__, ____-__, ____. Two syllables, two syllables, one.`,
                      },
                    },
                  ],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m2.form-signed'] || !ctx.flags['m2.envelope-read']) {
                  return { text: `He has not finished here. The desk still wants him.` };
                }
                return {
                  text: `He folds the envelope and slips it into the inside pocket of his jacket. He has memorised what he needs to memorise.

The radiator clanks. The light through the window shifts. The dream tilts.`,
                  effects: [{ advanceToMovement: { movementId: 'm3', targetRoom: 'apt-kitchen' } }],
                };
              },
            },
          },
          {
            id: 'form',
            name: 'the signature confirmation form',
            examine: `A typewritten form. The line for the confirmation code is blank.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Standard procedural language. Sign, countersign, file. A four-digit code, given orally beforehand, is required at the bottom.`,
              }),
              use: (ctx: ActionContext) => {
                if (ctx.flags['m2.form-signed']) {
                  return { text: `The form is signed. There is nothing more to do with it.` };
                }
                const hasNumber = ctx.journal.some(j => j.id === 'number-7314');
                if (!hasNumber) {
                  return { text: `He has the code somewhere. He has not yet written it where he can find it. His hand will not write what he has not yet kept.` };
                }
                return {
                  text: `He writes 7 3 1 4 in the blank, slowly, in his hand. The form is signed.`,
                  effects: [{ setFlags: { 'm2.form-signed': true } }],
                };
              },
            },
          },
          atmoRead(
            'typewriter-soviet',
            'the typewriter',
            'Soviet make. Cyrillic. Carriage clean. He uses it daily.',
            `He types more than he speaks. The keys are softer than they look.`
          ),
          atmoRead(
            'radiator-m2',
            'the radiator',
            'Steam. Clanks at uneven intervals.',
            `He does not notice it. You do.`
          ),
          decoy(
            'phone-m2',
            'the phone',
            'Black, on the desk. It does not ring. It will not ring today.'
          ),
          atmoRead(
            'coat-on-chair',
            'his coat',
            'Hung on the back of the chair. The same grey wool he has worn for eleven years.',
            `He does not put it on. The room is warm enough for now.`
          ),
          atmoRead(
            'poster-star-city',
            'a poster on the wall',
            'A propaganda poster — a stylised cosmonaut against a stylised orbit. The toponymy underneath is wrong by one letter.',
            `He looks at it every morning and does not bother to correct it. Someone else, possibly Drozdov, has noticed the misprint and not said.`
          ),
          {
            id: 'lunch-tin',
            name: 'a lunch tin',
            examine: `On the corner of the desk. Heavier than it looks.`,
            actions: ['open', 'examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He has been carrying the same tin to work for nine years. The dent on the lid is the dent on the lid.`,
              }),
              open: () => ({
                text: `Bread, sausage, an apple already brown. He will not get back to it before evening. He closes it.`,
              }),
            },
          },
          {
            id: 'desk-drawer',
            name: 'the desk drawer',
            examine: `A shallow drawer under the desktop, slightly ajar.`,
            actions: ['open', 'examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `It is the kind of drawer that holds nothing valuable, and so is never locked.`,
              }),
              open: () => ({
                text: `Pencils. A worn-out eraser. A coin from a country Andrei has not visited. A receipt for a haircut he does not remember getting. He shuts it.`,
              }),
            },
          },
          decoy(
            'wall-clock-m2',
            'the wall clock',
            'It shows 10:42. The corridor\'s clock will, later, show the right time. This one has been wrong for months.'
          ),
        ],
      },
    },

    'office-corridor': {
      id: 'office-corridor',
      name: 'A Corridor',
      exits: [
        { direction: 'south', roomId: 'cosmonaut-office' },
        { direction: 'east', roomId: 'parade-ground-window' },
      ],
      reckoner: {
        entry: `A short, dimly lit corridor. Photographs of past cosmonauts on the wall. A secretary's desk, unoccupied. A door at the far end labelled "Stores — keep closed." A clock that shows the right time. A bulletin board with two postings.`,
        look: `The wall of past cosmonauts. The secretary's empty desk. The stores door, closed. The corridor's clock. The bulletin board. The parade-ground annex is east.`,
        items: [
          {
            id: 'corridor-photos',
            name: 'the wall of photographs',
            examine: `Past cosmonauts, framed, in a row. Several you do not recognise.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['photograph.flipped']) {
                  return { text: `Most of the faces mean nothing to you. One of them — third from the left — is K. The face from the photograph on his desk. Here he is, framed, official. Andrei walks past without looking.` };
                }
                return { text: `Most of the faces mean nothing to you. Andrei walks past without looking at any of them in particular.` };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['photograph.flipped']) {
                  return { text: `Nothing to note yet. You don't know what you're looking at.` };
                }
                if (ctx.journal.some(j => j.id === 'k-on-wall')) {
                  return { text: `Already noted.` };
                }
                return {
                  text: `You write it down: K. is on the wall. Officially. Framed.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'k-on-wall',
                        label: 'K. is on the wall, officially',
                        body: `Third from the left in the corridor of past cosmonauts. The man whose face Andrei keeps face-down on his desk is on the wall outside the office, framed and official. Andrei does not look at him.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'secretarys-desk',
            "the secretary's desk",
            'Empty. The typewriter has a sheet of paper in it, half typed.',
            `Most of a memo about supply schedules. She has stepped away. She will not be long.`
          ),
          {
            id: 'stores-door',
            name: 'the stores door',
            examine: `Heavy, with a small sign: "Stores — keep closed."`,
            actions: ['open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              open: () => ({
                text: `Locked. You do not have the key. You wonder if anyone does.`,
              }),
            },
          },
          atmoRead(
            'corridor-clock',
            'the corridor clock',
            'Shows the right time. 10:51. The office clock is wrong. This one is correct.',
            `The contrast is small enough that nobody mentions it.`
          ),
          atmoRead(
            'bulletin-board',
            'the bulletin board',
            'Two notices. A duty roster. A request for blood donors.',
            `He has signed the blood donor list twice already this year. The duty roster has his name on it for Thursday.`
          ),
        ],
      },
    },

    'parade-ground-window': {
      id: 'parade-ground-window',
      name: 'A Small Annex',
      exits: [
        { direction: 'west', roomId: 'office-corridor' },
      ],
      reckoner: {
        entry: `A small annex off the corridor. A window looking out over the cleared parade ground. A flagpole. A wind sock. A telescope on a tripod. A logbook on a small table.`,
        look: `The window. The telescope. The logbook. A flagpole and wind sock through the glass. At the far edge of the parade ground, a distant figure walking.`,
        items: [
          atmoRead(
            'parade-window',
            'the window',
            'Out over the cleared parade ground. Cold light. The flag is half-furled.',
            `The parade ground is empty most days. It is empty today.`
          ),
          {
            id: 'telescope',
            name: 'the telescope',
            examine: `On a tripod, pointing west. Brass, well-used.`,
            actions: ['use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              use: () => ({
                text: `Through the lens: the cosmodrome at distance, a service road, a gantry in the far haze. The figure walking across the parade ground resolves into a man in flight gear. You cannot make out his face.`,
              }),
            },
          },
          atmoRead(
            'parade-logbook',
            'the logbook',
            'Weather readings. Whoever sits here notes the conditions every hour.',
            `Today's entries: 06:00 — clear, cold. 09:00 — clear, warming. 10:00 — clear. The handwriting is meticulous. The next entry is blank.`
          ),
          atmoRead(
            'flagpole',
            'the flagpole',
            'Through the window. The flag is half-furled by the wind.',
            `It is not half-mast. It is just the wind, doing what wind does.`
          ),
          {
            id: 'distant-figure',
            name: 'a distant figure',
            examine: `At the far edge of the parade ground, walking. In flight gear. He does not turn to look back.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He does not turn to look. He walks east. You cannot tell, from here, whether you have seen him before.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'distant-figure-note')) {
                  return { text: `Already noted.` };
                }
                return {
                  text: `You write: a figure walking east across the parade ground. Flight gear. Face you could not make out.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'distant-figure-note',
                        label: 'A figure on the parade ground',
                        body: `Through the telescope from the annex. A man in flight gear walking east across the parade ground. He did not turn to look back. You could not make out his face.`,
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

    // ════════════════════════════════════════════════════════════════════════
    // M3 — The Apartment (dreamer)
    // ════════════════════════════════════════════════════════════════════════

    'apt-kitchen': {
      id: 'apt-kitchen',
      name: 'The Kitchen',
      exits: [
        { direction: 'east', roomId: 'apt-living-room' },
        { direction: 'north', roomId: 'apt-bedroom' },
      ],
      dreamer: {
        entry: `The kitchen. Evening. Yelena at the counter, her hands floured. Nina at the table, drawing. The kettle on the stove sings a note that is almost the right note. A clock on the wall whose numerals seem to slide.

The window black. The wall calendar to your left. A door behind you that, somewhere, someone has knocked on.`,
        look: `Yelena at the counter, working bread. Nina at the table, drawing and humming. The wall calendar with one Tuesday circled. The kettle. The clock. The door. A shelf of jars. Nina's shoes by the door. The living room is east. The bedroom is north.`,
        items: [
          {
            id: 'yelena',
            name: 'Yelena',
            examine: `She is making something — bread, or what becomes bread. Her hands are sure. Her voice, when she speaks, is a half-step too high.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `She says, without turning: "You're late again." Andrei does not respond. You hear her smile.`,
              }),
            },
          },
          {
            id: 'nina',
            name: 'Nina',
            examine: `Seven years old. A pencil in her hand. A drawing forming under it. She is humming, then quietly singing.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m3.phrase-heard']) {
                  return { text: `She is still singing it. The same three syllables, three beats, a fall. She has not looked up.` };
                }
                return {
                  text: `She sings it three times before stopping: "LOR-ka, LOR-ka, LOR." Three beats and a fall. Then she says, eyes still on the page: "It's the song he taught me."\n\nShe does not look up. Andrei has not spoken yet.`,
                  effects: [{ setFlags: { 'm3.phrase-heard': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m3.phrase-heard']) {
                  return { text: `You have not yet heard her sing. The page in your journal is blank for this moment.` };
                }
                if (ctx.journal.some(j => j.id === 'ninas-phrase')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down the phrase. "LOR-ka, LOR-ka, LOR." Three beats and a fall. And what she said: it's the song he taught me.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'ninas-phrase',
                        label: "Nina's phrase",
                        body: `She sang it three times: "LOR-ka, LOR-ka, LOR." Three beats and a fall. She said: it's the song he taught me. She would not say who. She did not look up.`,
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
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m3.date-noted']) {
                  return { text: `The same Tuesday. April 27.` };
                }
                return {
                  text: `April 1965. Today, April 13, a Tuesday. The Tuesday two weeks from now — April 27 — is circled. Faintly. In pencil. By a hand you cannot identify.`,
                  effects: [{ setFlags: { 'm3.date-noted': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m3.date-noted']) {
                  return { text: `You have not yet read what it says.` };
                }
                if (ctx.journal.some(j => j.id === 'circled-date')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down the date. April 27, 1965. Tuesday. Two weeks. Pencilled in by a hand you cannot identify.`,
                  effects: [
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
          atmoRead(
            'kettle-m3',
            'the kettle',
            'On the stove. It sings a note that is almost the right note.',
            `Yelena says it's fine. You stand near the stove and it is, almost, fine.`
          ),
          decoy(
            'clock-m3',
            'the clock',
            'On the wall. The numerals slide. You cannot read it. The dream will not let you have the time.'
          ),
          atmoRead(
            'drawing',
            "Nina's drawing",
            'A small house. A tall man. A smaller man. A much smaller figure between them.',
            `When you look back, the smaller man has moved. He is on the other side of the figure now. Nina is humming.`
          ),
          {
            id: 'kitchen-door-apt',
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
          atmoRead(
            'jars-on-shelf',
            'jars on the shelf',
            'Preserved fruit. Pickles. Honey. One of them is labelled in a language Andrei does not read.',
            `He has not asked her about it. She has not offered to say.`
          ),
          decoy(
            'ninas-shoes',
            "Nina's shoes",
            'By the door. Small. One of them tipped onto its side.'
          ),
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
        look: `Three frames on the shelf. The middle one catches your attention. A record player against the wall. A bookshelf, full. An armchair, shaped to him. The window is dark.`,
        items: [
          atmoRead(
            'shelf-m3',
            'the shelf',
            'Three photographs. The middle one is the one that holds you.',
            `One is the lake — Yelena and Nina, the same photograph as on his desk. One is an older couple, a wedding in sepia. The middle one is a man.`
          ),
          {
            id: 'middle-photo',
            name: 'the middle photograph',
            examine: `A man in flight gear, late thirties, mid-laugh.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['photograph.flipped']) {
                  return { text: `It is the same man. The pencil mark on the back of the photograph on Andrei's desk: K., 1962. Here he is full-face, framed, eyes bright. Nina knows his face.\n\nAndrei stops. The dream stops with him.` };
                }
                return { text: `A man you do not know — flight gear, late thirties, mid-laugh. The back of the frame is blank. Yelena keeps it dustless.` };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['photograph.flipped']) {
                  return { text: `You have not yet recognised him. You write nothing.` };
                }
                if (ctx.journal.some(j => j.id === 'man-recognized')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down the recognition. The man on the desk and the man on the shelf are the same. Yelena keeps it dustless. Nina knows his face.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'man-recognized',
                        label: 'The man on the shelf is K.',
                        body: `The man whose face Andrei keeps face-down in his office is the same man Yelena keeps framed on the shelf. Nina knows his face. Andrei does not say his name aloud, not once.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'wedding-photo',
            'the wedding photograph',
            'Sepia. A couple from another era. The bride is laughing.',
            `You think it is Yelena's parents. Or someone else's. The dream does not say.`
          ),
          atmoRead(
            'lake-photo',
            'the lake photograph',
            'Yelena, Nina, the lake. The same photograph that sits on his desk.',
            `Or close enough. The dream may be reusing it. Or it may be the same one. You cannot tell.`
          ),
          {
            id: 'record-player',
            name: 'the record player',
            examine: `Against the wall. A record on the turntable. A waltz, by the look of the sleeve.`,
            actions: ['use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              use: () => ({
                text: `You set the needle. Strings, faintly. The same strings that drift on Tomás's radio at home, possibly. The same. Or close enough. Yelena hears it from the kitchen and does not call out.`,
              }),
            },
          },
          atmoRead(
            'bookshelf-m3',
            'the bookshelf',
            'Full. Technical manuals, novels, a few children\'s books on the lower shelf for Nina.',
            `You skim three spines. Nothing pulls you. Andrei has not read most of them in a year.`
          ),
          atmoRead(
            'armchair',
            'the armchair',
            'Worn, shaped to him.',
            `He has spent more evenings here than anywhere else in this flat. The shape of him is in the cushions.`
          ),
        ],
      },
    },

    'apt-bedroom': {
      id: 'apt-bedroom',
      name: 'The Bedroom',
      exits: [
        { direction: 'south', roomId: 'apt-kitchen' },
      ],
      dreamer: {
        entry: `Nina's room. A small bed. Drawings stuck to the wall in three uneven rows. A closet against the far wall, slightly ajar. A toy on the pillow. The window onto a courtyard that, if you look hard, is not quite the same courtyard.`,
        look: `The bed. The drawings on the wall. The closet, slightly ajar. The toy. The window. The pillow. A small rug.`,
        items: [
          atmoRead(
            'ninas-bed',
            "Nina's bed",
            'Small, neat. The cover is pulled up but not tucked in.',
            `She has made it herself. Mostly.`
          ),
          {
            id: 'drawings-on-wall',
            name: 'drawings on the wall',
            examine: `Crayon. A dozen of them, stuck up with bits of tape, in three uneven rows.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Most of them are houses, suns, the lake. One of them — third row, fourth from the left — is the same small house with three figures, but the fourth figure is added: a man in flight gear, standing slightly apart. K.\n\nNina has labelled him "the man who taught me the song."`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'ninas-fourth-figure')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write it down. The fourth figure. The label. The man who taught her the song.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'ninas-fourth-figure',
                        label: "Nina's drawings — a fourth figure",
                        body: `Among Nina's drawings on the bedroom wall: a small house with four figures. The fourth, set slightly apart, in flight gear. She labelled him "the man who taught me the song." Andrei is not in this drawing. Or perhaps he is — the second figure could be him.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'closet',
            name: 'the closet',
            examine: `Slightly ajar. Andrei has not been into Nina's closet in a year.`,
            actions: ['open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              open: (ctx: ActionContext) => {
                if (ctx.flags['bedroom.closet-opened']) {
                  return { text: `Already open. The strange coat is still there.` };
                }
                return {
                  text: `You pull the door wider. Mostly Nina's clothes — small, washed soft. But hanging at the back, where it should not be, a man's coat. Heavy wool. Not Andrei's. The shoulders are wrong. The smell is wrong.`,
                  effects: [{ setFlags: { 'bedroom.closet-opened': true } }],
                };
              },
            },
          },
          {
            id: 'strange-coat',
            name: 'the strange coat',
            examine: `Heavy wool, hanging at the back of Nina's closet. Shoulders broader than Andrei's. A smell of cold that is not this flat's cold.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (!ctx.flags['bedroom.closet-opened']) {
                  return { text: `You cannot read it until you have seen it. The closet is closed.` };
                }
                return {
                  text: `You feel the pockets. A folded square of paper, blank. A button, loose. A pencil. The lining has been mended, neatly, by someone who is not Yelena — the stitch is too small.`,
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['bedroom.closet-opened']) {
                  return { text: `Nothing to note. You have not seen it.` };
                }
                if (ctx.journal.some(j => j.id === 'the-strange-coat')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down what you found. A coat that is not Andrei's, at the back of Nina's closet. A coat that someone has mended.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'the-strange-coat',
                        label: 'A coat at the back of the closet',
                        body: `A man's coat at the back of Nina's closet. Not Andrei's. Heavier wool. Mended, neatly, by a hand that is not Yelena's. A button loose in the pocket. A folded square of paper, blank. A smell of cold from somewhere else.`,
                      },
                    },
                  ],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['bedroom.closet-opened']) {
                  return { text: `You cannot touch it. The closet is closed.` };
                }
                if (!ctx.journal.some(j => j.id === 'ninas-phrase')) {
                  return { text: `He reaches for it and stops. There is something he has not yet heard. The dream will not let him leave until he has.` };
                }
                return {
                  text: `He puts his hand on the coat. The dream tilts. The fabric is right under his fingers — and then it is not — and then he is somewhere else.`,
                  effects: [{ advanceToMovement: { movementId: 'm4', targetRoom: 'briefing-anteroom' } }],
                };
              },
            },
          },
          atmoRead(
            'window-bedroom',
            'the window',
            'Onto a courtyard. Not quite the same courtyard.',
            `If you look directly: it is the courtyard outside the flat. If you look obliquely: it isn't. The dream is doing what dreams do.`
          ),
          atmoRead(
            'toy-bird',
            'a wooden toy',
            'On the pillow. A small carved bird, mid-flight.',
            `Stylised the way the sticker on Andrei's panel was stylised. The same hand, possibly.`
          ),
          decoy(
            'small-rug',
            'a small rug',
            'On the floor by the bed. Faded. Yelena was given it by her mother. Nina has worn it thin in the same place.'
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M4 — The Briefing (reckoner)
    // ════════════════════════════════════════════════════════════════════════

    'briefing-anteroom': {
      id: 'briefing-anteroom',
      name: 'A Small Antechamber',
      exits: [
        { direction: 'north', roomId: 'briefing-room' },
      ],
      reckoner: {
        entry: `A small windowless antechamber. A wooden bench. A coat rack with Drozdov's coat already hanging. A poster on the wall. A clock that reads 15:55. The door north leads into the briefing room.`,
        look: `Drozdov's coat on the rack. The bench, polished smooth. The poster. The clock. A small sign on the corridor wall. The briefing room is north.`,
        items: [
          atmoRead(
            'drozdovs-coat',
            "Drozdov's coat",
            'On the rack. The same hand that wrote the envelope folded this collar.',
            `He has been in already. He is waiting inside.`
          ),
          decoy(
            'anteroom-bench',
            'the bench',
            'Polished smooth at the centre. Many cosmonauts have waited on it. He has waited on it before.'
          ),
          {
            id: 'anteroom-poster',
            name: 'the poster',
            examine: `Three words on a cream-coloured ground, in a stern serif: DISCIPLINE. DISCRETION. DISTANCE.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The same three words in the same stern type, on the wall of every secured corridor in the programme. Cream ground. Stern serif. He has stopped seeing it.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'three-words')) {
                  return { text: `Already in your journal.` };
                }
                return {
                  text: `You write down the three words. They have the weight of a creed.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'three-words',
                        label: 'Discipline. Discretion. Distance.',
                        body: `The poster on the wall of every secured corridor in the programme. Cream ground. Stern serif. Three words. Andrei has stopped seeing it. You have not.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          decoy(
            'anteroom-clock',
            'the clock',
            '15:55. Five minutes to the briefing.'
          ),
          atmoRead(
            'corridor-sign',
            'a small sign',
            'On the wall by the door: "Section 4 — Restricted. Personnel only."',
            `It is the kind of sign that is read once and never again. Andrei reads it never.`
          ),
        ],
      },
    },

    'briefing-room': {
      id: 'briefing-room',
      name: 'A Briefing Room',
      exits: [
        { direction: 'south', roomId: 'briefing-anteroom' },
      ],
      reckoner: {
        entry: `Windowless. A long table. A wall map of the southern hemisphere with a route marked in red. A small scale model on the side table, under a cloth. The cloth stays on.

Drozdov at the head of the table. Two officers seated — one introduced earlier this week, the other not. The door has been closed and locked behind you. You sit.`,
        look: `Drozdov is reading from a folder. The second officer has not spoken and has not looked up. The map is annotated in two hands. The model under the cloth is shaped, but the cloth stays on.

On the table in front of you: the briefing acceptance form, a blank line where the callsign should be written. Three folders. A samovar in the corner. A chalkboard. The locked door, behind.`,
        items: [
          {
            id: 'briefing-document',
            name: 'the briefing document',
            examine: `Drozdov reads from it. You can read along.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m4.briefing-heard']) {
                  return { text: `The same callsign. The same date. The same three beats.` };
                }
                return {
                  text: `Drozdov reads: "Operational callsign — LOR-ka, LOR-ka, LOR. Departure window opens 27 April. Risk profile remains outside standard tolerances. Secrecy reiterated."\n\nThree beats. A fall.`,
                  effects: [{ setFlags: { 'm4.briefing-heard': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m4.briefing-heard']) {
                  return { text: `Drozdov has not yet read it aloud. There is nothing to write.` };
                }
                const hasRhythm = ctx.journal.some(j => j.id === 'envelope-rhythm');
                const hasPhrase = ctx.journal.some(j => j.id === 'ninas-phrase');
                if (hasRhythm && hasPhrase && !ctx.journal.some(j => j.id === 'alignment')) {
                  return {
                    text: `You write it down. LOR-ka, LOR-ka, LOR. Three beats. The rhythm in your journal goes still. The rhythm Nina was singing goes still. They are the same. You underline both.`,
                    effects: [
                      {
                        addJournalEntry: {
                          id: 'alignment',
                          label: 'The callsign — and what Nina sang',
                          body: `Drozdov said it aloud. LOR-ka, LOR-ka, LOR. The same three beats as the masked rhythm Drozdov wrote. The same three beats as Nina's song. Nina knows the callsign. Or she taught it to him. Or someone did.`,
                        },
                      },
                    ],
                  };
                }
                if (!ctx.journal.some(j => j.id === 'briefing-callsign')) {
                  return {
                    text: `You write down the callsign. LOR-ka, LOR-ka, LOR. Three beats. A fall. You do not yet have anything to set it against.`,
                    effects: [
                      {
                        addJournalEntry: {
                          id: 'briefing-callsign',
                          label: 'The callsign, as read aloud',
                          body: `Drozdov, in the briefing: LOR-ka, LOR-ka, LOR. Three beats and a fall.`,
                        },
                      },
                    ],
                  };
                }
                return { text: `Already in your journal.` };
              },
            },
          },
          {
            id: 'briefing-form',
            name: 'the briefing form',
            examine: `An acceptance form. A blank line where the callsign should be written.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Standard acceptance language. Once signed, the mission is his.`,
              }),
              use: (ctx: ActionContext) => {
                if (ctx.flags['m4.form-signed']) {
                  return { text: `The form is signed. There is nothing more to do with it.` };
                }
                if (!ctx.flags['m4.briefing-heard']) {
                  return { text: `He will not sign before he hears Drozdov read it aloud. The pen stays in his hand.` };
                }
                const hasCallsign = ctx.journal.some(j => j.id === 'briefing-callsign' || j.id === 'alignment');
                if (!hasCallsign) {
                  return { text: `He has heard it but he has not yet kept it. He cannot write what he has not yet written somewhere closer.` };
                }
                const hasPosterSlogan = ctx.journal.some(j => j.id === 'three-words');
                if (!hasPosterSlogan) {
                  return { text: `His pen hesitates. Something he walked past in the corridor is not yet in the journal. He has signed forms like this before and regretted it. Not today, until he has the words straight.` };
                }
                return {
                  text: `He writes the callsign on the blank line: LOR-ka, LOR-ka, LOR. He signs. Drozdov countersigns without looking at him.

At the door, Drozdov stops. Quietly, only to Andrei: "You'll know him by his hands."`,
                  effects: [
                    { setFlags: { 'm4.form-signed': true } },
                    {
                      addJournalEntry: {
                        id: 'drozdovs-parting',
                        label: "Drozdov's parting word",
                        body: `At the door, only to Andrei: "You'll know him by his hands." Drozdov said it the way he says everything. Andrei wrote it down later. So have you.`,
                      },
                    },
                    { advanceToMovement: { movementId: 'coda', targetRoom: 'tomas-desk-coda' } },
                  ],
                };
              },
            },
          },
          atmoRead(
            'drozdov',
            'Major Drozdov',
            'Fifties. Quiet. Reads everything twice. He is reading now.',
            `He reads the document, then reads it again. He has been Andrei's superior for eleven years. Andrei trusts him almost completely.`
          ),
          atmoRead(
            'silent-officer',
            'the second officer',
            'He has not spoken. He has not looked up.',
            `Mid-forties. A uniform you cannot quite identify. He has a folder of his own that he does not open.`
          ),
          atmoRead(
            'the-map',
            'the wall map',
            'Southern hemisphere. A route marked in red, terminating at a parallel of latitude you cannot place.',
            `The route is annotated in two different hands. One of them is Drozdov's. The other is not.`
          ),
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
          decoy(
            'samovar',
            'a samovar',
            'In the corner. The silent officer rises once and pours himself tea. He does not offer.'
          ),
          atmoRead(
            'chalkboard',
            'a chalkboard',
            'On the side wall. A partial diagram in white chalk — three intersecting orbits, one of them dotted.',
            `Incomplete. Whoever drew it stopped halfway.`
          ),
          atmoRead(
            'three-folders',
            'a stack of folders',
            'Three of them, square-cornered. Two unrelated. One is the mission file again.',
            `He skims the two unrelated ones. Logistics. Personnel. Neither his concern today.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // CODA — Tomás's flat, late evening
    // ════════════════════════════════════════════════════════════════════════

    'tomas-desk-coda': {
      id: 'tomas-desk-coda',
      name: 'Your Desk',
      exits: [
        { direction: 'east', roomId: 'tomas-kitchen-coda' },
      ],
      neutral: {
        entry: `Your desk. The radio is off. The journal is full — six new pages since yesterday. The window is dark. The lit window opposite is dark too. You sit. You have not eaten.`,
        look: `Your desk. The closed journal. The typewriter with the same German page in it. The window onto the courtyard, dark. The lamp, still on. The kitchen, east.

The journal is the only thing here that has changed.`,
        items: [
          {
            id: 'journal-coda',
            name: 'your journal',
            examine: `Full now. The last entry sits open beneath your hand.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['coda.journal-read']) {
                  return { text: `You have already read it back. The window is still dark.` };
                }
                const hasAlignment = ctx.journal.some(j => j.id === 'alignment');
                if (hasAlignment) {
                  return {
                    text: `You read back what you wrote.

The masked rhythm in Drozdov's envelope. The phrase Nina was singing at the kitchen table. The callsign Drozdov read aloud. They are the same three beats. You wrote the alignment down already, but you did not see it until just now.

You sit with it for a long time. The window is still dark.`,
                    effects: [{ setFlags: { 'coda.journal-read': true } }],
                  };
                }
                return {
                  text: `You read back what you wrote.

A great deal of texture. A great deal of weather. You wrote less than you might have. The pages feel thinner than they should.

You sit with it for a long time. The window is still dark.`,
                  effects: [{ setFlags: { 'coda.journal-read': true } }],
                };
              },
            },
          },
          atmoRead(
            'typewriter-coda',
            'the typewriter',
            'The same page. The same paragraph. You have not touched it in a day.',
            `The German is still there. The paragraph is still there. The man is still returning to the house.`
          ),
          {
            id: 'coda-window',
            name: 'the window',
            examine: `The courtyard, dark. The window opposite, dark. Your reflection, faint.`,
            actions: ['open', 'examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Your reflection. The lamp behind you. Your face. The journal lies behind you, full of a stranger's day.`,
              }),
              open: (ctx: ActionContext) => {
                if (!ctx.flags['coda.journal-read']) {
                  return { text: `Your hand is on the latch. The latch is cold. You do not open it. Not yet.` };
                }
                if (ctx.flags['sp01.complete']) {
                  return { text: `It is closed again. The lit window opposite is dark now. You did not see it go out.` };
                }
                return {
                  text: `You reach for the latch.

In the unlit glass, for one beat, the room behind you is not your room. It is a narrow institutional room with a wooden desk, a radiator clanking, a forest road through the window. Then the reflection settles, and it is your kitchen.

You turn off the lamp.

The lit window opposite is dark now. You did not see it go out.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'the-alignment',
                        label: 'You did not see it until just now',
                        body: `The rhythm. Three places, the same three beats. You did not see it until you closed the journal and stood up and put your hand on the window's latch.`,
                      },
                    },
                    { setFlags: { 'sp01.complete': true } },
                    { complete: true },
                  ],
                };
              },
            },
          },
          decoy(
            'radio-coda',
            'the radio',
            'Off. You turned it off when you got back. You do not remember turning it off.'
          ),
          atmoRead(
            'desk-lamp-coda',
            'the desk lamp',
            'Still on. Warmer than it was earlier. The bulb has been on for a long time.',
            `You will turn it off in a moment.`
          ),
          atmoRead(
            'courtyard-window-coda',
            'the courtyard',
            'Through the window. The lit window opposite is dark for the first time in six weeks.',
            `Or you only just noticed.`
          ),
        ],
      },
    },

    'tomas-kitchen-coda': {
      id: 'tomas-kitchen-coda',
      name: 'Your Kitchen',
      exits: [
        { direction: 'west', roomId: 'tomas-desk-coda' },
      ],
      neutral: {
        entry: `The kitchen. The dish is still in the sink. The mail is still on the table. The neighbour's note is still there. The radio is off. The window is dark.

Nothing has moved since the prologue. You have.`,
        look: `The dish. The unread mail. The note. The radio, off. The kitchen window, dark. The desk is west.`,
        items: [
          decoy(
            'dish-in-sink-coda',
            'the dish',
            'Still there. Three days now.'
          ),
          decoy(
            'mail-still',
            'the mail',
            'Still unread. The bill, the magazine, Maria\'s letter.'
          ),
          decoy(
            'neighbours-note-coda',
            "the neighbour's note",
            'Still on the table. "Come down for coffee sometime. — Signora R."'
          ),
          atmoRead(
            'kitchen-radio-coda',
            'the radio',
            'Off. You turned it off when you got back. The kitchen is quiet.',
            `The strings have stopped. You can hear the building. You can hear the courtyard.`
          ),
          atmoRead(
            'kitchen-window-coda',
            'the window',
            'Onto the courtyard. The lit window opposite is dark.',
            `From here, too.`
          ),
        ],
      },
    },
  },

  triggers: [],
};
