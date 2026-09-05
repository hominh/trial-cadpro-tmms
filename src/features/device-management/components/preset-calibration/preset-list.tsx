import { useDevicePresetStore } from "../../stores/device-preset-store";
export function PresetList() {
  const presets = useDevicePresetStore((state) => state.presets);
  return (
    <section>
      <h3>Preset đã lưu</h3>
      {presets.length === 0 ? (
        <p>Chưa có preset.</p>
      ) : (
        <ul className={"preset-list grid gap-[0.65rem] p-0 list-none"}>
          {presets.map((preset) => (
            <li key={preset.id}>
              <strong>
                #{preset.presetNo} — {preset.name}
              </strong>
              <span
                className={
                  "badge inline-flex items-center rounded-[999px] p-[0.2rem_0.5rem] [background:#e9ece8] text-[0.72rem] font-bold"
                }
              >
                {preset.isCalibrated ? "Đã hiệu chỉnh" : "Bản nháp"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
