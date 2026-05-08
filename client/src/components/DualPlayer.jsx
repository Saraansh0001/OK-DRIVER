import { motion } from "framer-motion";
import { usePlaybackStore } from "../store/usePlaybackStore";
import { useVideoBuffer } from "../hooks/useVideoBuffer";

function VideoLayer({ videoRef, active }) {
  return (
    <video
      ref={videoRef}
      muted
      playsInline
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

function BufferedCamera({ label, camera }) {
  const { videoARef, videoBRef, activeSlot, loading } = useVideoBuffer(camera);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-black shadow-xl">
      <div className="absolute left-3 top-3 z-10 rounded bg-slate-900/80 px-2 py-1 text-xs uppercase tracking-wide text-slate-200">
        {label}
      </div>
      {loading && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/45 text-sm text-slate-200">Buffering...</div>
      )}
      <div className="relative h-72 w-full">
        <VideoLayer videoRef={videoARef} active={activeSlot === "A"} />
        <VideoLayer videoRef={videoBRef} active={activeSlot === "B"} />
      </div>
    </div>
  );
}

export function DualPlayer() {
  const viewMode = usePlaybackStore((state) => state.viewMode);
  const toggleViewMode = usePlaybackStore((state) => state.toggleViewMode);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Dual Camera Playback</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-md border border-slate-500 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-800"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={toggleViewMode}
            className="rounded-md border border-cyan-500 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-900/30"
          >
            Toggle {viewMode === "side-by-side" ? "PiP" : "Side-by-Side"}
          </button>
        </div>
      </div>

      {viewMode === "side-by-side" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <BufferedCamera label="Front Camera" camera="front" />
          <BufferedCamera label="Rear Camera" camera="rear" />
        </div>
      ) : (
        <div className="relative">
          <BufferedCamera label="Front Camera" camera="front" />
          <motion.div
            className="absolute bottom-4 right-4 w-80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BufferedCamera label="Rear PiP" camera="rear" />
          </motion.div>
        </div>
      )}
    </section>
  );
}
