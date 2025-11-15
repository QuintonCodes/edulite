import * as SecureStore from 'expo-secure-store';
import { createVideoPlayer, VideoPlayer } from 'expo-video';
import { useEffect, useRef, useState } from 'react';

export function useVideoProgress({ videoUrl, tutorialId }: { videoUrl: string; tutorialId: string }) {
  const [player, setPlayer] = useState<VideoPlayer | null>(null);
  const [progress, setProgressState] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const isReleasedRef = useRef(false);
  const playerRef = useRef<VideoPlayer | null>(null);
  const lastSavedProgress = useRef(0);
  const lastSavedTime = useRef(0);

  // Load completion status and progress on mount
  useEffect(() => {
    if (!tutorialId) return;

    (async () => {
      try {
        const completedStatus = await SecureStore.getItemAsync(`completed_${tutorialId}`);
        const savedProgress = await SecureStore.getItemAsync(`progress_${tutorialId}`);

        if (completedStatus === 'true') {
          setIsCompleted(true);
          setProgressState(1);
        } else if (savedProgress) {
          setProgressState(parseFloat(savedProgress));
        }
      } catch (error) {
        console.warn('Error loading completion status:', error);
      }
    })();
  }, [tutorialId]);

  // Initialize the video player
  useEffect(() => {
    if (!videoUrl) {
      setPlayer(null);
      return;
    }

    isReleasedRef.current = false;
    const videoPlayer = createVideoPlayer({ uri: videoUrl });
    if (videoPlayer) {
      videoPlayer.loop = false;
      playerRef.current = videoPlayer;
      setPlayer(videoPlayer);
    }

    return () => {
      isReleasedRef.current = true;

      const currentPlayer = playerRef.current;
      if (currentPlayer) {
        try {
          currentPlayer.pause();
          currentPlayer.release();
        } catch (error) {
          console.warn('Video player cleanup warning:', error);
        }
        playerRef.current = null;
      }

      setPlayer(null);
    };
  }, [videoUrl]);

  // Load saved time and seek to it
  useEffect(() => {
    if (!playerRef.current || isReleasedRef.current || !tutorialId || isCompleted) return;

    let checkReady: number | null = null;

    (async () => {
      try {
        const savedTime = await SecureStore.getItemAsync(`time_${tutorialId}`);

        if (isReleasedRef.current) return;

        if (savedTime && playerRef.current && !isReleasedRef.current) {
          const time = parseFloat(savedTime);
          setCurrentTime(time);
          lastSavedTime.current = time;

          checkReady = setInterval(() => {
            const currentPlayer = playerRef.current;
            if (isReleasedRef.current || !currentPlayer) {
              if (checkReady) clearInterval(checkReady);
              return;
            }

            try {
              if (currentPlayer.duration > 0) {
                currentPlayer.currentTime = time;
                if (checkReady) clearInterval(checkReady);
              }
            } catch {
              if (checkReady) clearInterval(checkReady);
            }
          }, 200);
        }
      } catch (error) {
        console.warn('Error loading progress:', error);
      }
    })();

    return () => {
      if (checkReady) clearInterval(checkReady);
    };
  }, [tutorialId, player, isCompleted]);

  // Save progress and time periodically
  useEffect(() => {
    if (!tutorialId || isCompleted) return;

    const saveInterval = setInterval(async () => {
      // Only save if progress or time has changed significantly
      if (Math.abs(progress - lastSavedProgress.current) > 0.01 || Math.abs(currentTime - lastSavedTime.current) > 2) {
        try {
          await SecureStore.setItemAsync(`progress_${tutorialId}`, progress.toString());
          await SecureStore.setItemAsync(`time_${tutorialId}`, currentTime.toString());
          lastSavedProgress.current = progress;
          lastSavedTime.current = currentTime;
        } catch (error) {
          console.warn('Error saving progress:', error);
        }
      }
    }, 3000); // every 3 seconds

    return () => clearInterval(saveInterval);
  }, [currentTime, progress, tutorialId, isCompleted]);

  // Track video progress
  useEffect(() => {
    if (!playerRef.current || isReleasedRef.current) return;

    let progressInterval: number | null = null;
    let listenerRef: { remove: () => void } | null = null;

    function updateProgress() {
      const currentPlayer = playerRef.current;
      if (isReleasedRef.current || !currentPlayer) {
        if (progressInterval) clearInterval(progressInterval);
        return;
      }

      try {
        const duration = player?.duration ?? 0;
        const current = player?.currentTime ?? 0;

        setDuration(duration);
        setCurrentTime(current);

        if (duration > 0 && !isCompleted) setProgressState(current / duration);
      } catch {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      }
    }

    progressInterval = setInterval(updateProgress, 500); // update every 0.5s

    // Listen for when the video ends
    try {
      const currentPlayer = playerRef.current;
      if (currentPlayer) {
        listenerRef = currentPlayer.addListener('playToEnd', () => {
          if (isReleasedRef.current || !playerRef.current) return;
          setProgressState(1);
          try {
            setCurrentTime(playerRef.current.duration ?? 0);
          } catch (error) {
            console.warn('playToEnd handler error:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to add playToEnd listener:', error);
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (listenerRef) {
        try {
          listenerRef.remove();
        } catch (error) {
          console.warn('Error removing listener:', error);
        }
      }
    };
  }, [player, isCompleted]);

  async function setProgress(newProgress: number, markComplete: boolean = false) {
    setProgressState(newProgress);

    if (!tutorialId) return;

    try {
      await SecureStore.setItemAsync(`progress_${tutorialId}`, newProgress.toString());

      if (markComplete) {
        await SecureStore.setItemAsync(`completed_${tutorialId}`, 'true');
        setIsCompleted(true);
      }
    } catch (error) {
      console.warn('Error saving progress:', error);
    }
  }

  return {
    player,
    progress,
    setProgress,
    currentTime,
    duration,
    setCurrentTime,
    isCompleted,
    setIsCompleted,
  };
}
