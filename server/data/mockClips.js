const FRONT_STREAMS = [
  "https://vz-44c78a82-e6f.b-cdn.net/4635c38f-7cc0-460a-960e-ae4e3f280c09/playlist.m3u8",
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
];

const REAR_STREAMS = [
  "https://vz-44c78a82-e6f.b-cdn.net/4635c38f-7cc0-460a-960e-ae4e3f280c09/playlist.m3u8",
  "https://test-streams.mux.dev/test_001/stream.m3u8",
];

const CLIP_SECONDS = 300;

function buildMockClips(dateString) {
  const selectedDate = dateString || "2026-05-08";
  const startUnix = Math.floor(new Date(`${selectedDate}T00:00:00.000Z`).getTime() / 1000);

  return Array.from({ length: 24 }).map((_, hour) => {
    const clipStart = startUnix + hour * 3600;
    const startAtSecond = hour === 0 ? 0 : 900;
    const cameraFrontUrl = FRONT_STREAMS[hour % FRONT_STREAMS.length];
    const cameraRearUrl = REAR_STREAMS[hour % REAR_STREAMS.length];

    return {
      id: `clip-${selectedDate}-${hour}`,
      startUnix: clipStart,
      endUnix: clipStart + CLIP_SECONDS,
      date: selectedDate,
      availableSeconds: CLIP_SECONDS,
      timelineStartSecond: hour * 3600 + startAtSecond,
      frontUrl: cameraFrontUrl,
      rearUrl: cameraRearUrl,
    };
  });
}

module.exports = { buildMockClips };
