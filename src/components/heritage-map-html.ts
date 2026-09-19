/**
 * heritage-map-html
 * ==================
 *
 * Builds one self-contained HTML page: a Leaflet map (OpenStreetMap tiles, no
 * API key needed) plotting the curated heritage locations plus the viewer's
 * own live position. Used two ways, both loading this same string so there is
 * only one map implementation to maintain:
 *
 *   - native (heritage-map.native.tsx): loaded into a `react-native-webview`
 *     WebView, which shares expo-location's permission with the app.
 *   - web (heritage-map.web.tsx): loaded into an `<iframe srcDoc>` in the
 *     real browser DOM, using the browser's own Geolocation API.
 *
 * Leaflet is pulled from a CDN inside the HTML document itself, so it never
 * touches the app's own JS bundle size.
 */

export interface MapLocation {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusM: number;
  unlocked: boolean;
}

export interface HeritageMapStrings {
  unlocked: string;
  locked: string;
  locating: string;
  locateDenied: string;
  you: string;
}

export interface HeritageMapTheme {
  primary: string; // unlocked marker + "you are here" accent
  accent: string; // locked marker
  surface: string; // popup background
  text: string;
  textMuted: string;
  border: string;
  background: string;
}

/** Escapes text dropped into the page's inline <script> as a JSON literal. */
function json(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildHeritageMapHtml({
  locations,
  theme,
  strings,
  rtl,
}: {
  locations: MapLocation[];
  theme: HeritageMapTheme;
  strings: HeritageMapStrings;
  rtl: boolean;
}): string {
  return `<!DOCTYPE html>
<html lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: ${theme.background}; }
  .khutwa-popup .leaflet-popup-content-wrapper {
    background: ${theme.surface}; color: ${theme.text};
    border-radius: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  }
  .khutwa-popup .leaflet-popup-tip { background: ${theme.surface}; }
  .khutwa-popup h3 { margin: 0 0 4px; font-size: 15px; }
  .khutwa-popup .badge {
    display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    text-transform: uppercase; padding: 2px 8px; border-radius: 999px; margin-top: 4px;
  }
  .badge.unlocked { background: ${theme.primary}; color: ${theme.surface}; }
  .badge.locked { background: ${theme.border}; color: ${theme.textMuted}; }
  .you-dot {
    width: 16px; height: 16px; border-radius: 50%;
    background: #2F6FED; border: 3px solid #fff; box-shadow: 0 0 0 2px rgba(47,111,237,0.35);
  }
  .locate-note {
    position: absolute; ${rtl ? 'right' : 'left'}: 10px; bottom: 10px; z-index: 1000;
    background: ${theme.surface}; color: ${theme.textMuted}; font: 12px system-ui, sans-serif;
    padding: 6px 10px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    max-width: 70%;
  }
</style>
</head>
<body>
<div id="map"></div>
<div class="locate-note" id="note"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function () {
  var LOCATIONS = ${json(locations)};
  var STR = ${json(strings)};
  var THEME = ${json(theme)};
  var note = document.getElementById('note');

  var map = L.map('map', { zoomControl: true, attributionControl: true });
  // Esri's free "World Street Map" tiles -- no API key, no signup, and
  // (unlike OSM's own data) labelled in Latin/English rather than each
  // region's local script, so this reads the same in EN and AR. Two
  // OSM-data-based alternatives were tried first and both turned out worse:
  //  - Wikimedia's "osm-intl" tiles have Latin labels too, but their tile
  //    server didn't reliably serve a public site (tiles silently failed to
  //    load once actually deployed to GitHub Pages).
  //  - CARTO's free "Voyager" basemap loads fine and shows Latin labels, but
  //    stamps "API KEY REQUIRED" across every tile on their free tier --
  //    worse than the thing being fixed.
  // Verified this one loads cleanly both locally and on the live GitHub
  // Pages deployment before keeping it.
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
  }).addTo(map);

  var markerIcon = function (unlocked) {
    var color = unlocked ? THEME.primary : THEME.accent;
    return L.divIcon({
      className: '',
      html:
        '<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;' +
        'transform:rotate(-45deg);background:' + color + ';border:2px solid ' + THEME.surface + ';' +
        'box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -24],
    });
  };

  var bounds = [];
  LOCATIONS.forEach(function (loc) {
    var m = L.marker([loc.lat, loc.lng], { icon: markerIcon(loc.unlocked) }).addTo(map);
    var badge = loc.unlocked ? 'unlocked' : 'locked';
    var label = loc.unlocked ? STR.unlocked : STR.locked;
    m.bindPopup(
      '<div class="khutwa-popup-inner"><h3>' + loc.label + '</h3>' +
        '<span class="badge ' + badge + '">' + label + '</span></div>',
      { className: 'khutwa-popup' },
    );
    L.circle([loc.lat, loc.lng], { radius: loc.radiusM, color: THEME.border, weight: 1, fillOpacity: 0.06 }).addTo(map);
    bounds.push([loc.lat, loc.lng]);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [36, 36] });
  } else {
    map.setView([24.4667, 54.3667], 11); // Abu Dhabi fallback
  }

  var youMarker = null;
  function placeYou(lat, lng, accuracy) {
    if (!youMarker) {
      youMarker = L.marker([lat, lng], {
        icon: L.divIcon({ className: '', html: '<div class="you-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
        zIndexOffset: 1000,
      }).addTo(map);
      youMarker.bindTooltip(STR.you, { permanent: false });
    } else {
      youMarker.setLatLng([lat, lng]);
    }
  }

  // Called from the native side (heritage-map.tsx, via injectJavaScript) on
  // iOS, where WKWebView doesn't reliably expose navigator.geolocation to a
  // page loaded from a raw HTML string (no https:// origin). expo-location
  // already has the OS permission (shared with geofencing) and feeds the
  // position in here directly, bypassing the in-page geolocation call below
  // entirely. Harmless to also have on Android/web -- whichever source
  // reports a position first just wins.
  window.khutwaSetLocation = function (lat, lng) {
    note.textContent = '';
    placeYou(lat, lng);
  };

  if (navigator.geolocation) {
    note.textContent = STR.locating;
    navigator.geolocation.watchPosition(
      function (pos) {
        note.textContent = '';
        placeYou(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      function () {
        note.textContent = STR.locateDenied;
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
  } else {
    note.textContent = STR.locateDenied;
  }
})();
</script>
</body>
</html>`;
}
