import { getCalendarFeed } from "@/lib/services/calendar-service";

export async function GET() {
  return Response.json(await getCalendarFeed());
}
