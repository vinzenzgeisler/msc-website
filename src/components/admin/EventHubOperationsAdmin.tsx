import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CalendarClock, Loader2, Megaphone, Plus, Save, Trash2 } from 'lucide-react';
import { ensureCmsSession, listAllRecords, mapEventLiveNoticeRecord, mapEventScheduleRecord, mapStructuredEventScheduleEntryRecord, pb, type EventLiveNotice, type EventSchedule, type StructuredEventScheduleEntry } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { RecordModel } from 'pocketbase';

type EditableEntry = StructuredEventScheduleEntry & { time_label: string };
const localDateTime = (value?: string | null) => value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : '';

export function EventHubOperationsAdmin({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['event_hub_admin', eventId],
    queryFn: async () => {
      const [days, entries, notices] = await Promise.all([listAllRecords('eventSchedules'), listAllRecords('eventScheduleEntries'), listAllRecords('eventLiveNotices')]);
      return {
        days: days.filter((item: RecordModel) => item.event === eventId && item.locale === 'de').map(mapEventScheduleRecord).sort((a, b) => a.day_number - b.day_number) as EventSchedule[],
        entries: entries.filter((item: RecordModel) => item.event === eventId && item.locale === 'de').map(mapStructuredEventScheduleEntryRecord).sort((a, b) => a.sort_order - b.sort_order) as EditableEntry[],
        notices: notices.filter((item: RecordModel) => item.event === eventId && item.locale === 'de').map(mapEventLiveNoticeRecord).sort((a, b) => a.sort_order - b.sort_order) as EventLiveNotice[],
      };
    },
  });
  const [days, setDays] = useState<EventSchedule[]>([]);
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [notices, setNotices] = useState<EventLiveNotice[]>([]);
  useEffect(() => { if (data) { setDays(data.days); setEntries(data.entries); setNotices(data.notices); } }, [data]);

  const saveSchedule = useMutation({
    mutationFn: async () => {
      await ensureCmsSession();
      await Promise.all(days.map((day) => pb.collection('eventSchedules').update(day.id, { dayLabel: day.day_label, date: day.date, afterProgramNote: day.after_program_note || '' })));
      await Promise.all(entries.map((entry) => pb.collection('eventScheduleEntries').update(entry.id, { timeLabel: entry.time_label, title: entry.title, subtitle: entry.subtitle || '', startDt: entry.start_dt, endDt: entry.end_dt, entryType: entry.entry_type, sortOrder: entry.sort_order })));
    },
    onSuccess: () => { toast.success('Zeitplan gespeichert'); queryClient.invalidateQueries({ queryKey: ['event_content'] }); },
    onError: () => toast.error('Zeitplan konnte nicht gespeichert werden'),
  });

  const saveNotices = useMutation({
    mutationFn: async () => {
      await ensureCmsSession();
      for (const notice of notices) {
        const payload = { event: eventId, title: notice.title, message: notice.message || '', severity: notice.severity, startsAt: notice.starts_at || null, endsAt: notice.ends_at || null, active: notice.active, sortOrder: notice.sort_order, locale: 'de' };
        if (notice.id.startsWith('new-')) await pb.collection('eventLiveNotices').create(payload);
        else await pb.collection('eventLiveNotices').update(notice.id, payload);
      }
    },
    onSuccess: () => { toast.success('Live-Hinweise gespeichert'); queryClient.invalidateQueries({ queryKey: ['event_hub_admin', eventId] }); queryClient.invalidateQueries({ queryKey: ['event_live_notices'] }); },
    onError: () => toast.error('Live-Hinweise konnten nicht gespeichert werden'),
  });

  const removeNotice = async (notice: EventLiveNotice) => {
    if (!notice.id.startsWith('new-')) { await ensureCmsSession(); await pb.collection('eventLiveNotices').delete(notice.id); }
    setNotices((items) => items.filter((item) => item.id !== notice.id));
    queryClient.invalidateQueries({ queryKey: ['event_live_notices'] });
  };

  if (isLoading) return <Card><CardContent className="flex items-center gap-2 p-6"><Loader2 className="h-4 w-4 animate-spin"/>Event-Hub wird geladen</CardContent></Card>;
  return <div className="space-y-6">
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5"/>Zeitplan 2026</CardTitle><CardDescription>Deutscher Leitzeitplan. Änderungen werden auf der Eventseite sofort wirksam.</CardDescription></CardHeader><CardContent className="space-y-6">{days.map((day) => <div key={day.id} className="space-y-3"><div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]"><div><Label>Tag</Label><Input value={day.day_label} onChange={(e) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, day_label: e.target.value } : item))}/></div><div><Label>Datum</Label><Input type="date" value={day.date?.slice(0, 10) || ''} onChange={(e) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, date: e.target.value } : item))}/></div><div><Label>Hinweis nach Programmende</Label><Input value={day.after_program_note || ''} onChange={(e) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, after_program_note: e.target.value } : item))}/></div></div><div className="border border-border">{entries.filter((entry) => entry.schedule_day === day.id).map((entry) => <div key={entry.id} className="grid gap-2 border-b border-border p-3 last:border-0 md:grid-cols-[8rem_8rem_1fr_1fr_8rem]"><Input type="datetime-local" aria-label="Start" value={localDateTime(entry.start_dt)} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, start_dt: new Date(e.target.value).toISOString(), time_label: e.target.value.slice(11, 16) } : item))}/><Input type="datetime-local" aria-label="Ende" value={localDateTime(entry.end_dt)} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, end_dt: new Date(e.target.value).toISOString() } : item))}/><Input aria-label="Titel" value={entry.title} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, title: e.target.value } : item))}/><Input aria-label="Untertitel" value={entry.subtitle || ''} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, subtitle: e.target.value } : item))}/><select aria-label="Typ" className="h-10 border border-input bg-background px-2 text-sm" value={entry.entry_type} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, entry_type: e.target.value as EditableEntry['entry_type'] } : item))}><option value="program">Programm</option><option value="pause">Pause</option><option value="highlight">Highlight</option></select></div>)}</div></div>)}<Button onClick={() => saveSchedule.mutate()} disabled={saveSchedule.isPending}><Save className="mr-2 h-4 w-4"/>Zeitplan speichern</Button></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/>Live-Hinweise</CardTitle><CardDescription>Aktive Hinweise erscheinen während der Live-Phase oberhalb des Programms.</CardDescription></CardHeader><CardContent className="space-y-4">{notices.map((notice, index) => <div key={notice.id} className="grid gap-3 border border-border p-4 md:grid-cols-2"><div><Label>Titel</Label><Input value={notice.title} onChange={(e) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, title: e.target.value } : item))}/></div><div><Label>Priorität</Label><select className="h-10 w-full border border-input bg-background px-3 text-sm" value={notice.severity} onChange={(e) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, severity: e.target.value as EventLiveNotice['severity'] } : item))}><option value="info">Info</option><option value="important">Wichtig</option><option value="warning">Warnung</option></select></div><div className="md:col-span-2"><Label>Text</Label><Textarea value={notice.message || ''} onChange={(e) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, message: e.target.value } : item))}/></div><div className="flex items-center gap-3"><Switch checked={notice.active} onCheckedChange={(active) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, active } : item))}/><Label>Aktiv</Label></div><Button variant="ghost" size="sm" className="justify-self-end text-destructive" onClick={() => removeNotice(notice)}><Trash2 className="mr-2 h-4 w-4"/>Entfernen</Button></div>)}<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setNotices((items) => [...items, { id: `new-${Date.now()}`, event: eventId, title: '', message: '', severity: 'info', starts_at: null, ends_at: null, active: true, sort_order: items.length, locale: 'de' }])}><Plus className="mr-2 h-4 w-4"/>Hinweis</Button><Button onClick={() => saveNotices.mutate()} disabled={saveNotices.isPending}><Save className="mr-2 h-4 w-4"/>Hinweise speichern</Button></div></CardContent></Card>
  </div>;
}
