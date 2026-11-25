import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparePage } from "@/components/ComparePage";

export const metadata: Metadata = {
  title: "Compare cities",
};

export default function CompareRoute() {
  return (
    <Suspense fallback={<p className="page-panel page-lead">Loading…</p>}>
      <ComparePage />
    </Suspense>
  );
}