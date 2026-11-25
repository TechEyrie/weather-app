import type { Metadata } from "next";
import { HourlyPage } from "@/components/HourlyPage";

export const metadata: Metadata = {
  title: "Hourly Forecast",
};

export default function HourlyRoute() {
  return <HourlyPage />;
}