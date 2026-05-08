import { useEffect } from "react";
import { usePlaybackStore } from "../store/usePlaybackStore";

export function useTimelineSync() {
  const timelineSecond = usePlaybackStore((state) => state.timelineSecond);
  const seekToTimeline = usePlaybackStore((state) => state.seekToTimeline);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.code === "Space") {
        event.preventDefault();
        setIsPlaying(!isPlaying);
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        seekToTimeline(timelineSecond - 5);
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        seekToTimeline(timelineSecond + 5);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, seekToTimeline, setIsPlaying, timelineSecond]);
}
