import { useEffect, useState } from "react";
import { DualPlayer } from "./components/DualPlayer";
import { TimelineCanvas } from "./components/TimelineCanvas";
import { useTimelineSync } from "./hooks/useTimelineSync";
import { fetchClips, loginDemo } from "./lib/api";
import { usePlaybackStore } from "./store/usePlaybackStore";

function App() {
  const setToken = usePlaybackStore((state) => state.setToken);
  const setClips = usePlaybackStore((state) => state.setClips);
  const [status, setStatus] = useState("Loading playback...");
  const [error, setError] = useState("");
  useTimelineSync();

  useEffect(() => {
    async function bootstrap() {
      try {
        const auth = await loginDemo();
        setToken(auth.token);
        const payload = await fetchClips(auth.token, "2026-05-08");
        setClips(payload.clips);
        setStatus("Ready");
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    bootstrap();
  }, [setClips, setToken]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h1 className="text-2xl font-bold text-slate-50">OKDriver DVR History Playback</h1>
          <p className="mt-2 text-sm text-slate-400">
            Fleet telematics playback with double-buffer transitions and synchronized front/rear views.
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-cyan-300">{error || status}</p>
        </header>

        {!error && (
          <>
            <DualPlayer />
            <TimelineCanvas />
          </>
        )}
      </div>
    </main>
  );
}

export default App;
