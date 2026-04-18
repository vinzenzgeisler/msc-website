import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { StructuredRow } from '@/lib/structured-rows';

interface RowsEditorProps {
  rows: StructuredRow[];
  onChange: (rows: StructuredRow[]) => void;
  labelHeader: string;
  valueHeader: string;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}

export function RowsEditor({
  rows,
  onChange,
  labelHeader,
  valueHeader,
  labelPlaceholder,
  valuePlaceholder,
  addLabel = 'Zeile hinzufügen',
}: RowsEditorProps) {
  const update = (index: number, field: 'label' | 'value', value: string) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...rows, { label: '', value: '' }]);
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Label>{labelHeader}</Label>
        <Label>{valueHeader}</Label>
        <span />
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Einträge. Füge unten eine Zeile hinzu.</p>
      )}

      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            value={row.label}
            onChange={(e) => update(index, 'label', e.target.value)}
            placeholder={labelPlaceholder}
          />
          <Input
            value={row.value}
            onChange={(e) => update(index, 'value', e.target.value)}
            placeholder={valuePlaceholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            aria-label="Zeile entfernen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
