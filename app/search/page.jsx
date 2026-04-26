import { PlatformShell } from "@/components/platform-shell";
import { SearchIntelWorkbench } from "@/components/search-intel-workbench";
import { getSearchIntel } from "@/lib/services/search-service";

export const metadata = {
  title: "情报搜索"
};

export default async function SearchPage() {
  const payload = await getSearchIntel();

  return (
    <PlatformShell>
      <SearchIntelWorkbench initialPayload={payload} />
    </PlatformShell>
  );
}
