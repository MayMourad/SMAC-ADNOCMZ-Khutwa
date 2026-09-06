/**
 * LocationService
 * ===============
 *
 * Wraps `expo-location` geofencing so the rest of the app only ever deals with
 * one idea: "the phone entered the region for memory X".
 *
 * Public surface:
 *   - requestPermissions()          ask for foreground (+ background) location
 *   - startGeofencing(regions)      begin watching a list of memory regions
 *   - stopGeofencing()              stop watching
 *   - onEnterRegion(cb)             subscribe to enter events; returns an unsubscribe fn
 *   - distanceMeters(a, b)          haversine helper (also used for "together" detection)
 *
 * TWO IMPLEMENTATIONS, ONE API:
 *   - Native dev build  -> real OS geofencing via Location.startGeofencingAsync
 *     + a TaskManager background task. Survives the app being backgrounded.
 *   - Expo Go / web      -> a foreground polling fallback using watchPositionAsync.
 *     Good enough to demo the trigger while standing near a location.
 *
 * The fallback matters because background geofencing needs a custom dev build
 * (it does not work in Expo Go on iOS). `startGeofencing` picks automatically.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MemoryRegion {
  /** Memory.id — the value handed back to onEnterRegion listeners. */
  locationId: string;
  latitude: number;
  longitude: number;
  /** Trigger radius in metres. */
  radius: number;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

type EnterListener = (locationId: string) => void;

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

export const GEOFENCE_TASK = 'khutwa-geofence-task';

const enterListeners = new Set<EnterListener>();
let activeRegions: MemoryRegion[] = [];
let foregroundWatch: Location.LocationSubscription | null = null;
/** locationIds we are currently "inside", so we only fire enter once per visit. */
const insideRegionIds = new Set<string>();

function emitEnter(locationId: string) {
  if (insideRegionIds.has(locationId)) return;
  insideRegionIds.add(locationId);
  enterListeners.forEach((cb) => cb(locationId));
}

function emitExit(locationId: string) {
  insideRegionIds.delete(locationId);
}

// ---------------------------------------------------------------------------
// Background task (native only). Defined at module load, as TaskManager requires.
// ---------------------------------------------------------------------------

// `defineTask` expects an async executor, so this callback is declared `async`
// even though our handling is synchronous.
TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[LocationService] geofence task error:', error.message);
    return;
  }
  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };
  const locationId = region.identifier;
  if (!locationId) return;

  if (eventType === Location.GeofencingEventType.Enter) {
    emitEnter(locationId);
  } else if (eventType === Location.GeofencingEventType.Exit) {
    emitExit(locationId);
  }
});

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function requestPermissions(options?: {
  /** Also ask for "always" / background permission (needed for OS geofencing). */
  background?: boolean;
}): Promise<{ foreground: boolean; background: boolean }> {
  const fg = await Location.requestForegroundPermissionsAsync();
  let bg = { granted: false } as { granted: boolean };
  if (options?.background && fg.granted && Platform.OS !== 'web') {
    bg = await Location.requestBackgroundPermissionsAsync();
  }
  return { foreground: fg.granted, background: bg.granted };
}

// ---------------------------------------------------------------------------
// Geofencing – auto-selecting implementation
// ---------------------------------------------------------------------------

/** True when real OS geofencing is usable on this build. */
async function canUseNativeGeofencing(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

export async function startGeofencing(regions: MemoryRegion[]): Promise<void> {
  activeRegions = regions;
  insideRegionIds.clear();

  if (await canUseNativeGeofencing()) {
    const locationRegions: Location.LocationRegion[] = regions.map((r) => ({
      identifier: r.locationId,
      latitude: r.latitude,
      longitude: r.longitude,
      radius: r.radius,
      notifyOnEnter: true,
      notifyOnExit: true,
    }));
    try {
      await Location.startGeofencingAsync(GEOFENCE_TASK, locationRegions);
      return;
    } catch (e) {
      console.warn(
        '[LocationService] native geofencing failed, using foreground fallback:',
        (e as Error).message,
      );
    }
  }

  await startForegroundFallback();
}

export async function stopGeofencing(): Promise<void> {
  activeRegions = [];
  insideRegionIds.clear();
  foregroundWatch?.remove();
  foregroundWatch = null;
  if (Platform.OS !== 'web') {
    const registered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK).catch(
      () => false,
    );
    if (registered) await Location.stopGeofencingAsync(GEOFENCE_TASK).catch(() => {});
  }
}

/**
 * Fallback: poll the phone position every few seconds and compare against every
 * active region. Only runs while the app is foregrounded.
 */
async function startForegroundFallback(): Promise<void> {
  foregroundWatch?.remove();
  foregroundWatch = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (pos) => {
      const here: LatLng = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      for (const region of activeRegions) {
        const d = distanceMeters(here, {
          latitude: region.latitude,
          longitude: region.longitude,
        });
        if (d <= region.radius) emitEnter(region.locationId);
        else if (d > region.radius * 1.3) emitExit(region.locationId); // hysteresis
      }
    },
  );
}

// ---------------------------------------------------------------------------
// Subscription API
// ---------------------------------------------------------------------------

/** Subscribe to "entered region" events. Returns a function that unsubscribes. */
export function onEnterRegion(listener: EnterListener): () => void {
  enterListeners.add(listener);
  return () => enterListeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in metres (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Are these two members "together"? Used for the bloom state. Default threshold
 * is 50 m, which comfortably covers GPS jitter while still meaning "same place".
 */
export function areTogether(a: LatLng, b: LatLng, thresholdM = 50): boolean {
  return distanceMeters(a, b) <= thresholdM;
}

/** Read the current position once (foreground). Handy for check-ins. */
export async function getCurrentPosition(): Promise<LatLng | null> {
  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}
