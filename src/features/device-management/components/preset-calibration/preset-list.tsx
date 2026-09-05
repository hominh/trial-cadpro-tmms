import { useDevicePresetStore } from "../../stores/device-preset-store";
export function PresetList() {
  const presets = useDevicePresetStore((state) => state.presets);
  return (
    <section>
      <h3>Preset đã lưu</h3>
      {presets.length === 0 ? (
        <p>Chưa có preset.</p>
      ) : (
        <ul className="preset-list">
          {presets.map((preset) => (
            <li key={preset.id}>
              <strong>
                #{preset.presetNo} — {preset.name}
              </strong>
              <span className="badge">{preset.isCalibrated ? "Đã hiệu chỉnh" : "Bản nháp"}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
