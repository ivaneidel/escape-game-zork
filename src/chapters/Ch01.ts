import type { Chapter, Item } from '../types';

// MP Chapter 1 — The Apollo (v2).
// Vienna, late autumn 1907, the Apollo-Saal. ~90 minutes before curtain.
// Two players, two devices, offline-local, no networking. Each side has its
// own room cluster per movement; each movement is a pair of device-modal
// puzzles whose answers are information only on the other device's screen.
// See chapters/season-1/chapter-01/mp-v2.md.

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

export const Ch01: Chapter = {
  id: 'ch01',
  title: 'The Apollo',
  contentVersion: 3,
  actionSet: ['look', 'open', 'take', 'examine', 'use', 'push'],
  starts: {
    dreamer: 'dressing-room-arrival',
    reckoner: 'workshop-arrival',
  },
  cast: {
    protagonist: 'Anneliese',
    partner: 'Emil',
    mentor: 'Maestro Levin',
    daughter: 'Liesl',
  },

  prologue: `A gas lamp flickers. A match is struck. You do not know whose hand holds it.

The smell of velvet and old wood. Somewhere, an orchestra is tuning. The air is cold, then warm, then cold again — like a memory finding its shape.

You are not awake. You are not dreaming. You are between.

The lamp steadies. You see:`,

  epilogue: `The curtain rises. The audience becomes one body, gasping.

For a moment, everything is as it should be.

Then the hunger stirs again — quiet, patient, already drawing the plans for something bigger.

The memory dims. The lamp flickers.

You are between, again.`,

  completionFlag: 'ch01.complete',

  movements: [
    {
      id: 'prologue',
      title: 'The Arrival',
      mode: 'neutral',
      rooms: ['dressing-room-arrival', 'workshop-arrival'],
      transitionOut: `The room takes its working register. The hour begins.`,
    },
    {
      id: 'm1',
      title: 'The Running Order',
      mode: 'neutral',
      rooms: ['dressing-prep', 'stage-wing-prep', 'workshop-prep', 'back-office'],
      transitionIn: `Ninety minutes to curtain. The props need to be in the wings. The cues need to be confirmed. The two halves of the work are in two rooms tonight.`,
      transitionOut: `The cue list and the wing table agree. One thing is in its place.`,
    },
    {
      id: 'm2',
      title: 'The Notebook',
      mode: 'neutral',
      rooms: ['dressing-vanity', 'workshop-letters'],
      transitionIn: `The Mentor's hand on the page. The Mentor's hand on the letter. Two halves of the same instruction.`,
      transitionOut: `The maxim closes around the page. You have it now.`,
    },
    {
      id: 'm3',
      title: 'The Aria',
      mode: 'neutral',
      rooms: ['backstage-corridor', 'mirror-nook', 'orchestra-pit-edge', 'conductor-stand'],
      transitionIn: `The orchestra rehearses through the wall on one side; the score sits on the conductor's stand on the other. The cue is in both places, in two languages.`,
      transitionOut: `The bar is set. The beat is marked. The cue will land where it should.`,
    },
    {
      id: 'm4',
      title: 'Five Minutes',
      mode: 'neutral',
      rooms: ['stage-wing-final', 'understage-trap'],
      transitionIn: `The audience is in. The orchestra is tuning. Five minutes. Something is wrong, and the only way to find it is to feel it from one side and inspect it from the other.`,
      transitionOut: `The fault is found. The trick will land safely tonight.`,
    },
    {
      id: 'coda',
      title: 'The Curtain',
      mode: 'neutral',
      rooms: ['wings-curtain-up', 'workshop-stairs-coda'],
      transitionIn: `Curtain in seconds. You have done what you can. The hour closes around you.`,
    },
  ],

  rooms: {

    // ════════════════════════════════════════════════════════════════════════
    // PROLOGUE — Arrival at the theatre
    // ════════════════════════════════════════════════════════════════════════

    'dressing-room-arrival': {
      id: 'dressing-room-arrival',
      name: 'Dressing Room',
      exits: [],
      dreamer: {
        entry: `Late afternoon light through the high window. The radiator clanks the way old radiators clank when they have been on since morning. Your costume is hung on the brass rack. The mirror bulbs are warm but unlit. The decanter is on the vanity. The Mentor's notebook is on the vanity. A photograph of Liesl is tucked into the mirror frame.

You have come up the stairs from the stage door. You are home in the room. The hour begins when you turn the bulbs on.`,
        look: `The mirror bulbs, unlit. The velvet costume. The decanter. The notebook. Liesl in the mirror frame. The radiator.`,
        items: [
          {
            id: 'mirror-bulbs',
            name: 'the mirror bulbs',
            examine: `Eight bulbs around the mirror. Warm to the touch, unlit. The switch is at the base.`,
            actions: ['examine', 'push'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `You can feel the filament behind the glass. They will throw amber when you turn them on.` }),
              push: () => ({
                text: `The bulbs warm up one by one. The room shifts register — the evening register, the working register. Eight reflections of your face along the mirror.

The hour begins.`,
                effects: [
                  { advanceToMovement: { movementId: 'm1', targetRoom: 'dressing-prep' } },
                ],
              }),
            },
          },
          atmoRead(
            'costume-on-rack-prologue',
            'a velvet costume',
            'Deep velvet, midnight blue. On the brass rack. It still has the smell of last night\'s footlights in the seams.',
            `Your hand on the velvet. It knows your shoulders. You will wear it in twenty-seven minutes.`
          ),
          atmoRead(
            'vanity-decanter-prologue',
            'a crystal decanter',
            'Heavy crystal, half-full of amber. Warm under the hand.',
            `You do not pour. You touch it. It is enough.`
          ),
          {
            id: 'mentor-notebook-glimpse-prologue',
            name: "the Mentor's notebook",
            examine: `Cracked leather, on the vanity. Open to a page that keeps not resolving when you look at it directly. You will come back to it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Maestro Levin's hand on every page. You will read him later. The hour is not for him yet.` }),
            },
          },
          atmoRead(
            'liesl-photograph-prologue',
            "Liesl's photograph",
            'A small photograph tucked into the mirror frame. A child of eight, squinting in summer sun.',
            `She is with her nurse this week. You will write to her in the morning.`
          ),
          atmoRead(
            'dressing-radiator-prologue',
            'the radiator',
            'Cast iron under the window. The pipes clank. The building turned the heat on hours ago.',
            `You put a hand on it and take it off. It is hot. It is the right kind of hot.`
          ),
        ],
      },
    },

    'workshop-arrival': {
      id: 'workshop-arrival',
      name: 'Workshop',
      exits: [],
      reckoner: {
        entry: `Below the stage. A narrow brick room, low ceiling, the air ten degrees colder than upstairs. A single gas lamp over the workbench. The forge has been let to cool to embers. Tonight's running order is on the chalkboard. The stage manager's logbook hangs on its hook.

You came down the back stairs. The building is awake around you. You sign in.`,
        look: `The workbench, mid-assembly. The cold forge. The chalkboard with the running order. The stage manager's logbook. The lamp.`,
        items: [
          {
            id: 'stage-manager-logbook',
            name: "the stage manager's logbook",
            examine: `Bound in linen. Hung on a brass hook by the door. The night's entries are open and waiting for your initials.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: 'Logbook', examine: "Stage manager's logbook." },
            onAction: {
              examine: () => ({ text: `Tonight's date. Your name typed at the top. A blank line beside it.` }),
              use: () => ({
                text: `You take the pen on its string and write your initials beside your name. The book accepts them. The hour begins.

The workshop sharpens around you. You have work to do.`,
                effects: [
                  { advanceToMovement: { movementId: 'm1', targetRoom: 'workshop-prep' } },
                ],
              }),
            },
          },
          atmoRead(
            'cold-forge-prologue',
            'the forge',
            'Brick, cooled to embers. The fire was let down at noon. The metal stand is still warm to the back of the hand.',
            `You will not need the forge tonight. Tomorrow, perhaps.`
          ),
          atmoRead(
            'bench-tools-prologue',
            'the workbench tools',
            'Files, calipers, a small mallet, a magnifying loupe on a strap. Laid out in the order you would reach for them.',
            `You set the mallet a finger\'s width to the left of where someone else put it. Habit.`
          ),
          atmoRead(
            'chalkboard-arrival-prologue',
            'the chalkboard',
            "Tonight's running order in Emil's neat hand. Four cues. You have read it three times already.",
            `Four cues. Four props. The new piece opens the night at twenty hundred — you put it there. You have not unscored it. You will not.`
          ),
          {
            id: 'workshop-lamp-prologue',
            name: 'the workshop lamp',
            examine: `A gas lamp on a chain over the workbench. Currently low.`,
            actions: ['examine', 'push'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Brass. Hung at the right height. The valve is to your left.` }),
              push: () => ({ text: `You turn the valve. The flame settles brighter. The workbench takes the light.` }),
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M1 — The Running Order
    // ════════════════════════════════════════════════════════════════════════

    'dressing-prep': {
      id: 'dressing-prep',
      name: 'Dressing Room',
      exits: [
        { direction: 'east', roomId: 'stage-wing-prep' },
      ],
      dreamer: {
        entry: `The mirror bulbs are on now. The amber catches the rim of the decanter, the velvet on the rack, the small photograph of Liesl. The notebook on the vanity is open and waits. You have eighty-eight minutes.

Through the wall you hear the orchestra beginning to rehearse. A corridor runs off the dressing room toward the wings where the props are being laid.`,
        look: `The vanity, the mirror, the velvet on the rack. The decanter. The notebook open. The radiator clanking. Emil's jacket on the chair-back. The corridor east.`,
        items: [
          atmoRead(
            'dressing-mirror-m1',
            'the dressing mirror',
            'A long mirror surrounded by warm bulbs. Your face in it, made up for tonight but not yet costumed.',
            `You meet your eyes for a moment. Then you look away. You have been performing for fifteen years.`
          ),
          atmoRead(
            'costume-detail-m1',
            'the velvet costume',
            'Midnight blue. Up close you can see the trim, the weight of the sleeves, the small repair you made in the hem in Budapest.',
            `Your hand on the velvet. The fabric remembers your body before you put it on.`
          ),
          {
            id: 'dressing-brandy-m1',
            name: 'a brandy glass',
            examine: `Half-drunk crystal on the vanity. Warm to the touch. Not yours from this morning — Emil left it.`,
            actions: ['examine', 'take'],
            takeable: true,
            inventory: { label: 'a warmth in your hand', examine: 'A half-drunk brandy. Warm from the lamp. The sensation of him having been here.' },
            onAction: {
              examine: () => ({ text: `Crystal, half-full. The fingerprints on the bowl are not yours. The warmth in your palm is the warmth of him having held it a quarter-hour ago.` }),
            },
          },
          {
            id: 'mentor-notebook-glimpse-m1',
            name: "the Mentor's notebook",
            examine: `Open on the vanity. The pages refuse to settle when you look directly. You can feel each image more than you see it. Maestro Levin's hand throughout.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Bird, broken cup. Two doors. A heart. A cabinet with a single eye. A spiral staircase. You will come back to this. The hour is not for him yet.` }),
            },
          },
          atmoRead(
            'liesl-photograph-m1',
            "Liesl's photograph",
            'In the mirror frame. The child squints. The summer behind her is bright.',
            `Eight years old, this June. You will not see her until Vienna ends.`
          ),
          {
            id: 'emils-jacket-m1',
            name: "Emil's jacket",
            examine: `On the back of the chair. Wool, dark, the elbows worn. He hung it here when he came up from the workshop with the brandy.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `You lift the collar. Tobacco, sawdust, him. He will collect it before the curtain.` }),
            },
          },
        ],
      },
    },

    'stage-wing-prep': {
      id: 'stage-wing-prep',
      name: 'Stage-Left Wing',
      exits: [
        { direction: 'west', roomId: 'dressing-prep' },
      ],
      dreamer: {
        entry: `The wings. Worklights overhead. The velvet legs hang dusty in their fly lines. The prop table is along the back wall — four positions, four props laid out.

You touch each in turn. They know your hands.`,
        look: `The prop table with four positions. The curtain edge. The worklights. Emil's voice somewhere below in the workshop. The corridor west.`,
        items: [
          atmoRead(
            'prop-cabinet-feel',
            'a prop by feel — heavy, cold',
            "On the prop table. Your hand finds it without looking. Heavy. The brass handle is cold the way a doorknob is cold.",
            `Cabinet, you would say. But the table does not name itself. It only feels.`
          ),
          atmoRead(
            'prop-bell-feel',
            'a prop by feel — camphor, felt',
            'Wrapped in felt. Smells of camphor. Your fingers expect resonance and find none, because the clapper is wrapped.',
            `The bell. Silver beneath the felt. You can feel the hoop with your thumb.`
          ),
          atmoRead(
            'prop-silks-feel',
            'a prop by feel — small fingers',
            'Folded silks. They make your fingers feel small and deft when you handle them. They slide differently than they used to.',
            `Three silks — red, gold, black. Emil moved them here last week. He was right.`
          ),
          atmoRead(
            'prop-new-cabinet-feel',
            'a prop by feel — warm, new',
            'A handle warmer than the others. The wood is new and the handle is not quite where your hand expects it to be.',
            `The new piece. Its release is on the right, not the left. Your hand will have to remember.`
          ),
          atmoRead(
            'wing-curtain-edge',
            'the curtain edge',
            'The leg curtain at the wing\'s edge. Velvet, deep with dust.',
            `You can feel the audience through it without seeing them. The murmur is steady.`
          ),
          atmoRead(
            'wing-worklights',
            'the worklights',
            'Two on a stand. Naked bulbs. Warm.',
            `You stand in the cone of one of them. The boards under you are warmer than the wings.`
          ),
          atmoRead(
            'emils-voice-from-below',
            "Emil's voice from below",
            'Through the boards under your feet. He is in the workshop, checking something. You cannot make out the words.',
            `You can feel him through the floor. He hums when he works. He does not know he hums.`
          ),
          {
            id: 'prop-arrangement',
            name: 'the wing-table arrangement',
            examine: `The four prop positions on the table. The stage manager wants them in cue order. You can arrange them by feel.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `You stand in front of the table. The four props under your hands. You will need to know in what order the cues come — you cannot read the chalkboard from up here.` }),
            },
            device: {
              kind: 'slot-assign',
              invoke: 'use',
              slots: [
                { id: 'pos-1', label: 'Position 1 (first cue)' },
                { id: 'pos-2', label: 'Position 2 (second cue)' },
                { id: 'pos-3', label: 'Position 3 (third cue)' },
                { id: 'pos-4', label: 'Position 4 (fourth cue)' },
              ],
              options: [
                { id: 'heavy-cold',    label: 'the heavy cold one (brass handle)' },
                { id: 'camphor-felt',  label: 'the camphor-and-felt one' },
                { id: 'small-fingers', label: 'the small-fingers feeling' },
                { id: 'new-warm',      label: 'the new warm-handled one' },
              ],
              correct: {
                'pos-1': 'new-warm',
                'pos-2': 'camphor-felt',
                'pos-3': 'small-fingers',
                'pos-4': 'heavy-cold',
              },
              prompt: 'Arrange the props in cue order, by feel. The cue list is downstairs — you cannot read it from up here.',
              onSolve: () => ({
                text: `Each prop settles into its place. The cabinet is heavy in the first position; the bell is wrapped where it should be; the silks lift toward the third; the new piece sits warm in the fourth. The table is set.

You step back. You have eighty-two minutes.`,
                effects: [
                  { setFlags: { 'm1.dreamer.solved': true } },
                  { advanceToMovement: { movementId: 'm2', targetRoom: 'dressing-vanity' } },
                ],
              }),
            },
          },
        ],
      },
    },

    'workshop-prep': {
      id: 'workshop-prep',
      name: 'Workshop',
      exits: [
        { direction: 'east', roomId: 'back-office' },
      ],
      reckoner: {
        entry: `The workshop sharpened by the lamp. The workbench laid out for the night. The chalkboard with the cue order. The safety binder on its shelf. The cooled forge.

A small door at the side wall leads to the manager's back office.`,
        look: `The chalkboard with the cue order. The workbench with the apparatus mid-assembly. The safety binder. The program. The forge. The door east.`,
        items: [
          {
            id: 'chalkboard-cue-order',
            name: 'the chalkboard',
            examine: `Tonight's cue order, in Emil's hand:

  20:00 — Cabinet (V2 — prototype)
  20:12 — Bell
  20:24 — Silks
  20:36 — Cabinet (V1)

The prototype opens tonight. You put it there yourself.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Four cues. Four props. The V2 prototype goes up first — the headliner slot. You wrote the order. You have not crossed it off. You will not.` }),
            },
          },
          atmoRead(
            'workbench-apparatus-m1',
            'the apparatus on the workbench',
            "A cabinet hinge mid-assembly. A latch laid on a felt strip. A coil of wire. The work that will not be finished tonight.",
            `You will come back to it tomorrow. Tonight the prototype goes on stage in this state.`
          ),
          {
            id: 'safety-cert-binder',
            name: 'the safety binder',
            examine: `A linen-bound binder on the shelf. The most recent certificate is dated 14 days ago.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: 'Safety binder', examine: 'Safety certificates, this season.' },
            onAction: {
              examine: () => ({
                text: `Most-recent formal entry, 14 days ago: "Cabinet (V1) apparatus inspected. Counterweight bolt shows wear — replace before next tour." Initialled E.R.

No certificate exists for the V2 prototype. You walked under it last week, alone. You did not write it down.`,
              }),
            },
          },
          atmoRead(
            'forge-cooled-m1',
            'the cooled forge',
            'Embers under grey ash. The metal pan is still warm to the back of the hand.',
            `You will not light it tonight. Tomorrow.`
          ),
          {
            id: 'running-order-program-m1',
            name: 'the evening program',
            examine: `A typewritten program for tonight's performance, printed by the management. The opening cue is "The Cabinet" — the management has not been told it is the prototype.`,
            actions: ['examine', 'take'],
            takeable: true,
            inventory: { label: 'Program', examine: 'Tonight\'s typewritten program. Four cues.' },
            onAction: {
              examine: () => ({ text: `The management has not been told the V2 is a prototype. They have been told the cabinet is the cabinet. The opener is "The Cabinet." Tonight that is the new one.` }),
            },
          },
        ],
      },
    },

    'back-office': {
      id: 'back-office',
      name: "Manager's Back Office",
      exits: [
        { direction: 'west', roomId: 'workshop-prep' },
      ],
      reckoner: {
        entry: `A narrow office behind the workshop. A desk. A wall clock. A filing cabinet. A telegram on the blotter. The contract beside it. The cue-confirmation form waiting to be signed.`,
        look: `The manager's desk. The wall clock. The filing cabinet. The Budapest telegram. The Apollo-Saal contract. The cue-confirmation form. The door west.`,
        items: [
          atmoRead(
            'managers-desk-m1',
            "the manager's desk",
            'A heavy oak desk. Inkstand, blotter, two empty glasses. The chair is on the wrong side, as if someone stood to leave in a hurry.',
            `The manager will not be back until after intermission. The desk is yours for the duration.`
          ),
          {
            id: 'telegram-budapest-m1',
            name: 'a telegram from Budapest',
            examine: `Sender: V. Three lines, postmarked three days ago.`,
            actions: ['examine', 'take'],
            takeable: true,
            inventory: { label: 'Telegram', examine: 'Telegram from Budapest. Sender: V.' },
            onAction: {
              examine: () => ({ text: `"YOUR NEXT IS WAITING. WE ARE WATCHING. — V."

You do not know which V. There are several. You leave it.` }),
            },
          },
          {
            id: 'management-contract-m1',
            name: 'the management contract',
            examine: `Apollo-Saal contract. 4-week run. Clause 7: "Artist responsible for own apparatus safety inspections."`,
            actions: ['examine', 'take'],
            takeable: true,
            inventory: { label: 'Contract', examine: 'Apollo-Saal management contract.' },
            onAction: {
              examine: () => ({ text: `Signed by you, October 1st. The clause was standard. It is still standard.` }),
            },
          },
          {
            id: 'filing-cabinet-office',
            name: 'a filing cabinet',
            examine: `Four drawers. Mostly empty. The bottom drawer sticks.`,
            actions: ['examine', 'open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `The drawers carry old correspondence. None of it relevant tonight.` }),
              open: () => ({ text: `You pull the top drawer. Empty but for a desiccated rose pressed inside a season\'s programme from 1903. Atmosphere.` }),
            },
          },
          atmoRead(
            'wall-clock-office',
            'the wall clock',
            'A heavy pendulum clock above the desk. Tick, tick, tick. The minute hand has just moved.',
            `19:18. Cue 20:00 is forty-two minutes away.`
          ),
          {
            id: 'cue-form',
            name: 'the cue-confirmation form',
            examine: `Typewritten on Apollo-Saal letterhead. Four cue times, four blank fields. Awaits the formal prop name against each cue. The stage manager needs it before curtain.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `The four blank fields beside the four cue times. The formal prop names belong in them — but which name at which time depends on what is laid out at the wing table, and the wing table is upstairs.` }),
            },
            device: {
              kind: 'slot-assign',
              invoke: 'use',
              slots: [
                { id: 't-2000', label: '20:00' },
                { id: 't-2012', label: '20:12' },
                { id: 't-2024', label: '20:24' },
                { id: 't-2036', label: '20:36' },
              ],
              options: [
                { id: 'cabinet',    label: 'The Cabinet (V1)' },
                { id: 'bell',       label: 'The Silver Bell' },
                { id: 'silks',      label: 'The Performance Silks' },
                { id: 'cabinet-v2', label: 'The Cabinet (V2 — prototype)' },
              ],
              correct: {
                't-2000': 'cabinet-v2',
                't-2012': 'bell',
                't-2024': 'silks',
                't-2036': 'cabinet',
              },
              prompt: 'Match the formal prop names to the cue times. The wing-table is upstairs — you cannot see it from down here.',
              onSolve: () => ({
                text: `The form is complete. Each cue time has its prop. You initial the bottom. The stage manager will collect it.

You have eighty-two minutes.`,
                effects: [
                  { setFlags: { 'm1.reckoner.solved': true } },
                  { advanceToMovement: { movementId: 'm2', targetRoom: 'workshop-letters' } },
                ],
              }),
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M2 — The Notebook
    // ════════════════════════════════════════════════════════════════════════

    'dressing-vanity': {
      id: 'dressing-vanity',
      name: 'Dressing Room — the Vanity',
      exits: [],
      dreamer: {
        entry: `Back at the vanity. The bulbs throw their warm light. The notebook is open. A small portrait of Maestro Levin is tucked behind it — you had forgotten he was there.

You can feel each page of the notebook before you see it. The shapes settle when your hand rests on them.`,
        look: `The vanity. The Mentor's notebook open. The portrait of Maestro Levin. The decanter, the photograph of Liesl, the mirror frame. The radiator behind you.`,
        items: [
          {
            id: 'mentor-notebook',
            name: "the Mentor's notebook",
            examine: `Cracked leather. Pages dense with diagrams and marginalia. The pages refuse to settle when you look directly. You feel each page more than you see it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `You turn the pages. Each one resolves to an image only when your hand rests on it.

  — a bird in flight beside a broken cup, with cramped marginalia
  — a room with two doors and no walls
  — a diagram that looks like a heart
  — a cabinet with a single eye on its face
  — concentric circles around a name you cannot read
  — a spiral staircase descending
  — a mask above a flame
  — an open hand offering a key

Eight pages. One of them is the page he wrote about.`,
              }),
            },
          },
          atmoRead(
            'liesl-photograph-vanity',
            "Liesl's photograph",
            'Still in the mirror frame. The summer behind her is still bright.',
            `You will write to her in the morning.`
          ),
          atmoRead(
            'decanter-vanity',
            'the decanter',
            'Half-drunk. Warm from the bulbs.',
            `Emil came up with the brandy and left without saying anything. You smile despite yourself.`
          ),
          atmoRead(
            'mirror-frame-vanity',
            'the mirror frame',
            'Wood, scratched at the corners. The bulbs around it cast amber on your hands.',
            `You meet your own eyes again and look away again.`
          ),
          atmoRead(
            'mentor-photograph-vanity',
            "a portrait of Maestro Levin",
            'A small framed photograph tucked behind the notebook. Maestro Levin, taken around 1893. He is looking past the camera.',
            `He has been dead nine years. He is in the room because the notebook is in the room.`
          ),
          atmoRead(
            'radiator-vanity-m2',
            'the radiator',
            'Behind you. Clanking softly.',
            `Steam. The hour continues.`
          ),
          {
            id: 'page-pick',
            name: 'the open notebook (page selection)',
            examine: `The notebook is open. You can lock your hand on the matching page when you know which it is.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Maestro Levin's letter is downstairs on the workshop bench. The letter refers to one of these pages. You will need to know which.` }),
            },
            device: {
              kind: 'slot-assign',
              invoke: 'use',
              slots: [
                { id: 'page', label: 'The matching page' },
              ],
              options: [
                { id: 'bird-broken-cup', label: 'the bird and the broken cup' },
                { id: 'two-doors',       label: 'the room with two doors' },
                { id: 'heart-diagram',   label: 'the diagram that looks like a heart' },
                { id: 'cabinet-eye',     label: 'the cabinet with a single eye' },
                { id: 'circles',         label: 'concentric circles around a name' },
                { id: 'staircase',       label: 'a spiral staircase descending' },
                { id: 'mask-flame',      label: 'a mask above a flame' },
                { id: 'hand-key',        label: 'an open hand offering a key' },
              ],
              correct: { 'page': 'bird-broken-cup' },
              prompt: "Maestro Levin's letter refers to one of these pages. The letter is downstairs in the workshop.",
              onSolve: () => ({
                text: `Your hand settles on the page. The bird, the cup, the cramped marginalia. Beneath the drawing, in Maestro's precise hand:

"Never build what you cannot dismantle alone. The release is always at the bottom. Check it before every rise of the curtain. The day you skip it is the day it matters."

You read it twice. You read it a third time.`,
                effects: [
                  { setFlags: { 'm2.dreamer.solved': true } },
                  { advanceToMovement: { movementId: 'm3', targetRoom: 'backstage-corridor' } },
                ],
              }),
            },
          },
        ],
      },
    },

    'workshop-letters': {
      id: 'workshop-letters',
      name: 'Workshop — the Letters',
      exits: [],
      reckoner: {
        entry: `Back at the workshop, the bench now cleared. Maestro Levin's letter stands on a small frame — you put it there years ago, you read it before opening nights. The filing cabinet behind you holds the rest of his correspondence. A photograph of him on the shelf above the bench.`,
        look: `The Mentor's letter on its stand. The filing cabinet of correspondence. The mentor's portrait above the bench. The chalkboard redrawn. The tools. The maxim awaiting completion.`,
        items: [
          {
            id: 'mentor-letter',
            name: "Maestro Levin's letter",
            examine: `Two pages in his precise hand, dated 1899. You have read it a hundred times.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `Two pages, the ink a little faded.

"…you will find what you need on the page with the bird and the broken cup. Do not skip the marginalia. The maxim there is the one I taught you in your first year — and the one you will, when you are honest with yourself, have already broken. Read it again. Read it tonight. Read it before every rise of the curtain."

He does not write the maxim out. He knew you would have to look at the page.`,
              }),
            },
          },
          {
            id: 'correspondence-cabinet',
            name: 'the filing cabinet of correspondence',
            examine: `Steel, four drawers. The Mentor's letters, mostly. A few from old colleagues.`,
            actions: ['examine', 'open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `You know the contents by heart.` }),
              open: () => ({ text: `You pull the top drawer. Three folders of his letters, in date order. None of the others bear on tonight.` }),
            },
          },
          atmoRead(
            'mentor-portrait-workshop',
            'the portrait of Maestro Levin',
            'On the shelf above the bench. The same photograph as the one on the vanity upstairs. He is looking past the camera here too.',
            `You inherited the bench from him. You inherited the maxim from him. You have not yet inherited his death.`
          ),
          atmoRead(
            'chalkboard-redrawn-m2',
            'the chalkboard',
            'The running order, unchanged from before. You glance at it without reading.',
            `It will not change between now and curtain.`
          ),
          atmoRead(
            'workbench-tools-m2',
            'the workbench tools',
            'Calipers, mallet, loupe. Where you left them.',
            `You straighten the mallet. Habit again.`
          ),
          {
            id: 'maxim',
            name: 'the maxim (to be completed)',
            examine: `A blank-line completion at the foot of the Mentor's letter. The first half is written; the last two words are missing.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `"Never build what you cannot ___ ___."

Two words. The notebook upstairs in the dressing room carries the canonical form.` }),
            },
            device: {
              kind: 'slot-assign',
              invoke: 'use',
              multiOption: true,
              slots: [
                { id: 'w1', label: 'First word' },
                { id: 'w2', label: 'Second word' },
              ],
              options: [
                { id: 'lift',      label: 'lift' },
                { id: 'repair',    label: 'repair' },
                { id: 'dismantle', label: 'dismantle' },
                { id: 'forgive',   label: 'forgive' },
                { id: 'together',  label: 'together' },
                { id: 'alone',     label: 'alone' },
                { id: 'again',     label: 'again' },
                { id: 'safely',    label: 'safely' },
              ],
              correct: { 'w1': 'dismantle', 'w2': 'alone' },
              prompt: 'Complete the maxim. The notebook upstairs in the dressing room carries the canonical form.',
              onSolve: () => ({
                text: `The maxim closes. "Never build what you cannot dismantle alone."

You write it in your own hand at the foot of the letter, beside his. The two hands together. You have done this every opening night for six years.

The hour continues.`,
                effects: [
                  { setFlags: { 'm2.reckoner.solved': true } },
                  { advanceToMovement: { movementId: 'm3', targetRoom: 'orchestra-pit-edge' } },
                ],
              }),
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M3 — The Aria
    // ════════════════════════════════════════════════════════════════════════

    'backstage-corridor': {
      id: 'backstage-corridor',
      name: 'Backstage Corridor',
      exits: [
        { direction: 'east', roomId: 'mirror-nook' },
      ],
      dreamer: {
        entry: `The corridor between dressing rooms and the wings. Velvet curtains on the wall. The orchestra is rehearsing tonight's aria through the plaster. You know the piece — Fauré's Pavane.

You stand still. You listen.`,
        look: `The velvet drape. The bulletin board. The corridor. The faint music through the wall. The mirror nook east, where the music is closest.`,
        items: [
          atmoRead(
            'corridor-velvet',
            'velvet curtains on the wall',
            'A drape between dressing-room doors. Dust in the folds.',
            `You touch it without thinking. Old velvet. Steady weight.`
          ),
          atmoRead(
            'corridor-emils-voice-distant',
            "Emil's voice, distant",
            'Through the floor and the velvet, very faintly. He is in the workshop, talking to himself the way he does when he works.',
            `You cannot hear the words. You can hear that it is him.`
          ),
          atmoRead(
            'corridor-bulletin',
            'a bulletin board',
            'A small board on the wall. Tonight\'s notices. A note from the stage manager. A pinned cue sheet.',
            `Nothing on it is for you. You move on.`
          ),
          atmoRead(
            'corridor-rehearsal-music',
            'the rehearsal music',
            "The aria through the wall. You know this piece — you have heard it a thousand times. You can hum back what you just heard.",
            `The vanish cue is in this piece. Somewhere in this bar. You will know it when you feel it.`
          ),
        ],
      },
    },

    'mirror-nook': {
      id: 'mirror-nook',
      name: 'The Mirror Nook',
      exits: [
        { direction: 'west', roomId: 'backstage-corridor' },
      ],
      dreamer: {
        entry: `A narrow nook beside the corridor wall. A small mirror, tilted. The wall is thinner here — the music carries clean. A folded note is tucked behind the mirror.

This is where you come to listen when you need to listen carefully.`,
        look: `The small tilted mirror. The thin wall, the music close. A folded note. The cue-beat marker.`,
        items: [
          atmoRead(
            'nook-mirror-small',
            'a small tilted mirror',
            'A hand-mirror mounted at face height. Your face from a strange angle. The corridor doubles back behind you in the glass.',
            `You see your face from the side. It is not your performance face.`
          ),
          atmoRead(
            'nook-wall',
            'the thin wall',
            "Your hand on the plaster. The music is right there. You can feel the rhythm through the wall.",
            `Your fingers count from the opening. The vanish cue lands one bar earlier than the conductor's first mark — the renumber held. The piece told you. The piece always tells you.`
          ),
          {
            id: 'nook-emils-note',
            name: "a folded note (Emil's hand)",
            examine: `Tucked behind the mirror. You did not know it was there. It is in his hand.`,
            actions: ['examine', 'take'],
            takeable: true,
            inventory: { label: "a paper warm from his hand", examine: "A folded paper, warm from where it sat behind the mirror. His handwriting on it." },
            onAction: {
              examine: () => ({
                text: `"A. — please don't test the new Cabinet tonight. Not without me checking it first. The counterweight isn't the same as the old one. The release is on the wrong side. You'll reach for it where it used to be, and your hand will find nothing.

I know you don't want to hear this. But I promised him I'd keep you safe.

— E."

You fold it back. You leave it in the mirror. You do not change your mind.`,
              }),
            },
          },
          {
            id: 'melody-beat',
            name: 'the cue-beat marker',
            examine: `A small wooden lever mounted in the nook beside the wall. One position from 1 to 8. The conductor's beats for the bar where the cue lands. You can hear the music through the plaster; the downbeat annotation is on the score, far away in the pit.`,
            actions: ['examine', 'open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `You will need to know which beat of the bar the cue lands on. The score has the annotation; the score is in the pit.` }),
            },
            device: {
              kind: 'combination',
              invoke: 'open',
              digits: 1,
              correct: '3',
              prompt: 'Mark the beat-within-bar where the vanish cue lands.',
              labels: ['beat'],
              onSolve: () => ({
                text: `The lever settles on 3. You feel the bar fall into place around it. You know exactly where the cue is now — your hand will move on its own when the moment comes.

The hour continues.`,
                effects: [
                  { setFlags: { 'm3.dreamer.solved': true } },
                  { advanceToMovement: { movementId: 'm4', targetRoom: 'stage-wing-final' } },
                ],
              }),
            },
          },
        ],
      },
    },

    'orchestra-pit-edge': {
      id: 'orchestra-pit-edge',
      name: 'Orchestra Pit (Edge)',
      exits: [
        { direction: 'east', roomId: 'conductor-stand' },
      ],
      reckoner: {
        entry: `The edge of the orchestra pit, stage-right. A waist-high rail. You can see the conductor below at his stand. He is rehearsing the aria — Fauré's Pavane. He marks something on the score, frowns, keeps going.

A small annexed conductor's stand sits along the rail.`,
        look: `The pit rail. The conductor visible below. A stagehand at the door. A program corner. The annexed stand east.`,
        items: [
          atmoRead(
            'pit-rail',
            'the pit rail',
            'A brass rail along the edge. Polished by hands.',
            `You rest your hands on it. You watch.`
          ),
          atmoRead(
            'pit-conductor-visible',
            'the conductor at his stand',
            "He is rehearsing. He gestures emphatically. The baton stops at a bar; he marks it; he keeps going. You cannot see what he wrote.",
            `He has been the Apollo's conductor for eleven years. You trust his ear.`
          ),
          atmoRead(
            'pit-stagehand',
            'a stagehand',
            'At the side door of the pit. Smoking. He nods to you. You nod back.',
            `He has been here longer than the conductor.`
          ),
          atmoRead(
            'pit-program-corner',
            'a corner of a program',
            'A folded corner of tonight\'s program, abandoned on the rail. Same as the workshop\'s.',
            `You leave it where it is.`
          ),
        ],
      },
    },

    'conductor-stand': {
      id: 'conductor-stand',
      name: "Conductor's Stand",
      exits: [
        { direction: 'west', roomId: 'orchestra-pit-edge' },
      ],
      reckoner: {
        entry: `A small annexed stand at the back of the pit, beside the rail. The conductor leaves his score here between rehearsals; he is in front of the orchestra now. You have a quarter of an hour while he conducts before he comes back.

The score is open. The dial for the cue is on the stand beside it.`,
        look: `The conductor's score. The baton on its rest. The stool. Margins decoyed with other annotations. The bar-cue dial.`,
        items: [
          {
            id: 'conductor-score',
            name: "the conductor's score",
            examine: `Fauré, Pavane, Op. 50. Heavily annotated.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({
                text: `At bar 47, in the conductor's hand: "VANISH CUE — downbeat of the third beat."

But — he has crossed out a repeat earlier in the piece, at bars 44–49, and renumbered. The cue marker was not moved when he renumbered.

You will need to know whether the cue follows the renumber, or stays at the original bar. The piece itself will tell you, if you can hear it.`,
              }),
            },
          },
          atmoRead(
            'conductor-baton-m3',
            "the conductor's baton",
            'On a rest on the stand. White, tipped in black.',
            `You do not touch it. You know better.`
          ),
          atmoRead(
            'conductor-stool-m3',
            "the conductor's stool",
            'A high wooden stool, scratched at the foot. He sits on it between rehearsals.',
            `You stand beside it.`
          ),
          atmoRead(
            'score-margins-decoy',
            'other annotations',
            "The score's other margins. Notes about tempo. A reminder to himself to retighten the first violin. A small caricature.",
            `None of them concern tonight\'s cue.`
          ),
          {
            id: 'bar-dial',
            name: 'the bar-cue dial',
            examine: `A small brass dial mounted beside the score on the stand. Three digits. Currently reads 000.`,
            actions: ['examine', 'open'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Three brass wheels. The corrected bar number lives here. The conductor will check the dial before he gives the downbeat.` }),
            },
            device: {
              kind: 'combination',
              invoke: 'open',
              digits: 3,
              correct: '046',
              prompt: 'Set the corrected vanish-cue bar number.',
              onSolve: () => ({
                text: `The dial clicks at 046. The score's marker shifts. The cue is set for the corrected bar — half a bar earlier than the conductor first marked. He will see the change when he comes back. He will nod once and keep going.

The hour continues.`,
                effects: [
                  { setFlags: { 'm3.reckoner.solved': true } },
                  { advanceToMovement: { movementId: 'm4', targetRoom: 'understage-trap' } },
                ],
              }),
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // M4 — Five Minutes
    // ════════════════════════════════════════════════════════════════════════

    'stage-wing-final': {
      id: 'stage-wing-final',
      name: 'Stage-Left Wing — Five Minutes',
      exits: [],
      dreamer: {
        entry: `Five minutes. The orchestra is tuning in the pit. The audience is in. The cabinet is at centre stage. You stand in the wings and feel the room.

Something is wrong. The air is off. A hum is missing or extra. You cannot say what.`,
        look: `The breathing curtain. The cabinet at centre stage, felt from here. The bell on the table. The silks. Emil's coat on the chair. The air, off. The region map.`,
        items: [
          atmoRead(
            'final-curtain',
            'the curtain (breathing)',
            'Deep red, floor to ceiling. Three hundred people behind it. Their warmth comes through the velvet.',
            `You can feel them before you can see them. You are calm.`
          ),
          atmoRead(
            'final-cabinet-on-stage',
            'the cabinet (felt from here)',
            'The new cabinet at centre stage. You feel it from the wings without seeing it clearly. Something is wrong near it. You cannot say more without naming the region.',
            `You step closer in the wings. The wrongness does not move. It is settled somewhere — you would know it if you walked past it.`
          ),
          atmoRead(
            'final-bell-on-table',
            'the silver bell on the prop table',
            'Wrapped in felt. In the third position. Where it should be.',
            `Untouched since you placed it.`
          ),
          atmoRead(
            'final-silks-on-table',
            'the silks on the prop table',
            'Folded. In their position.',
            `They will lift well tonight.`
          ),
          atmoRead(
            'final-emils-coat-on-chair',
            "Emil's coat on a chair",
            'In the wings. He is on stage with the conductor.',
            `He will be with you. He will be in the right place. He always is.`
          ),
          atmoRead(
            'final-air',
            'the air',
            "Cold where it should be warm. A hum where it should be silent. You cannot name it. You can only feel where it is.",
            `It is not your imagination. It is information.`
          ),
          {
            id: 'region-feel',
            name: 'the region you feel is wrong',
            examine: `You can narrow the wrongness by where your body wants to be. You point.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Your body will point. The under-stage workshop is below; whoever is there will need to know the region.` }),
            },
            device: {
              kind: 'slot-assign',
              invoke: 'use',
              slots: [
                { id: 'region', label: 'Where the wrongness is' },
              ],
              options: [
                { id: 'cabinet-low-cold',    label: 'near the cabinet, low to the floor, cold where it should be warm' },
                { id: 'cabinet-high-humming', label: 'high on the cabinet, a humming that wasn\'t there yesterday' },
                { id: 'trapdoor-below',      label: 'below the stage, behind the trapdoor' },
                { id: 'counterweight-column', label: 'at the counterweight column' },
                { id: 'orchestra-wall',      label: 'by the orchestra wall, the music too loud here' },
                { id: 'above-curtain',       label: 'above the curtain rod, a draft that shouldn\'t be' },
              ],
              correct: { 'region': 'cabinet-low-cold' },
              prompt: 'Narrow it by feeling. Where is the wrongness?',
              onSolve: () => ({
                text: `You touch the cabinet, low, near the floor. The counterweight is colder than it should be. You don't know what is wrong, only that it is here. You tell Emil — through the floor, through the boards, in the way you have learned to tell him things in the seconds before curtain.

He hears you. He acts.`,
                effects: [
                  { setFlags: { 'm4.dreamer.solved': true } },
                  { advanceToMovement: { movementId: 'coda', targetRoom: 'wings-curtain-up' } },
                ],
              }),
            },
          },
        ],
      },
    },

    'understage-trap': {
      id: 'understage-trap',
      name: 'Under-Stage Trap',
      exits: [],
      reckoner: {
        entry: `Below the stage. The trapdoor mechanism overhead. The cabinet's underside. The counterweight column. A handheld lamp. The schematic on a clip beside you.

Your partner above will tell you where to look. You will find it.`,
        look: `The trap mechanism. The cabinet underside schematic. The oil can. The lamp. The cabinet leg supports. The components ready to be inspected.`,
        items: [
          atmoRead(
            'trap-mechanism',
            'the trapdoor mechanism',
            'Iron. Greased recently. The spring is taut.',
            `You test it with a fingertip. It is correct.`
          ),
          {
            id: 'cabinet-underside-schematic',
            name: "the cabinet's underside schematic",
            examine: `Clipped to a stand. The components labelled in your hand — you drew this. The counterweight column is on the left; the release plate is on the right (different from V1). The bolts, ropes, cleats, and the skirt are labelled in turn.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Six components in the region near the cabinet. You can inspect each.` }),
            },
          },
          atmoRead(
            'trap-oil-can',
            'an oil can',
            'On the floor beside the schematic. Half-full. You used it on the spring last week.',
            `You put it down where it was.`
          ),
          atmoRead(
            'understage-lamp',
            'a handheld lamp',
            'A small electric lamp on a wire. The bulb is bright. You can move it close to the inspection.',
            `You hold it where you need to.`
          ),
          atmoRead(
            'cabinet-leg-supports',
            'the cabinet leg supports',
            "Four iron supports under the cabinet's corners. Bolted to the boards.",
            `Each one solid. None of them the fault.`
          ),
          {
            id: 'component-inspect',
            name: 'the fault to identify',
            examine: `You will inspect the components narrowed to by the region the wings have surfaced.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Six components in the cabinet's underside region. The wings above have the feeling of where; you have the schematic of what. You identify which one.` }),
            },
            device: {
              kind: 'slot-assign',
              invoke: 'use',
              slots: [
                { id: 'fault', label: 'The fault' },
              ],
              options: [
                { id: 'counterweight-bolt', label: 'Counterweight bolt (low, at the column base)' },
                { id: 'release-plate',     label: 'Release plate (right side, mid-height)' },
                { id: 'hinge-pin',         label: 'Cabinet hinge pin (upper-right corner)' },
                { id: 'trap-rope',         label: 'Trap rope (overhead, behind the cabinet)' },
                { id: 'floor-cleat',       label: 'Floor cleat (front-left, holding the cabinet down)' },
                { id: 'cabinet-skirt',     label: 'Cabinet skirt (around the base, all sides)' },
              ],
              correct: { 'fault': 'counterweight-bolt' },
              prompt: 'Inspect the components in the indicated region. Identify the fault.',
              onSolve: () => ({
                text: `You find it. The counterweight bolt has slipped half an inch since your inspection last week. Harmless with Emil there to catch it; dangerous in principle. You take a wrench from your belt; you turn the bolt three quarters; you tighten the locknut against it. The lock clicks home.

The hour is almost ended.`,
                effects: [
                  { setFlags: { 'm4.reckoner.solved': true } },
                  { advanceToMovement: { movementId: 'coda', targetRoom: 'workshop-stairs-coda' } },
                ],
              }),
            },
          },
        ],
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    // CODA — The Curtain
    // ════════════════════════════════════════════════════════════════════════

    'wings-curtain-up': {
      id: 'wings-curtain-up',
      name: 'The Wings — Curtain Up',
      exits: [],
      dreamer: {
        entry: `The curtain rises. The audience becomes one body, gasping. The footlights are warm. The cabinet at centre, the silver bell on its stand, the silks ready to fly. Your costume catches the light.

You step onto the stage. The trick lands. The audience erupts. You come back into the wings. Emil's hand finds yours.`,
        look: `The risen curtain. The stage from the wings. Emil's hand. The audience warmth. The hungry thought. The bow waiting.`,
        items: [
          atmoRead(
            'coda-curtain-rising',
            'the risen curtain',
            'Up at last. Three hundred people on the other side, holding their breath.',
            `You take the breath you have been holding for ninety minutes.`
          ),
          atmoRead(
            'coda-stage-from-wings',
            'the stage from the wings',
            'The footlights warm. The cabinet at centre. Your body knows what to do.',
            `You step out. Your body knows.`
          ),
          {
            id: 'coda-emils-hand',
            name: "Emil's hand",
            examine: `On yours as you come off the stage. Brief. Warm. He does not say anything. He never does after this trick.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `He squeezes once and lets go. He has to be back on stage in twelve minutes. You watch him go.` }),
            },
          },
          atmoRead(
            'coda-audience-warmth',
            'the audience warmth',
            'Through the velvet, the heat of three hundred bodies and three hundred breaths.',
            `It belongs to you tonight. You belong to it tonight.`
          ),
          {
            id: 'coda-the-hungry-thought',
            name: 'a thought you are already having',
            examine: `As you stand in the wings, you are thinking about what you could do next. Bigger. More.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `A larger cabinet. More compartments. Fewer redundancies. You can see it in your head now, the way you see costumes.

You are not afraid. You are hungry. You have not yet named the difference.` }),
            },
          },
          {
            id: 'coda-bow',
            name: 'the bow',
            examine: `The audience is still applauding. You can step out once more and bow.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Twelve seconds. The applause holds.` }),
              use: () => ({
                text: `You step into the bow. The audience holds you. The applause settles into rhythm. You straighten. You step back. The curtain comes down on you slowly.

You will do this again tomorrow night. And the next. And the night after that.`,
                effects: [{ setFlags: { 'm4.dreamer.acknowledged': true } }],
              }),
            },
          },
        ],
      },
    },

    'workshop-stairs-coda': {
      id: 'workshop-stairs-coda',
      name: 'The Workshop Stairs',
      exits: [],
      reckoner: {
        entry: `Below the stage again. You have come down the back stairs to catch your breath after the trick. The workshop is at your back; the stairs at your front. There is a small mirror nailed beside the door — habit, from years of leaving fast.

A schematic has fallen on the floor. You drew it between cues. You did not mean to leave it where someone might find it.`,
        look: `The stairs. The small mirror. The workshop lamp low. A schematic on the floor.`,
        items: [
          atmoRead(
            'coda-stairs-breath',
            'the stairs',
            'Eight steps up to the wings, eight back down. You catch your breath on the third.',
            `The trick landed. Your hands are steady.`
          ),
          {
            id: 'coda-small-mirror',
            name: 'a small mirror',
            examine: `Beside the door. Hand-sized. Your reflection in it.`,
            actions: ['examine'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `For a single beat, the woman in the mirror is hungry. Then she is not. Then she is you again.

You straighten your collar. You look away.` }),
            },
          },
          {
            id: 'coda-new-schematic-on-floor',
            name: 'a schematic on the floor',
            examine: `On the boards. Your hand. A larger cabinet. More compartments than the current one. The release column is missing — no safety release at all. You drew this between cues, without meaning to.`,
            actions: ['examine', 'take'],
            takeable: true,
            inventory: { label: 'New schematic', examine: 'Your own drawing of a cabinet you have not built yet.' },
            onAction: {
              examine: () => ({ text: `You stare at it. You did not mean to draw it. You did. The release column is missing in the drawing the way a tooth is missing in a smile.` }),
            },
          },
          atmoRead(
            'coda-workshop-lamp-coda',
            'the workshop lamp',
            'Low on its chain. You have not turned the valve down. The flame is steady.',
            `You will turn it down before you go up.`
          ),
          {
            id: 'coda-fold-schematic',
            name: 'fold the schematic',
            examine: `You can fold the schematic and slip it under the bench.`,
            actions: ['examine', 'use'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              examine: () => ({ text: `Under the bench. Out of sight. Not gone.` }),
              use: () => ({
                text: `You fold it twice and slip it under the bench. Out of sight. Not gone.

You go up the stairs. The applause is still ending above you.`,
                effects: [{ setFlags: { 'm4.reckoner.acknowledged': true } }],
              }),
            },
          },
        ],
      },
    },

  },

  triggers: [
    // Per-side chapter completion. Each device fires its own ch01.complete +
    // state.completed independently. Players coordinate verbally on when to
    // tap Return on each device.
    {
      id: 'chapter-complete-dreamer',
      side: 'dreamer',
      once: true,
      when: [
        { flag: 'm1.dreamer.solved',       value: true },
        { flag: 'm2.dreamer.solved',       value: true },
        { flag: 'm3.dreamer.solved',       value: true },
        { flag: 'm4.dreamer.solved',       value: true },
        { flag: 'm4.dreamer.acknowledged', value: true },
      ],
      then: [
        { setFlags: { 'ch01.complete': true } },
        { complete: true },
      ],
    },
    {
      id: 'chapter-complete-reckoner',
      side: 'reckoner',
      once: true,
      when: [
        { flag: 'm1.reckoner.solved',       value: true },
        { flag: 'm2.reckoner.solved',       value: true },
        { flag: 'm3.reckoner.solved',       value: true },
        { flag: 'm4.reckoner.solved',       value: true },
        { flag: 'm4.reckoner.acknowledged', value: true },
      ],
      then: [
        { setFlags: { 'ch01.complete': true } },
        { complete: true },
      ],
    },
  ],
};
