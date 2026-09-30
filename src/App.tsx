import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ProductPage } from "@/pages/ProductPage";
import { JoinPage } from "@/pages/JoinPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * /live (canvas glass wall) and /black are split out of the initial bundle so the
 * heaviest routes never ship to visitors who do not open them.
 */
const LivePage = lazy(() =>
  import("@/pages/LivePage").then((module) => ({ default: module.LivePage })),
);
const BlackPage = lazy(() =>
  import("@/pages/BlackPage").then((module) => ({ default: module.BlackPage })),
);

function RouteFallback() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-cream-100" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/black" element={<BlackPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
