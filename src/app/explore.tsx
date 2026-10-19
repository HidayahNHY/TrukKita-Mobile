import { Redirect } from "expo-router";

// Mengarahkan route bawaan Expo Explore ke halaman utama TrukKita.
export default function ExploreRedirect() {
  return <Redirect href="/" />;
}