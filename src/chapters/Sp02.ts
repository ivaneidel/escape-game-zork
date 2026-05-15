import type { Chapter, ActionContext, Item } from '../types';

// SP Chapter 2 — The Range.
// Tomás's trance pulls him back to 14–15 August 1962 — a parallel-Soviet
// flight-test range in the southern steppe. Andrei is still a test pilot.
// Konstantin Pavlovich (K. from Ch01) is alive, on stage. The chapter is the
// source moment of the "K., 1962" photograph and a quiet plant of the K.
// mystery. Movement order: R, D, R, D. See chapters/season-1/chapter-02/sp.md.

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

export const Sp02: Chapter = {
  id: 'sp02',
  title: 'The Range',
  contentVersion: 1,
  actionSet: ['look', 'open', 'examine', 'use', 'note'],
  starts: {
    dreamer: 'tomas-desk-morning',
    reckoner: 'tomas-desk-morning',
  },
  cast: {
    protagonist: 'Tomás',
    cosmonaut: 'Andrei',
    friend: 'Konstantin',
    wife: 'Yelena',
    daughter: 'Nina',
    superior: 'Drozdov',
    surgeon: 'Reznik',
    sister: 'Maria',
  },
  usesJournal: true,

  prologue: `You did not sleep.

You have been reading back the journal since the lamp went off. Six new pages, three rhythms underlined twice. The window outside is grey. A morning that started without you noticing it had.

Maria has written. The letter is unopened on the mail pile. Yesterday's coffee is still on the desk.

You sit down. The journal is open on your lap. You wait, this time. The dream does not arrive at night any more.`,

  epilogue: `You have folded Maria's letter into the journal between two pages of August 1962.

The radio is silent. The window opposite is grey. A man in flight gear who is not you was at your shoulder for a moment, in the glass. He is not there now.

You do not know who he is. You know more than you did.`,

  completionFlag: 'sp02.complete',

  movements: [
    {
      id: 'prologue',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-morning', 'tomas-balcony'],
      transitionOut: `You open the journal on your lap. The page is warm where your hand was. The page is warm where it should not be warm. The desk is no longer your desk.`,
    },
    {
      id: 'm1',
      title: 'The Quarters',
      mode: 'reckoner',
      rooms: ['andrei-quarters-1962', 'mess-hall-morning', 'flight-prep-room'],
      transitionIn: `A different desk under your hand. Concrete walls. Sun off a steppe through a small window. The smell of preserved cabbage somewhere down a corridor. A flight schedule on the wall, in Cyrillic, in someone's careful hand.`,
      transitionOut: `Your hand on the helmet is your hand again. Your feet are on tarmac. The light is wide. The trance unhooks. The sky takes over.`,
    },
    {
      id: 'm2',
      title: 'The Flight',
      mode: 'dreamer',
      rooms: ['cockpit-1962', 'the-altitude'],
      transitionIn: `Already at altitude. The cockpit is small. The breathing is yours and is not. The horizon is too long.`,
      transitionOut: `You bring the throttle back. The aircraft drops with you. Somewhere the day is ending without your having seen it. The dream tilts to evening.`,
    },
    {
      id: 'm3',
      title: 'The Mess',
      mode: 'reckoner',
      rooms: ['mess-hall-evening', 'andrei-bunk-night'],
      transitionIn: `Electric light. A long table. A room of men in shirtsleeves. Konstantin is on his feet at the head of the table, glass in hand. He has not seen you come in.`,
      transitionOut: `You close the book. You slide the bookmark to page seventy-four. You put it under the pillow. You turn the lamp off. The dawn comes very soon.`,
    },
    {
      id: 'm4',
      title: 'Strela-3',
      mode: 'dreamer',
      rooms: ['k-flight-prep-1962', 'tarmac-dawn-1962', 'the-empty-cockpit'],
      transitionIn: `Pre-dawn. A flight-prep room you have already been in, but you are not in it. Konstantin is. He is fastening the inner harness without watching his hands.`,
      transitionOut: `Your hand on the radio gets static. A single fragment of voice — "— back —" — and static again. The dream lets you go in pieces.`,
    },
    {
      id: 'coda',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk-coda-2', 'tomas-kitchen-coda-2'],
      transitionIn: `You come back to yourself at your desk. The light is evening light. The journal in front of you is full. Your hand is cramped. You stand up.`,
    },
  ],

  rooms: {

    // ════════════════════════════════════════════════════════════════════════
    // PROLOGUE — Tomás's flat, morning after Ch01
    // ════════════════════════════════════════════════════════════════════════

    'tomas-desk-morning': {
      id: 'tomas-desk-morning',
      name: 'Your Desk',
      exits: [
        { direction: 'east', roomId: 'tomas-balcony' },
      ],
      neutral: {
        entry: `Morning. The lamp is off. The light through the window is grey-blue and uncertain. The journal is open on the desk where you left it last night.

You have not slept. The pages from yesterday lie under your hand. Three rhythms underlined. The same three beats in three places.

You sit. You wait.`,
        look: `Your desk. The open journal. The typewriter with the same German paragraph. Yesterday's coffee. The mail pile, untouched. The balcony, east.

The flat is silent. You are listening for the dream to begin.`,
        items: [
          {
            id: 'journal-2-prologue',
            name: 'your journal',
            examine: `Open to last night's last page. The rhythms are underlined twice. Your hand was steady when you did it.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['p2.journal-examined']) {
                  return {
                    text: `The same three beats. Nina, the briefing, the masked envelope. The page is warm under your hand.`,
                  };
                }
                return {
                  text: `You read it back. The rhythm Nina was singing. The rhythm Drozdov masked in the envelope. The rhythm Drozdov read aloud as a callsign. Three places, the same three beats. You wrote it down last night. You see it now in daylight.

The page is warm under your hand.`,
                  effects: [{ setFlags: { 'p2.journal-examined': true } }],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['p2.journal-examined']) {
                  return { text: `You have not read it back yet. There are still things to do here.` };
                }
                return {
                  text: `You open the journal on your lap. You close your eyes. You wait.

The page is warm under your hand. The page is warm where it should not be warm.

The desk is no longer your desk.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm1', targetRoom: 'andrei-quarters-1962' } },
                  ],
                };
              },
              note: () => ({
                text: `There is nothing new to write yet. The next page is waiting.`,
              }),
            },
          },
          atmoRead(
            'typewriter-2-prologue',
            'the typewriter',
            'The same Olivetti. The same page. The German paragraph has not moved since yesterday.',
            `The man is still returning to the house. The sentence after the sentence is still the problem.`
          ),
          atmoRead(
            'coffee-cup-2-prologue',
            'the coffee cup',
            'Yesterday\'s. Cold. The ring of grounds at the bottom is dry.',
            `You will not drink it. You will not pour it out either.`
          ),
          atmoRead(
            'german-novel-2',
            'the German novel',
            'Face-down where you left it. The cracked spine has cracked further.',
            `You do not pick it up. The translation can wait. The translation has been waiting.`
          ),
          {
            id: 'maria-letter-prologue',
            name: 'a letter from Maria',
            examine: `On top of the mail pile. Your sister's hand. The stamp is from yesterday. You have not opened it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You look at the envelope. You do not open it yet. There will be time.`,
              }),
            },
          },
          decoy(
            'pencil-prologue-2',
            'a pencil',
            'The tip is worn flat. You used it for the underlining.'
          ),
          atmoRead(
            'radio-2-prologue',
            'the radio',
            'Silent. The station from last night is gone. The dial is on a frequency you did not tune.',
            `You do not turn it on. The silence is what you need.`
          ),
          atmoRead(
            'courtyard-window-2-prologue',
            'the courtyard window',
            'The lit window opposite is dark. The curtain is open. No one is there.',
            `Whoever lives there is asleep, or away, or never was there. You stop looking.`
          ),
        ],
      },
    },

    'tomas-balcony': {
      id: 'tomas-balcony',
      name: 'The Balcony',
      exits: [
        { direction: 'west', roomId: 'tomas-desk-morning' },
      ],
      neutral: {
        entry: `A narrow balcony off the kitchen. The Adriatic light is the wrong shade. The morning has a smell that you recognise without naming.

The flat is behind you. The journal is on the desk. You came out for air. The air is not what you came for.`,
        look: `The courtyard, four floors down. A dead plant in a pot. A clothesline, empty. A cat on a parapet. The cold morning sea-smell.

The desk is west.`,
        items: [
          atmoRead(
            'courtyard-below',
            'the courtyard',
            'Four floors down. Cobbled. One bicycle leaning against a wall. No one has moved through it yet.',
            `You watch it for a moment. Nothing happens. You are aware of how long it has been since you watched anything happen.`
          ),
          atmoRead(
            'dead-flowerpot',
            'a flowerpot',
            'On the parapet. Whatever was in it died in July. You have not changed the soil.',
            `It is a small failure. It is a small failure you can correct. You will not correct it today.`
          ),
          decoy(
            'clothesline-balcony',
            'a clothesline',
            'Empty. The pegs are still there.'
          ),
          atmoRead(
            'neighbour-cat',
            'a cat',
            "Sitting on the parapet across the courtyard. Looking at you. You don't know whose.",
            `It does not look away. After a moment, it does. You go in.`
          ),
          atmoRead(
            'sea-smell',
            'the morning air',
            'Cold off the Adriatic. The same air you have breathed for eleven autumns.',
            `It has not changed. You have. You are not sure when.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M1 — The Quarters (reckoner) — 14 August 1962, late morning
    // ════════════════════════════════════════════════════════════════════════

    'andrei-quarters-1962': {
      id: 'andrei-quarters-1962',
      name: "Andrei's Quarters",
      exits: [
        { direction: 'south', roomId: 'mess-hall-morning' },
      ],
      reckoner: {
        entry: `A small room. A bunk, a footlocker, a desk under the window. The window onto the airfield. Late morning. The smell of warm concrete and aviation fuel.

His hand picks up a pen and puts it down again. The half-written letter on the desk is to his wife. The third paragraph stops mid-sentence.

The mess is south.`,
        look: `The bunk. The footlocker. The desk under the window. The half-written letter. Nina's drawing taped above the desk. A photograph of Yelena and Nina, frameless. A borrowed paperback on the bunk. A coat on the chair. The flight schedule pinned to the wall.

The mess is south.`,
        items: [
          {
            id: 'flight-schedule-1962',
            name: 'the flight schedule',
            examine: `Today\'s sheet, pinned to the wall in Cyrillic. Two flights are typed in full — no redactions, no codenames yet.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m1.schedule-read']) {
                  return { text: `Voronin, 13:00, Strela-7. Pavlovich, K., 06:00 tomorrow, Strela-3. Two names, written in full.` };
                }
                return {
                  text: `You read it the way Andrei reads it — by hand, line by line.

13:00 today: VORONIN, A. — Strela-7 — high-altitude profile.
06:00 tomorrow: PAVLOVICH, K. — Strela-3 — endurance profile.

His own name in full, not redacted. Not yet. The codenames are still openly written.`,
                  effects: [{ setFlags: { 'm1.schedule-read': true } }],
                };
              },
            },
          },
          {
            id: 'half-written-letter',
            name: 'a half-written letter',
            examine: `Three paragraphs in Andrei\'s hand, addressed to Yelena. The first two are about weather and a book Nina liked. The third stops mid-sentence.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei reads back what he has written. The third paragraph ends: "Kostya has been —"

The pen stopped there. He has not picked it up since.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'andrei-unfinished-letter')) {
                  return { text: `Already in the journal. The unfinished sentence about Kostya.` };
                }
                return {
                  text: `You write down what he has not written. "Kostya has been —" and then the pen stopped.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'andrei-unfinished-letter',
                      label: 'Kostya has been —',
                      body: `Andrei was writing to Yelena about Kostya. The third paragraph stops mid-sentence: "Kostya has been —". The pen lay where he set it down. Whatever he was about to write, he did not.`,
                    },
                  }],
                };
              },
            },
          },
          {
            id: 'nina-drawing-1962',
            name: "Nina's drawing",
            examine: `A child's drawing, taped above the desk. Crayon on a folded page from a school exercise book. Nina is four.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `A small house. A tall man. A smaller man. A child between them. The same composition as the drawing on the kitchen wall in 1965. Two years younger. The smaller man is not labelled. The child has Nina's face.`,
              }),
            },
          },
          atmoRead(
            'yelena-photo-1962',
            'a photograph',
            'Frameless, propped against the inkstand. Yelena and Nina, the previous summer. Yelena\'s hair is shorter than it will be in 1965.',
            `Andrei looks at it for a moment. He does not pick it up. He has been looking at it long enough that it is no longer information.`
          ),
          {
            id: 'borrowed-paperback-quarters',
            name: "a borrowed paperback",
            examine: `On the bunk. The spine reads "На Степи" — On the Steppe. A small 1950s Soviet edition. A bookmark protrudes at page 73. It is not Andrei\'s book. Kostya lent it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He picks it up, looks at the bookmark, puts it down. He has not opened it past the bookmark. He intends to. The bookmark is a torn corner from a different book, in K.'s hand: a small triangle of paper.`,
              }),
            },
          },
          atmoRead(
            'coat-on-chair-quarters',
            "a coat on the chair",
            "Andrei's flight coat, on the back of the chair. It smells of the airfield.",
            `He shrugs it on without thinking. Then takes it off again. It is not yet time.`
          ),
          {
            id: 'footlocker-quarters',
            name: 'the footlocker',
            examine: `A grey-green metal locker at the foot of the bunk. Closed.`,
            actions: ['examine', 'open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `The lock is undone. He has not bothered with it in months.` }),
              open: () => ({
                text: `Inside: a pressure-suit liner folded with care. A pair of polished boots he hardly wears. A spare notebook, blank. A pencil. Nothing surprising.`,
              }),
            },
          },
          atmoRead(
            'window-airfield-quarters',
            'the window onto the airfield',
            'A Strela aircraft is being towed along the apron. Two ground crew with a tractor. The morning is bright.',
            `He watches it without thinking. The aircraft is not his.`
          ),
        ],
      },
    },

    'mess-hall-morning': {
      id: 'mess-hall-morning',
      name: 'The Mess Hall',
      exits: [
        { direction: 'north', roomId: 'andrei-quarters-1962' },
        { direction: 'west', roomId: 'flight-prep-room' },
      ],
      reckoner: {
        entry: `The officers' mess at eleven in the morning. The breakfast rush is over. Two tables of pilots remain. Konstantin is at the nearer one, hand on his cheek, reading.

The room smells of coffee and preserved cabbage. The bulletin board by the door has a fresh notice pinned.`,
        look: `Konstantin and three other pilots at the nearer table. The samovar in the corner. The bulletin board. The window onto the airfield. The corridor door.

Konstantin's notebook is open beside his cup. Quarters are north. The flight-prep room is west.`,
        items: [
          {
            id: 'konstantin-morning',
            name: 'Konstantin',
            examine: `At the next table, hand on his cheek, reading. He looks up when he feels you looking, lifts his coffee, sets it down.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Konstantin Pavlovich. Thirty-two. Test pilot, two grades senior to most of the room, the kind of senior that does not announce itself. He has the gift of paying attention to one thing thoroughly. He is reading.

He notices Andrei without lifting his head. He smiles half a smile and goes back to the page.`,
              }),
            },
          },
          {
            id: 'k-notebook',
            name: "Konstantin's notebook",
            examine: `Small, leather-bound, soft from being carried. Open beside his cup. The left page has a list of altitudes; the right page has a sketch.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m1.bird-noted']) {
                  return { text: `The sketch is the same as before. A swallow with three lines beneath. His mark.` };
                }
                return {
                  text: `The sketch is small and precise. A swallow in profile, wings folded back, three short lines beneath suggesting speed or distance. It is not a doodle. It is a signature. Kostya drew it slowly.`,
                };
              },
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'k-bird-motif')) {
                  return { text: `Already in the journal. The bird with three lines.` };
                }
                return {
                  text: `You record it. A swallow in profile. Three lines beneath. The same shape, somehow, as the sticker on the panel in the dream I had the night before this morning.`,
                  effects: [
                    { setFlags: { 'm1.bird-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'k-bird-motif',
                        label: 'A swallow with three lines',
                        body: `Konstantin's motif. He sketched it in his notebook at breakfast. He has the same enamel pin on the strap of his flight helmet. The shape is the same as the sticker on the dream-capsule panel in 1965. The bird is his.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'k-coffee-cup',
            "Konstantin's coffee cup",
            "Standard issue, white with a chipped rim. Half empty, half cold.",
            `He has not drunk from it in fifteen minutes. He is reading more than he is drinking.`
          ),
          atmoRead(
            'yevgenny-mess',
            'Yevgenny',
            'A pilot at the next table. Second wave. Sharp-edged face, a fresh haircut.',
            `He is not reading. He is watching the room. He notices Andrei and nods once.`
          ),
          atmoRead(
            'mikhail-mess',
            'Mikhail',
            'A pilot at the next table. Reading the newspaper through breakfast, every morning, for as long as Andrei has known him.',
            `He has read past the headlines and is now on the small column on the back page. He has not looked up.`
          ),
          atmoRead(
            'pyotr-mess',
            'Pyotr',
            'A pilot at the next table. Never finishes his food.',
            `The eggs on his plate are cold. He is talking to no one in particular about a flight he had last week.`
          ),
          atmoRead(
            'canteen-radio',
            'the canteen radio',
            'On a shelf above the samovar. Tinny, far away. A march, then a weather report, then a march again.',
            `The same broadcast that plays every morning. Nobody listens. Nobody turns it off.`
          ),
          {
            id: 'bulletin-board-morning',
            name: 'the bulletin board',
            examine: `Pinned: today's schedule, range advisories, a list of orders. A small printed card has been pinned freshly, near the top.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Pinned at the top, in three lines on a small printed card:

    Discipline.
    Discretion.
    Distance.

The same three words from the briefing-room poster in 1965. An earlier card. The same hand of the same authority.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'three-words-1962')) {
                  return { text: `Already in the journal. The slogan is older than I thought.` };
                }
                return {
                  text: `You record it. The same three words I noted in 1965, pinned on a bulletin board three years earlier. It is older than the briefing room. It is older than the closed city.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'three-words-1962',
                      label: 'Discipline. Discretion. Distance — earlier.',
                      body: `Pinned on the bulletin board in the officers' mess at the range, 14 August 1962. The same three words I noted in the briefing anteroom in 1965. The slogan is older than the closed city. It belongs to the institution, not to one programme.`,
                    },
                  }],
                };
              },
            },
          },
          atmoRead(
            'samovar-mess-morning',
            'the samovar',
            'In the corner. Tarnished brass. The same shape as the one in the briefing room in 1965.',
            `Andrei does not look at it twice. You do.`
          ),
          atmoRead(
            'mess-window-morning',
            'the window onto the airfield',
            'The aircraft is still being towed. The wind sock is limp.',
            `The day is wide.`
          ),
        ],
      },
    },

    'flight-prep-room': {
      id: 'flight-prep-room',
      name: 'Flight Prep',
      exits: [
        { direction: 'east', roomId: 'mess-hall-morning' },
      ],
      reckoner: {
        entry: `A long narrow room. Pressure suits on a rack. Helmets on hooks. A bench. The flight surgeon\'s clipboard hung on a nail by the door.

Andrei\'s helmet is on the rack beside Konstantin\'s. The two helmets are mirrored.`,
        look: `The clipboard on the wall. Andrei's helmet on the rack. Konstantin's helmet beside it, with the small pin on the strap. The pressure-suit rack. The bench. The equipment log.

The mess is east.`,
        items: [
          {
            id: 'reznik-clipboard-m1',
            name: "Reznik's clipboard",
            examine: `The flight surgeon\'s daily clearance log. Pencilled annotations in the margins. Hung on a nail.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei's clearance for today is signed off cleanly. Pavlovich, K. — cleared for 06:00 tomorrow.

In the right margin, against Pavlovich's line, a small mark in pencil. A circle around a numeric value in the heart-rate-resting column. The slope of the circle, the pressure of the lead — the same hand that pencilled the margin annotation on Andrei's medical-fitness report in 1965.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'reznik-hand')) {
                  return { text: `Already in the journal. Reznik's hand on Kostya's clearance.` };
                }
                return {
                  text: `You write it down. Reznik's hand. The same pencil-slope. The same small circle around a value. He marked it on Kostya in 1962. He will mark it on Andrei in 1965.`,
                  effects: [
                    { setFlags: { 'm1.surgeon-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'reznik-hand',
                        label: "The flight surgeon's hand",
                        body: `Major Reznik annotates clearances with a small pencilled circle around a numeric value. The same mark appears on Konstantin Pavlovich's pre-flight clearance, 14 August 1962, and on Andrei Voronin's medical-fitness report, 1965. The hand is the same. The mark survives across three years.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'andrei-helmet-rack',
            "Andrei's helmet on the rack",
            "On a hook. Visor scratched on the left. The strap has a small mark where his fingers settle.",
            `He looks at it. He does not yet pick it up.`
          ),
          {
            id: 'k-helmet-rack',
            name: "Konstantin's helmet",
            examine: `On the hook beside Andrei\'s. The strap carries a small enamel pin: a swallow in profile, three short lines beneath. K.\'s mark.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei lifts the strap and turns the pin in the light. Enamel, dark blue, polished by Kostya's thumb. The same shape as the sketch in the notebook in the mess.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'k-bird-motif')) {
                  return {
                    text: `The pin matches the sketch. The journal already knows.`,
                    effects: [{ setFlags: { 'm1.bird-noted': true } }],
                  };
                }
                return {
                  text: `You record it. The pin on Kostya\'s helmet strap. A swallow with three lines beneath. The same shape as the sketch in his notebook. The same shape as the sticker on the dream-capsule panel in 1965.`,
                  effects: [
                    { setFlags: { 'm1.bird-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'k-bird-motif',
                        label: 'A swallow with three lines',
                        body: `Konstantin's motif. Sketched in his notebook at breakfast. Enamel pin on the strap of his flight helmet. The shape is the same as the sticker on the dream-capsule panel in 1965. The bird is his.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          decoy(
            'pressure-suit-rack',
            'the pressure suits',
            'A rack of six suits. Andrei\'s, Konstantin\'s, four others. He could not tell them apart at a distance.'
          ),
          atmoRead(
            'equipment-log-m1',
            'the equipment log',
            'On the bench. Date stamps and gear checkouts in a ledger hand.',
            `Andrei flips it open out of habit. His name on today\'s line. Kostya\'s on tomorrow\'s. Nothing irregular.`
          ),
          {
            id: 'andrei-helmet',
            name: "Andrei's helmet (USE to suit up)",
            examine: `The helmet on the rack, in your hand. The strap loose. The visor scratched. He is about to put it on. He has not yet.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He lifts it off the hook. He weighs it in both hands. He sets it down again.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m1.schedule-read']) {
                  return { text: `Your hand rests on the helmet. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m1.surgeon-noted']) {
                  return { text: `Your hand rests on the helmet. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m1.bird-noted']) {
                  return { text: `Your hand rests on the helmet. Not yet. There are still things to do here.` };
                }
                return {
                  text: `He puts the helmet on. The strap clicks under his chin. He walks out of the prep room, down the corridor, onto the apron. The trance unhooks at the threshold.

The dream takes over with the sun on his visor.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm2', targetRoom: 'cockpit-1962' } },
                  ],
                };
              },
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M2 — The Flight (dreamer)
    // ════════════════════════════════════════════════════════════════════════

    'cockpit-1962': {
      id: 'cockpit-1962',
      name: 'The Cockpit',
      exits: [
        { direction: 'north', roomId: 'the-altitude' },
      ],
      dreamer: {
        entry: `Inside the cockpit. The instruments alive, the dials in Cyrillic. Mid-ascent. The breathing is yours and is not yours. The visor reflects nothing.

A small photograph is clipped to the panel — Yelena and Nina, summer 1961. The radio carries Konstantin's voice from the ground, running the morning's other check.

Higher is north.`,
        look: `The instrument panel. The radio. The visor. The canopy. The small clipped photograph. Andrei\'s thigh pocket — there is something folded in it.

Higher is north.`,
        items: [
          {
            id: 'instrument-panel-1962',
            name: 'the instrument panel',
            examine: `Dials in Cyrillic. An altimeter climbing. An attitude indicator alive. The panel has no sticker — not yet. The metal is bare where one will eventually be.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The panel is bare. The sticker that will eventually live here, three years from now, is not here yet. The metal is clean.`,
              }),
            },
          },
          atmoRead(
            'cockpit-radio',
            'the radio',
            "Konstantin\'s voice on ground control, running the check for Yevgenny on a different aircraft. Methodical, dry, the same voice as in the mess.",
            `He reads back the readings with a small pause between each, the way he reads to Nina at home. The dream notices the pause.`
          ),
          atmoRead(
            'visor-cockpit',
            'the visor',
            'Sun through it. The sky cleaner than the air at the range usually is.',
            `Andrei sees through it the way he sees through any visor. The dream looks through it differently.`
          ),
          atmoRead(
            'canopy-cockpit',
            'the canopy',
            "Above. Blue. The dream wants altitude.",
            `Higher is north.`
          ),
          atmoRead(
            'panel-photograph',
            "a clipped photograph",
            "Yelena and Nina. Summer 1961. Yelena's hair is shorter than it will be.",
            `He glances at it. He glances away. He does not let himself look at it during the climb.`
          ),
          {
            id: 'andrei-pocket-cockpit',
            name: "your thigh pocket",
            examine: `Something paper. Folded. Small. You did not put it there.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['m2.pocket-opened']) {
                  return { text: `The note is unfolded now. It is on the panel, weighted by the stick base. You have read it.` };
                }
                return {
                  text: `Andrei's fingers find the paper. He unfolds it one-handed, keeping the other hand on the stick.

A slip torn from the back of something. Konstantin's hand, in pencil.

The note is on the panel now. You can examine it.`,
                  effects: [{ setFlags: { 'm2.pocket-opened': true } }],
                };
              },
            },
          },
          {
            id: 'k-folded-note',
            name: "Konstantin's note",
            examine: `A slip of paper. The writing is K.\'s pencil-hand, slightly hurried. One sentence on the front. A small drawing on the back.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (!ctx.flags['m2.pocket-opened']) {
                  return { text: `The note is folded in your pocket. You have not unfolded it yet.` };
                }
                return {
                  text: `Front, in pencil:

    If you come back, tell me what it sounded like.

On the back, smaller than thumb-print size: a swallow in profile, three short lines beneath. His mark.`,
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m2.pocket-opened']) {
                  return { text: `You have not unfolded it yet. There are still things to do here.` };
                }
                if (ctx.journal.some(j => j.id === 'k-folded-note')) {
                  return { text: `Already in the journal. The note about the sound.` };
                }
                return {
                  text: `You write it down. The whole of it.

Front: "If you come back, tell me what it sounded like."
Back: the swallow with three lines.

He wants to know what the air sounded like up there. He did not say "what it looked like." He said "what it sounded like."`,
                  effects: [
                    { setFlags: { 'm2.note-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'k-folded-note',
                        label: 'If you come back, tell me what it sounded like.',
                        body: `Konstantin's note. Tucked into Andrei's thigh pocket before the flight, without telling him. He asked Andrei to bring back not the look of altitude but the sound of it. On the back of the note, his mark: the swallow with three lines. Why the sound. Why not the look.`,
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

    'the-altitude': {
      id: 'the-altitude',
      name: 'The Altitude',
      exits: [
        { direction: 'south', roomId: 'cockpit-1962' },
      ],
      dreamer: {
        entry: `Cruise altitude. The cloud deck a long way below. Time does not behave the way it should.

The horizon curves. A star is visible in daylight, somehow. The radio is silent.

The throttle is in your hand.`,
        look: `The horizon, very long. A star visible in daylight. The altimeter, frozen on a single reading. The radio, silent. The gloved hand on the stick. The throttle.

Lower is south.`,
        items: [
          atmoRead(
            'altitude-horizon',
            'the horizon',
            'Very long. Curves more than it should at this altitude.',
            `The dream is exaggerating. The dream is being honest about exaggerating.`
          ),
          {
            id: 'daylight-star-m2',
            name: 'a star',
            examine: `Visible in daylight. Faint. Where no star should be.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Andrei looks at it twice. The dream lets him. The second look is the look of someone who has decided to remember.`,
              }),
            },
          },
          {
            id: 'altimeter-21400',
            name: 'the altimeter',
            examine: `Frozen on a single reading. Twenty-one thousand four hundred metres.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Frozen on twenty-one thousand four hundred metres. A reading slightly higher than any Strela should reach. The dream is exaggerating. The dream is doing it on purpose.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'altitude-21400')) {
                  return { text: `Already in the journal. Twenty-one thousand four hundred.` };
                }
                return {
                  text: `You record the number. Twenty-one thousand four hundred metres. Higher than any Strela can fly. The dream insists.`,
                  effects: [
                    { setFlags: { 'm2.altitude-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'altitude-21400',
                        label: '21 400 m',
                        body: `The altimeter froze on twenty-one thousand four hundred metres during the dream-flight. Higher than the actual Strela ceiling. The dream-instrument was specific. The number was deliberate.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'altitude-radio',
            'the radio',
            'Silent. Konstantin\'s voice is gone. The whole channel is gone.',
            `He waits for a moment. The silence is not the radio. The silence is the dream.`
          ),
          atmoRead(
            'gloved-hand-altitude',
            'the gloved hand',
            "On the stick. Steady, mostly. Shaking very slightly at the wrist.",
            `It is his hand. The shake is the dream's.`
          ),
          {
            id: 'throttle-altitude',
            name: 'the throttle',
            examine: `Forward, locked to cruise. He could bring it back. He has not yet.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `His gloved hand rests on the lever. He could descend. The dream has not released him yet.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m2.note-noted']) {
                  return { text: `The throttle is in your hand. The dream is not finished with you yet.` };
                }
                if (!ctx.flags['m2.altitude-noted']) {
                  return { text: `The throttle is in your hand. The dream is not finished with you yet.` };
                }
                return {
                  text: `He brings the throttle back. The aircraft drops with him. The horizon stops curving. The star fades. The dream lets him fall through evening.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm3', targetRoom: 'mess-hall-evening' } },
                  ],
                };
              },
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M3 — The Mess (reckoner) — evening, 14 August 1962
    // ════════════════════════════════════════════════════════════════════════

    'mess-hall-evening': {
      id: 'mess-hall-evening',
      name: 'The Mess Hall, Evening',
      exits: [
        { direction: 'north', roomId: 'andrei-bunk-night' },
      ],
      reckoner: {
        entry: `The mess hall in electric light. A long table set with glasses. A dozen officers in shirtsleeves. Konstantin is on his feet at the head of the table, mid-toast, glass in hand. He has not seen you come in.

Cpl. Sasha is moving along the wall with a camera. He is about to take the photograph.`,
        look: `Konstantin at the head of the table, glass raised. The long table. The samovar. The wall of photographs. The bulletin board with the slogan. Sasha with the camera. The cigarette case on the sideboard.

The quarters are north.`,
        items: [
          {
            id: 'konstantin-evening',
            name: 'Konstantin',
            examine: `On his feet at the head of the long table. Glass in hand. He has not seen you yet. He is mid-toast, the laugh still in his throat from whatever he said before.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He raises the glass an inch higher. The room raises theirs. He says something Andrei half-hears about the air being honest, about tomorrow being short. He laughs. The room laughs with him.

This is the photograph. This is what you will keep face-down on your desk three years from now.`,
              }),
            },
          },
          atmoRead(
            'long-table-evening',
            'the long table',
            'A dozen officers, glasses raised. The dishes have been cleared. Bottles in the middle. The room is warm.',
            `It is the kind of evening that records itself.`
          ),
          atmoRead(
            'samovar-mess-evening',
            'the samovar',
            'In the corner. Tarnished brass. The same shape as the one in the briefing room in 1965.',
            `The samovar does not change. The men do.`
          ),
          {
            id: 'wall-photographs-cropped',
            name: 'the wall photographs',
            examine: `Eight framed photographs along the wall. Pilots in flight gear, mostly. Most are decoys to your eye. One catches.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The catching one shows a young Konstantin, perhaps four years younger, with another pilot in flight gear. The frame has been cropped — there is a hand visible at the right edge of the photograph, on Kostya's shoulder. The hand belongs to a person no longer in the photograph. Someone has cropped them out.`,
              }),
            },
          },
          atmoRead(
            'bulletin-board-evening',
            'the bulletin board',
            'The same card. "Discipline. Discretion. Distance." The same three words.',
            `Pinned over fresh duty assignments for tomorrow. Strela-3 listed at 06:00.`
          ),
          atmoRead(
            'cigarette-case',
            'a cigarette case',
            'Brass, on the sideboard. Cpl. Sasha\'s — he rolls it between his fingers when he is about to take a photograph.',
            `He is rolling it now.`
          ),
          {
            id: 'mess-camera',
            name: 'the camera',
            examine: `A Soviet rangefinder on a strap around Cpl. Sasha\'s neck. Well-used. He is about to take the photograph.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Sasha frames the shot. Konstantin, glass raised, mid-laugh. The line of officers behind him. The flash bulb readied.`,
              }),
              use: (ctx: ActionContext) => {
                if (ctx.flags['m3.photo-taken']) {
                  return { text: `The flash has already fired. The room is settling back into itself.` };
                }
                return {
                  text: `Sasha presses the shutter. The flash fires. The room whites out for a beat. Konstantin is still mid-laugh; you are at his shoulder; Yevgenny is on his left, Mikhail and Pyotr to your right. The shape of the photograph you will keep face-down on your desk in 1965 is fixed in this beat.

Then the room comes back. The laughter continues. Sasha goes on along the wall.`,
                  effects: [
                    { setFlags: { 'm3.photo-taken': true } },
                    {
                      addJournalEntry: {
                        id: 'the-photograph-1962',
                        label: 'The photograph: 14 August 1962, evening mess',
                        body: `Cpl. Sasha took it tonight. Konstantin mid-laugh at the head of the table, glass in hand. Andrei at his shoulder. Yevgenny on Kostya's left; Mikhail and Pyotr at Andrei's right. The same photograph Andrei will keep face-down on his desk in spring 1965, pencilled "K., 1962" on the back. I was here when it was taken. I know who K. is now. I do not know what happened to him.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'sasha-photographer',
            'Cpl. Sasha',
            'A junior officer with a camera, working the wall. Twenty-three, careful.',
            `He will be remembered for this photograph. He will not be remembered for anything else.`
          ),
          atmoRead(
            'mess-window-evening',
            'the window onto the airfield',
            'Dark now. The runway lights on, blue and small.',
            `The night is wide.`
          ),
        ],
      },
    },

    'andrei-bunk-night': {
      id: 'andrei-bunk-night',
      name: "Andrei's Quarters, Night",
      exits: [
        { direction: 'south', roomId: 'mess-hall-evening' },
      ],
      reckoner: {
        entry: `Back at quarters. The lamp on. The day has been a long day in a long week. Andrei sits on the bunk with the borrowed paperback in his hands.

A new letter from Yelena waits on the desk — delivered while he was in the mess.`,
        look: `The borrowed paperback. Yelena's letter on the desk. The lamp. The half-written letter still mid-sentence. Andrei's own journal, blank.

The mess is south.`,
        items: [
          {
            id: 'yelena-letter-bunk',
            name: "Yelena's letter",
            examine: `Three pages, in her hand. Just arrived. Nina is mentioned twice on the first page.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `She is well. Nina is well. Nina has been humming a song she says Kostya taught her last spring on a visit. Yelena spells the syllables out as Nina sings them, three short, three short, three short. The rhythm is on the page.

The rhythm is the same as the briefing callsign you wrote down in 1965.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'nina-song-by-letter')) {
                  return { text: `Already in the journal. Yelena spelled the song out in syllables.` };
                }
                return {
                  text: `You write it down. Yelena's letter, three pages, the second-page paragraph: Nina humming the song Kostya taught her. The rhythm spelled out in syllables. The same three beats as the briefing callsign, the masked envelope, Nina's song in 1965. The rhythm goes back at least to 1962.`,
                  effects: [
                    { setFlags: { 'm3.letter-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'nina-song-by-letter',
                        label: "Yelena: Nina hums Kostya's song (1962)",
                        body: `Yelena's letter to Andrei, 14 August 1962. Nina has been humming a song "Kostya taught her last spring." Yelena spells the syllables: three short, three short, three short. Same rhythm I noted from Nina in 1965, from the masked envelope, from the briefing callsign. The song goes back at least three years.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'borrowed-paperback-bunk',
            name: 'the borrowed paperback',
            examine: `On the bunk. К.\'s book. The bookmark at page 73.`,
            actions: ['examine', 'open', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He weighs it. He flips it open at the bookmark. He has not read past 73. He intends to. He moves the bookmark forward to find where the page break falls.`,
              }),
              open: (ctx: ActionContext) => {
                if (ctx.flags['m3.book-opened']) {
                  return { text: `The underlined sentence is on page 73. You have already read it.` };
                }
                return {
                  text: `He opens the book at the bookmark. Page 73 is folded down at the corner. A sentence is underlined in pencil — K.\'s hand:

    "He told me he was tired of being weighed before flights."

Andrei reads it twice. He does not turn the page.`,
                  effects: [{ setFlags: { 'm3.book-opened': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['m3.book-opened']) {
                  return { text: `You have not opened it yet. There are still things to do here.` };
                }
                if (ctx.journal.some(j => j.id === 'k-paperback-underline')) {
                  return { text: `Already in the journal. The underlined sentence.` };
                }
                return {
                  text: `You record it. K. underlined a sentence in a borrowed book and lent it forward to Andrei. The sentence is about being weighed before flights. The pencil mark Reznik makes on his clearances is about a weighed value. The book and the clipboard are saying the same thing in different rooms.`,
                  effects: [
                    { setFlags: { 'm3.book-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'k-paperback-underline',
                        label: 'Tired of being weighed before flights',
                        body: `Konstantin underlined a single sentence in pencil in the borrowed copy of "On the Steppe": "He told me he was tired of being weighed before flights." He left the book for Andrei to find on the bunk. The same evening Reznik's pencil annotated K.'s clearance with a circle around a numeric value. The book and the clipboard are saying the same thing in different rooms.`,
                      },
                    },
                  ],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m3.photo-taken']) {
                  return { text: `Your hand is on the book. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m3.letter-noted']) {
                  return { text: `Your hand is on the book. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['m3.book-noted']) {
                  return { text: `Your hand is on the book. Not yet. There are still things to do here.` };
                }
                return {
                  text: `He closes the book. He slides the bookmark to page seventy-four. He puts it under the pillow. He reaches up and turns the lamp off.

The dawn comes very soon.`,
                  effects: [
                    { advanceToMovement: { movementId: 'm4', targetRoom: 'k-flight-prep-1962' } },
                  ],
                };
              },
            },
          },
          atmoRead(
            'lamp-bunk',
            'the table lamp',
            'On the desk. Warm under his hand. The bulb keeps the room distinct from the corridor.',
            `He will turn it off in a moment. The lamp is not the trigger tonight.`
          ),
          atmoRead(
            'half-written-letter-bunk',
            'the half-written letter',
            'Still on the desk where he left it. Still mid-sentence. "Kostya has been —".',
            `He looks at it. He does not pick up the pen.`
          ),
          atmoRead(
            'andrei-journal-blank',
            "Andrei's notebook",
            "A small blank notebook on the desk. He has been meaning to start a journal of his own. He has not.",
            `Yours is the only journal of this day. He has not begun his.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M4 — Strela-3 (dreamer) — pre-dawn, 15 August 1962
    // ════════════════════════════════════════════════════════════════════════

    'k-flight-prep-1962': {
      id: 'k-flight-prep-1962',
      name: 'Flight Prep, Pre-dawn',
      exits: [
        { direction: 'east', roomId: 'tarmac-dawn-1962' },
      ],
      dreamer: {
        entry: `The flight-prep room. Five-thirty in the morning. Half-light through the high window. Konstantin alone, fastening the inner harness without watching his hands.

Andrei is not here in his body. The dream is here without him.`,
        look: `Konstantin suiting up. His helmet on the bench. His thigh pocket. Reznik's clipboard on the wall.

The tarmac is east.`,
        items: [
          {
            id: 'konstantin-prep-m4',
            name: 'Konstantin',
            examine: `He is fastening the inner harness without watching his hands. He is not looking at anything, which is how he looks at things he has decided not to feel.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He works through the checklist by touch. His face is calm. His mouth is set. He pauses once at the chest buckle and starts again from the top.`,
              }),
            },
          },
          {
            id: 'k-helmet-prep-m4',
            name: "Konstantin's helmet",
            examine: `On the bench beside him. The bird pin still on the strap, polished.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The helmet is right where he set it down. The pin is on the strap where it belongs. He has not picked it up yet.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'k-bird-motif')) {
                  return { text: `The pin is the same pin. The journal already knows.` };
                }
                return {
                  text: `You record it again. The pin. The bird with three lines. The same shape, the same enamel.`,
                  effects: [{
                    addJournalEntry: {
                      id: 'k-bird-motif',
                      label: 'A swallow with three lines',
                      body: `Konstantin's motif. Enamel pin on the strap of his flight helmet. The shape is the same as the sticker on the dream-capsule panel in 1965. The bird is his.`,
                    },
                  }],
                };
              },
            },
          },
          {
            id: 'k-thigh-pocket',
            name: "Konstantin's thigh pocket",
            examine: `Something paper, folded inward. He has not unfolded it. He will not.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The paper is folded inward. You cannot read it. The dream does not allow it. He has not unfolded it for anyone, including himself.`,
              }),
            },
          },
          {
            id: 'reznik-clipboard-m4',
            name: "Reznik's clipboard",
            examine: `Hung on the wall by the door. K.\'s clearance for this morning is signed off. The pencilled margin annotation from yesterday is gone.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The clipboard is the clipboard. The clearance line is the same. But the right margin against Pavlovich's line is clean — the small pencilled circle is gone. The paper is slightly indented where the lead was. Someone erased it between yesterday evening and this morning.

The journal already has the original mark. You have the before-state. There is no longer an after-state to compare it to in this clipboard.`,
              }),
            },
          },
          atmoRead(
            'equipment-log-m4',
            'the equipment log',
            'On the bench. Today\'s line: Pavlovich, 06:00, Strela-3. The handwriting is steady.',
            `He has signed himself out. He is signed out. He has not left yet.`
          ),
        ],
      },
    },

    'tarmac-dawn-1962': {
      id: 'tarmac-dawn-1962',
      name: 'The Tarmac at Dawn',
      exits: [
        { direction: 'west', roomId: 'k-flight-prep-1962' },
        { direction: 'east', roomId: 'the-empty-cockpit' },
      ],
      dreamer: {
        entry: `Outside. The sky just beginning to lighten. Tarmac under his boots. The runway lights flickering off as he passes each one.

A junior officer at the hangar door is watching him cross.`,
        look: `Konstantin walking. The Strela-3 aircraft, half-hidden by a service van. The wind sock. The watching pilot at the hangar door. A faint star still in the lightening sky.

The prep room is west. East: an aircraft you can almost see.`,
        items: [
          {
            id: 'konstantin-walking',
            name: 'Konstantin',
            examine: `Crossing the tarmac at an unhurried pace. The runway lights flicker off as he passes them, one by one.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He has the gait of a man who has done this many times. He does not look back. He does not look up. He looks ahead at the aircraft he is half-walking toward.`,
              }),
            },
          },
          atmoRead(
            'strela-3-aircraft',
            'Strela-3',
            'Half-obscured by a service van on the apron. You can see a wing, a tail number, the edge of the canopy.',
            `The dream will not let you see the whole of it.`
          ),
          atmoRead(
            'service-van',
            'a service van',
            'Parked at an angle that hides most of the aircraft. A junior officer at the driver\'s door, hands in his pockets.',
            `The angle is not accidental.`
          ),
          atmoRead(
            'wind-sock-dawn',
            'the wind sock',
            'Limp. The wind is between two minds.',
            `It is going to lift in a minute or it is going to keep being still for an hour.`
          ),
          {
            id: 'drozdov-watching',
            name: 'a watching pilot',
            examine: `A lone officer at the hangar door, hands in his pockets, watching Konstantin cross the tarmac. Late twenties, the chin already set. Junior uniform. You do not know him.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He stands still. He does not call out. He does not move. He has been watching the whole crossing. The way he is watching is not the way curious men watch other men cross tarmac.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'drozdov-at-range')) {
                  return { text: `Already in the journal. The watching lieutenant.` };
                }
                return {
                  text: `You record him. The set of the chin. The hands in the pockets. The way of watching.

Late twenties in 1962. He will be Major Drozdov by the time Andrei meets him in 1965. He is watching the wrong way for someone who is just curious. He never mentions this morning, in 1965. He never mentions Kostya at all.`,
                  effects: [
                    { setFlags: { 'm4.drozdov-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'drozdov-at-range',
                        label: 'Drozdov at the hangar door (1962)',
                        body: `A junior officer in a junior uniform watching Konstantin cross the tarmac at dawn, 15 August 1962. Late twenties, set chin. The same man who will be Major Drozdov in 1965 — Andrei's superior in the closed city. He was at the range. He watched K. cross. He never spoke of it.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          atmoRead(
            'dawn-star',
            'a star',
            'Still in the sky, very faint, where the dawn has not yet erased it.',
            `The same star as the cockpit yesterday. The dream is reusing it. The dream wants you to notice.`
          ),
        ],
      },
    },

    'the-empty-cockpit': {
      id: 'the-empty-cockpit',
      name: 'An Empty Cockpit',
      exits: [
        { direction: 'west', roomId: 'tarmac-dawn-1962' },
      ],
      dreamer: {
        entry: `Inside a cockpit. Not yours, not his — not Strela-3, not Strela-7. The seat is warm. The harness is unbuckled, hanging loose. The canopy is half-open. The sky outside is full daylight already, somehow.

The dream-logic is at its loosest here.`,
        look: `The warm seat. K.\'s helmet on the cockpit floor. The radio. The half-open canopy. The sky outside, daylight where there should be dawn. The star: gone.

The tarmac is west.`,
        items: [
          atmoRead(
            'warm-seat',
            'the seat',
            'Warm. The harness is unbuckled. The way a body leaves a chair when called out of it suddenly.',
            `Someone was here. Someone is not here now.`
          ),
          {
            id: 'k-helmet-floor',
            name: "Konstantin's helmet (on the floor)",
            examine: `On the cockpit floor, not strapped to the panel, not on a rack. The bird pin still on the strap.`,
            actions: ['examine', 'note'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `The helmet is on the floor. Helmets are not left on the floor of cockpits. The pin is on the strap. The pin would not have been left.`,
              }),
              note: (ctx: ActionContext) => {
                if (ctx.journal.some(j => j.id === 'k-helmet-on-floor')) {
                  return { text: `Already in the journal. The helmet on the floor.` };
                }
                return {
                  text: `You write it down. Kostya's helmet on the floor of a cockpit that is not his. The pin still attached. He would not have left it. He did not leave it. Someone else moved it. Or the dream did.`,
                  effects: [
                    { setFlags: { 'm4.helmet-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'k-helmet-on-floor',
                        label: "Kostya's helmet on the floor",
                        body: `End of the M4 dream. A cockpit that is not Andrei's and not Kostya's. The seat warm, the harness loose. Konstantin's helmet on the floor, the bird pin still on the strap. He would not have left it. The pin would not have been left. He was pulled out of a different aircraft, or the dream is showing me a state that does not exist yet.`,
                      },
                    },
                  ],
                };
              },
            },
          },
          {
            id: 'empty-cockpit-radio',
            name: 'the radio',
            examine: `Silent. The channel indicator lit but no carrier.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `He stares at it. He could try to raise someone. The dream is waiting for him to.`,
              }),
              use: (ctx: ActionContext) => {
                if (!ctx.flags['m4.drozdov-noted']) {
                  return { text: `Your hand is on the radio. Not yet. There are still things to see.` };
                }
                if (!ctx.flags['m4.helmet-noted']) {
                  return { text: `Your hand is on the radio. Not yet. There are still things to see.` };
                }
                return {
                  text: `He keys the radio.

Static. Then, briefly, a fragment of a voice — "— back —" — and static again. The fragment is not Konstantin's voice. The fragment is not Andrei's voice. The fragment is a voice the dream knows and the listener does not.

The dream lets him go in pieces.`,
                  effects: [
                    { advanceToMovement: { movementId: 'coda', targetRoom: 'tomas-desk-coda-2' } },
                  ],
                };
              },
            },
          },
          atmoRead(
            'canopy-empty',
            'the canopy',
            'Half-open. The sky outside is full daylight, somehow. The dream has skipped an hour.',
            `He notices the sky. He does not act on the noticing.`
          ),
          atmoRead(
            'vanished-star',
            'the sky',
            'Daylight, full. No star. The faint star from the tarmac is gone — daylight took it.',
            `It was there a moment ago. It is not now.`
          ),
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // CODA — Tomás's flat, evening of the same day
    // ════════════════════════════════════════════════════════════════════════

    'tomas-desk-coda-2': {
      id: 'tomas-desk-coda-2',
      name: 'Your Desk',
      exits: [
        { direction: 'east', roomId: 'tomas-kitchen-coda-2' },
      ],
      neutral: {
        entry: `Your desk. Evening already. You have been writing for hours without registering them. The journal is full of August 1962. The pages are warm with your hand.

The unopened letter from Maria is still where you left it this morning.`,
        look: `The journal. The typewriter, still mid-paragraph. The unopened letter from Maria. The window onto the courtyard.

The kitchen is east.`,
        items: [
          {
            id: 'journal-coda-2',
            name: 'your journal',
            examine: `Full of 14 August 1962. The cockpit, the mess, the photograph, the underlined sentence, the tarmac at dawn. You underline three things: 1962, Strela-3, Drozdov.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You read back. You underline three things: 1962. Strela-3. Drozdov. You stare at the third underline for a long time. He was there.`,
              }),
            },
          },
          atmoRead(
            'typewriter-coda-2',
            'the typewriter',
            'The same Olivetti. The same page. Two days untouched now.',
            `The German is still German. It will keep until tomorrow. It has kept this long.`
          ),
          {
            id: 'coda-window-2',
            name: 'the window',
            examine: `The courtyard, dusk. The lit window opposite is dark again. Your reflection in the glass.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['coda.reflection-seen']) {
                  return { text: `Your reflection is your reflection. The room behind you is your room.` };
                }
                return {
                  text: `You look at your reflection. For one beat, the room behind you is not your room — there is a cockpit canopy, half-open, a sky too full of daylight, a helmet on a floor. Then the reflection settles, and the room behind you is your room.

The journal on your desk is fuller than it was when you sat down this morning. The day was a day.`,
                  effects: [{ setFlags: { 'coda.reflection-seen': true } }],
                };
              },
            },
          },
          {
            id: 'maria-letter-unopened',
            name: "Maria's letter (still unopened)",
            examine: `On the mail pile where you left it. Yesterday's stamp. You have not opened it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You will open it in the kitchen, with tea. You stand up. You walk east.`,
              }),
            },
          },
        ],
      },
    },

    'tomas-kitchen-coda-2': {
      id: 'tomas-kitchen-coda-2',
      name: 'Your Kitchen',
      exits: [
        { direction: 'west', roomId: 'tomas-desk-coda-2' },
      ],
      neutral: {
        entry: `Your kitchen. The kettle is warm — you made tea without registering that you did. The radio is silent. The window opposite is grey.

Maria's letter is in your hand. You open it.`,
        look: `The kettle. The silent radio. The window. Maria's letter, opened.

The desk is west.`,
        items: [
          atmoRead(
            'kettle-coda-2',
            'the kettle',
            'Warm. You boiled water at some point during the writing and made tea without registering it.',
            `The cup is on the counter. The tea is cool.`
          ),
          atmoRead(
            'radio-kitchen-coda-2',
            'the radio',
            'Silent. The station from yesterday is gone. The station from this morning is gone.',
            `You do not turn it on.`
          ),
          atmoRead(
            'kitchen-window-coda-2',
            'the kitchen window',
            'Onto the courtyard. Same view. The lit window opposite is dark.',
            `Or the curtain is closed. The two amount to the same thing.`
          ),
          {
            id: 'maria-letter-opened',
            name: "Maria's letter",
            examine: `Three pages in Maria's hand. Brief. She wanted to tell you something before she forgot.`,
            actions: ['examine', 'note', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: (ctx: ActionContext) => {
                if (ctx.flags['coda.letter-read']) {
                  return { text: `You have read it. The three notes Maria heard in her sleep.` };
                }
                return {
                  text: `Maria writes:

"I dreamt of Papa last night. He was at his desk, humming the three notes he used to hum when he was working. You will remember them. I have not heard them in twenty years. I heard them last night, in my sleep, exactly. I wrote them down in case I forgot.

Da — da-da. Da — da-da. Da — da-da.

I do not know why I want you to know. I only know that I want you to know."

The three notes. The rhythm. Three short, three short, three short. The same rhythm.`,
                  effects: [{ setFlags: { 'coda.letter-read': true } }],
                };
              },
              note: (ctx: ActionContext) => {
                if (!ctx.flags['coda.letter-read']) {
                  return { text: `You have not read it yet. There are still things to do here.` };
                }
                if (ctx.journal.some(j => j.id === 'tomas-father-song')) {
                  return { text: `Already in the journal. The song that crossed.` };
                }
                return {
                  text: `You write it down. The third place. The fourth, if you count yourself separately from Maria. Papa's three notes, heard in Trieste in 1988, the same rhythm as Nina's song in 1965, the same rhythm as the briefing callsign, the same rhythm as Yelena's letter in 1962.

The song is older than Konstantin. The song is older than you. You do not yet know what it is.`,
                  effects: [
                    { setFlags: { 'coda.letter-noted': true } },
                    {
                      addJournalEntry: {
                        id: 'tomas-father-song',
                        label: "Papa's three notes (Maria's letter)",
                        body: `Maria writes from her city. She dreamt of Papa last night humming the three notes he used to hum at his desk. She wrote them down: da — da-da, three times. Same rhythm as Nina's song (1965 and 1962), the masked envelope, the briefing callsign. The song crosses my own family. The song is older than Konstantin. The song is older than this dreaming. I do not know what it is.`,
                      },
                    },
                  ],
                };
              },
              use: (ctx: ActionContext) => {
                if (!ctx.flags['coda.letter-noted']) {
                  return { text: `Your hand is on the letter. Not yet. There are still things to do here.` };
                }
                if (!ctx.flags['coda.reflection-seen']) {
                  return { text: `Your hand is on the letter. Not yet. There are still things to do here.` };
                }
                return {
                  text: `You fold Maria's letter into the journal between two pages of August 1962. The page closes around it. You set the journal on the kitchen table. You stand at the window.

The radio is silent. The window opposite is grey. A man in flight gear who is not you was at your shoulder for a moment, in the glass. He is not there now.

You do not know who he is. You know more than you did.`,
                  effects: [
                    {
                      addJournalEntry: {
                        id: 'the-song-runs',
                        label: 'The song runs older than I thought',
                        body: `Nina (1965, via Konstantin) — Yelena (1962, via Konstantin) — Konstantin (somewhere earlier) — my father (Trieste, decades back) — me. The song goes backward through people. I do not yet know whose it began as. I do not yet know what the dreaming has to do with my own family.`,
                      },
                    },
                    { setFlags: { 'sp02.complete': true } },
                    { complete: true },
                  ],
                };
              },
            },
          },
        ],
      },
    },

  },

  triggers: [],
};
