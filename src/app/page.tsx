import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className={
        "landing-shell min-h-screen grid place-content-center gap-4 max-w-[900px] m-auto p-[4rem_2rem] [&_h1]:m-0 [&_h1]:max-w-[14ch] [&_h1]:text-[clamp(3rem,_8vw,_7rem)] [&_h1]:leading-[0.92] [&_h1]:tracking-[-0.06em] [&_p:not(.eyebrow)]:max-w-[56ch] [&_p:not(.eyebrow)]:text-[#5b6b65] [&_p:not(.eyebrow)]:text-[1.1rem]"
      }
    >
      <p
        className={
          "eyebrow [font:700_0.75rem/1_ui-monospace,_monospace] tracking-[0.2em] text-[#0b6b53]"
        }
      >
        CADPRO · TMMS
      </p>
      <h1>Giám sát thiết bị giao thông theo thời gian thực.</h1>
      <p>Một bản đồ vận hành thống nhất cho camera, phương tiện, cảm biến và tủ tín hiệu.</p>
      <div className={"landing-actions flex flex-wrap gap-3"}>
        <Link
          className={
            "primary-link min-h-[44px] inline-flex items-center justify-center rounded-[0.5rem] [border:1px_solid_transparent] p-[0.65rem_1rem] no-underline cursor-pointer w-fit text-white [background:#10211d]"
          }
          href="/map"
        >
          Mở bản đồ vận hành
        </Link>
        <Link
          className={
            "primary-link min-h-[44px] inline-flex items-center justify-center rounded-[0.5rem] [border:1px_solid_transparent] p-[0.65rem_1rem] no-underline cursor-pointer w-fit text-white [background:#10211d]"
          }
          href="/devices"
        >
          Quản lý thiết bị
        </Link>
      </div>
    </main>
  );
}
