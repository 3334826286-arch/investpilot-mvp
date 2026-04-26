import { cache } from "react";
import { mockCalendarFeed } from "@/lib/mock-data";
import { mergeStructuredData } from "@/lib/services/merge-utils";
import { resolveServiceData } from "@/lib/services/shared";

export const getCalendarFeed = cache(async function getCalendarFeed() {
  return resolveServiceData({
    endpoint: "/v1/calendar/events",
    buildMockData: () => mockCalendarFeed,
    normalizeRemote: (payload) => mergeStructuredData(mockCalendarFeed, payload?.data ?? payload)
  });
});
