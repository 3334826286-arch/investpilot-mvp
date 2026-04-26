import { buildServiceEnvelope } from "@/lib/services/shared";
import { summarizeDocumentInput } from "@/lib/services/documents-service";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let text = "";
    let file = null;
    let sourceName = "";
    let sourceType = "";

    if (contentType.includes("application/json")) {
      const payload = await request.json();
      text = String(payload?.text ?? "");
      sourceName = String(payload?.source_name ?? payload?.sourceName ?? "");
      sourceType = String(payload?.source_type ?? payload?.sourceType ?? "");
    } else {
      const formData = await request.formData();
      text = String(formData.get("text") ?? "");
      sourceName = String(formData.get("source_name") ?? formData.get("sourceName") ?? "");
      sourceType = String(formData.get("source_type") ?? formData.get("sourceType") ?? "");
      const fileEntry = formData.get("file");
      file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
    }

    return Response.json(
      await summarizeDocumentInput({
        text,
        file,
        sourceName,
        sourceType
      })
    );
  } catch (error) {
    return Response.json(
      buildServiceEnvelope("/v1/documents/summarize", null, {
        fallback: false,
        errorMessage: error.message
      }),
      { status: 400 }
    );
  }
}
