import type { Metadata } from "next";
import { ReportsPage } from "@/components/ReportsPage";

export const metadata: Metadata = {
  title: "Weekly report",
};

export default function ReportsRoute() {
  return <ReportsPage />;
}