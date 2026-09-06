/**
 * Route: "/explore"
 *
 * Leftover route from the Expo starter template. Khutwa's four tabs are Home,
 * Walk, Stories and Family, so nothing links here — but the file is kept (not
 * deleted) and simply redirects to Home so a stray link or bookmark still works.
 */
import { Redirect } from 'expo-router';

export default function Explore() {
  return <Redirect href="/" />;
}
