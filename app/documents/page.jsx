import { PlatformShell } from "@/components/platform-shell";
import { SectionHeading } from "@/components/section-heading";
import { DocumentWorkbench } from "@/components/document-workbench";
import { getDocumentWorkbenchSeed } from "@/lib/services/documents-service";

export const metadata = {
  title: "文档提炼"
};

const isStaticExport = process.env.INVESTPILOT_STATIC_EXPORT === "1";

export default async function DocumentsPage({ searchParams }) {
  const documentPayload = await getDocumentWorkbenchSeed();
  const resolvedSearchParams = isStaticExport ? null : await searchParams;

  const initialDraft = resolvedSearchParams?.text
    ? {
        text: String(resolvedSearchParams.text),
        sourceName: String(resolvedSearchParams.sourceName ?? resolvedSearchParams.title ?? "搜索情报"),
        sourceType: String(resolvedSearchParams.sourceType ?? "search"),
        autoSubmit: String(resolvedSearchParams.autoSubmit ?? "0") === "1"
      }
    : null;

  return (
    <PlatformShell>
      <div className="grid gap-6">
        <section className="strong-panel rounded-[34px] px-5 py-6 sm:px-6">
          <SectionHeading
            kicker="文档提炼"
            title="把年报、研报、公告和搜索结果压缩成可读结论"
            description="当前版本已经支持粘贴正文、上传文档、承接搜索结果、提取摘要、拆解风险，并预留了对更强文档服务和摘要模型的接入位置。"
          />
        </section>

        <DocumentWorkbench initialResult={documentPayload.data} initialMeta={documentPayload.meta} initialDraft={initialDraft} />
      </div>
    </PlatformShell>
  );
}
