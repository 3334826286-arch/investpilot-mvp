import { PlatformShell } from "@/components/platform-shell";
import { SearchIntelWorkbench } from "@/components/search-intel-workbench";
import { getSearchIntel } from "@/lib/services/search-service";

export const metadata = {
  title: "研究工作台"
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : "";
  const payload = await getSearchIntel({ query });

  return (
    <PlatformShell>
      <SearchIntelWorkbench initialPayload={payload} />
    </PlatformShell>
  );
}
