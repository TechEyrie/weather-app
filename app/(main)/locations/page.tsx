import type { Metadata } from "next";
import { LocationsPage } from "@/components/LocationsPage";

export const metadata: Metadata = {
  title: "Saved locations",
};

export default function LocationsRoute() {
  return <LocationsPage />;
}