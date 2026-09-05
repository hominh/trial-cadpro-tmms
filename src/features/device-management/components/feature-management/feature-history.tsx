import { useDeviceFeatureStore } from "../../stores/device-feature-store";
export function FeatureHistory() {
  const history = useDeviceFeatureStore((state) => state.history);
  return (
    <section>
      <h3>Lịch sử thay đổi</h3>
      {history.length === 0 ? (
        <p>Chưa có lịch sử.</p>
      ) : (
        <ol className="history-list">
          {history.map((item) => (
            <li key={item.id}>
              <strong>{item.eventType}</strong> · {item.feature.name}
              <br />
              <small>
                {new Date(item.validFrom).toLocaleString("vi-VN")} — {item.actor.displayName}
              </small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
