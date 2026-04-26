import { getSearchIntel } from "@/lib/services/search-service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  return Response.json(
    await getSearchIntel({
      query: searchParams.get("q") ?? "",
      limit: Number(searchParams.get("limit") ?? 6)
    })
  );
}
