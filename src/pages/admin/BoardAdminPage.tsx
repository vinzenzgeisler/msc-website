import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateBoardMember,
  useBoardMembers,
  useDeleteBoardMember,
  useUpdateBoardMember,
} from '@/hooks/useBoardMembers';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';

export default function BoardAdminPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vorstand</h1>
        <p className="text-muted-foreground">Pflegen Sie die Vorstandsmitglieder des Vereins.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Vorstandsmitglieder</CardTitle>
            <CardDescription>Pflegen Sie die Kartenansicht der Vorstandsseite direkt über einzelne Personen.</CardDescription>
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
              data.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                    <p className="text-xs text-muted-foreground">Sortierung: {item.sort_order}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(item.id)}>Bearbeiten</Button>
                    <Button variant="destructive" size="sm" onClick={async () => {
                      try {
                        await deleteBoardMember.mutateAsync(item.id);
                        toast.success('Vorstandsmitglied gelöscht');
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
            <CardTitle>{editing ? 'Vorstandsmitglied bearbeiten' : 'Neues Vorstandsmitglied'}</CardTitle>
            <CardDescription>Die Einträge werden als Karten auf der Vorstandsseite gerendert.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Rolle</Label>
              <Input value={form.role} onChange={(e) => setForm((c) => ({ ...c, role: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Reihenfolge</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm((c) => ({ ...c, sort_order: Number(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Foto</Label>
                <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                <MediaAssetPicker onSelect={(file) => setPhotoFile(file)} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={save} disabled={createBoardMember.isPending || updateBoardMember.isPending}>Speichern</Button>
              {editing && <Button variant="outline" onClick={reset}>Abbrechen</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
