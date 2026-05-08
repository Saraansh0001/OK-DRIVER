import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { usePlaybackStore, DAY_SECONDS } from "../store/usePlaybackStore";
import { PlayheadScrubber } from "./PlayheadScrubber";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TimelineCanvas() {
  const canvasRef = useRef(null);
  const clips = usePlaybackStore((state) => state.clips);
  const timelineSecond = usePlaybackStore((state) => state.timelineSecond);
  const seekToTimeline = usePlaybackStore((state) => state.seekToTimeline);

  const segments = useMemo(
    () =>
      clips.map((clip, index) => ({
        ...clip,
        endSecond: clips[index + 1]?.timelineStartSecond ?? clip.timelineStartSecond + clip.availableSeconds,
      })),
    [clips],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = 52;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#1c2230";
    ctx.fillRect(0, 0, width, height);

    for (const segment of segments) {
      const x = (segment.timelineStartSecond / DAY_SECONDS) * width;
      const nextX = (segment.endSecond / DAY_SECONDS) * width;
      const segmentWidth = Math.max(2, nextX - x);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(x, 10, segmentWidth, 32);
    }

    for (const hour of HOURS) {
      const x = (hour / 24) * width;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.32)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, [segments]);

  function handleClick(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const normalized = clickX / rect.width;
    seekToTimeline(Math.floor(normalized * DAY_SECONDS));
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">24h Timeline Playback</h3>
        <span className="text-xs text-slate-400">Clickable canvas timeline</span>
      </div>

      <div className="relative">
        <PlayheadScrubber timelineSecond={timelineSecond} />
        <motion.canvas
          ref={canvasRef}
          className="h-[52px] w-full cursor-pointer rounded-md"
          onClick={handleClick}
          whileTap={{ scale: 0.998 }}
        />
      </div>

      <div className="mt-2 grid grid-cols-12 text-xs text-slate-500">
        {HOURS.filter((h) => h % 2 === 0).map((hour) => (
          <span key={hour} className="col-span-1">
            {String(hour).padStart(2, "0")}:00
          </span>
        ))}
      </div>
    </div>
  );
}
