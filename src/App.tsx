import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Footer } from "@/features/chrome/Footer";
import { Navbar } from "@/features/chrome/Navbar";
import { SkipLink } from "@/features/chrome/SkipLink";
import { FullScreenMenu } from "@/features/transitions/FullScreenMenu";
import { BlackRoute, LiveRoute } from "@/features/transitions/routes";
import { TransitionProvider } from "@/features/transitions/TransitionProvider";
import { HomePage } from "@/pages/HomePage";
import { JoinPage } from "@/pages/JoinPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { ProductPage } from "@/pages/ProductPage";

function RouteFallback() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-cream-100" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
    </div>
  );
}

/**
 * Layout contract (docs/05_TRANSITIONS_SPEC.md):
 * - nav, the menu and the stairs overlay live OUTSIDE #route-root, so they are not
 *   scaled by the page-enter tween and are not wiped when the route swaps;
 * - the footer lives INSIDE #route-root, so it belongs to the page that mounted it.
 */
export function App() {
  return (
    <TransitionProvider>
      <SkipLink />
      <Navbar />
      <FullScreenMenu />

      <div id="route-root">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/live" element={<LiveRoute />} />
            <Route path="/black" element={<BlackRoute />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </TransitionProvider>
  );
}

