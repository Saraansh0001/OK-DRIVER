import { DAY_SECONDS } from "../store/usePlaybackStore";

function formatTime(second) {
  const total = Math.max(0, Math.floor(second));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function PlayheadScrubber({ timelineSecond }) {
  const percent = (timelineSecond / DAY_SECONDS) * 100;

  return (
    <div className="absolute -top-9 z-20" style={{ left: `${percent}%` }}>
      <div className="-translate-x-1/2 rounded bg-teal-400/20 px-2 py-1 text-xs font-semibold text-teal-200 ring-1 ring-teal-300/40">
        {formatTime(timelineSecond)}
      </div>
      <div className="mx-auto h-7 w-[2px] -translate-x-1/2 bg-teal-300/80" />
    </div>
  );
}
