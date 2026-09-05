import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <p className="eyebrow">CADPRO · TMMS</p>
      <h1>Giám sát thiết bị giao thông theo thời gian thực.</h1>
      <p>Một bản đồ vận hành thống nhất cho camera, phương tiện, cảm biến và tủ tín hiệu.</p>
      <div className="landing-actions">
        <Link className="primary-link" href="/map">
          Mở bản đồ vận hành
        </Link>
        <Link className="primary-link" href="/devices">
          Quản lý thiết bị
        </Link>
      </div>
    </main>
  );
}
