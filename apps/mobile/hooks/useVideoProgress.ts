import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { YoutubeIframeRef } from 'react-native-youtube-iframe';

export function useVideoProgress({
  videoId,
  tutorialId,
}: {
  videoId: string | undefined;
  tutorialId: string | undefined;
}) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedTimeRef = useRef(0);

  const [progress, setProgressState] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  // 1. Load progress from storage on mount
  useEffect(() => {
    if (!tutorialId) return;

    (async () => {
      try {
        const completedStatus = await SecureStore.getItemAsync(`completed_${tutorialId}`);

        if (completedStatus === 'true') {
          setIsCompleted(true);
          setProgressState(1);
        } else {
          const savedTime = await SecureStore.getItemAsync(`time_${tutorialId}`);
          setInitialTime(parseFloat(savedTime || '0'));
        }
      } catch (error) {
        console.warn('Error loading completion status:', error);
      }
    })();
  }, [tutorialId]);

  // 2. Clear interval when component unmounts
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // 3. Pause video when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        playerRef.current?.seekTo(0, true); // Pause video
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onReady = useCallback(() => {
    setIsPlayerReady(true);
    if (initialTime > 0) {
      playerRef.current?.seekTo(initialTime, true);
    }
  }, [initialTime]);

  // 5. Player 'onChangeState' callback (the core logic)
  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'playing') {
        // Start polling for progress
        progressIntervalRef.current = setInterval(async () => {
          try {
            const [currentTime, duration] = await Promise.all([
              playerRef.current?.getCurrentTime(),
              playerRef.current?.getDuration(),
            ]);

            if (currentTime !== undefined && duration !== undefined && duration > 0) {
              // Save time to secure store (throttled)
              if (Math.abs(currentTime - lastSavedTimeRef.current) > 3) {
                await SecureStore.setItemAsync(`time_${tutorialId}`, currentTime.toString());
                lastSavedTimeRef.current = currentTime;
              }
              // Update progress state
              if (!isCompleted) {
                setProgressState(currentTime / duration);
              }
            }
          } catch (error) {
            console.warn('Error polling video progress:', error);
          }
        }, 500);
      } else {
        // Clear interval if paused, ended, etc.
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }

      if (state === 'ended') {
        setProgressState(1);
        if (!isCompleted) {
          // Don't call setProgress, just update local state
          setIsCompleted(true);
          SecureStore.setItemAsync(`completed_${tutorialId}`, 'true');
        }
      }
    },
    [isCompleted, tutorialId],
  );

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
    playerRef,
    onReady,
    onStateChange,
    progress,
    setProgress,
    isCompleted,
    setIsCompleted,
    isPlayerReady,
  };
}
