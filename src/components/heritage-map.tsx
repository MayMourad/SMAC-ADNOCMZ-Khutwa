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
 * client needed) — the map itself never touches native map SDKs. Geolocation
 * inside the WebView uses the app's own already-granted expo-location
 * permission.
 */

import { StyleSheet, View } from 'react-native';
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

  return (
    <View style={styles.wrap}>
      <WebView
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
