/**
 * HeritageMap (default — iOS / Android)
 *
 * This is the file Metro picks for native builds; heritage-map.web.tsx
 * overrides it on web (same-name-plus-.web.tsx is the standard Expo/RN
 * platform-split convention — see animated-icon.web.tsx / app-tabs.web.tsx
 * for the other examples in this codebase).
 *
 * Renders the shared Leaflet HTML (heritage-map-html.ts) inside a WebView.
 * `react-native-webview` is a plain Expo-Go-compatible module (no custom dev
 * client needed) — the map itself never touches native map SDKs.
 *
 * Geolocation does NOT come from the WebView's own in-page `navigator.
 * geolocation` here, unlike the web version. iOS's WKWebView (what
 * react-native-webview uses under the hood) only exposes that API to pages
 * loaded over a real secure origin — a `source={{ html }}` string has no
 * https:// origin, so `navigator.geolocation` inside the page is unreliable
 * on iOS even with `geolocationEnabled` set and OS permission already
 * granted. Instead, expo-location (already used for geofencing, so the
 * permission is shared) gets the position on the native side and pushes it
 * into the page via `injectJavaScript`, calling the `khutwaSetLocation`
 * hook the HTML template exposes for exactly this.
 */

import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import WebView from 'react-native-webview';

import { buildHeritageMapHtml, type MapLocation, type HeritageMapStrings, type HeritageMapTheme } from '@/components/heritage-map-html';

export function HeritageMap({
  locations,
  theme,
  strings,
  rtl,
}: {
  locations: MapLocation[];
  theme: HeritageMapTheme;
  strings: HeritageMapStrings;
  rtl: boolean;
}) {
  const html = buildHeritageMapHtml({ locations, theme, strings, rtl });
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      // The screen that shows this map already requests foreground location
      // when it opens (see walk-screen.tsx) -- this just checks the result
      // rather than prompting a second time. If it's not granted, the page
      // keeps showing its own "location unavailable" note; nothing to do.
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 15 },
        (pos) => {
          webviewRef.current?.injectJavaScript(
            `window.khutwaSetLocation && window.khutwaSetLocation(${pos.coords.latitude}, ${pos.coords.longitude}); true;`,
          );
        },
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        geolocationEnabled
        domStorageEnabled
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 380, borderRadius: 20, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: 'transparent' },
});
