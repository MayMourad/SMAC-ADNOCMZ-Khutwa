/**
 * HeritageMap (web)
 *
 * Same shared Leaflet HTML as the native version (heritage-map-html.ts),
 * loaded into a sandboxed <iframe> instead of a WebView — this is a real
 * browser tab, so the page's own Geolocation API works directly, prompting
 * the visitor for permission the normal browser way.
 */

import type { CSSProperties } from 'react';
import { StyleSheet, View } from 'react-native';

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
      {/* Raw DOM element (web-only file) — a real <iframe>, not an RN View,
          so its style is plain CSS, not a RN StyleSheet. */}
      {/* eslint-disable-next-line react/no-unknown-property -- web-only element via react-native-web */}
      <iframe title="Khutwa heritage map" srcDoc={html} allow="geolocation" style={iframeStyle} />
    </View>
  );
}

const iframeStyle: CSSProperties = { border: 0, width: '100%', height: '100%' };

const styles = StyleSheet.create({
  wrap: { height: 380, borderRadius: 20, overflow: 'hidden' },
});
