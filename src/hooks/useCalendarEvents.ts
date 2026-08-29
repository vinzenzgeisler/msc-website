import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pb,
  CalendarEvent,
  buildSlug,
  listAllRecords,
  mapCalendarEventRecord,
} from "@/integrations/pocketbase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { getSafeTimestamp } from "@/lib/date";

function resolveLocalizedEvents(events: CalendarEvent[], locale: string) {
  const grouped = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = event.slug || event.id;
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(event);
    } else {
      grouped.set(key, [event]);
    }
  }

  return Array.from(grouped.values())
    .map((variants) => {
      return (
        variants.find((event) => event.locale === locale) ||
        variants.find((event) => event.locale === "de") ||
        variants[0]
      );
    })
    .filter((event): event is CalendarEvent => Boolean(event));
}

export function useCalendarEvents(filterByLocale = true) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ["calendar_events", filterByLocale ? locale : "all"],
    queryFn: async () => {
      const data = await listAllRecords("calendarEvents");
      const events = data.map(mapCalendarEventRecord) as CalendarEvent[];

      const resolvedEvents = filterByLocale
        ? resolveLocalizedEvents(events, locale)
        : events;

      return resolvedEvents.sort(
        (a, b) => getSafeTimestamp(a.start_dt) - getSafeTimestamp(b.start_dt),
      );
    },
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: ["calendar_events", id],
    queryFn: async () => {
      const data = await pb.collection("calendarEvents").getOne(id);
      return mapCalendarEventRecord(data) as CalendarEvent;
    },
    enabled: !!id,
  });
}

export function useCalendarEventBySlug(slug?: string) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ["calendar_events", "slug", slug, locale],
    enabled: Boolean(slug),
    queryFn: async () => {
      const data = await listAllRecords("calendarEvents");
      const events = data
        .map(mapCalendarEventRecord)
        .filter(
          (event): event is CalendarEvent =>
            event.slug === slug && event.published !== false,
        );

      return (
        events.find((event) => event.locale === locale) ||
        events.find((event) => event.locale === "de") ||
        null
      );
    },
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      event: Omit<CalendarEvent, "id" | "created_at" | "updated_at">,
    ) => {
      const payload: Record<string, unknown> = {
        title: event.title,
        slug: buildSlug(event.slug || event.title),
        startDt: event.start_dt,
        locale: event.locale,
        published: event.published,
      };

      if (event.description) payload.description = event.description;
      if (event.category) payload.category = event.category;
      if (event.end_dt) payload.endDt = event.end_dt;
      if (event.location) payload.location = event.location;
      if (event.contact_email) payload.contactEmail = event.contact_email;
      if (event.registration_url)
        payload.registrationUrl = event.registration_url;
      if (event.detail_url) payload.detailUrl = event.detail_url;
      if (event.is_main_event) payload.isMainEvent = true;
      payload.phaseOverride = event.phase_override || "auto";
      if (event.live_start_dt) payload.liveStartDt = event.live_start_dt;
      if (event.day_ticket_price !== null)
        payload.dayTicketPrice = event.day_ticket_price;
      if (event.weekend_ticket_price !== null)
        payload.weekendTicketPrice = event.weekend_ticket_price;
      if (event.children_free_under !== null)
        payload.childrenFreeUnder = event.children_free_under;
      payload.parkingFree = event.parking_free;
      payload.showDrivers = event.show_drivers;
      payload.showVoting = event.show_voting;
      payload.eventPageMode = event.event_page_mode || "hub";

      const data = await pb.collection("calendarEvents").create(payload);

      return mapCalendarEventRecord(data) as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      queryClient.invalidateQueries({ queryKey: ["main_event"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Omit<CalendarEvent, "created_at" | "updated_at">> & {
      id: string;
    }) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.slug !== undefined)
        payload.slug = buildSlug(updates.slug || updates.title || "");
      if (updates.description !== undefined)
        payload.description = updates.description || "";
      if (updates.category !== undefined)
        payload.category = updates.category || null;
      if (updates.start_dt !== undefined) payload.startDt = updates.start_dt;
      if (updates.end_dt !== undefined) payload.endDt = updates.end_dt || null;
      if (updates.location !== undefined)
        payload.location = updates.location || "";
      if (updates.locale !== undefined) payload.locale = updates.locale;
      if (updates.is_main_event !== undefined)
        payload.isMainEvent = updates.is_main_event;
      if (updates.contact_email !== undefined)
        payload.contactEmail = updates.contact_email || null;
      if (updates.registration_url !== undefined)
        payload.registrationUrl = updates.registration_url || null;
      if (updates.detail_url !== undefined)
        payload.detailUrl = updates.detail_url || null;
      if (updates.published !== undefined)
        payload.published = updates.published;
      if (updates.phase_override !== undefined)
        payload.phaseOverride = updates.phase_override;
      if (updates.live_start_dt !== undefined)
        payload.liveStartDt = updates.live_start_dt || null;
      if (updates.day_ticket_price !== undefined)
        payload.dayTicketPrice = updates.day_ticket_price;
      if (updates.weekend_ticket_price !== undefined)
        payload.weekendTicketPrice = updates.weekend_ticket_price;
      if (updates.children_free_under !== undefined)
        payload.childrenFreeUnder = updates.children_free_under;
      if (updates.parking_free !== undefined)
        payload.parkingFree = updates.parking_free;
      if (updates.show_drivers !== undefined)
        payload.showDrivers = updates.show_drivers;
      if (updates.show_voting !== undefined)
        payload.showVoting = updates.show_voting;
      if (updates.event_page_mode !== undefined)
        payload.eventPageMode = updates.event_page_mode;

      const data = await pb.collection("calendarEvents").update(id, payload);
      return mapCalendarEventRecord(data) as CalendarEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar_events", data.id] });
      queryClient.invalidateQueries({ queryKey: ["main_event"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection("calendarEvents").delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
    },
  });
}
