import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CalendarClock, ChevronDown, Loader2, Megaphone, Plus, Save, Timer, Trash2 } from 'lucide-react';
import { ensureCmsSession, listAllRecords, mapEventLiveNoticeRecord, mapEventScheduleRecord, mapStructuredEventScheduleEntryRecord, pb, type EventLiveNotice, type EventSchedule, type StructuredEventScheduleEntry } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { RecordModel } from 'pocketbase';
import { useBackendClasses } from '@/hooks/useBackendClasses';

type EditableEntry = StructuredEventScheduleEntry & { time_label: string };
const localDateTime = (value?: string | null) => value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : '';
const shiftIso = (value: string | null, minutes: number) => value ? new Date(new Date(value).getTime() + minutes * 60_000).toISOString() : value;

/** Shifts the given entry and every later entry (by sort_order) by `minutes`, so a delay entered at one point in the schedule carries forward through the rest of the day/run. */
function applyDelayFrom(entries: EditableEntry[], fromEntryId: string, minutes: number): EditableEntry[] {
  const from = entries.find((entry) => entry.id === fromEntryId);
  if (!from || !minutes) return entries;
  return entries.map((entry) => {
    if (entry.sort_order < from.sort_order) return entry;
    const start_dt = shiftIso(entry.start_dt, minutes);
    return {
      ...entry,
      start_dt,
      end_dt: shiftIso(entry.end_dt, minutes),
      time_label: start_dt ? format(new Date(start_dt), 'HH:mm') : entry.time_label,
    };
  });
}

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
  const { data: backendClasses = [] } = useBackendClasses();
  const [days, setDays] = useState<EventSchedule[]>([]);
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [notices, setNotices] = useState<EventLiveNotice[]>([]);
  const [delayInputs, setDelayInputs] = useState<Record<string, string>>({});
  useEffect(() => { if (data) { setDays(data.days); setEntries(data.entries); setNotices(data.notices); } }, [data]);

  const applyDelay = (entryId: string) => {
    const minutes = Number(delayInputs[entryId]);
    if (!Number.isFinite(minutes) || minutes === 0) return;
    setEntries((items) => applyDelayFrom(items, entryId, minutes));
    setDelayInputs((items) => ({ ...items, [entryId]: '' }));
    toast.success(`Verspätung von ${minutes} Minuten auf alle folgenden Programmpunkte angewendet`);
  };

  const saveSchedule = useMutation({
    mutationFn: async () => {
      await ensureCmsSession();
      await Promise.all(days.map((day) => pb.collection('eventSchedules').update(day.id, { dayLabel: day.day_label, date: day.date, afterProgramNote: day.after_program_note || '' })));
      await Promise.all(entries.map((entry) => pb.collection('eventScheduleEntries').update(entry.id, { timeLabel: entry.time_label, title: entry.title, subtitle: entry.subtitle || '', startDt: entry.start_dt, endDt: entry.end_dt, entryType: entry.entry_type, programBlock: entry.program_block || 'other', backendClassIds: entry.backend_class_ids || [], sortOrder: entry.sort_order })));
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
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5"/>Zeitplan 2026</CardTitle><CardDescription>Deutscher Leitzeitplan. Änderungen werden auf der Eventseite sofort wirksam. Tippe einen Programmpunkt an, um ihn zu bearbeiten.</CardDescription></CardHeader><CardContent className="space-y-6">{days.map((day) => <div key={day.id} className="space-y-3"><div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]"><div><Label>Tag</Label><Input value={day.day_label} onChange={(e) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, day_label: e.target.value } : item))}/></div><div><Label>Datum</Label><Input type="date" value={day.date?.slice(0, 10) || ''} onChange={(e) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, date: e.target.value } : item))}/></div><div><Label>Hinweis nach Programmende</Label><Input value={day.after_program_note || ''} onChange={(e) => setDays((items) => items.map((item) => item.id === day.id ? { ...item, after_program_note: e.target.value } : item))}/></div></div><div className="divide-y divide-border border border-border">{entries.filter((entry) => entry.schedule_day === day.id).map((entry) => <details key={entry.id} className="group p-3"><summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden"><span className="shrink-0 rounded bg-muted px-2 py-1 font-mono text-xs font-semibold">{entry.time_label || '--:--'}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{entry.title || 'Ohne Titel'}</span>{entry.entry_type !== 'program' && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{entry.entry_type === 'pause' ? 'Pause' : 'Highlight'}</span>}<ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"/></summary><div className="mt-3 space-y-3"><div className="grid grid-cols-2 gap-2"><div><Label className="text-xs text-muted-foreground">Start</Label><Input type="datetime-local" value={localDateTime(entry.start_dt)} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, start_dt: new Date(e.target.value).toISOString(), time_label: e.target.value.slice(11, 16) } : item))}/></div><div><Label className="text-xs text-muted-foreground">Ende</Label><Input type="datetime-local" value={localDateTime(entry.end_dt)} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, end_dt: new Date(e.target.value).toISOString() } : item))}/></div></div><div className="flex items-end gap-2 border border-dashed border-border bg-muted/40 p-2"><div className="flex-1"><Label className="flex items-center gap-1 text-xs text-muted-foreground"><Timer className="h-3 w-3"/>Verspätung ab hier (Minuten)</Label><Input type="number" placeholder="z. B. 15" value={delayInputs[entry.id] ?? ''} onChange={(e) => setDelayInputs((items) => ({ ...items, [entry.id]: e.target.value }))}/></div><Button type="button" variant="secondary" size="sm" onClick={() => applyDelay(entry.id)}>Anwenden</Button></div><div><Label className="text-xs text-muted-foreground">Titel</Label><Input value={entry.title} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, title: e.target.value } : item))}/></div><div><Label className="text-xs text-muted-foreground">Untertitel</Label><Input value={entry.subtitle || ''} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, subtitle: e.target.value } : item))}/></div><div className="grid grid-cols-2 gap-2"><div><Label className="text-xs text-muted-foreground">Typ</Label><select className="h-10 w-full border border-input bg-background px-2 text-sm" value={entry.entry_type} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, entry_type: e.target.value as EditableEntry['entry_type'] } : item))}><option value="program">Programm</option><option value="pause">Pause</option><option value="highlight">Highlight</option></select></div><div><Label className="text-xs text-muted-foreground">Durchgang</Label><select className="h-10 w-full border border-input bg-background px-2 text-sm" value={entry.program_block || 'other'} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, program_block: e.target.value as EditableEntry['program_block'] } : item))}><option value="run_1">1. Durchgang</option><option value="run_2">2. Durchgang</option><option value="other">Weiteres</option></select></div></div>{backendClasses.length > 0 && <div><Label className="text-xs text-muted-foreground">Backend-Klassen</Label><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">{backendClasses.map((cls) => <label key={cls.id} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={(entry.backend_class_ids || []).includes(cls.id)} onChange={(e) => setEntries((items) => items.map((item) => item.id === entry.id ? { ...item, backend_class_ids: e.target.checked ? [...(item.backend_class_ids || []), cls.id] : (item.backend_class_ids || []).filter((id) => id !== cls.id) } : item))}/>{cls.name}</label>)}</div></div>}</div></details>)}</div></div>)}<Button className="w-full sm:w-auto" onClick={() => saveSchedule.mutate()} disabled={saveSchedule.isPending}><Save className="mr-2 h-4 w-4"/>Zeitplan speichern</Button></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/>Live-Hinweise</CardTitle><CardDescription>Aktive Hinweise erscheinen während der Live-Phase oberhalb des Programms.</CardDescription></CardHeader><CardContent className="space-y-4">{notices.map((notice, index) => <div key={notice.id} className="grid gap-3 border border-border p-4 md:grid-cols-2"><div><Label>Titel</Label><Input value={notice.title} onChange={(e) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, title: e.target.value } : item))}/></div><div><Label>Priorität</Label><select className="h-10 w-full border border-input bg-background px-3 text-sm" value={notice.severity} onChange={(e) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, severity: e.target.value as EventLiveNotice['severity'] } : item))}><option value="info">Info</option><option value="important">Wichtig</option><option value="warning">Warnung</option></select></div><div className="md:col-span-2"><Label>Text</Label><Textarea value={notice.message || ''} onChange={(e) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, message: e.target.value } : item))}/></div><div className="flex items-center gap-3"><Switch checked={notice.active} onCheckedChange={(active) => setNotices((items) => items.map((item) => item.id === notice.id ? { ...item, active } : item))}/><Label>Aktiv</Label></div><Button variant="ghost" size="sm" className="justify-self-end text-destructive" onClick={() => removeNotice(notice)}><Trash2 className="mr-2 h-4 w-4"/>Entfernen</Button></div>)}<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setNotices((items) => [...items, { id: `new-${Date.now()}`, event: eventId, title: '', message: '', severity: 'info', starts_at: null, ends_at: null, active: true, sort_order: items.length, locale: 'de' }])}><Plus className="mr-2 h-4 w-4"/>Hinweis</Button><Button onClick={() => saveNotices.mutate()} disabled={saveNotices.isPending}><Save className="mr-2 h-4 w-4"/>Hinweise speichern</Button></div></CardContent></Card>
  </div>;
}
