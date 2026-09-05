"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type Position = readonly [number, number];
export function PolygonCoordinateTable({
  vertices,
  onChange,
}: {
  readonly vertices: readonly Position[];
  readonly onChange: (vertices: readonly Position[]) => void;
}) {
  const update = (index: number, coordinate: 0 | 1, value: string) => {
    const copy = vertices.map((item) => [...item] as [number, number]);
    const next = Number(value);
    if (Number.isFinite(next) && copy[index]) copy[index][coordinate] = next;
    onChange(copy);
  };
  const remove = (index: number) => onChange(vertices.filter((_, item) => item !== index));
  return (
    <div className={"coordinate-table grid gap-[0.4rem]"}>
      <h4>Tọa độ vùng phạt</h4>
      {vertices.map((point, index) => (
        <div
          className={"coordinate-row grid grid-cols-[1fr_1fr_auto] gap-[0.4rem]"}
          key={`${index}-${point[0]}-${point[1]}`}
        >
          <Input
            aria-label={`Kinh độ đỉnh ${index + 1}`}
            type="number"
            value={point[0]}
            onChange={(event) => update(index, 0, event.target.value)}
          />
          <Input
            aria-label={`Vĩ độ đỉnh ${index + 1}`}
            type="number"
            value={point[1]}
            onChange={(event) => update(index, 1, event.target.value)}
          />
          <Button type="button" variant="ghost" onClick={() => remove(index)}>
            Xóa
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...vertices, [106.7, 10.77]])}
      >
        Thêm đỉnh
      </Button>
    </div>
  );
}
