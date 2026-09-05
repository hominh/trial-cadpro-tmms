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
        className={
          "input min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)]"
        }
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
