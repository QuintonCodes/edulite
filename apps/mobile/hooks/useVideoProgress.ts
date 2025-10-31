import * as SecureStore from 'expo-secure-store';
import { createVideoPlayer, VideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';

export function useVideoProgress({ videoUrl, tutorialId }: { videoUrl: string; tutorialId: string }) {
  const [player, setPlayer] = useState<VideoPlayer | null>(null);
  const [progress, setProgress] = useState(0); // Progress as a percentage (0 to 1)
  const [currentTime, setCurrentTime] = useState(0); // Current time in seconds
  const [duration, setDuration] = useState(0); // Total video duration in seconds

  // Initialize the video player
  useEffect(() => {
    if (!videoUrl) return;

    const videoPlayer = createVideoPlayer({ uri: videoUrl });
    if (videoPlayer) videoPlayer.loop = false;
    setPlayer(videoPlayer);

    return () => {
      if (videoPlayer) {
        videoPlayer.pause(); // Pause the player before releasing
        videoPlayer.release(); // Release the player
      }
      setPlayer(null); // Clear the player reference
    };
  }, [videoUrl]);

  useEffect(() => {
    async function loadProgress() {
      const savedProgress = await SecureStore.getItemAsync(`progress_${tutorialId}`);
      const savedTime = await SecureStore.getItemAsync(`time_${tutorialId}`);
      if (savedProgress) setProgress(parseFloat(savedProgress));
      if (savedTime) setCurrentTime(parseFloat(savedTime));

      if (player && savedTime) player.seekBy(parseFloat(savedTime)); // Seek to the saved time
    }
    loadProgress();
  }, [tutorialId, player]);

  useEffect(() => {
    async function saveProgress() {
      await SecureStore.setItemAsync(`progress_${tutorialId}`, progress.toString());
      await SecureStore.setItemAsync(`time_${tutorialId}`, currentTime.toString());
    }
    saveProgress();
  }, [progress, currentTime, tutorialId]);

  useEffect(() => {
    if (!player) return;

    function updateProgress() {
      const duration = player?.duration ?? 0;
      const current = player?.currentTime ?? 0;

      setDuration(duration);
      setCurrentTime(current);

      if (duration > 0) {
        setProgress(current / duration);
      }
    }

    const interval = setInterval(updateProgress, 500); // update every 0.5s

    // Listen for when the video ends
    const listener = player.addListener('playToEnd', () => {
      setProgress(1); // Set progress to 100%
      setCurrentTime(duration); // Set current time to the end of the video
    });

    return () => {
      clearInterval(interval);
      listener.remove();
    };
  }, [duration, player]);

  return {
    player,
    progress,
    setProgress,
    currentTime,
    duration,
    setCurrentTime,
  };
}
