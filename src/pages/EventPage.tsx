import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMainEvent } from "@/hooks/useMainEvent";

const ClassicEventPage = lazy(() => import("@/pages/event/ClassicEventPage"));
const EventHubPage = lazy(() => import("@/pages/event/EventHubPage"));

export default function EventPage() {
  const { data: event } = useMainEvent();
  const [searchParams, setSearchParams] = useSearchParams();
  const previewMode = import.meta.env.DEV
    ? searchParams.get("previewMode")
    : null;
  const configuredMode = event?.event_page_mode || "hub";
  const mode =
    previewMode === "classic" || previewMode === "hub"
      ? previewMode
      : configuredMode;

  const setPreviewMode = (nextMode: "classic" | "hub" | null) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode) next.set("previewMode", nextMode);
    else next.delete("previewMode");
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-[75] flex items-center gap-1 border border-border bg-background p-1 shadow-xl">
          <span className="hidden px-2 text-xs font-semibold text-muted-foreground sm:inline">
            Seitenmodus
          </span>
          <Button
            size="sm"
            variant={mode === "classic" ? "default" : "ghost"}
            onClick={() => setPreviewMode("classic")}
          >
            Classic
          </Button>
          <Button
            size="sm"
            variant={mode === "hub" ? "default" : "ghost"}
            onClick={() => setPreviewMode("hub")}
          >
            Hub
          </Button>
          {previewMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewMode(null)}
            >
              CMS
            </Button>
          )}
        </div>
      )}
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        {mode === "classic" ? <ClassicEventPage /> : <EventHubPage />}
      </Suspense>
    </>
  );
}
