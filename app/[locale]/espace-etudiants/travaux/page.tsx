"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TravauxContent from "./_components/TravauxContent";

export default function TravauxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cj-blue)]" />
        </div>
      }
    >
      <TravauxContent />
    </Suspense>
  );
}
