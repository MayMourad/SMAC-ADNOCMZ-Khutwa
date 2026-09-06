/**
 * StepsService
 * ============
 *
 * Reads step counts for the current member. The idea brief wants steps pulled
 * from the platform health store (Apple HealthKit / Google Fit). That needs a
 * custom dev build and extra config, so this service is staged:
 *
 *   Stage 1 (now):  expo-sensors Pedometer where available + a manual entry
 *                   fallback, so the tree can grow during development/demo.
 *   Stage 2 (later): swap `readTodaySteps` for a HealthKit / Health Connect read.
 *                   Nothing else in the app has to change.
 *
 * Pedometer notes (SDK 57):
 *   - `getStepCountAsync(start, end)` is iOS-only and covers the last 7 days.
 *   - `watchStepCount` works on both platforms but only in the foreground.
 *   - Android has no historical step API here — use Health Connect for that.
 */

import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

import type { DailyStepEntry, IsoDate, StepSource } from '@/types/models';

export const todayIso = (): IsoDate => new Date().toISOString().slice(0, 10);

export async function isPedometerAvailable(): Promise<boolean> {
  try {
    return await Pedometer.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function requestStepPermission(): Promise<boolean> {
  try {
    const res = await Pedometer.requestPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

/**
 * Best-effort read of today's step count for this device.
 * Returns null when we can't read it (e.g. Android historical, or no permission)
 * — callers then fall back to `manualSteps`.
 */
export async function readTodaySteps(): Promise<
  { steps: number; source: StepSource } | null
> {
  if (Platform.OS === 'ios') {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { steps } = await Pedometer.getStepCountAsync(start, new Date());
      return { steps, source: 'expo-pedometer' };
    } catch {
      return null;
    }
  }
  // Android: no historical API via expo-sensors. Stage 2 uses Health Connect.
  return null;
}

/**
 * Live step updates while a walk screen is open (foreground only).
 * `callback` receives the cumulative steps since the subscription started.
 */
export function watchSteps(callback: (stepsSinceStart: number) => void): () => void {
  const sub = Pedometer.watchStepCount(({ steps }) => callback(steps));
  return () => sub.remove();
}

/** Manual fallback so a teammate can enter a step count during testing/demo. */
export function manualSteps(uid: string, steps: number): DailyStepEntry {
  return {
    uid,
    date: todayIso(),
    steps,
    source: 'manual',
    syncedAt: Date.now(),
  };
}
