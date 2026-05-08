import { create } from "zustand";

const DAY_SECONDS = 24 * 60 * 60;

const defaultBufferState = {
  activeSlot: "A",
  loading: true,
  switching: false,
  activeClipIndex: 0,
  nextClipIndex: 1,
};

export const usePlaybackStore = create((set, get) => ({
  token: "",
  clips: [],
  timelineSecond: 0,
  isPlaying: true,
  viewMode: "side-by-side",
  bufferState: defaultBufferState,
  setToken: (token) => set({ token }),
  setClips: (clips) => {
    const sorted = [...clips].sort((a, b) => a.timelineStartSecond - b.timelineStartSecond);
    set({
      clips: sorted,
      timelineSecond: sorted[0]?.timelineStartSecond ?? 0,
      bufferState: {
        ...defaultBufferState,
        activeClipIndex: 0,
        nextClipIndex: sorted.length > 1 ? 1 : 0,
        loading: sorted.length > 0,
      },
    });
  },
  setTimelineSecond: (next) => set({ timelineSecond: Math.max(0, Math.min(DAY_SECONDS - 1, next)) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  toggleViewMode: () => set((state) => ({ viewMode: state.viewMode === "side-by-side" ? "pip" : "side-by-side" })),
  setBufferState: (partial) => set((state) => ({ bufferState: { ...state.bufferState, ...partial } })),
  getClipByIndex: (index) => get().clips[index] ?? null,
  seekToTimeline: (second) => {
    const clips = get().clips;
    if (!clips.length) return;

    const bounded = Math.max(0, Math.min(DAY_SECONDS - 1, second));
    const foundIndex = clips.findIndex((clip, index) => {
      const nextStart = clips[index + 1]?.timelineStartSecond ?? DAY_SECONDS;
      return bounded >= clip.timelineStartSecond && bounded < nextStart;
    });

    const clipIndex = foundIndex === -1 ? 0 : foundIndex;
    const nextClipIndex = Math.min(clipIndex + 1, clips.length - 1);

    set({
      timelineSecond: bounded,
      bufferState: {
        ...get().bufferState,
        activeClipIndex: clipIndex,
        nextClipIndex,
        activeSlot: "A",
        loading: true,
      },
    });
  },
}));

export { DAY_SECONDS };
