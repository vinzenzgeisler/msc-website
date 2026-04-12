import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  useCreateBoardMember,
  useBoardMembers,
  useDeleteBoardMember,
  useUpdateBoardMember,
} from '@/hooks/useBoardMembers';
import {
  useDisciplineHighlightMutations,
  useDisciplineHighlightsAdmin,
  useHistoryTimelineEntriesAdmin,
  useHistoryTimelineMutations,
  useMembershipBenefitMutations,
  useMembershipBenefitsAdmin,
  useMembershipStepMutations,
  useMembershipStepsAdmin,
  usePartnerClubMutations,
  usePartnerClubsAdmin,
} from '@/hooks/useStructuredContent';
import { DisciplineHighlight, HistoryTimelineEntry, MembershipBenefit, MembershipStep, PartnerClub } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';

type Locale = 'de' | 'en' | 'cz';

const localeOptions: Locale[] = ['de', 'en', 'cz'];

function LocaleBadge({ locale }: { locale: string }) {
  return <Badge variant="outline">{locale.toUpperCase()}</Badge>;
}

function TextRecordList({
  title,
  description,
  items,
  renderLabel,
  onEdit,
  onDelete,
  loading,
}: {
  title: string;
  description: string;
  items: Array<{ id: string }>;
  renderLabel: (item: any) => ReactNode;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Einträge vorhanden.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="min-w-0">{renderLabel(item)}</div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(item.id)}>
                  Bearbeiten
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                  Löschen
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function BoardEditor() {
  const { data, isLoading } = useBoardMembers();
  const createBoardMember = useCreateBoardMember();
  const updateBoardMember = useUpdateBoardMember();
  const deleteBoardMember = useDeleteBoardMember();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    sort_order: 0,
  });

  const editing = useMemo(() => data?.find((item) => item.id === editingId) || null, [data, editingId]);

  const reset = () => {
    setEditingId(null);
    setPhotoFile(null);
    setForm({ name: '', role: '', email: '', phone: '', sort_order: 0 });
  };

  const startEdit = (id: string) => {
    const item = data?.find((entry) => entry.id === id);
    if (!item) return;
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      email: item.email || '',
      phone: item.phone || '',
      sort_order: item.sort_order,
    });
    setPhotoFile(null);
  };

  const save = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name und Rolle sind Pflichtfelder.');
      return;
    }

    try {
      if (editingId) {
        await updateBoardMember.mutateAsync({ id: editingId, ...form, photoFile });
      } else {
        await createBoardMember.mutateAsync({ ...form, photoFile });
      }
      toast.success('Vorstandsmitglied gespeichert');
      reset();
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <TextRecordList
        title="Vorstandsmitglieder"
        description="Pflegen Sie die Kartenansicht der Vorstandsseite direkt über einzelne Personen."
        items={data || []}
        loading={isLoading}
        onEdit={startEdit}
        onDelete={async (id) => {
          try {
            await deleteBoardMember.mutateAsync(id);
            toast.success('Vorstandsmitglied gelöscht');
            if (editingId === id) reset();
          } catch (error) {
            toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
          }
        }}
        renderLabel={(item) => (
          <div className="space-y-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.role}</p>
            <p className="text-xs text-muted-foreground">Sortierung: {item.sort_order}</p>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Vorstandsmitglied bearbeiten' : 'Neues Vorstandsmitglied'}</CardTitle>
          <CardDescription>Die Einträge werden als Karten auf der Vorstandsseite gerendert.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Rolle</Label>
            <Input value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Reihenfolge</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((current) => ({ ...current, sort_order: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Foto</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              <MediaAssetPicker onSelect={(file) => setPhotoFile(file)} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={save} disabled={createBoardMember.isPending || updateBoardMember.isPending}>
              Speichern
            </Button>
            {editing ? (
              <Button variant="outline" onClick={reset}>
                Abbrechen
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryEditor() {
  const { data, isLoading } = useHistoryTimelineEntriesAdmin();
  const { create, update, remove } = useHistoryTimelineMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    yearLabel: '',
    title: '',
    description: '',
    sortOrder: 0,
    locale: 'de' as Locale,
  });

  const reset = () => {
    setEditingId(null);
    setImageFile(null);
    setForm({ yearLabel: '', title: '', description: '', sortOrder: 0, locale: 'de' });
  };

  const save = async () => {
    if (!form.yearLabel.trim() || !form.title.trim()) {
      toast.error('Jahr und Titel sind Pflichtfelder.');
      return;
    }
    const payload: Record<string, unknown> = {
      yearLabel: form.yearLabel,
      title: form.title,
      description: form.description,
      sortOrder: form.sortOrder,
      locale: form.locale,
    };
    if (imageFile) payload.image = imageFile;

    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success('Zeitstrahl-Eintrag gespeichert');
      reset();
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <TextRecordList
        title="Zeitstrahl-Einträge"
        description="Die Vereinsgeschichte wird als sortierbarer Zeitstrahl gepflegt."
        items={data || []}
        loading={isLoading}
        onEdit={(id) => {
          const item = data?.find((entry) => entry.id === id);
          if (!item) return;
          setEditingId(item.id);
          setImageFile(null);
          setForm({
            yearLabel: item.year_label,
            title: item.title,
            description: item.description || '',
            sortOrder: item.sort_order,
            locale: item.locale as Locale,
          });
        }}
        onDelete={async (id) => {
          try {
            await remove.mutateAsync(id);
            toast.success('Zeitstrahl-Eintrag gelöscht');
            if (editingId === id) reset();
          } catch (error) {
            toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
          }
        }}
        renderLabel={(item: HistoryTimelineEntry) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{item.year_label}</p>
              <LocaleBadge locale={item.locale} />
            </div>
            <p className="text-sm">{item.title}</p>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Zeitstrahl-Eintrag bearbeiten' : 'Neuer Zeitstrahl-Eintrag'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Jahr / Label</Label>
              <Input value={form.yearLabel} onChange={(e) => setForm((current) => ({ ...current, yearLabel: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Sprache</Label>
              <Select value={form.locale} onValueChange={(value: Locale) => setForm((current) => ({ ...current, locale: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{localeOptions.map((option) => <SelectItem key={option} value={option}>{option.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea rows={5} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Sortierung</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Bild</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              <MediaAssetPicker onSelect={(file) => setImageFile(file)} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={save}>Speichern</Button>
            {editingId ? <Button variant="outline" onClick={reset}>Abbrechen</Button> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MembershipEditor() {
  const { data: benefits, isLoading: benefitsLoading } = useMembershipBenefitsAdmin();
  const { data: steps, isLoading: stepsLoading } = useMembershipStepsAdmin();
  const benefitMutations = useMembershipBenefitMutations();
  const stepMutations = useMembershipStepMutations();
  const [benefitForm, setBenefitForm] = useState({ id: '', title: '', description: '', icon: 'star', sortOrder: 0, locale: 'de' as Locale });
  const [stepForm, setStepForm] = useState({ id: '', title: '', description: '', sortOrder: 0, locale: 'de' as Locale });

  const saveBenefit = async () => {
    if (!benefitForm.title.trim()) {
      toast.error('Titel ist Pflicht.');
      return;
    }
    const payload = {
      title: benefitForm.title,
      description: benefitForm.description,
      icon: benefitForm.icon,
      sortOrder: benefitForm.sortOrder,
      locale: benefitForm.locale,
    };
    try {
      if (benefitForm.id) {
        await benefitMutations.update.mutateAsync({ id: benefitForm.id, payload });
      } else {
        await benefitMutations.create.mutateAsync(payload);
      }
      toast.success('Mitgliedervorteil gespeichert');
      setBenefitForm({ id: '', title: '', description: '', icon: 'star', sortOrder: 0, locale: 'de' });
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  const saveStep = async () => {
    if (!stepForm.title.trim()) {
      toast.error('Titel ist Pflicht.');
      return;
    }
    const payload = {
      title: stepForm.title,
      description: stepForm.description,
      sortOrder: stepForm.sortOrder,
      locale: stepForm.locale,
    };
    try {
      if (stepForm.id) {
        await stepMutations.update.mutateAsync({ id: stepForm.id, payload });
      } else {
        await stepMutations.create.mutateAsync(payload);
      }
      toast.success('Beitrittsschritt gespeichert');
      setStepForm({ id: '', title: '', description: '', sortOrder: 0, locale: 'de' });
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <TextRecordList
          title="Mitgliedervorteile"
          description="Jeder Vorteil wird als eigener Eintrag gepflegt."
          items={benefits || []}
          loading={benefitsLoading}
          onEdit={(id) => {
            const item = benefits?.find((entry) => entry.id === id);
            if (!item) return;
            setBenefitForm({
              id: item.id,
              title: item.title,
              description: item.description || '',
              icon: item.icon,
              sortOrder: item.sort_order,
              locale: item.locale as Locale,
            });
          }}
          onDelete={async (id) => {
            try {
              await benefitMutations.remove.mutateAsync(id);
              toast.success('Mitgliedervorteil gelöscht');
            } catch (error) {
              toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
            }
          }}
          renderLabel={(item: MembershipBenefit) => (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.title}</p>
                <LocaleBadge locale={item.locale} />
              </div>
              <p className="text-sm text-muted-foreground">{item.icon} · Sortierung {item.sort_order}</p>
            </div>
          )}
        />

        <Card>
          <CardHeader><CardTitle>{benefitForm.id ? 'Vorteil bearbeiten' : 'Neuer Vorteil'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Titel</Label><Input value={benefitForm.title} onChange={(e) => setBenefitForm((current) => ({ ...current, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={4} value={benefitForm.description} onChange={(e) => setBenefitForm((current) => ({ ...current, description: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={benefitForm.icon} onValueChange={(value) => setBenefitForm((current) => ({ ...current, icon: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['star', 'users', 'shield', 'award', 'calendar', 'map'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Sortierung</Label><Input type="number" value={benefitForm.sortOrder} onChange={(e) => setBenefitForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))} /></div>
              <div className="space-y-2">
                <Label>Sprache</Label>
                <Select value={benefitForm.locale} onValueChange={(value: Locale) => setBenefitForm((current) => ({ ...current, locale: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{localeOptions.map((option) => <SelectItem key={option} value={option}>{option.toUpperCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={saveBenefit}>Speichern</Button>
              {benefitForm.id ? <Button variant="outline" onClick={() => setBenefitForm({ id: '', title: '', description: '', icon: 'star', sortOrder: 0, locale: 'de' })}>Abbrechen</Button> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TextRecordList
          title="Beitrittsschritte"
          description="Pflegen Sie den Ablauf in sortierbaren Schritten."
          items={steps || []}
          loading={stepsLoading}
          onEdit={(id) => {
            const item = steps?.find((entry) => entry.id === id);
            if (!item) return;
            setStepForm({ id: item.id, title: item.title, description: item.description || '', sortOrder: item.sort_order, locale: item.locale as Locale });
          }}
          onDelete={async (id) => {
            try {
              await stepMutations.remove.mutateAsync(id);
              toast.success('Beitrittsschritt gelöscht');
            } catch (error) {
              toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
            }
          }}
          renderLabel={(item: MembershipStep) => (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.title}</p>
                <LocaleBadge locale={item.locale} />
              </div>
              <p className="text-xs text-muted-foreground">Sortierung: {item.sort_order}</p>
            </div>
          )}
        />

        <Card>
          <CardHeader><CardTitle>{stepForm.id ? 'Beitrittsschritt bearbeiten' : 'Neuer Beitrittsschritt'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Titel</Label><Input value={stepForm.title} onChange={(e) => setStepForm((current) => ({ ...current, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={5} value={stepForm.description} onChange={(e) => setStepForm((current) => ({ ...current, description: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Sortierung</Label><Input type="number" value={stepForm.sortOrder} onChange={(e) => setStepForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))} /></div>
              <div className="space-y-2">
                <Label>Sprache</Label>
                <Select value={stepForm.locale} onValueChange={(value: Locale) => setStepForm((current) => ({ ...current, locale: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{localeOptions.map((option) => <SelectItem key={option} value={option}>{option.toUpperCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={saveStep}>Speichern</Button>
              {stepForm.id ? <Button variant="outline" onClick={() => setStepForm({ id: '', title: '', description: '', sortOrder: 0, locale: 'de' })}>Abbrechen</Button> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DisciplinesEditor() {
  const { data, isLoading } = useDisciplineHighlightsAdmin();
  const { create, update, remove } = useDisciplineHighlightMutations();
  const [form, setForm] = useState({
    id: '',
    disciplineKey: 'motocross' as DisciplineHighlight['discipline_key'],
    title: '',
    description: '',
    icon: 'training',
    sortOrder: 0,
    locale: 'de' as Locale,
  });

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Titel ist Pflicht.');
      return;
    }
    const payload = {
      disciplineKey: form.disciplineKey,
      title: form.title,
      description: form.description,
      icon: form.icon,
      sortOrder: form.sortOrder,
      locale: form.locale,
    };
    try {
      if (form.id) {
        await update.mutateAsync({ id: form.id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success('Sektionskarte gespeichert');
      setForm({ id: '', disciplineKey: 'motocross', title: '', description: '', icon: 'training', sortOrder: 0, locale: 'de' });
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <TextRecordList
        title="Sektionskarten"
        description="Training, Events, Touren oder Community werden als Karten gepflegt."
        items={data || []}
        loading={isLoading}
        onEdit={(id) => {
          const item = data?.find((entry) => entry.id === id);
          if (!item) return;
          setForm({
            id: item.id,
            disciplineKey: item.discipline_key,
            title: item.title,
            description: item.description || '',
            icon: item.icon,
            sortOrder: item.sort_order,
            locale: item.locale as Locale,
          });
        }}
        onDelete={async (id) => {
          try {
            await remove.mutateAsync(id);
            toast.success('Sektionskarte gelöscht');
          } catch (error) {
            toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
          }
        }}
        renderLabel={(item: DisciplineHighlight) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{item.title}</p>
              <LocaleBadge locale={item.locale} />
              <Badge>{item.discipline_key}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.icon}</p>
          </div>
        )}
      />

      <Card>
        <CardHeader><CardTitle>{form.id ? 'Sektionskarte bearbeiten' : 'Neue Sektionskarte'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Sektion</Label>
              <Select value={form.disciplineKey} onValueChange={(value: DisciplineHighlight['discipline_key']) => setForm((current) => ({ ...current, disciplineKey: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['motocross', 'trial', 'touring'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sprache</Label>
              <Select value={form.locale} onValueChange={(value: Locale) => setForm((current) => ({ ...current, locale: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{localeOptions.map((option) => <SelectItem key={option} value={option}>{option.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Titel</Label><Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={form.icon} onValueChange={(value) => setForm((current) => ({ ...current, icon: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['training', 'events', 'community', 'tour', 'track', 'award'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Sortierung</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={save}>Speichern</Button>
            {form.id ? <Button variant="outline" onClick={() => setForm({ id: '', disciplineKey: 'motocross', title: '', description: '', icon: 'training', sortOrder: 0, locale: 'de' })}>Abbrechen</Button> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PartnerClubsEditor() {
  const { data, isLoading } = usePartnerClubsAdmin();
  const { create, update, remove } = usePartnerClubMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
    active: true,
    sortOrder: 0,
    locale: 'de' as Locale,
  });

  const reset = () => {
    setEditingId(null);
    setLogoFile(null);
    setForm({ name: '', description: '', location: '', website: '', active: true, sortOrder: 0, locale: 'de' });
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name ist Pflicht.');
      return;
    }
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      location: form.location,
      website: form.website,
      active: form.active,
      sortOrder: form.sortOrder,
      locale: form.locale,
    };
    if (logoFile) payload.logo = logoFile;

    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, payload });
      } else {
        await create.mutateAsync(payload);
      }
      toast.success('Partnerverein gespeichert');
      reset();
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <TextRecordList
        title="Partnervereine"
        description="Partnervereine werden als einzelne Einträge statt als Fließtext gepflegt."
        items={data || []}
        loading={isLoading}
        onEdit={(id) => {
          const item = data?.find((entry) => entry.id === id);
          if (!item) return;
          setEditingId(item.id);
          setLogoFile(null);
          setForm({
            name: item.name,
            description: item.description || '',
            location: item.location || '',
            website: item.website || '',
            active: item.active,
            sortOrder: item.sort_order,
            locale: item.locale as Locale,
          });
        }}
        onDelete={async (id) => {
          try {
            await remove.mutateAsync(id);
            toast.success('Partnerverein gelöscht');
            if (editingId === id) reset();
          } catch (error) {
            toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
          }
        }}
        renderLabel={(item: PartnerClub) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{item.name}</p>
              <LocaleBadge locale={item.locale} />
              {!item.active ? <Badge variant="secondary">inaktiv</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">{item.location || 'Ohne Ort'}</p>
          </div>
        )}
      />

      <Card>
        <CardHeader><CardTitle>{editingId ? 'Partnerverein bearbeiten' : 'Neuer Partnerverein'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Ort</Label><Input value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2"><Label>Sortierung</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm((current) => ({ ...current, sortOrder: Number(e.target.value) || 0 }))} /></div>
            <div className="space-y-2">
              <Label>Sprache</Label>
              <Select value={form.locale} onValueChange={(value: Locale) => setForm((current) => ({ ...current, locale: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{localeOptions.map((option) => <SelectItem key={option} value={option}>{option.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              <MediaAssetPicker onSelect={(file) => setLogoFile(file)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Aktiv</p>
              <p className="text-sm text-muted-foreground">Im Frontend sichtbar</p>
            </div>
            <Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} />
          </div>
          <div className="flex gap-3">
            <Button onClick={save}>Speichern</Button>
            {editingId ? <Button variant="outline" onClick={reset}>Abbrechen</Button> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StructuredContentAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Strukturierte Inhalte</h1>
        <p className="text-muted-foreground">
          Pflegen Sie echte Inhaltstypen statt generischer Seitenfelder.
        </p>
      </div>

      <Tabs defaultValue="board" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap gap-2">
          <TabsTrigger value="board">Vorstand</TabsTrigger>
          <TabsTrigger value="history">Chronik</TabsTrigger>
          <TabsTrigger value="membership">Mitgliedschaft</TabsTrigger>
          <TabsTrigger value="disciplines">Sektionen</TabsTrigger>
          <TabsTrigger value="partners">Partnervereine</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <BoardEditor />
        </TabsContent>
        <TabsContent value="history">
          <HistoryEditor />
        </TabsContent>
        <TabsContent value="membership">
          <MembershipEditor />
        </TabsContent>
        <TabsContent value="disciplines">
          <DisciplinesEditor />
        </TabsContent>
        <TabsContent value="partners">
          <PartnerClubsEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
