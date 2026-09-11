export type VotingStatus = 'not_open' | 'open' | 'closed';

export interface EventHubClass {
  id: string;
  name: string;
  vehicleType: 'moto' | 'auto';
}

export interface EventHubCandidate {
  entryId: string;
  classId: string;
  startNumberNorm: string | null;
  driverName: string;
  vehicleImageUrl: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  pinned: boolean;
  featured?: boolean;
}

export interface EventHubFactEntry {
  entryId: string;
  driverName: string;
  value: number;
}

export interface EventHubFacts {
  farthestTravelKm: EventHubFactEntry[] | null;
  youngestDriver: EventHubFactEntry[] | null;
  oldestDriver: EventHubFactEntry[] | null;
  oldestVehicle: EventHubFactEntry[] | null;
  largestDisplacementCcm: EventHubFactEntry[] | null;
  highestPowerPs: EventHubFactEntry[] | null;
  mostCylinders: EventHubFactEntry[] | null;
}

export interface EventHubResultEntry {
  entryId: string;
  driverName: string;
  voteCount: number;
  percent: number;
}

export interface EventHubClassResult {
  classId: string;
  entries: EventHubResultEntry[];
}

export interface EventHubResponse {
  event: { id: string; name: string; startsAt: string; endsAt: string };
  votingStatus: VotingStatus;
  classes: EventHubClass[];
  candidates: EventHubCandidate[];
  facts: EventHubFacts;
  results: EventHubClassResult[] | null;
}

export function groupCandidatesByClass(candidates: EventHubCandidate[]): Map<string, EventHubCandidate[]> {
  const map = new Map<string, EventHubCandidate[]>();
  for (const candidate of candidates) {
    const list = map.get(candidate.classId) ?? [];
    list.push(candidate);
    map.set(candidate.classId, list);
  }
  return map;
}

/** Priority classes (e.g. the class currently running) are sorted first; order among them and the rest is preserved otherwise. */
export function sortClassesWithPriority(classes: EventHubClass[], priorityClassIds: string[]): EventHubClass[] {
  if (priorityClassIds.length === 0) return classes;
  const priority = new Set(priorityClassIds);
  return [...classes].sort((a, b) => {
    const aPriority = priority.has(a.id) ? 0 : 1;
    const bPriority = priority.has(b.id) ? 0 : 1;
    return aPriority - bPriority;
  });
}

export interface VotingProgress {
  votedCount: number;
  totalCount: number;
}

export function computeVotingProgress(classes: EventHubClass[], votedClassIds: string[]): VotingProgress {
  const voted = new Set(votedClassIds);
  return {
    votedCount: classes.filter((c) => voted.has(c.id)).length,
    totalCount: classes.length
  };
}

export function isClassVotable(status: VotingStatus, classId: string, votedClassIds: string[]): boolean {
  return status === 'open' && !votedClassIds.includes(classId);
}

const normalizeName = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Guards against showing voting/participant data for the wrong event when the
 * CMS's "current" event and the participant backend's "current" event have
 * drifted apart (e.g. one side wasn't switched over for the next event yet).
 */
export function matchesActiveEvent(
  cmsEvent: { title: string; start_dt: string },
  backendEvent: { name: string; startsAt: string }
): boolean {
  const cmsDate = cmsEvent.start_dt.slice(0, 10);
  const backendDate = backendEvent.startsAt.slice(0, 10);
  if (cmsDate !== backendDate) return false;

  const cmsName = normalizeName(cmsEvent.title);
  const backendName = normalizeName(backendEvent.name);
  return cmsName === backendName || cmsName.includes(backendName) || backendName.includes(cmsName);
}
