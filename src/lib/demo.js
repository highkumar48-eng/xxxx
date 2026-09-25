const photos = [
  "photo-1464822759023-fed622ff2c3b",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1518837695005-2083093ee35b",
  "photo-1470770841072-f978cf4d019e",
  "photo-1500534623283-312aade485b7",
  "photo-1441974231531-c6227db76b6e",
  "photo-1507525428034-b723cf961d3e",
  "photo-1469474968028-56623f02e42e",
  "photo-1447752875215-b2761acb3c5d",
];
const titles = [
  "Above it all · A journey into the mountains",
  "Slow mornings, somewhere in the wild",
  "Where the ocean meets the sky",
  "A little cabin. A world of possibility.",
  "Chasing the last light",
  "Take the road less traveled",
  "The art of doing absolutely nothing",
  "Somewhere you’ve never been",
  "Finding quiet in the everyday",
];
export const demoVideos = titles.map((title, i) => ({
  id: `demo-${i + 1}`,
  title,
  description:
    "A moment worth sharing. Explore this sample collection while you set up your own library. Demo playback uses the public Big Buck Bunny sample film; the cover photography is illustrative.",
  tags: [
    i % 3 === 0 ? "Travel" : i % 3 === 1 ? "Nature" : "Lifestyle",
    "Cinematic",
  ],
  media_type: i === 8 ? "image" : "video",
  video_url:
    i === 8
      ? `https://images.unsplash.com/${photos[i]}?auto=format&fit=crop&w=1600&q=85`
      : "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnail_url: `https://images.unsplash.com/${photos[i]}?auto=format&fit=crop&w=1200&q=85`,
  duration: 596,
  views: [12400, 8200, 6100, 4300, 3800, 2700, 1900, 1600, 920][i],
  created_at: new Date(Date.UTC(2026, 8, 24 - i)).toISOString(),
  is_published: true,
}));
