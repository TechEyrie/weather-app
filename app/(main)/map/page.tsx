import type { Metadata } from "next";
import { MapPage } from "@/components/MapPage";

export const metadata: Metadata = {
  title: "Map",
};

export default function MapRoute() {
  return <MapPage />;
}