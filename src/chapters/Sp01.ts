// STUB chapter for SP. Exists only to verify Phase-1 engine plumbing:
// solo boot, three render modes, movement transitions, journal as inventory,
// cross-movement puzzle. Will be rewritten in Phase 2 with the real First
// Light content.

import type { Chapter, ActionContext } from '../types';

export const Sp01: Chapter = {
  id: 'sp01',
  title: 'First Light (stub)',
  starts: {
    dreamer: 'tomas-desk',
    reckoner: 'tomas-desk',
  },
  cast: {
    protagonist: 'Tomás',
  },
  usesJournal: true,
  prologue: `The lamp is on. The journal is open. The translation has stopped.

Close your eyes.`,
  epilogue: `You surface, slowly. The radio is still on. The journal is full of a stranger's day.

For a moment you almost wonder. Then you do not.

You close the book.`,
  completionFlag: 'sp01.complete',

  movements: [
    {
      id: 'prologue',
      title: 'The Flat',
      mode: 'neutral',
      rooms: ['tomas-desk'],
      transitionOut: `You lean back. The chair creaks. The lamp is the last thing you see.`,
    },
    {
      id: 'm1-window',
      title: 'The Window',
      mode: 'dreamer',
      rooms: ['capsule'],
      transitionIn: `Pressure in your ears. Slow breathing that is not yours. Somewhere far below, a surface that does not resolve.`,
      transitionOut: `You wake. Your hand is on the journal. You write.`,
    },
    {
      id: 'm2-desk',
      title: 'The Desk',
      mode: 'reckoner',
      rooms: ['cosmonaut-office'],
      transitionIn: `The radiator clanks. Morning. You sit at a desk that is not yours and pick up a pen that is not yours either.`,
    },
  ],

  rooms: {
    'tomas-desk': {
      id: 'tomas-desk',
      name: "Tomás's Desk",
      exits: [
        { direction: 'north', roomId: 'capsule' },
      ],
      neutral: {
        entry: `A small flat. The desk is by the window, the courtyard is dark, the radio is playing something almost recognisable. The journal is open. You have been staring at the same paragraph for an hour.`,
        look: `Your desk, your typewriter, your unwashed coffee cup. The journal lies open. There is nowhere to go but to sleep.`,
        items: [
          {
            id: 'journal-on-desk',
            name: 'the journal',
            examine: `Six weeks of entries. Most of them brief. One of them ends, mid-sentence, with "I don't know who he is."`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
          },
        ],
      },
    },

    'capsule': {
      id: 'capsule',
      name: 'A Small Chamber',
      exits: [
        { direction: 'north', roomId: 'cosmonaut-office', blockedBy: 'window.read' },
      ],
      dreamer: {
        entry: `Curved walls. One small round window. Pressure. Your breathing — his breathing — slow and trained.

Beyond the window, something that is not sky.`,
        look: `The chamber is small. The window is small. Your gloved hands rest on a panel of switches you somehow know how to use.`,
        items: [
          {
            id: 'window',
            name: 'the window',
            examine: `Curved glass. A number is etched into the inside of the lower rim, where no observer would ever look.`,
            actions: ['read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (_ctx: ActionContext) => ({
                text: `Seven. Three. One. Four.\n\nYou write it down without thinking.`,
                effects: [
                  { setFlags: { 'window.read': true } },
                  {
                    addJournalEntry: {
                      id: 'number-7314',
                      label: 'A number etched in the window',
                      body: `7 3 1 4. Inside the lower rim of the curved glass. He counted it three times and settled on it.`,
                    },
                  },
                  { enableExit: { direction: 'north', roomId: 'cosmonaut-office' } },
                ],
              }),
            },
          },
        ],
      },
    },

    'cosmonaut-office': {
      id: 'cosmonaut-office',
      name: 'A Cosmonaut\'s Office',
      exits: [],
      reckoner: {
        entry: `A narrow institutional room. A wooden desk. A steam radiator. A typewriter. Through the window, a forest road and the corner of a hangar.

On the desk, a signature confirmation form waits for a four-digit code.`,
        look: `The form is laid out precisely. Above the blank for the confirmation code is the line: "Enter only if you are the addressee and have been given the code orally."`,
        items: [
          {
            id: 'form',
            name: 'the form',
            examine: `A typewritten confirmation form. The line for the code is blank.`,
            actions: ['use', 'read'],
            takeable: false,
            inventory: { label: '', examine: '' },
            onAction: {
              read: (_ctx: ActionContext) => ({
                text: `Standard procedural language. Sign, countersign, file.`,
              }),
              use: (ctx: ActionContext) => {
                const hasNumber = ctx.journal.some(j => j.id === 'number-7314');
                if (!hasNumber) {
                  return { text: `You do not know the code. Not yet.` };
                }
                return {
                  text: `You write 7 3 1 4 in the blank, slowly, in his hand.\n\nThe form is signed.`,
                  effects: [
                    { setFlags: { 'sp01.complete': true } },
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
