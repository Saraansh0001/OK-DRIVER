import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { usePlaybackStore } from "../store/usePlaybackStore";

function attachSource(videoEl, src) {
  if (!videoEl || !src) return null;

  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = src;
    return null;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(src);
    hls.attachMedia(videoEl);
    return hls;
  }

  videoEl.src = src;
  return null;
}

export function useVideoBuffer(camera = "front") {
  const clips = usePlaybackStore((state) => state.clips);
  const timelineSecond = usePlaybackStore((state) => state.timelineSecond);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const bufferState = usePlaybackStore((state) => state.bufferState);
  const setBufferState = usePlaybackStore((state) => state.setBufferState);
  const setTimelineSecond = usePlaybackStore((state) => state.setTimelineSecond);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);

  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const hlsARef = useRef(null);
  const hlsBRef = useRef(null);
  const [isAReady, setIsAReady] = useState(false);
  const [isBReady, setIsBReady] = useState(false);

  const activeRef = bufferState.activeSlot === "A" ? videoARef : videoBRef;
  const activeClip = clips[bufferState.activeClipIndex] ?? null;
  const nextClip = clips[bufferState.nextClipIndex] ?? null;

  const sourceKey = camera === "rear" ? "rearUrl" : "frontUrl";

  const seekWithinClip = useMemo(() => {
    if (!activeClip) return 0;
    return Math.max(0, timelineSecond - activeClip.timelineStartSecond);
  }, [activeClip, timelineSecond]);

  const preloadClipToSlot = useCallback(
    (videoRef, hlsRef, clipIndex, onReady) => {
      const clip = clips[clipIndex];
      const source = clip?.[sourceKey];
      if (!clip || !source || !videoRef.current) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      onReady(false);
      const hls = attachSource(videoRef.current, source);
      hlsRef.current = hls;
      videoRef.current.load();

      const handleReady = () => onReady(true);
      videoRef.current.addEventListener("canplay", handleReady, { once: true });
    },
    [clips, sourceKey],
  );

  useEffect(() => {
    if (!clips.length) return;
    preloadClipToSlot(videoARef, hlsARef, bufferState.activeClipIndex, setIsAReady);
    preloadClipToSlot(videoBRef, hlsBRef, bufferState.nextClipIndex, setIsBReady);
  }, [bufferState.activeClipIndex, bufferState.nextClipIndex, clips.length, preloadClipToSlot]);

  useEffect(() => {
    if (!activeRef.current || !activeClip) return;
    activeRef.current.currentTime = seekWithinClip;
  }, [activeClip, activeRef, seekWithinClip]);

  useEffect(() => {
    const activeVideo = activeRef.current;
    if (!activeVideo || !activeClip) return undefined;

    const onTimeUpdate = () => {
      const second = activeClip.timelineStartSecond + activeVideo.currentTime;
      setTimelineSecond(Math.floor(second));
    };

    const onEnded = () => {
      if (!nextClip) {
        setIsPlaying(false);
        return;
      }

      setBufferState({ switching: true });
      const nextSlot = bufferState.activeSlot === "A" ? "B" : "A";
      const upcoming = bufferState.nextClipIndex + 1;

      setBufferState({
        activeSlot: nextSlot,
        activeClipIndex: bufferState.nextClipIndex,
        nextClipIndex: upcoming < clips.length ? upcoming : bufferState.nextClipIndex,
        switching: false,
      });

      const currentReady = nextSlot === "A" ? isAReady : isBReady;
      setBufferState({ loading: !currentReady });

      const preloadTargetVideo = nextSlot === "A" ? videoBRef : videoARef;
      const preloadTargetHls = nextSlot === "A" ? hlsBRef : hlsARef;
      const setReady = nextSlot === "A" ? setIsBReady : setIsAReady;

      if (upcoming < clips.length) {
        preloadClipToSlot(preloadTargetVideo, preloadTargetHls, upcoming, setReady);
      }
    };

    activeVideo.addEventListener("timeupdate", onTimeUpdate);
    activeVideo.addEventListener("ended", onEnded);

    if (isPlaying) {
      activeVideo.play().catch(() => setIsPlaying(false));
    } else {
      activeVideo.pause();
    }

    return () => {
      activeVideo.removeEventListener("timeupdate", onTimeUpdate);
      activeVideo.removeEventListener("ended", onEnded);
    };
  }, [
    activeClip,
    activeRef,
    bufferState.activeSlot,
    bufferState.nextClipIndex,
    clips.length,
    isAReady,
    isBReady,
    isPlaying,
    nextClip,
    preloadClipToSlot,
    setBufferState,
    setIsPlaying,
    setTimelineSecond,
  ]);

  useEffect(
    () => () => {
      if (hlsARef.current) hlsARef.current.destroy();
      if (hlsBRef.current) hlsBRef.current.destroy();
    },
    [],
  );

  return {
    videoARef,
    videoBRef,
    activeSlot: bufferState.activeSlot,
    loading: bufferState.loading || (bufferState.activeSlot === "A" ? !isAReady : !isBReady),
    currentClip: activeClip,
    nextClip,
  };
}
