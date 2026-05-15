import type { Chapter, ActionContext } from '../types';

export const Ch01: Chapter = {
  id: 'ch01',
  title: 'The Apollo',
  starts: {
    dreamer: 'dressing-room',
    reckoner: 'workshop',
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

  rooms: {
    'dressing-room': {
      id: 'dressing-room',
      name: 'Dressing Room',
      exits: [
        { direction: 'north', roomId: 'stage-wing' },
      ],
      dreamer: {
        entry: `Warm amber light spills from the mirror bulbs, catching the rim of a crystal decanter half-drunk. The air is heavy — greasepaint, perfume, the ghost of cigarette smoke.

Your costume hangs on a brass rack — deep velvet, midnight blue, patient. Through the wall, the orchestra is tuning. A voice that might be Emil's carries from somewhere below.

A photograph is tucked into the mirror frame. The Mentor's notebook lies open on the vanity.`,

        look: `The dressing room breathes. The mirror bulbs cast their warm glow on everything — the decanter, the notebook, the photograph. A small note is tucked beneath the decanter.

Tomorrow's schedule waits on the vanity. Through the wall, the orchestra continues its tuning.`,

        ambient: 'dressing-room',
        items: [
          {
            id: 'decanter', name: 'crystal decanter',
            examine: `A heavy crystal decanter, half-full of amber liquid. Numbers are etched into the glass: 7, 3, 1, 4. The glass is warm from the lamp.`,
            actions: ['examine'], takeable: true,
            inventory: { label: 'Decanter', examine: 'A heavy crystal decanter. Numbers 7-3-1-4 etched on the side.' },
            onAction: {
              examine: () => ({ text: 'You examine the decanter. The numbers 7, 3, 1, 4 catch the lamplight. Etched cleanly, deliberately — not a wear pattern. Someone put them there on purpose.', effects: [{ setFlags: { 'ch01.decanter-examined': true } }] }),
            },
          },
          { id: 'costume', name: 'velvet costume', examine: 'Deep velvet, midnight blue. The fabric holds the warmth of a thousand stage lights. You have worn this for every major performance.', actions: ['examine'], takeable: false, inventory: { label: 'Costume', examine: 'Deep velvet, midnight blue.' } },
          {
            id: 'notebook', name: "Mentor's notebook",
            examine: `The Mentor's notebook, bound in cracked leather. Pages dense with ink — diagrams, symbols, marginalia. Each page seems to shift when you're not looking directly at it.

You turn the pages. A bird in a cage beside a broken cup. A room with two doors. A larger cabinet. A single eye.

One page holds your attention — the bird and the broken cup. Below it, in tiny script: "The release is always at the bottom."`,
            actions: ['examine', 'open'], takeable: false,
            inventory: { label: 'Notebook', examine: "The Mentor's notebook, cracked leather." },
            onAction: {
              examine: () => ({
                text: `You turn to the page with the bird and the broken cup.

Beneath the drawing, in the Mentor's precise hand: "The release is always at the bottom. Check it before every rise of the curtain. The day you skip it is the day it matters."

His voice, across the years.`,
                effects: [{ setFlags: { 'ch01.notebook-page-found': true } }],
              }),
              open: () => ({ text: 'The notebook falls open to a page with a bird and a broken cup.' }),
            },
          },
          { id: 'photograph', name: 'photograph', examine: 'A small photograph tucked into the mirror frame. A child — eight years old, maybe — squinting in the sun. Liesl. You feel something twist when you look at it.', actions: ['examine'], takeable: false, inventory: { label: 'Photo', examine: 'Liesl, summer 1905.' } },
          {
            id: 'emils-note', name: "Emil's note",
            examine: 'A folded note, tucked beneath the decanter. Emil\'s handwriting.',
            actions: ['examine'], takeable: true,
            inventory: { label: "Emil's note", examine: 'A folded note in Emil\'s hand.' },
            onAction: {
              examine: () => ({
                text: `"Moved the silks to the left wing. Safer there. Trust me."

You smile despite yourself. He's always adjusting things. The silks are in the left wing now.

He's probably right.`,
                effects: [{ setFlags: { 'ch01.emils-note-read': true }, addItem: 'silks-found' }],
              }),
            },
          },
          {
            id: 'wardrobe', name: 'wardrobe',
            examine: 'A tall oak wardrobe. Heavy. The door is slightly ajar.',
            actions: ['open', 'push'], takeable: false,
            inventory: { label: 'Wardrobe', examine: 'A tall oak wardrobe.' },
            onAction: {
              open: (ctx: ActionContext) => {
                if (ctx.flags['ch01.cabinet-code-entered']) {
                  return { text: 'The wardrobe swings open. Inside, a small compartment you hadn\'t noticed before. A photograph falls out — Emil, younger, holding Liesl as a baby.', effects: [{ setFlags: { 'ch01.wardrobe-opened': true } }] };
                }
                return { text: 'The wardrobe is mostly empty — a few hangers, an old coat.' };
              },
              push: () => ({ text: 'The wardrobe is too heavy to move. It might as well be part of the wall.' }),
            },
          },
        ],
      },
      reckoner: {
        entry: `Dressing Room 4 — Apollo-Saal. A typewritten inventory is taped to the door: "Props checked: 12/14." The steam radiator clanks rhythmically.

A steel filing cabinet stands against the far wall. The vanity is organized: program, correspondence, a telegram. 

One item is unchecked: "crystal decanter — see ledger entry: Emil — birth."`,

        look: `Dressing Room 4. Filing cabinet against the far wall. Vanity with program, correspondence, inventory sheet. Telegram leans against the mirror. Radiator clanking.`,

        ambient: 'dressing-room',
        items: [
          { id: 'inventory-sheet', name: 'inventory sheet', examine: 'Typewritten inventory: "Dressing Room 4 — Apollo-Saal, 1907." 14 props listed, 12 checked.\n\nItem #7 — Crystal decanter. Notation: "Etched with year of birth. See ledger entry: Emil Roth, b. 1872."\n\nItem #14 — [blank] "Relocated per E. Roth."', actions: ['examine'], takeable: true, inventory: { label: 'Inventory sheet', examine: 'Dressing Room 4 inventory. 14 props.' } },
          { id: 'letter', name: 'management letter', examine: 'Unopened letter from Apollo-Saal management, addressed to "Madame Vespera, c/o Artist Entrance." Postmarked 3 days ago. Seal intact.', actions: ['examine'], takeable: true, inventory: { label: 'Mgt letter', examine: 'Unopened management letter.' } },
          { id: 'telegram', name: 'telegram', examine: 'Unopened telegram. Addressed to "Becker, c/o Apollo-Saal Vienna." Postmarked Budapest, 3 days ago. Sender: "V."', actions: ['examine', 'open'], takeable: true, inventory: { label: 'Telegram', examine: 'Telegram from Budapest. Sender: V.' } },
          {
            id: 'filing-cabinet', name: 'filing cabinet',
            examine: 'Steel filing cabinet, four drawers. Labels: "Correspondence 1907," "Safety Certificates," "Contracts," "Personal." The Safety drawer is slightly ajar.',
            actions: ['open', 'push'], takeable: false, inventory: { label: 'Filing cabinet', examine: 'Steel filing cabinet.' },
            onAction: {
              open: () => ({
                text: `You pull open the Safety drawer. Inside: certificates dating back years. A recent one catches your eye:

"Cabinet apparatus inspected 14 days ago. Counterweight bolt shows wear — replace before next tour." Initialled "E.R."

A separate sheet is tucked behind it — a handwritten note from Emil: "Counterweight replaced. New Cabinet's release is on the RIGHT side, not the left. Don't let her perform without knowing this."`,
                effects: [{ setFlags: { 'ch01.safety-cert-found': true }, addItem: 'safety-cert' }],
              }),
              push: () => ({ text: 'The cabinet is bolted to the wall.' }),
            },
          },
          {
            id: 'program', name: 'evening program',
            examine: `Tonight's program. Typewritten:

20:00 — The Cabinet (Madame Vespera)
20:12 — The Silver Bell
20:24 — The Silks
20:36 — Intermission

Scrawled in pencil on the margin: "Cabinet cue at bar 47 — watch conductor's downbeat." Something about the cue annotation seems off — a number crossed out beneath it.`,
            actions: ['examine'], takeable: true, inventory: { label: 'Program', examine: 'Tonight\'s program.' },
          },
        ],
      },
    },
    'workshop': {
      id: 'workshop',
      name: 'Workshop',
      exits: [
        { direction: 'south', roomId: 'stage-wing' },
      ],
      dreamer: {
        entry: `The workshop is cold. Brick and iron and the smell of old fire. The workbench holds shapes you know by touch — a Cabinet mechanism, a Bell's clapper wrapped in felt, the Silks folded in their box.

Emil's coat hangs on the back of the chair. The chalkboard is covered in his handwriting — timings, positions, notes.

Your fingers brush the Cabinet's corner. A memory surfaces: sawdust, Emil laughing at something the Mentor once said.`,

        look: `The workshop in half-dark. Tools hang in neat rows. The Cabinet looms in the corner, its mechanism exposed. The chalkboard covered in Emil's script.

A safety release is visible on the Cabinet's side, hidden behind a small brass plate.`,

        ambient: 'workshop',
        items: [
          {
            id: 'chalkboard', name: 'chalkboard',
            examine: `The running order, in Emil's neat hand. Something catches your attention: a line partially erased.

"Cabinet — counterweight check" has been written and scrubbed out. Beneath it, faintly: "She hasn't checked it yet."`,
            actions: ['examine'], takeable: false, inventory: { label: 'Chalkboard', examine: 'The chalkboard.' },
          },
          {
            id: 'cabinet-apparatus', name: 'Cabinet apparatus',
            examine: `The Cabinet. You know it better than your own body — every hinge, every latch. But this one is different. The mechanism is newer, unfamiliar.

A small brass plate on the side hides the safety release. The counterweight is visible at the bottom — a heavy iron cylinder. It has been turned recently.`,
            actions: ['push', 'open'], takeable: false, inventory: { label: 'Cabinet', examine: 'The Cabinet apparatus.' },
            onAction: {
              push: (ctx: ActionContext) => {
                if (ctx.flags['ch01.release-checked']) {
                  return { text: 'You press the mechanism test. The counterweight engages smoothly. Everything is in order.', effects: [{ setFlags: { 'ch01.cabinet-tested': true } }] };
                }
                return { text: 'The mechanism feels firm. The counterweight is heavier than you remember. You should check the safety release before anything else.' };
              },
            },
          },
          {
            id: 'safety-release', name: 'safety release',
            examine: `The Mentor taught you this — always check it before every performance. A small brass lever behind a plate on the Cabinet's side.

It disengages the counterweight in an emergency. You haven't checked it tonight.`,
            actions: ['push'], takeable: false, inventory: { label: 'Safety release', examine: 'The safety release lever.' },
            onAction: {
              push: () => ({
                text: `You press the safety release. It moves smoothly. The counterweight mechanism is properly engaged.

The Mentor's voice, in your memory: "Never build what you cannot dismantle alone."

You let out a breath you didn't realize you were holding.`,
                effects: [{ setFlags: { 'ch01.release-checked': true } }],
              }),
            },
          },
          { id: 'emils-coat', name: "Emil's coat", examine: 'An old wool coat, worn at the elbows. You lift it — tobacco, sawdust, him. A ticket stub falls from the pocket: "Budapest — Vienna, Oct 29."', actions: ['examine'], takeable: false, inventory: { label: "Emil's coat", examine: 'An old wool coat.' } },
        ],
      },
      reckoner: {
        entry: `Below the stage. Narrow brick room, low ceiling. A single gas lamp illuminates the workbench — apparatus mid-assembly, a small forge cooled to embers.

Steel filing cabinets of diagrams. The chalkboard shows tonight's running order. The conductor's annotated score hangs beside the door.

On the bench: a typewritten contract. A telegram, unopened.`,

        look: `Workshop. Filing cabinets of schematics. Workbench with apparatus. Chalkboard with running order. Conductor's score on hook. Contract and telegram on bench.

The air smells of iron and cold ash.`,

        ambient: 'workshop',
        items: [
          {
            id: 'chalkboard', name: 'chalkboard',
            examine: `Running order:
20:00 — Cabinet (Vespera)
20:12 — Bell
20:24 — Silks
20:36 — Interval

Beneath, in Emil's hand: "A. — check the new Cabinet's counterweight. It's not the one we tested."
Crossed out below: "She hasn't listened yet."`,
            actions: ['examine'], takeable: false, inventory: { label: 'Chalkboard', examine: 'The chalkboard.' },
          },
          {
            id: 'conductors-score', name: "conductor's score",
            examine: `Fauré, "Pavane," Op. 50. The score is heavily annotated. At bar 47: "VANISH CUE — downbeat."

But look closer — the conductor has cut a repeat, renumbering bars 44-49. The original bar 47 is now bar 46. The cue is off by one bar.

If the conductor plays bar 46 and Emil cues the vanish at the marked "bar 47," they'll miss by a full bar.`,
            actions: ['examine'], takeable: false, inventory: { label: 'Score', examine: 'Conductor\'s annotated score.' },
          },
          { id: 'contract', name: 'management contract', examine: 'Apollo-Saal management contract. 4-week run, 6 performances weekly. Clause 7: "Artist responsible for own apparatus safety inspections." Signed by theatre director and "A. Becker." Dated October 1, 1907.', actions: ['examine'], takeable: true, inventory: { label: 'Contract', examine: 'Management contract.' } },
          {
            id: 'cabinet-schematics', name: 'Cabinet schematics',
            examine: `Technical drawing: Cabinet apparatus, Version 2.

Annotations in Emil's hand:
"Counterweight bolt — replace every 6 months."
"Safety release: lower-RIGHT, behind brass plate. Note: this is DIFFERENT from v1 (which was on the LEFT)."
"Prototype only. NOT FOR PERFORMANCE."

A second set of drawings is tucked behind — a larger Cabinet, more compartments. No safety release at all. The note reads: "For when she's ready."`,
            actions: ['examine'], takeable: true, inventory: { label: 'Schematics', examine: 'Cabinet v2 schematics.' },
            onAction: {
              examine: () => ({
                text: `You study the schematics carefully.

The v1 Cabinet had the safety release on the left. This new one — the prototype already on stage — has it on the right. A completely different mechanism.

The second set of drawings makes your stomach drop: a larger Cabinet with no safety release at all. The annotation: "For when she's ready."

Ready for what?`,
                effects: [{ setFlags: { 'ch01.schematics-read': true } }],
              }),
            },
          },
          {
            id: 'emils-note-cabinet', name: "Emil's note",
            examine: 'Handwritten, pinned to the bench. Folded and refolded many times.',
            actions: ['examine'], takeable: true, inventory: { label: "Emil's note", examine: 'A worn note.' },
            onAction: {
              examine: () => ({
                text: `"A. — please don't test the new Cabinet tonight. Not without me checking it first. The counterweight isn't the same as the old one. The release is on the wrong side. You'll reach for it where it used to be, and your hand will find nothing.

I know you don't want to hear this. But I promised him I'd keep you safe.

— E."`,
                effects: [{ setFlags: { 'ch01.emil-cabinet-note-read': true } }],
              }),
            },
          },
        ],
      },
    },
    'stage-wing': {
      id: 'stage-wing',
      name: 'Stage Wing',
      exits: [
        { direction: 'south', roomId: 'dressing-room' },
        { direction: 'north', roomId: 'workshop' },
        { direction: 'east', roomId: 'stage' },
      ],
      dreamer: {
        entry: `The wings. Velvet drapes heavy with dust and years. Through the curtain gap, the empty audience pit — you hear the echo of tonight's crowd yet to arrive.

The props are laid out on a long table. You touch each one:

The Cabinet — heavy, brass handle cold.
The Bell — wrapped in felt, smells of camphor.
The Silks — they make your fingers feel small.

The fourth position is empty.`,

        look: `The wings. Dust motes in the worklights. Table with props: Cabinet, Bell, Silks, empty fourth position. Emil's voice somewhere in the theatre.`,

        ambient: 'stage-wing',
        items: [
          { id: 'silks', name: 'performance silks', examine: 'Folded silk cloths — deep red, gold, black. They shimmer. When you hold them, your fingers feel small and deft. Emil moved them here. He was right — they\'re safer.', actions: ['examine', 'take'], takeable: true, inventory: { label: 'Silks', examine: 'Performance silks. Red, gold, black.' } },
          { id: 'bell', name: 'silver bell', examine: 'A handbell in polished silver, clapper wrapped in felt. The metal is cold. Smells faintly of camphor.', actions: ['examine', 'use'], takeable: true, inventory: { label: 'Bell', examine: 'A silver handbell.' } },
          { id: 'cabinet-wing', name: 'performance Cabinet', examine: 'The Cabinet. From the wings it looks different — larger, more imposing. The brass handle is cold. The wood grain runs in patterns you know by heart.', actions: ['open', 'push'], takeable: false, inventory: { label: 'Cabinet', examine: 'The performance Cabinet.' } },
        ],
      },
      reckoner: {
        entry: `Stage Left Wing. Prop table at C-4 per chalkboard:

1. Cabinet apparatus — verified
2. Silver Bell — verified
3. Performance Silks — verified
4. EMPTY — item relocated per E. Roth, 18:45

Stage manager's log confirms the relocation. No further details.`,

        look: `Wings, Stage Left. Prop table C-4. Cabinet, Bell, Silks present. Position 4 empty. Worklights on. Stage visible through curtain gap.`,

        ambient: 'stage-wing',
        items: [
          { id: 'stage-manager-log', name: "stage manager's log", examine: 'Log entry, 18:45: "E. Roth relocated item from position 4 to an alternate position. Reason: safety concern. No further action required."', actions: ['examine'], takeable: false, inventory: { label: 'Log', examine: 'Stage manager log entry.' } },
          {
            id: 'prop-inventory', name: 'prop inventory list',
            examine: `Prop inventory — Apollo-Saal, 20:00 performance.

1. Cabinet apparatus
2. Silver Bell
3. Performance Silks
4. [BLANK]

Annotation: "Item 4 relocated. See dressing room — decanter, item #7."`,
            actions: ['examine'], takeable: true, inventory: { label: 'Prop list', examine: 'Prop inventory.' },
          },
          {
            id: 'note-on-stand', name: 'note on music stand',
            examine: `Handwritten note, left on the stage manager's stand:

"Props confirmed. Cue 1: Cabinet at 20:00 sharp. Watch for my hand — I'll signal from the wings when we're ready. If the third lamp doesn't light, hold for 10 seconds. — E."

Below, in different ink: "She's already tested it. I saw her."`,
            actions: ['examine'], takeable: true, inventory: { label: 'Stand note', examine: 'Note from Emil.' },
          },
        ],
      },
    },
    'stage': {
      id: 'stage',
      name: 'Stage',
      exits: [
        { direction: 'west', roomId: 'stage-wing' },
      ],
      dreamer: {
        entry: `The stage. Empty now, but alive — the boards remember every foot that has crossed them. The footlights cast a warm amber glow across the worn floor.

The Cabinet stands at center stage. Beyond the curtain, the murmur of the arriving audience — a low, warm animal sound.

This is where you come alive.`,

        look: `The stage. Cabinet at center. Footlights warm. Curtain breathing with the air currents. The audience beyond.`,

        ambient: 'stage',
        items: [
          {
            id: 'center-cabinet', name: 'Center Cabinet',
            examine: `This is the new Cabinet. The one you've been building quietly for months. The mechanism is smooth, the catch precise.

It feels right. It feels dangerous.`,
            actions: ['open', 'push'], takeable: false, inventory: { label: 'Center Cabinet', examine: 'The new Cabinet.' },
            onAction: {
              open: () => ({ text: 'The Cabinet door swings open silently. Velvet-lined darkness inside. Perfect.', effects: [{ setFlags: { 'ch01.cabinet-opened': true } }] }),
              push: () => ({ text: 'You press the Cabinet\'s side. Solid. But a faint scratch on the counterweight housing catches your eye — as if recently adjusted.' }),
            },
          },
          { id: 'curtain', name: 'curtain', examine: 'Deep red velvet, floor to ceiling. On the other side: 300 people waiting.', actions: ['push', 'examine'], takeable: false, inventory: { label: 'Curtain', examine: 'The main curtain.' } },
        ],
      },
      reckoner: {
        entry: `The stage. 300-seat house. Standard proscenium arch. House lights at 30%, footlights at full.

The performance Cabinet is at center stage, DS-C. Trapdoor confirmed operational. Curtain drawn.

Orchestra pit: Fauré "Pavane" underway. Conductor at bar 46 — score still marked at bar 47 for the vanish cue. Discrepancy of 1 bar.`,

        look: `Stage. Cabinet at DS-C. Trapdoor confirmed. House lights dim. Orchestra running "Pavane" — bar discrepancy noted. Curtain drawn.`,

        ambient: 'stage',
        items: [
          { id: 'trapdoor', name: 'trapdoor', examine: 'Beneath the Cabinet. Recently oiled — fresh machine oil. A scrap of paper in the hinge: "Counterweight checked — E."', actions: ['open', 'push'], takeable: false, inventory: { label: 'Trapdoor', examine: 'The stage trapdoor.' } },
          { id: 'orchestra', name: 'orchestra pit', examine: 'The orchestra plays "Pavane." The conductor gestures emphatically. His score marks the vanish cue at bar 47, but he just finished bar 46 and the music suggests the cue is sooner.', actions: ['examine'], takeable: false, inventory: { label: 'Orchestra', examine: 'The orchestra pit.' } },
        ],
      },
    },
  },
  triggers: [
    {
      id: 'movement-1-done',
      when: [{ flag: 'ch01.emils-note-read', value: true }],
      once: true,
      then: [{
        setFlags: { 'ch01.running-order-confirmed': true },
      }],
    },
    {
      id: 'movement-2-dreamer',
      when: [{ flag: 'ch01.notebook-page-found', value: true }],
      once: true,
      then: [{
        setFlags: { 'ch01.safety-release-visible': true },
      }],
    },
    {
      id: 'movement-2-reckoner',
      when: [{ flag: 'ch01.schematics-read', value: true }],
      once: true,
      then: [{
        setFlags: { 'ch01.counterweight-warning': true },
      }],
    },
    {
      id: 'movement-3-dreamer',
      when: [{ flag: 'ch01.release-checked', value: true }],
      once: true,
      then: [{
        setFlags: { 'ch01.movement-3-ready': true },
      }],
    },
    {
      id: 'all-movements-done',
      when: [
        { flag: 'ch01.running-order-confirmed', value: true },
        { flag: 'ch01.release-checked', value: true },
      ],
      once: true,
      then: [{
        setFlags: { 'ch01.complete': true },
      }],
    },
  ],
};
