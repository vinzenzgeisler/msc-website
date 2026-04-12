import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePartnerClubsAdmin, usePartnerClubMutations } from '@/hooks/useStructuredContent';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import type { PartnerClub } from '@/integrations/pocketbase/client';

type Locale = 'de' | 'en' | 'cz';
const localeOptions: Locale[] = ['de', 'en', 'cz'];

export default function PartnerClubsAdminPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partnervereine</h1>
        <p className="text-muted-foreground">Pflegen Sie die Partnervereine des MSC.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Partnervereine</CardTitle>
            <CardDescription>Partnervereine werden als einzelne Einträge gepflegt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : !data?.length ? (
              <p className="text-sm text-muted-foreground">Noch keine Einträge vorhanden.</p>
            ) : (
              data.map((item: PartnerClub) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="outline">{item.locale.toUpperCase()}</Badge>
                      {!item.active && <Badge variant="secondary">inaktiv</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.location || 'Ohne Ort'}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
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
                    }}>Bearbeiten</Button>
                    <Button variant="destructive" size="sm" onClick={async () => {
                      try {
                        await remove.mutateAsync(item.id);
                        toast.success('Partnerverein gelöscht');
                        if (editingId === item.id) reset();
                      } catch (error) {
                        toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
                      }
                    }}>Löschen</Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Partnerverein bearbeiten' : 'Neuer Partnerverein'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Ort</Label><Input value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={(e) => setForm((c) => ({ ...c, website: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Sortierung</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm((c) => ({ ...c, sortOrder: Number(e.target.value) || 0 }))} /></div>
              <div className="space-y-2">
                <Label>Sprache</Label>
                <Select value={form.locale} onValueChange={(value: Locale) => setForm((c) => ({ ...c, locale: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{localeOptions.map((o) => <SelectItem key={o} value={o}>{o.toUpperCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Logo</Label><Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Aktiv</p>
                <p className="text-sm text-muted-foreground">Im Frontend sichtbar</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(value) => setForm((c) => ({ ...c, active: value }))} />
            </div>
            <div className="flex gap-3">
              <Button onClick={save}>Speichern</Button>
              {editingId && <Button variant="outline" onClick={reset}>Abbrechen</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
