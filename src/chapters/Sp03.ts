import type { Chapter, ActionContext, Item } from '../types';

// SP Chapter 3 — The Selection.
// 5–7 November 1963. Between Ch02 (the range, Aug 1962) and Ch01 (the closed
// city, Spring 1965). Andrei is selected for the cosmonaut programme. K. is
// off-stage and named once by Nina through a wall. Tomás writes Andrei's name
// in the journal for the first time. Movement order: D, R, R, D.
// See chapters/season-1/chapter-03/sp.md.

// ─── helpers ────────────────────────────────────────────────────────────────

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

export const Sp03: Chapter = {
  id: 'sp03',
  title: 'The Selection',
  contentVersion: 1,
  actionSet: ['look', 'open', 'examine', 'use', 'note'],
  starts: {
    dreamer: 'tomas-desk-finishing',
    reckoner: 'tomas-desk-finishing',
  },
  cast: {
    protagonist: 'Tomás',
    cosmonaut: 'Andrei',
    wife: 'Yelena',
    daughter: 'Nina',
    surgeon: 'Reznik',
    superior: 'Drozdov',
    sister: 'Maria',
  },
  usesJournal: true,

  prologue: `You have slept. You have eaten. You have read Maria's letter twice more between two pages of August 1962.

The German paragraph has been mid-sentence for a week. You sit down to finish it. You have decided, this morning, to type one more sentence. The radiator clanks. You have it under your hand.

The keys are warm. You wait for the sentence to come.`,

  epilogue: `You have typed his name on the page. You have underlined it twice in the journal.

The radiator clanks. The kitchen radio is low and is not the song. The window opposite is unlit and the leaves are off the tree.

His name is Andrei. You will write it again tomorrow.`,

  completionFlag: 'sp03.complete',

  movements: [
    {
      id: 'prologue',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-finishing', 'tomas-radiator'],
      transitionOut: `You strike the period. The paragraph closes. The page does not. Your fingers stay on the keys. The keys are warm. The keys are warm where they should not be warm.

A different room takes shape under your hands.`,
    },
    {
      id: 'm1',
      title: 'The Wait',
      mode: 'dreamer',
      rooms: ['andrei-flat-hallway', 'andrei-flat-study', 'andrei-flat-bedroom-door'],
      transitionIn: `A small hallway. A telephone on a shelf. A bulb that is half-lit and not flickering — halved. Three coats on a rack. The smell of bread from somewhere below.

The dream is unstable. The phone is ringing. The phone has rung. The phone has not rung yet.`,
      transitionOut: `He lifts the receiver. A voice — Russian, distant, careful — tells him the panel is at ten on Wednesday. He does not say anything back.

The dream cuts to a different city.`,
    },
    {
      id: 'm2',
      title: 'The Panel',
      mode: 'reckoner',
      rooms: ['hotel-room-1963', 'panel-corridor', 'medical-room-1963', 'panel-room-1963'],
      transitionIn: `A hotel room with one window onto a side street. The basin is full. He has not slept well. The itinerary on the desk is typed in someone else's hand.

The central city. The morning of the 6th. The panel at ten.`,
      transitionOut: `He signs. The captain countersigns without lifting his eyes for long. The civilian writes in his notebook. The surgeon does not look up.

He stands. The trance unhooks at the threshold of the room.`,
    },
    {
      id: 'm3',
      title: 'The Telegram',
      mode: 'reckoner',
      rooms: ['flat-hallway-real', 'flat-kitchen', 'flat-study-real', 'flat-bedroom'],
      transitionIn: `His own hallway again. The bulb is fully lit now. The coats are coats. Yelena's voice calls from the kitchen — she has heard the door.

The 7th. Afternoon. The telegram has arrived in his absence.`,
      transitionOut: `He closes the trunk. The latches click in turn. The lamp in the bedroom is off. The night begins to be its own thing.

He boards the night train at twenty-two hundred.`,
    },
    {
      id: 'm4',
      title: 'The Crossing',
      mode: 'dreamer',
      rooms: ['train-compartment', 'train-corridor', 'the-platform-dream'],
      transitionIn: `A second-class sleeping compartment. The train is moving. The frost on the window is patterned in a way frost is not patterned. The upper berth is empty.

The night train east.`,
      transitionOut: `He steps back from the platform. The platform sign refuses to resolve. The corridor light spills onto the snow. The dream lets him go in pieces.`,
    },
    {
      id: 'coda',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-coda-3', 'tomas-kitchen-coda-3'],
      transitionIn: `You come back to yourself at your desk. The German paragraph has been finished. The page has two more sentences than you intended. The afternoon is becoming evening.`,
    },
  ],

  rooms: {

    // ════════════════════════════════════════════════════════════════════════
    // PROLOGUE — Tomás's flat, mid-morning, days after the Ch02 coda
    // ════════════════════════════════════════════════════════════════════════

    'tomas-desk-finishing': {
      id: 'tomas-desk-finishing',
      name: 'Your Desk',
      exits: [
        { direction: 'north', roomId: 'tomas-radiator' },
      ],
      neutral: {
        entry: `Mid-morning. The radiator has been on since overnight without warning. The journal is on the desk, Maria's letter folded between two August 1962 pages. The Olivetti has the German paragraph still mid-sentence.

You have decided to finish it.`,
        look: `The desk. The Olivetti, the journal, the German novel, the coffee cup. The pencil you sharpened before sitting down. The courtyard window. The kitchen-corner where the radiator is, north.`,
        items: [
          {
            id: 'typewriter-prologue-3',
            name: 'the typewriter',
            examine: `The Olivetti. Same page. The German paragraph stops mid-sentence. The keys are warm under your hand from the morning's first try.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['p3.typewriter-examined']) {
                  return { text: `The keys are still warm. The sentence is still waiting. You know how it ends now. You will type it.` };
                }
                return {
                  text: `You look at the page. You know the sentence that comes next. You have known it for a week. The block was never the sentence. The block was the day around the sentence.

You set your fingers on the keys.`,
                  effects: [{ setFlags: { 'p3.typewriter-examined': true } }],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['p3.typewriter-examined']) {
                  return { text: `Your fingers are on the keys. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['p3.journal-reread']) {
                  return { text: `Your fingers are on the keys. Not yet. There are still things to do here.` };
                }
                return {
                  text: `You type. The sentence you have known for a week lands cleanly. You strike the period. The carriage clicks.

The paragraph closes. The page does not. Your fingers stay on the keys. The keys are warm. The keys are warm where they should not be warm.

A different room takes shape under your hands.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm1', targetRoom: 'andrei-flat-hallway' } },
                  ],
                };
              },
            },
          },
          {
            id: 'journal-prologue-3',
            name: 'your journal',
            examine: `Open on the desk. Maria's letter is folded between two pages of August 1962. The bird-and-three-lines sketch is on a margin from a week ago.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['p3.journal-reread']) {
                  return { text: `You have read it. The same rhythm in four places. The same hand on three clearances. The same chin in two rooms. You have not yet written his name.` };
                }
                return {
                  text: `You read back. The August 1962 pages, the Maria pages, the bird, the song running backward through people. You stop where you stopped last.

The man whose life you have been inside for two chapters does not have a name in the journal. You have called him "him" and "the cosmonaut" and "Andrei's husband once." You have not written *Andrei*.

You will, today. You sit back and the page is warm under your hand.`,
                  effects: [{ setFlags: { 'p3.journal-reread': true } }],
                };
              },
            },
          },
          atmoRead(
            'german-novel-3',
            'the German novel',
            'Face-down, the cracked spine cracked further. The translation has waited a week. It will wait another hour.',
            `You do not pick it up. You will not need it for the sentence you know.`
          ),
          atmoRead(
            'coffee-cup-3',
            'the coffee cup',
            'Fresh this morning. Half-drunk. The ring of the saucer is still warm.',
            `You drink the last of it. It is bitter where the milk has fallen out.`
          ),
          atmoRead(
            'pencil-prologue-3',
            'a pencil',
            'Sharpened. You sharpened it before sitting down. The shavings are in the dish.',
            `A small ritual. A small commitment.`
          ),
          atmoRead(
            'courtyard-window-prologue-3',
            'the courtyard window',
            'The leaves are off the tree. The lit window opposite is unlit at this hour. Nobody is watching.',
            `The courtyard is empty of people, of weather, of anything that asks anything of you. You can sit and type.`
          ),
        ],
      },
    },

    'tomas-radiator': {
      id: 'tomas-radiator',
      name: 'The Kitchen Corner',
      exits: [
        { direction: 'south', roomId: 'tomas-desk-finishing' },
      ],
      neutral: {
        entry: `The corner of the kitchen where the radiator is. The radiator clanks the way old radiators clank when they have been on too long without warning. The kettle is cold. The radio is silent on the same station the dial was on a week ago.`,
        look: `The radiator clanking. The cold kettle. The silent radio. The kitchen window onto the same courtyard. The doorway south, back to the desk.`,
        items: [
          atmoRead(
            'radiator-prologue',
            'the radiator',
            'Cast iron. Painted over twice. Hot. The building turned the heat on overnight without telling anyone.',
            `You put a hand on it and take it off. It is hotter than it should be. It is what the building has decided.`
          ),
          atmoRead(
            'kitchen-radio-prologue-3',
            'the radio',
            'On the same station the dial was on a week ago. Silent — the station does not broadcast at this hour.',
            `You will not turn it on. You have not yet earned the silence breaking.`
          ),
          atmoRead(
            'kitchen-window-prologue-3',
            'the kitchen window',
            'Same courtyard. Same leafless tree. The flowerpot on the parapet is still dead.',
            `You have not changed the soil. You will not, today. You have decided to type instead.`
          ),
          atmoRead(
            'cold-kettle-prologue',
            'the kettle',
            'Cold. You did not make tea. You will, after.',
            `You put your hand on the spout. Steel. Cold.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M1 — The Wait (dreamer) — night of 5 November 1963
    // ════════════════════════════════════════════════════════════════════════

    'andrei-flat-hallway': {
      id: 'andrei-flat-hallway',
      name: 'The Hallway',
      exits: [
        { direction: 'east', roomId: 'andrei-flat-study' },
        { direction: 'west', roomId: 'andrei-flat-bedroom-door' },
      ],
      dreamer: {
        entry: `A small hallway. A telephone on a shelf, black bakelite. A coat rack with three coats. The bulb in the ceiling is half-lit and not flickering — halved.

The phone is ringing. The phone has rung. The phone has not rung yet.`,
        look: `The telephone on the shelf. Andrei's coat, Yelena's, Nina's small one. The half-lit bulb. The doormat. Doorways east and west.`,
        items: [
          {
            id: 'telephone-m1',
            name: 'the telephone',
            examine: `Black bakelite. On a shelf at chest height. The receiver is in its cradle. Sometimes the receiver lifts itself a finger's breadth and settles back. Sometimes it does not.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei looks at it. He has been looking at it for a long time. The dream cannot decide whether it has rung yet.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m1.map-noted']) {
                  return { text: `Your hand is on the receiver. Not yet. The dream is not finished with you yet.` };
                }
                if (!ctx.flags['m1.song-noted']) {
                  return { text: `Your hand is on the receiver. Not yet. The dream is not finished with you yet.` };
                }
                return {
                  text: `He lifts the receiver. The line is clear at one end and not at the other. A man's voice, careful, distant: *"Voronin. The panel is at ten on Wednesday. Be at the hotel by Tuesday evening. The room is in your name."*

He says nothing. He sets the receiver back. The hallway tilts.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm2', targetRoom: 'hotel-room-1963' } },
                  ],
                };
              },
            },
          },
          atmoRead(
            'andrei-coat-m1',
            "Andrei's coat",
            'On the rack. Damp at the shoulders. He has been out tonight, somewhere. He does not remember where.',
            `He touches the wool. It is wet to his fingers. He does not know what weather he was in.`
          ),
          atmoRead(
            'yelena-coat-m1',
            "Yelena's coat",
            "Beside his. The wool collar smells of bread. She has been to the bakery downstairs in the morning.",
            `The bakery is below the flat. He can smell it through the floor in the mornings. He cannot smell it now.`
          ),
          atmoRead(
            'nina-coat-m1',
            "Nina's coat",
            'Small, dark blue, one button missing. On the lower hook.',
            `The button has been missing for two months. Yelena has not had a moment to sew it.`
          ),
          atmoRead(
            'halved-bulb',
            'the ceiling bulb',
            'Halved. Not flickering — halved. The light only reaches the left wall.',
            `Dream-logic. He does not look up at it for long.`
          ),
          atmoRead(
            'hallway-doormat',
            'the doormat',
            'Someone has wiped boots on it tonight, twice. Andrei did not.',
            `Two sets of prints. One overlapping the other. He does not place them.`
          ),
        ],
      },
    },

    'andrei-flat-study': {
      id: 'andrei-flat-study',
      name: 'The Study',
      exits: [
        { direction: 'west', roomId: 'andrei-flat-hallway' },
      ],
      dreamer: {
        entry: `A small study off the hallway. A desk under a window. A wireless on a shelf. A map of the polity tacked to the wall. A photograph in a frame above the desk.

The dream has thinned the room. The objects are exact. The arrangement is wrong.`,
        look: `The desk. The wireless on the shelf. The wall photograph. The pencilled map. A sealed envelope on the desk. A sheaf of opened letters.`,
        items: [
          {
            id: 'study-wall-photograph',
            name: 'the wall photograph',
            examine: `Framed. Two figures in flight gear on a tarmac, ten metres apart. The composition is wrong — the figures are too far for a photograph someone meant to keep.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei and Konstantin in flight gear. The tarmac is a tarmac Andrei does not recognise. The print has been hand-cropped — the edge is uneven where a third figure was. The third figure is no longer there. The cropping was done by hand, with scissors, and the cut is steady.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'cropped-photograph-1963')) {
                  return { text: `Already in the journal. The second cropped photograph.` };
                }
                return {
                  text: `You record it. The second cropped photograph. The first was on the mess-hall wall. The same edge, the same hand. Someone has been removing people from photographs.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'cropped-photograph-1963',
                      label: 'A second cropped photograph',
                      body: `On the wall of Andrei's study, in dream: a print of him and Konstantin on a tarmac, ten metres apart. The third figure has been hand-cropped out. The cut is steady. The same cropping I saw on the mess-hall wall in August 1962. Whoever is removing people from photographs has been at it for at least a year.`,
                    },
                  }],
                };
              },
            },
          },
          {
            id: 'pencilled-map',
            name: 'a map on the wall',
            examine: `A printed map of the polity. The route from the institute city eastward to the central city is pencilled in firmly. Andrei has not made the trip yet.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei looks at it. The pencil is sharp. The route is exact. The institutional motion the map describes has not yet been performed.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'route-already-drawn')) {
                  return { text: `Already in the journal. The route already drawn.` };
                }
                return {
                  text: `You record it. The route is drawn before the journey. Someone has decided how this will go.`,
                  effects: [
                    { setFlags: { 'm1.map-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'route-already-drawn',
                        label: 'The route was drawn before the journey',
                        body: `On the dream-wall of Andrei's study: a map of the polity with the route from his institute city to the central city already pencilled in. He has not yet made the trip. The dream gives me the institutional motion as a thing already decided. The map knows where he is going.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'sealed-self-envelope',
            name: 'a sealed envelope',
            examine: `On the desk. Addressed to him in his own handwriting. Sealed. The dream will not let him open it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He picks it up. He turns it over. The seal is unbroken. The hand is his. He does not remember writing it.

He puts it down. The seal stays.`,
              }),
            },
          },
          {
            id: 'study-wireless',
            name: 'the wireless',
            examine: `A small wooden box with a brass dial. The dial is on a frequency that is not broadcasting.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The wireless is plugged in. The little orange bulb behind the dial is lit.`,
              }),
              use: () => ({
                text: `He turns it on. A low hum. A single sustained note. Then static. He turns it off.`,
              }),
            },
          },
          atmoRead(
            'opened-letters-desk',
            'a sheaf of opened letters',
            'On the desk. All open. Addressed in different hands. None of them in Yelena\'s.',
            `He flips through them. Routine correspondence — squadron paperwork, a magazine subscription, a notice from the bank. Nothing personal.`
          ),
          decoy(
            'study-blotter',
            'the blotter',
            'Inked at one corner. The ink dried out months ago.'
          ),
        ],
      },
    },

    'andrei-flat-bedroom-door': {
      id: 'andrei-flat-bedroom-door',
      name: 'Outside the Bedroom',
      exits: [
        { direction: 'east', roomId: 'andrei-flat-hallway' },
      ],
      dreamer: {
        entry: `The closed bedroom door. Yelena is asleep behind it, or Nina is, or both. Through the wood, very faintly, a child is singing in her sleep.

The handle does not turn. Dream-logic. The door is not the puzzle.`,
        look: `The closed door. A small shoe on the floor outside it. The faint song from behind the door.`,
        items: [
          {
            id: 'bedroom-door-closed',
            name: 'the bedroom door',
            examine: `Closed. The handle does not turn under his hand — the dream has decided. The wood is warm against his cheek when he leans in.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He leans in. He listens. The song is the song. The handle stays the way it is.`,
              }),
            },
          },
          atmoRead(
            'small-shoe-outside-door',
            'a small shoe',
            "Nina's. One. On the floor outside the door. Its partner is not here.",
            `She kicked it off in the hall. Yelena did not pick it up before bed. It is here.`
          ),
          {
            id: 'nina-sleep-song',
            name: 'a song behind the door',
            examine: `Very faint. Nina is singing in her sleep, the way small children sing. The same rhythm. Three short notes, three times.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `She does not wake. She sings the way breathing sings. The rhythm is exact. She is five. She has been singing it for at least two years.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'nina-sleep-song-entry')) {
                  return { text: `Already in the journal. Nina singing in her sleep.` };
                }
                return {
                  text: `You record it. Nina is asleep. The song goes on without her.`,
                  effects: [
                    { setFlags: { 'm1.song-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'nina-sleep-song-entry',
                        label: 'Nina sings the rhythm in her sleep',
                        body: `Through the closed door of her bedroom, in dream, Nina is singing the rhythm. Three short, three times. She is five. She has been doing this since at least the summer of 1962 (Yelena's letter). The song does not need her to be awake.`,
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
    // M2 — The Panel (reckoner) — morning of 6 November 1963
    // ════════════════════════════════════════════════════════════════════════

    'hotel-room-1963': {
      id: 'hotel-room-1963',
      name: 'The Hotel Room',
      exits: [
        { direction: 'south', roomId: 'panel-corridor' },
      ],
      reckoner: {
        entry: `A single room in the officers' hotel. A bed with the impression of a head on one pillow. A basin, full. A small window onto a side street. The morning is grey and the city is starting.

A typed itinerary lies on the desk. The day is on paper.`,
        look: `The bed, slept-in unevenly. The basin. The window. The typed itinerary. His coat on a hook. A small mirror above the washstand.`,
        items: [
          {
            id: 'typed-itinerary',
            name: 'the itinerary',
            examine: `Typed in someone else's hand. Five lines. The day's institutional shape.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `10:00 — Medical (Major Reznik).
11:00 — Panel (Cpt. Drozdov, Cmrd. Mironov, Maj. Reznik).
14:00 — Telegram results to be wired to home address.
22:00 — Night train east. Reservation in compartment 3, lower berth.

He reads it twice. The results are pre-decided. The 22:00 train is already booked.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'itinerary-decided')) {
                  return { text: `Already in the journal. The day was on paper before the day.` };
                }
                return {
                  text: `You record it. The decision precedes the panel. The panel is the form of the decision.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'itinerary-decided',
                      label: 'The itinerary is the decision',
                      body: `The typed itinerary in the hotel room has the night-train booked at 22:00 — for after the panel results. The institution has decided already. The panel is procedure. He is being shown how it will go, in order, on paper, with names.`,
                    },
                  }],
                };
              },
            },
          },
          atmoRead(
            'hotel-bed',
            'the bed',
            'Turned down. The impression of a head on one pillow. He sat up at three and did not lie back down.',
            `He has not slept well. He has slept worse. He will not lie down again before the panel.`
          ),
          atmoRead(
            'hotel-basin',
            'the washstand',
            'A heavy china basin. Full. He shaved before sleep. He will shave again before the panel.',
            `The water is warm. The razor is on the shelf. He has not yet picked it up this morning.`
          ),
          atmoRead(
            'hotel-window',
            'the small window',
            'Onto a side street. A man with a cart. A woman with bread. The street is starting.',
            `He watches it for a moment. The city is going on without him.`
          ),
          atmoRead(
            'hotel-coat-hook',
            'his coat on a hook',
            "The same coat. The damp from the dream is gone. The coat is dry.",
            `He has worn it for six winters. He will wear it for six more.`
          ),
          atmoRead(
            'hotel-mirror',
            'a small mirror',
            'Above the washstand. His face. Tired. Not yet 35. He will be 35 in March.',
            `He has not looked at himself for long, in years. He looks for a moment now. Nothing he had not seen.`
          ),
        ],
      },
    },

    'panel-corridor': {
      id: 'panel-corridor',
      name: 'The Corridor',
      exits: [
        { direction: 'north', roomId: 'hotel-room-1963' },
        { direction: 'west', roomId: 'medical-room-1963' },
        { direction: 'east', roomId: 'panel-room-1963' },
      ],
      reckoner: {
        entry: `A long corridor in an institutional building in the central city. Fluorescent lights, two of them flickering at the far end. Two closed doors — MEDICAL to the west, PANEL to the east. A bench. A clock on the wall reads 09:53.

A printed card is pinned at eye height on the wall opposite the bench.`,
        look: `The bench. The two doors. The clock. The printed card on the wall. The fluorescent lights.`,
        items: [
          {
            id: 'corridor-poster-three-words',
            name: 'a printed card',
            examine: `Pinned at eye height. Three lines, in heavy serifs, centred.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `    Discipline.
    Discretion.
    Distance.

The same three lines. Printed slightly larger here than at the range, on heavier paper. The institution carries it from city to city.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'three-words-1963')) {
                  return { text: `Already in the journal. The slogan, the third room in three chapters.` };
                }
                return {
                  text: `You record it. Third occurrence in three chapters. The institution carries it.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'three-words-1963',
                      label: 'Discipline. Discretion. Distance — central city.',
                      body: `Pinned in the corridor of the panel building, central city, 6 November 1963. Same wording as the range bulletin board (1962) and the anteroom poster (1965). The slogan is institution-wide and predates Andrei's selection by years. It is older than him in the programme.`,
                    },
                  }],
                };
              },
            },
          },
          atmoRead(
            'corridor-bench',
            'the bench',
            'Empty. He has not been asked to wait. The panel does not make him wait.',
            `He stands. He has been told ten and it is nine fifty-three. He has the corridor to himself.`
          ),
          atmoRead(
            'corridor-clock',
            'the clock',
            '09:53. The second hand is the steady kind. Soviet make.',
            `The minute hand will twitch in four minutes. He will go in.`
          ),
          atmoRead(
            'medical-door-closed',
            'the door marked MEDICAL',
            'Painted in stencil on the door. The handle is brass. The door does not stand ajar.',
            `It is the kind of door designed not to creak.`
          ),
          atmoRead(
            'panel-door-closed',
            'the door marked PANEL',
            'Stencil. Larger letters than the medical door. The handle is brass.',
            `He will go through here at eleven. He has been told.`
          ),
          atmoRead(
            'fluorescent-lights',
            'the fluorescent lights',
            'Two of them flicker at the far end. The rest are steady. Soviet bulbs.',
            `The flicker is the kind of flicker nobody fixes. The lights have been like this for years.`
          ),
        ],
      },
    },

    'medical-room-1963': {
      id: 'medical-room-1963',
      name: 'The Medical Room',
      exits: [
        { direction: 'east', roomId: 'panel-corridor' },
      ],
      reckoner: {
        entry: `A windowless examining room. A table with paper crinkles. A height-stick against one wall. A stethoscope on a hook. A glass of water on the side table.

Major Reznik is at his clipboard. He does not look up.`,
        look: `Reznik. The examining table. His clipboard. The stethoscope. The height-stick. The glass of water.`,
        items: [
          {
            id: 'reznik-in-person',
            name: 'Major Reznik',
            examine: `Fifty-three. Slight. Glasses pushed up onto his forehead. The pencil is in his right hand. He does not look up. He says: "Sit down, please."`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He is the hand. The hand is attached to a man who has been a flight surgeon for thirty years and has the surgeon's habit of not looking up. He works the stethoscope without conversation. He pencils a small circle around a value in Andrei's chart — the same shape Andrei has seen in his own file, in Kostya's clearance, in two clipboards in two cities. He looks up only when he is done, and only at the wall.

He says one more thing: "We proceed."`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'reznik-the-man')) {
                  return { text: `Already in the journal. The hand has a face.` };
                }
                return {
                  text: `You record it. The hand has a face. The face does not look up.`,
                  effects: [
                    { setFlags: { 'm2.reznik-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'reznik-the-man',
                        label: 'Reznik. The face attached to the hand.',
                        body: `Major Reznik in person. Fifty-three, slight, glasses on his forehead. The same pencil from two clipboards in two cities. He said two lines all morning — "Sit down, please" and "We proceed." He did not look up at Andrei. He looked up only at the wall, at the end. The circle around the heart-rate value is the same circle in two prior charts. He has been doing this for a long time. He is the institution's hand.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'examining-table',
            'the examining table',
            'White paper over a vinyl pad. Paper crinkles when he sits. A small stain at one corner — coffee from another morning.',
            `He sits. The paper crinkles. Reznik does not flinch.`
          ),
          atmoRead(
            'reznik-clipboard-stethoscope',
            'the clipboard',
            "Reznik carries it against his chest. He sets it down only to listen to the heart.",
            `When he sets it down, the small pencilled circle is visible against a row of numbers. The slope of the circle is the slope Andrei has seen.`
          ),
          atmoRead(
            'stethoscope-medical',
            'the stethoscope',
            'On a hook. Reznik takes it down without looking. He warms the bell on his sleeve before pressing it to the chest.',
            `The chest piece is cold for half a second and then is not. He has done this every working day for thirty years.`
          ),
          atmoRead(
            'height-stick',
            'the height-stick',
            'Marked in centimetres. Andrei stands against it. 178.',
            `He has been 178 since he was twenty-two. He has not grown since.`
          ),
          atmoRead(
            'glass-of-water',
            'the glass of water',
            'On the side table. For the swallowing test. He drinks half on instruction.',
            `It is room-temperature. He swallows on command. Reznik makes a mark.`
          ),
        ],
      },
    },

    'panel-room-1963': {
      id: 'panel-room-1963',
      name: 'The Panel Room',
      exits: [
        { direction: 'west', roomId: 'panel-corridor' },
      ],
      reckoner: {
        entry: `A long room. A long table. Three men behind it — Captain Drozdov in uniform, Comrade Mironov in a civilian suit, Major Reznik returned from the medical room. The room is well-lit. The wall behind the table is bare.

A typed sheet lies on the blotter in front of the chair where Andrei will sit. A pen lies on top of it.`,
        look: `The three men at the table. The long table. The typed sheet on the blotter. The pen. Drozdov's chin. The civilian's notebook. Reznik at the end.`,
        items: [
          {
            id: 'captain-drozdov-panel',
            name: 'Captain Drozdov',
            examine: `He has the chin Andrei has seen at the hangar door at dawn fifteen months ago. He has been promoted twice since. He is not yet Major. He looks Andrei in the face the way a man looks at a form he has filled out before.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Drozdov. Captain, this year. Forty-something. He has the chin. The eyes are the same eyes that watched Kostya cross the tarmac before dawn. He has been watching the room for a long time. He does not introduce himself. He clearly knows Andrei. Andrei clearly knows him.

He waits for Andrei to sit. He waits a beat longer than the room expects.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'drozdov-on-panel')) {
                  return { text: `Already in the journal. The chin from the hangar door, on the panel.` };
                }
                return {
                  text: `You record it. The captain on the panel today is the captain who watched the tarmac in August 1962. He has been promoted to where he can ask the questions.`,
                  effects: [
                    { setFlags: { 'm2.drozdov-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'drozdov-on-panel',
                        label: 'The chin from the hangar door, on the panel',
                        body: `Captain Drozdov on the selection panel, 6 November 1963. Same chin as the junior officer at the hangar door at dawn, 15 August 1962. He has been promoted twice. He will be Major by 1965 (the journal already knows). He looks Andrei in the face the way you look at a form you have filled out before. He waited a beat longer than the room expected before letting him sit.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'drozdov-question',
            name: "Drozdov's question",
            examine: `The captain reads from a small index card. The question is procedural. The cadence is not procedural.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He reads: "You have flown the high-altitude profile three times. Confirm, please, the standard descent rate."

Three short, three short, three short. He spaces the words the way the rhythm spaces. He shows no sign of knowing what he has just done. Or he shows exactly the right amount of nothing.

Andrei answers the question. The numbers are what the numbers are. Drozdov nods. The civilian writes.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'drozdov-cadence')) {
                  return { text: `Already in the journal. The cadence in the room where the cadence does not belong.` };
                }
                return {
                  text: `You record it. The third occurrence of the song. He spoke it without seeming to know. Or he knew, and showed nothing.`,
                  effects: [
                    { setFlags: { 'm2.cadence-noted': true }, },
                    {
                      addJournalEntry: {
                        id: 'drozdov-cadence',
                        label: "The cadence in Drozdov's question",
                        body: `Captain Drozdov's procedural question to Andrei was paced in the rhythm. Three short, three short, three short. The words were innocent — a descent-rate confirmation. The cadence was not. He showed no sign of knowing. He showed exactly the right amount of nothing. He may know the song. He may not. The journal records the third occurrence in a room where the song does not belong.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'comrade-mironov',
            name: 'Comrade Mironov',
            examine: `Civilian. Glasses. Charcoal suit. He has not looked up since Andrei came in. He writes in a notebook the way a stenographer writes — without seeming to register what he is recording.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He writes more than the conversation justifies. He turns the page once when no one is speaking. He does not introduce himself. Drozdov does not name him. Reznik does not name him. The notebook is small and bound in black.`,
              }),
            },
          },
          atmoRead(
            'reznik-at-panel',
            'Major Reznik at the panel',
            'At the far end of the table. The clipboard against his chest. He still does not look up.',
            `He has done his looking-up of the morning. The rest is paperwork.`
          ),
          atmoRead(
            'panel-long-table',
            'the long table',
            'Bare. Three blotters, the typed sheet, the pen. No water. No glasses. The institution does not believe in comfort at these.',
            `The wood is well-polished. Generations of forms have been signed on it.`
          ),
          {
            id: 'acceptance-form',
            name: 'the acceptance form',
            examine: `A single typed sheet on the blotter in front of his chair. KOSMONAUT TRAINING PROGRAMME — ACCEPTANCE. Below the header, in full typewritten capitals: VORONIN, A. — TEST PILOT, RANGE SQUADRON. A blank line for a signature.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The header is centred. The name is centred under it. There is the white space the institution puts between a name and a signature. Andrei reads his name in capitals. He has not seen it in capitals on a form before. The form was typed before the morning began.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'andrei-named')) {
                  return { text: `Already in the journal. His name. The first time I have written it.` };
                }
                return {
                  text: `You record it. You write his name in your own hand, beside the typed line. The journal has him in capitals and in your handwriting at once. You underline the cursive.`,
                  effects: [
                    { setFlags: { 'm2.name-written': true }, },
                    {
                      addJournalEntry: {
                        id: 'andrei-named',
                        label: 'His name. Andrei Voronin.',
                        body: `The acceptance form in the panel room: typewritten in capitals — VORONIN, A. — TEST PILOT, RANGE SQUADRON.

I have known the cosmonaut by face since the first night. I have known him by friend since the second chapter. I have known him by wife and child since this morning. I have not written his name. I am writing it now.

His name is Andrei Voronin. He has had this name all along. I will not stop using it.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'panel-pen',
            name: 'the pen',
            examine: `Black ink. Lying on top of the acceptance form. The cap is off. The nib is dry.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei picks it up. He has not used a fountain pen since the range. The weight is wrong. The institution prefers fountain pens for acceptance.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m2.reznik-noted']) {
                  return { text: `The pen is in your hand. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m2.drozdov-noted'] && !ctx.flags['m2.cadence-noted']) {
                  return { text: `The pen is in your hand. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m2.name-written']) {
                  return { text: `The pen is in your hand. Not yet. There are still things to do here.` };
                }
                return {
                  text: `He signs. The signature is the signature he has had for twenty years. Drozdov takes the form. Drozdov countersigns. Mironov writes in his notebook. Reznik does not look up.

Andrei stands. The room concludes. He walks out without being dismissed. The trance unhooks at the threshold of the door.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm3', targetRoom: 'flat-hallway-real' } },
                  ],
                };
              },
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M3 — The Telegram (reckoner) — afternoon of 7 November 1963
    // ════════════════════════════════════════════════════════════════════════

    'flat-hallway-real': {
      id: 'flat-hallway-real',
      name: 'The Hallway',
      exits: [
        { direction: 'east', roomId: 'flat-kitchen' },
        { direction: 'south', roomId: 'flat-study-real' },
        { direction: 'west', roomId: 'flat-bedroom' },
      ],
      reckoner: {
        entry: `His own hallway. The bulb is fully lit. The coats are three coats on a rack. The telephone is at rest, receiver in cradle. His travel bag is on the floor where he set it down a minute ago.

Yelena's voice from the kitchen: "Andrei?" She has heard the door.`,
        look: `The coat rack. The front door behind him. The telephone. His travel bag. Three doorways — kitchen east, study south, bedroom west.`,
        items: [
          atmoRead(
            'real-coat-rack',
            'the coat rack',
            "Three coats. His, Yelena's, Nina's. The bulb is on. The coats are coats.",
            `He hangs his coat. The wool is heavy. The damp at the shoulders is dry.`
          ),
          atmoRead(
            'real-front-door',
            'the front door',
            'Closed behind him. The latch has been re-fitted recently. Yelena had it done.',
            `He turns the lock. The house is sealed.`
          ),
          atmoRead(
            'real-telephone',
            'the telephone',
            "Black bakelite. At rest. The receiver is in the cradle. It is a telephone.",
            `He looks at it. The dream made it ring. This morning, in the central city, it rang once — wired the result. The day is paper now.`
          ),
          atmoRead(
            'travel-bag',
            'his travel bag',
            'On the floor by the door. Heavy. He has not unpacked.',
            `He will not unpack. He will repack tonight, for the train.`
          ),
        ],
      },
    },

    'flat-kitchen': {
      id: 'flat-kitchen',
      name: 'The Kitchen',
      exits: [
        { direction: 'west', roomId: 'flat-hallway-real' },
      ],
      reckoner: {
        entry: `The small kitchen over the bakery. Yelena at the counter, half a loaf of bread sliced beside her. The kettle on. Nina at the table with a piece of paper and coloured pencils, drawing.

Yelena looks at him for one second and knows. She turns the kettle off.`,
        look: `Yelena at the counter. Nina at the table. The kettle. The framed photograph on the shelf. The wall calendar. The bread.`,
        items: [
          {
            id: 'yelena-kitchen',
            name: 'Yelena',
            examine: `She is at the counter, slicing bread. She does not turn until he is in the room. She looks at his face for one second and knows. She turns the kettle off. She comes and takes his coat.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `She reads it before he says it. She does not ask. She makes tea. She moves the bread plate to the centre of the table. She says, without looking at him: "I'll write to my mother in the morning."

She has been preparing this conversation for weeks. The preparation included not having to have it.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'yelena-read-it')) {
                  return { text: `Already in the journal. Yelena reads it on his face.` };
                }
                return {
                  text: `You record it. The marriage in one examination. He did not say. She did not ask. She made tea.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'yelena-read-it',
                      label: 'Yelena read it on his face',
                      body: `Yelena Voronina, 30, his wife of seven years. She read the acceptance on Andrei's face the moment he came into the kitchen. She did not ask. She turned the kettle off. She moved the bread. She said: "I'll write to my mother in the morning." She has been preparing this conversation for weeks by not having to have it.`,
                    },
                  }],
                };
              },
            },
          },
          {
            id: 'nina-kitchen',
            name: 'Nina',
            examine: `Five years old. Coloured pencils. Folded paper. The small grave attention of a child who is not being watched.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `She is drawing. She does not look up. She is humming, very faintly, the way she hums when she draws. He has heard it before. He does not let himself hear it now.`,
              }),
            },
          },
          {
            id: 'nina-drawing-1963',
            name: "Nina's drawing in progress",
            examine: `A tall man, a smaller man, and a child between them. The tall man is in dark pencil. The child is in red. The smaller man is uncoloured — outline only.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `She has drawn this composition many times. Each time the smaller man has been less coloured-in. Today he is outline only. She has drawn him by habit. She no longer reaches for the blue pencil for his coat. Her hand goes to red for the child and brown for the tall man and then she moves on to the house.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'nina-drawing-uncoloured')) {
                  return { text: `Already in the journal. The smaller man going to outline.` };
                }
                return {
                  text: `You record it. The drawing is being un-coloured by inattention. She has not been told. The drawing has been told.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'nina-drawing-uncoloured',
                      label: 'Nina draws the smaller man in outline',
                      body: `Nina is drawing the same composition I saw on the wall above the Quarters desk in August 1962. Tall man, smaller man, child between. The smaller man is now uncoloured — outline only. She has been drawing him by habit for two years. She does not reach for the blue pencil any more. She has not been told he is gone. The drawing has been told.`,
                    },
                  }],
                };
              },
            },
          },
          atmoRead(
            'kitchen-kettle-3',
            'the kettle',
            'Was on, is off now. Yelena turned it off when he came in. Steam still leaves the spout.',
            `She will turn it back on in a minute. Tea is the next thing.`
          ),
          {
            id: 'wall-calendar-1963',
            name: 'the wall calendar',
            examine: `November 1963. A picture of the polity's mountains for the month. A date is circled in pencil.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The 14th, a Thursday. Circled in Yelena's hand. Seven days from today. The day they will move.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'circled-14-nov')) {
                  return { text: `Already in the journal. The 14th, circled.` };
                }
                return {
                  text: `You record it. The move date. The institution does not give long.`,
                  effects: [
                    { setFlags: { 'm3.calendar-noted': true }, },
                    {
                      addJournalEntry: {
                        id: 'circled-14-nov',
                        label: 'The 14th of November, circled',
                        body: `On the wall calendar in the kitchen. Yelena's hand, in pencil. The 14th of November, a Thursday, circled. Seven days from the day Andrei comes home. The institution gives a week. Yelena had the pencil out before he came home with the news.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'framed-k-lake-photo',
            name: 'a framed photograph',
            examine: `On the shelf above the table. A man in flight gear, late thirties, mid-laugh, by water. The pencil on the back reads "June 1962. The lake." in Yelena's hand.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Yelena keeps it. Andrei has not moved it. He has not looked at it for fifteen months. He does not look at it now. The frame is the kind from the institute town hardware store — cheap, sturdy, dust-coloured. The dust on top of the frame is the dust of the room.`,
              }),
            },
          },
          atmoRead(
            'kitchen-bread',
            'the bread',
            'Half a loaf, sliced. The bakery is downstairs. The smell is in the floorboards.',
            `Yelena slices a fresh piece. She sets it on the plate. Nina ignores it.`
          ),
          atmoRead(
            'kitchen-window-real',
            'the kitchen window',
            'Onto the small street. The leaves are off the tree. Afternoon light.',
            `The neighbour across is at her window. She nods. Yelena nods back without looking.`
          ),
        ],
      },
    },

    'flat-study-real': {
      id: 'flat-study-real',
      name: 'The Study',
      exits: [
        { direction: 'north', roomId: 'flat-hallway-real' },
      ],
      reckoner: {
        entry: `His small study, real this time. The desk is bare except for an opened envelope. The map on the wall is unmarked — no pencilled route. The bookshelf is full.

The telegram has arrived in his absence. Yelena has opened it and set it on the desk.`,
        look: `The telegram on the desk. The unmarked map. The bookshelf. K.'s book on the second shelf. The pen and blotter. The window.`,
        items: [
          {
            id: 'telegram-acceptance',
            name: 'the telegram',
            examine: `A standard form, three lines on a strip of paper glued to a backing card. Yelena has opened it.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `VORONIN A. — FORMAL ACCEPTANCE — REPORT 14 NOV CENTRAL OFFICE — SIGNED.

Three lines. No signature beyond SIGNED. The institution does not need many words once the form has been signed.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'telegram-dry')) {
                  return { text: `Already in the journal. The dry telegram.` };
                }
                return {
                  text: `You record it. The decision arrived on paper before he did.`,
                  effects: [
                    { setFlags: { 'm3.telegram-noted': true }, },
                    {
                      addJournalEntry: {
                        id: 'telegram-dry',
                        label: 'The formal acceptance, by wire',
                        body: `Telegram waiting on the study desk when Andrei comes home. Three lines: VORONIN A. — FORMAL ACCEPTANCE — REPORT 14 NOV CENTRAL OFFICE — SIGNED. The institution gave Yelena the news before it gave him the news in his hand. The decision is dry. The decision is on paper.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'unmarked-map',
            'a map on the wall',
            'A printed map of the polity. Unmarked. He has not pencilled the route. He will not.',
            `The route is in his head. The map will be folded into the trunk tonight.`
          ),
          atmoRead(
            'k-book-on-shelf',
            "Kostya's book",
            'On the second shelf. На Степи. The bookmark is gone — Andrei finished it. He has not written to anyone about finishing it.',
            `He could take it down. He does not. It belongs on the shelf.`
          ),
          decoy(
            'study-pen-blotter',
            'the pen and blotter',
            "His desk pen. The blotter is unmarked. He has not written at this desk in three weeks."
          ),
          atmoRead(
            'study-bookshelf',
            'the bookshelf',
            'Three rows. Engineering manuals, a Tolstoy, two volumes of poems. He has read most of them once. He has read Tolstoy three times.',
            `The poems are Yelena's. He has read them twice.`
          ),
          atmoRead(
            'study-window-real',
            'the window',
            'Onto the small street. The bakery sign is in the corner of the view.',
            `He could open it. He will not. The cold has been in the room.`
          ),
        ],
      },
    },

    'flat-bedroom': {
      id: 'flat-bedroom',
      name: 'The Bedroom',
      exits: [
        { direction: 'east', roomId: 'flat-hallway-real' },
      ],
      reckoner: {
        entry: `The small bedroom. The bed is made. A trunk is open in the middle of the floor — half-packed. The wardrobe doors stand open. Half of Yelena's dresses are folded into the trunk; half are still hanging.

From the kitchen, faintly, through the wall: a child's voice.`,
        look: `The trunk. The bed. The open wardrobe. A small wooden box inside the trunk. The window. Nina's voice through the wall.`,
        items: [
          {
            id: 'packing-trunk',
            name: 'the trunk',
            examine: `Half-packed. Two folded shirts. A coat. Yelena's small wooden box of papers. Half of her wardrobe is here.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He looks at it. Yelena has packed methodically. She has packed for both of them. She has packed in the order of urgency: papers, coats, the kitchen things last. The trunk has six days of use left in it before it is closed for the move.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m3.telegram-noted']) {
                  return { text: `Your hand is on the lid. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m3.calendar-noted']) {
                  return { text: `Your hand is on the lid. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m3.nina-said-his-name']) {
                  return { text: `Your hand is on the lid. Not yet. There are still things to do here.` };
                }
                return {
                  text: `He closes the lid. The latches click in turn — left, right, the small one in the middle. He sits back on his heels. The bedroom lamp is off. The night begins to be its own thing.

He boards the night train at twenty-two hundred.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm4', targetRoom: 'train-compartment' } },
                  ],
                };
              },
            },
          },
          atmoRead(
            'made-bed',
            'the bed',
            "Made. Yelena's habit. The quilt is folded back at one corner because Nina sat there to put on her shoes.",
            `He sits on the edge. The bed gives the way it has given for seven years.`
          ),
          atmoRead(
            'open-wardrobe',
            'the wardrobe',
            "Doors open. Half of Yelena's dresses folded into the trunk. Half still hanging. Two of his uniforms on the right.",
            `She has organised the hanging side by colour. She always has.`
          ),
          {
            id: 'wooden-box-ribbon-envelope',
            name: 'a small wooden box',
            examine: `Inside the trunk. Yelena's papers. The lid is open. A ribbon-tied envelope sits on top of the other papers — a woman's hand, addressed to her, ribbon from the previous summer.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The envelope is addressed *Voronina, Y.* in a hand Andrei does not know. The ribbon is plain white, knotted at the corner. It has been opened — the seal is broken — but the ribbon has been retied.

Yelena has carried it from city to city. She has not told him about it.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'yelena-ribbon-envelope')) {
                  return { text: `Already in the journal. The ribbon-tied envelope.` };
                }
                return {
                  text: `You record it. The envelope she has carried for fifteen months without telling him.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'yelena-ribbon-envelope',
                      label: "A ribbon-tied envelope in Yelena's box",
                      body: `Inside Yelena's wooden box of papers, in the trunk: a ribbon-tied envelope, addressed to her in a woman's hand he does not know. Ribbon is from 1962. Seal is broken; ribbon has been retied. She has carried it from city to city. She has not told him about it. The journal records its existence. The journal does not open it.`,
                    },
                  }],
                };
              },
            },
          },
          atmoRead(
            'bedroom-window-3',
            'the window',
            'Onto the small street. The leaves are off the tree. Afternoon turning toward evening.',
            `He could open it. He will not. There is the cold of the closed city ahead.`
          ),
          {
            id: 'nina-voice-through-wall',
            name: "Nina's voice through the wall",
            examine: `Faint, from the kitchen. He hears it the way a child hears something said about her — by accident, through a wall.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Nina, conversational, not pleading: "Uncle Kostya taught me a new one."

Yelena, sharper than usual: "Eat your bread."

The kitchen moves on. The kitchen has been moving on for fifteen months. The kitchen has not stopped.

Andrei sits very still on the edge of the bed.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'nina-said-his-name')) {
                  return { text: `Already in the journal. Nina said his name today.` };
                }
                return {
                  text: `You record it. The single naming. Andrei did not answer. The room moved on.`,
                  effects: [
                    { setFlags: { 'm3.nina-said-his-name': true }, },
                    {
                      addJournalEntry: {
                        id: 'nina-said-his-name',
                        label: 'Nina said his name today',
                        body: `Through the wall from the kitchen, faintly: "Uncle Kostya taught me a new one." Yelena, sharper than usual: "Eat your bread." The kitchen moved on. Andrei did not answer. He sat very still on the edge of the bed. The kitchen has been moving on for fifteen months. The kitchen has not stopped. Nina is five. She still says his name.`,
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
    // M4 — The Crossing (dreamer) — night of 7 November 1963
    // ════════════════════════════════════════════════════════════════════════

    'train-compartment': {
      id: 'train-compartment',
      name: 'The Compartment',
      exits: [
        { direction: 'east', roomId: 'train-corridor' },
      ],
      dreamer: {
        entry: `A second-class sleeping compartment. Two berths, upper and lower. A small folding table under the window. Frost on the inside of the glass, patterned in a way frost is not patterned.

The train is moving. The upper berth is empty.`,
        look: `The lower berth. The empty upper berth. The folding table — a glass of tea, a folded map, a pencil. The window with its frost pattern. The door to the corridor.`,
        items: [
          atmoRead(
            'lower-berth',
            'the lower berth',
            'He sits on the edge. He has not lain down. The blanket is folded back.',
            `He could lie down. He does not. The night will be the night either way.`
          ),
          atmoRead(
            'upper-berth-empty',
            'the upper berth',
            "Empty. The other ticket was for Yelena. She is on a later train with Nina — on the 14th.",
            `He has not been alone overnight in seven years. He is alone now.`
          ),
          atmoRead(
            'compartment-tea-glass',
            'a glass of tea',
            'On the folding table. Cooling. The conductor brought it without asking.',
            `He drinks half. The steel holder is cold. The tea is the tea.`
          ),
          {
            id: 'folded-map-train',
            name: 'a folded map',
            examine: `On the table. He pencilled the route at the station before boarding. The line goes east and stops at the boundary. The closed city is not on the printed map.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The pencil is sharp. The line is firm to the boundary. Past the boundary the map is blank — not faded, not absent, blank. The closed city is not printed where the closed city is. He has drawn the route as far as the institution allows him to know it.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'route-to-the-boundary')) {
                  return { text: `Already in the journal. The route to the boundary.` };
                }
                return {
                  text: `You record it. The map ends where the institution begins.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'route-to-the-boundary',
                      label: 'The route ends at the boundary',
                      body: `On the folded map on the train table: Andrei has pencilled the route east. The line ends at the boundary of the closed-territory blank. The map is blank past it — not faded, not absent, blank. He has drawn the route as far as the institution allows him to know it. The dream from M1 had the route already drawn in by someone else, going further. The waking map ends where it must.`,
                    },
                  }],
                };
              },
            },
          },
          {
            id: 'window-frost-pattern',
            name: 'the window',
            examine: `Frost on the inside. The pattern is exact: a swallow in profile, wings folded back, three short lines beneath.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He puts a fingertip to the glass. The cold is glass-cold. The pattern does not melt where he touches it. The pattern is in the frost, not on it.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'frost-bird-train')) {
                  return { text: `Already in the journal. The pattern in the frost.` };
                }
                return {
                  text: `You record it. The motif again. In the frost this time.`,
                  effects: [
                    { setFlags: { 'm4.frost-noted': true }, },
                    {
                      addJournalEntry: {
                        id: 'frost-bird-train',
                        label: 'The swallow and three lines in the train-window frost',
                        body: `On the inside of the compartment window, formed in the frost: a swallow in profile, three short lines beneath. The pattern does not melt where the fingertip touches it. The pattern is in the frost, not on it. Konstantin's motif again, in a dream where he is not on stage. The dream keeps the icon where the man is missing.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'compartment-pencil',
            'the pencil',
            'On the table beside the map. Sharp. The same kind he uses at home.',
            `He turns it in his fingers. The lead is soft for marking maps.`
          ),
          decoy(
            'compartment-door-inside',
            'the door',
            'To the corridor. The handle is brass. The handle works.'
          ),
        ],
      },
    },

    'train-corridor': {
      id: 'train-corridor',
      name: 'The Corridor',
      exits: [
        { direction: 'west', roomId: 'train-compartment' },
        { direction: 'north', roomId: 'the-platform-dream' },
      ],
      dreamer: {
        entry: `The corridor outside the compartment. Long, narrow, swaying. Lights flickering at the carriage joins. A few sleeping bodies behind closed compartment doors. A conductor folded into a jump-seat at the far end, dreaming.

A figure at the far end of the corridor, his back to Andrei, walking away.`,
        look: `The corridor. The figure at the far end. The sleeping conductor. A small enamel pin on the floor. The carriage join, north.`,
        items: [
          {
            id: 'figure-at-far-end',
            name: 'a figure at the far end',
            examine: `A man's back. He is walking away from Andrei, unhurried. The gait is the gait. The set of the shoulders is the set of the shoulders.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei stands still in the corridor. The figure does not turn. The figure does not change his pace. The figure passes through the carriage join and the door swings closed behind him.

The dream will not let him turn.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'kostya-glimpsed-back')) {
                  return { text: `Already in the journal. The back at the far end.` };
                }
                return {
                  text: `You record it. The dream allowed Andrei a back. The dream did not allow a face.`,
                  effects: [
                    { setFlags: { 'm4.kostya-glimpsed': true }, },
                    {
                      addJournalEntry: {
                        id: 'kostya-glimpsed-back',
                        label: 'A man\'s back at the far end of the corridor',
                        body: `In the dream-train corridor: a man's back, walking away from Andrei, unhurried. The gait is Kostya's. The set of the shoulders is the set of the shoulders. He did not turn. The dream did not let him turn. He passed through the carriage join and the door swung closed behind him. First appearance of Kostya since the empty cockpit in August 1962. He is in the dream. He is not yet allowed a face.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'sleeping-conductor-train',
            'a sleeping conductor',
            'In a folded jump-seat at the carriage join. His head is on his chest. His hand rests on a ticket-puncher.',
            `He is dreaming. The dream knows he is.`
          ),
          atmoRead(
            'carriage-join',
            'the carriage join',
            'Cold air between two cars. The metal plate rattles. The door past it swings on its own.',
            `The cold is the cold of the steppe at night.`
          ),
          atmoRead(
            'enamel-pin-floor',
            'an enamel pin',
            'On the floor of the corridor. Dark blue. A swallow in profile, three short lines beneath. Andrei does not pick it up.',
            `The dream will not let him pick it up. The pin stays on the floor where it has been waiting.`
          ),
          decoy(
            'compartment-doors-closed',
            'closed compartment doors',
            'A few of them. The numbers are in brass. The doors do not open.'
          ),
        ],
      },
    },

    'the-platform-dream': {
      id: 'the-platform-dream',
      name: 'The Platform',
      exits: [
        { direction: 'south', roomId: 'train-corridor' },
      ],
      dreamer: {
        entry: `A platform at night. Snow underfoot. Sodium lights overhead. The train at rest beside him. His breath in the cold. A station Andrei has not yet been to in waking.

The signs above the platform are unreadable — the letters dissolve when looked at directly. A conductor on the platform has just spoken his name and turned away.`,
        look: `The snow on the platform. The sodium lights. The unreadable platform sign. The conductor walking away. The cold. The train door behind him, corridor light spilling onto the snow.`,
        items: [
          atmoRead(
            'platform-snow',
            'the snow on the platform',
            "Underfoot. Crunches under his boots. Deeper than any cold he has stood in.",
            `He looks at his bootprints. They are deep. He has not been here before.`
          ),
          {
            id: 'unreadable-sign',
            name: 'the platform sign',
            examine: `Above the platform on a board. The letters refuse to resolve when looked at directly. In the corner of the eye they almost form a name. Looked at straight, they dissolve.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He tries to read it. He cannot. The dream redacts. The closed city does not get to name itself in dream.`,
              }),
            },
          },
          atmoRead(
            'platform-conductor',
            'the conductor',
            "On the platform. He has spoken Andrei's name — Voronin, A. — and turned away. He is walking down the platform.",
            `He does not look back. He is the institution's voice on the platform.`
          ),
          atmoRead(
            'platform-cold',
            'the cold',
            'Deeper than the institute city. Deeper than the central city. The kind of cold that goes into the bones in seconds.',
            `He pulls his coat tight. The cold is not impressed.`
          ),
          atmoRead(
            'platform-sodium-lights',
            'the sodium lights',
            'Yellow-orange. The snow under them is yellow-orange. The breath under them is yellow-orange.',
            `The light does not reach the dark past the platform. The dark past the platform is the closed city.`
          ),
          {
            id: 'train-door-platform',
            name: 'the train door',
            examine: `Behind him. Open. The corridor light spills out onto the snow at his feet.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The corridor is warm where the platform is not. He can step back. He can step forward. The dream is waiting to see which.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m4.frost-noted']) {
                  return { text: `Your hand is on the door. Not yet. The dream is not finished with you yet.` };
                }
                if (!ctx.flags['m4.kostya-glimpsed']) {
                  return { text: `Your hand is on the door. Not yet. The dream is not finished with you yet.` };
                }
                return {
                  text: `He steps back from the platform. The platform sign refuses to resolve. The corridor light spills onto the snow behind him. The dream cuts before the closed city resolves.

The dream lets him go in pieces.`,
                  effects: [
                    { advanceToMovement: { movementId: 'coda', targetRoom: 'tomas-desk-coda-3' } },
                  ],
                };
              },
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // CODA — Tomás's flat, late afternoon of the same day
    // ════════════════════════════════════════════════════════════════════════

    'tomas-desk-coda-3': {
      id: 'tomas-desk-coda-3',
      name: 'Your Desk',
      exits: [
        { direction: 'east', roomId: 'tomas-kitchen-coda-3' },
      ],
      neutral: {
        entry: `Your desk. The afternoon has become late afternoon. You have been writing in the journal for hours without registering them. The German paragraph is finished — and the page has two more sentences than you typed.

The radiator clanks. The kitchen radio is on low, somewhere east.`,
        look: `The journal, full of November 1963. The typewriter, with the German paragraph finished — and one extra sentence. The window onto the courtyard. The kitchen east.`,
        items: [
          {
            id: 'journal-coda-3',
            name: 'your journal',
            examine: `Full of 5–7 November 1963. The name VORONIN, A. is on a page near the front; you have underlined it twice and written *Andrei Voronin* beside it in cursive.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You read back. The wait, the panel, the kitchen, the train. Three chapters in. His name. Andrei. The cosmonaut has been a man with a face since the first night. He has been a man with a friend since the second chapter. He has been a man with a wife and a daughter since today. He has a name now.

You underline the cursive a third time. You write the name in capitals beside it: VORONIN, A. You write the name in cursive beneath: Andrei Voronin.`,
              }),
            },
          },
          {
            id: 'typewriter-coda-3',
            name: 'the typewriter',
            examine: `The Olivetti. The German paragraph is finished. There is one extra sentence after it that you do not remember typing.`,
            actions: ['examine', 'note', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['coda.typewriter-examined']) {
                  return { text: `The extra sentence is still on the page. Your hand still recognises typing it.` };
                }
                return {
                  text: `You read the page. The German paragraph closes the scene as it should. The next sentence on the page is in your typewritten English. It reads:

"He had not slept the night before he crossed."

The novel does not have this sentence. The novel is not in English. The man who has not slept is not the man in the novel. You typed it. Your fingers remember.`,
                  effects: [{ setFlags: { 'coda.typewriter-examined': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['coda.typewriter-examined']) {
                  return { text: `You have not yet read what you typed. There are still things to do here.` };
                }
                if (ctx.journal.some(j => j.id === 'stranger-line')) {
                  return { text: `Already in the journal. The line that does not belong.` };
                }
                return {
                  text: `You write it down. The first sentence the dreaming has typed through you in waking. The keys remember what you do not. You will keep this.`,
                  effects: [
                    { setFlags: { 'coda.stranger-line-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'stranger-line',
                        label: 'A sentence I did not write',
                        body: `On the Olivetti, after the finished German paragraph, in my own typewritten English:

"He had not slept the night before he crossed."

The novel does not contain this sentence. The novel is not in English. My fingers remember typing it; my mind does not. The dreaming wrote through me in waking. The work and the dreaming have begun to overlap. I do not know what this means. I will keep the page.`,
                      },
                    },
                  ],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['coda.stranger-line-noted']) {
                  return { text: `Your fingers are on the keys. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['coda.reflection-seen']) {
                  return { text: `Your fingers are on the keys. Not yet. There are still things to do here.` };
                }
                return {
                  text: `You type one more sentence, this time in your own deliberate voice, after the stranger-sentence and your own hand's space:

"His name is Andrei. I will write it again tomorrow."

You strike the period. You take the page out of the carriage. You fold it into the journal between two pages of November 1963.

The radiator clanks. The kitchen radio is low and is not the song. The window opposite is unlit and the leaves are off the tree. His name is Andrei. You will write it again tomorrow.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'name-commitment',
                        label: 'His name is Andrei. I will write it again tomorrow.',
                        body: `Final entry of the day. I have typed his name on the Olivetti deliberately, after the stranger-line, in my own voice: "His name is Andrei. I will write it again tomorrow." I have folded the page into the journal. I have stopped calling him "him." The cosmonaut has a name in my own handwriting and in the typewritten page at once. I will not stop using it.`,
                      },
                    },
                    { setFlags: { 'sp03.complete': true } },
                    { complete: true },
                  ],
                };
              },
            },
          },
          {
            id: 'coda-window-3',
            name: 'the window',
            examine: `The courtyard, late afternoon. The unlit window opposite, still unlit. The leafless tree. Your reflection in the darkening glass.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['coda.reflection-seen']) {
                  return { text: `The window is the window. The reflection is your reflection. The room behind you is your room.` };
                }
                return {
                  text: `You look at your reflection. For one beat, the glass is a different glass — frost on the inside of it, a swallow in profile, three short lines beneath. Then the frost is gone and the reflection is your face and the room behind you is your room.

The courtyard is empty. The leafless tree is leafless.`,
                  effects: [{ setFlags: { 'coda.reflection-seen': true } }],
                };
              },
            },
          },
          atmoRead(
            'german-novel-coda-3',
            'the German novel',
            'Face-down still. The translation will keep until tomorrow.',
            `You will not pick it up. The sentence you finished is enough.`
          ),
        ],
      },
    },

    'tomas-kitchen-coda-3': {
      id: 'tomas-kitchen-coda-3',
      name: 'Your Kitchen',
      exits: [
        { direction: 'west', roomId: 'tomas-desk-coda-3' },
      ],
      neutral: {
        entry: `Your kitchen. The radiator is on. The kettle is warm — you boiled water at some point and made tea without registering it. The radio is on low, a piece of music that is not the song.

The table is empty. You have not eaten since morning.`,
        look: `The warm radiator. The kettle. The low radio. The kitchen window. The empty table.`,
        items: [
          atmoRead(
            'radiator-coda-3',
            'the radiator',
            'Hot. The building kept the heat through the day.',
            `You put a hand on it. You take it off. It is hot.`
          ),
          atmoRead(
            'kettle-coda-3',
            'the kettle',
            "Warm. You made tea at some point. There is a cup on the counter, half-drunk.",
            `The tea is cool. You will drink the last of it.`
          ),
          atmoRead(
            'kitchen-radio-coda-3',
            'the radio',
            'On low. A piece of music — not the song. The rhythm is not in it.',
            `You let it play. It is a piece you do not know. It is not the song.`
          ),
          atmoRead(
            'kitchen-window-coda-3',
            'the kitchen window',
            'Onto the courtyard. The unlit window opposite. The leafless tree.',
            `Same view as the desk window. The courtyard is empty.`
          ),
          atmoRead(
            'kitchen-table-coda-3',
            'the kitchen table',
            'Empty. You have not eaten. You will, after you have written the last sentence.',
            `You will not eat here yet. You will go back to the desk.`
          ),
        ],
      },
    },

  },

  triggers: [],
};
