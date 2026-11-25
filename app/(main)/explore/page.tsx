import type { Metadata } from "next";
import { ExplorePage } from "@/components/ExplorePage";

export const metadata: Metadata = {
  title: "Explore regions",
};

export default function ExploreRoute() {
  return <ExplorePage />;
}