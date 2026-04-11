import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DisciplineHighlight,
  HistoryTimelineEntry,
  MembershipBenefit,
  MembershipStep,
  PartnerClub,
  StructuredEventScheduleEntry,
  listAllRecords,
  mapDisciplineHighlightRecord,
  mapHistoryTimelineEntryRecord,
  mapMembershipBenefitRecord,
  mapMembershipStepRecord,
  mapPartnerClubRecord,
  mapStructuredEventScheduleEntryRecord,
  pb,
} from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';

function resolveLocalizedList<T extends { locale: string }>(items: T[], locale: string) {
  const exact = items.filter((item) => item.locale === locale);
  if (exact.length > 0) return exact;
  return items.filter((item) => item.locale === 'de');
}

async function safeList(collectionName: string) {
  try {
    return await listAllRecords(collectionName);
  } catch {
    return [];
  }
}

export function usePartnerClubs() {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['partner_clubs', locale],
    queryFn: async () => {
      const data = await safeList('partnerClubs');
      const mapped = data.map(mapPartnerClubRecord) as PartnerClub[];
      return resolveLocalizedList(mapped, locale)
        .filter((item) => item.active)
        .sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}

export function usePartnerClubsAdmin() {
  return useQuery({
    queryKey: ['partner_clubs', 'admin'],
    queryFn: async () => {
      const data = await safeList('partnerClubs');
      return (data.map(mapPartnerClubRecord) as PartnerClub[]).sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
      );
    },
  });
}

export function useHistoryTimelineEntries() {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['history_timeline', locale],
    queryFn: async () => {
      const data = await safeList('historyTimelineEntries');
      const mapped = data.map(mapHistoryTimelineEntryRecord) as HistoryTimelineEntry[];
      return resolveLocalizedList(mapped, locale).sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}

export function useHistoryTimelineEntriesAdmin() {
  return useQuery({
    queryKey: ['history_timeline', 'admin'],
    queryFn: async () => {
      const data = await safeList('historyTimelineEntries');
      return (data.map(mapHistoryTimelineEntryRecord) as HistoryTimelineEntry[]).sort(
        (a, b) => a.sort_order - b.sort_order || a.year_label.localeCompare(b.year_label),
      );
    },
  });
}

export function useMembershipBenefits() {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['membership_benefits', locale],
    queryFn: async () => {
      const data = await safeList('membershipBenefits');
      const mapped = data.map(mapMembershipBenefitRecord) as MembershipBenefit[];
      return resolveLocalizedList(mapped, locale).sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}

export function useMembershipBenefitsAdmin() {
  return useQuery({
    queryKey: ['membership_benefits', 'admin'],
    queryFn: async () => {
      const data = await safeList('membershipBenefits');
      return (data.map(mapMembershipBenefitRecord) as MembershipBenefit[]).sort(
        (a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title),
      );
    },
  });
}

export function useMembershipSteps() {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['membership_steps', locale],
    queryFn: async () => {
      const data = await safeList('membershipSteps');
      const mapped = data.map(mapMembershipStepRecord) as MembershipStep[];
      return resolveLocalizedList(mapped, locale).sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}

export function useMembershipStepsAdmin() {
  return useQuery({
    queryKey: ['membership_steps', 'admin'],
    queryFn: async () => {
      const data = await safeList('membershipSteps');
      return (data.map(mapMembershipStepRecord) as MembershipStep[]).sort(
        (a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title),
      );
    },
  });
}

export function useDisciplineHighlights(disciplineKey: DisciplineHighlight['discipline_key']) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['discipline_highlights', disciplineKey, locale],
    queryFn: async () => {
      const data = await safeList('disciplineHighlights');
      const mapped = (data
        .map(mapDisciplineHighlightRecord) as DisciplineHighlight[])
        .filter((item) => item.discipline_key === disciplineKey);
      return resolveLocalizedList(mapped, locale).sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}

export function useDisciplineHighlightsAdmin() {
  return useQuery({
    queryKey: ['discipline_highlights', 'admin'],
    queryFn: async () => {
      const data = await safeList('disciplineHighlights');
      return (data.map(mapDisciplineHighlightRecord) as DisciplineHighlight[]).sort(
        (a, b) =>
          a.discipline_key.localeCompare(b.discipline_key) ||
          a.sort_order - b.sort_order ||
          a.title.localeCompare(b.title),
      );
    },
  });
}

export function useStructuredEventScheduleEntries(eventId?: string) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['structured_event_schedule_entries', eventId, locale],
    enabled: Boolean(eventId),
    queryFn: async () => {
      const data = await safeList('eventScheduleEntries');
      const mapped = (data
        .map(mapStructuredEventScheduleEntryRecord) as StructuredEventScheduleEntry[])
        .filter((item) => item.event === eventId);
      return resolveLocalizedList(mapped, locale).sort((a, b) => a.sort_order - b.sort_order);
    },
  });
}

type StructuredCollectionName =
  | 'partnerClubs'
  | 'historyTimelineEntries'
  | 'membershipBenefits'
  | 'membershipSteps'
  | 'disciplineHighlights'
  | 'eventScheduleEntries';

function useStructuredMutation(collectionName: StructuredCollectionName, queryKey: string[]) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => pb.collection(collectionName).create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      pb.collection(collectionName).update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => pb.collection(collectionName).delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { create, update, remove };
}

export function usePartnerClubMutations() {
  return useStructuredMutation('partnerClubs', ['partner_clubs']);
}

export function useHistoryTimelineMutations() {
  return useStructuredMutation('historyTimelineEntries', ['history_timeline']);
}

export function useMembershipBenefitMutations() {
  return useStructuredMutation('membershipBenefits', ['membership_benefits']);
}

export function useMembershipStepMutations() {
  return useStructuredMutation('membershipSteps', ['membership_steps']);
}

export function useDisciplineHighlightMutations() {
  return useStructuredMutation('disciplineHighlights', ['discipline_highlights']);
}

export function useStructuredEventScheduleEntryMutations() {
  return useStructuredMutation('eventScheduleEntries', ['structured_event_schedule_entries', 'event_content']);
}
