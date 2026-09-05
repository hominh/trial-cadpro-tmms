"use client";
import { Label } from "@/components/ui/label";
import { useDeviceCatalogStore } from "../../stores/device-catalog-store";
export function ObjectPicker({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const objects = useDeviceCatalogStore((state) => state.objects);
  return (
    <div>
      <Label htmlFor="device-object">Vị trí lắp đặt</Label>
      <select
        id="device-object"
        className="input"
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Chọn object</option>
        {objects.map((item) => (
          <option key={item.id} value={item.id}>
            {item.code} — {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
