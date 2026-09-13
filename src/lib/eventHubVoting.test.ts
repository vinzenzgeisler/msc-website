import { describe, expect, it } from 'vitest';
import {
  computeVotingProgress,
  collectVotingWinners,
  groupCandidatesByClass,
  isClassVotable,
  matchesActiveEvent,
  sortClassesNaturally,
  sortClassesWithPriority,
  type EventHubCandidate,
  type EventHubClass
} from './eventHubVoting';

const classes: EventHubClass[] = [
  { id: 'c1', name: 'Klasse 1', vehicleType: 'auto' },
  { id: 'c2', name: 'Klasse 2', vehicleType: 'moto' },
  { id: 'c3', name: 'Klasse 3', vehicleType: 'auto' }
];

const candidate = (entryId: string, classId: string, pinned = false): EventHubCandidate => ({
  entryId,
  classId,
  startNumberNorm: null,
  driverName: 'Fahrer',
  vehicleImageUrl: null,
  vehicleMake: null,
  vehicleModel: null,
  vehicleYear: null,
  pinned
});

describe('groupCandidatesByClass', () => {
  it('groups candidates under their class id', () => {
    const grouped = groupCandidatesByClass([candidate('e1', 'c1'), candidate('e2', 'c2'), candidate('e3', 'c1')]);
    expect(grouped.get('c1')?.map((c) => c.entryId)).toEqual(['e1', 'e3']);
    expect(grouped.get('c2')?.map((c) => c.entryId)).toEqual(['e2']);
  });
});

describe('sortClassesWithPriority', () => {
  it('keeps original order without priority classes', () => {
    expect(sortClassesWithPriority(classes, []).map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
  });
  it('moves the current class group to the front', () => {
    expect(sortClassesWithPriority(classes, ['c3']).map((c) => c.id)).toEqual(['c3', 'c1', 'c2']);
  });
});

describe('sortClassesNaturally', () => {
  it('sorts by number instead of string order', () => {
    const unordered: EventHubClass[] = [
      { id: 'c1', name: 'Klasse 1', vehicleType: 'auto' },
      { id: 'c10', name: 'Klasse 10', vehicleType: 'auto' },
      { id: 'c2', name: 'Klasse 2', vehicleType: 'auto' },
      { id: 'c11', name: 'Klasse 11', vehicleType: 'auto' }
    ];
    expect(sortClassesNaturally(unordered).map((c) => c.id)).toEqual(['c1', 'c2', 'c10', 'c11']);
  });
});

describe('computeVotingProgress', () => {
  it('counts only classes that exist and have been voted on', () => {
    expect(computeVotingProgress(classes, ['c1', 'c3', 'unknown-class'])).toEqual({ votedCount: 2, totalCount: 3 });
  });
  it('reports zero of n when nothing was voted yet', () => {
    expect(computeVotingProgress(classes, [])).toEqual({ votedCount: 0, totalCount: 3 });
  });
});

describe('collectVotingWinners', () => {
  it('combines all class results and sorts them by natural class name', () => {
    expect(collectVotingWinners(
      [
        { id: 'c10', name: 'Klasse 10', vehicleType: 'auto' },
        { id: 'c2', name: 'Klasse 2', vehicleType: 'moto' }
      ],
      [
        { classId: 'c10', entries: [{ entryId: 'e10', driverName: 'Alex' }] },
        { classId: 'c2', entries: [{ entryId: 'e2a', driverName: 'Bea' }, { entryId: 'e2b', driverName: 'Chris' }] }
      ]
    )).toEqual([
      { classId: 'c2', className: 'Klasse 2', entryId: 'e2a', driverName: 'Bea' },
      { classId: 'c2', className: 'Klasse 2', entryId: 'e2b', driverName: 'Chris' },
      { classId: 'c10', className: 'Klasse 10', entryId: 'e10', driverName: 'Alex' }
    ]);
  });
});

describe('isClassVotable', () => {
  it('is only votable while open and not yet voted', () => {
    expect(isClassVotable('open', 'c1', [])).toBe(true);
    expect(isClassVotable('open', 'c1', ['c1'])).toBe(false);
    expect(isClassVotable('not_open', 'c1', [])).toBe(false);
    expect(isClassVotable('closed', 'c1', [])).toBe(false);
  });
});

describe('matchesActiveEvent', () => {
  it('matches when date and name agree', () => {
    expect(
      matchesActiveEvent(
        { title: 'MSC Dreiecksrennen 2026', start_dt: '2026-09-12T06:00:00Z' },
        { name: 'Dreiecksrennen 2026', startsAt: '2026-09-12' }
      )
    ).toBe(true);
  });
  it('rejects a date mismatch even with a matching name', () => {
    expect(
      matchesActiveEvent(
        { title: 'Dreiecksrennen 2026', start_dt: '2026-09-12T06:00:00Z' },
        { name: 'Dreiecksrennen 2026', startsAt: '2027-09-11' }
      )
    ).toBe(false);
  });
  it('rejects a name mismatch even with a matching date', () => {
    expect(
      matchesActiveEvent(
        { title: 'Sommerfest', start_dt: '2026-09-12T06:00:00Z' },
        { name: 'Dreiecksrennen 2026', startsAt: '2026-09-12' }
      )
    ).toBe(false);
  });
});
