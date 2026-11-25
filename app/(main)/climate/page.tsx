import type { Metadata } from "next";
import { ClimatePage } from "@/components/ClimatePage";

export const metadata: Metadata = {
  title: "Climate",
};

export default function ClimateRoute() {
  return <ClimatePage />;
}