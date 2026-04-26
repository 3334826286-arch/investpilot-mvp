import { cache } from "react";
import { mockDocumentSeed } from "@/lib/mock-data";
import { parseUploadedDocument, summarizeInvestmentDocument } from "@/lib/document-utils";
import { buildServiceEnvelope, fetchFastApiJson } from "@/lib/services/shared";
import { canUseFastApi, isFastApiPreferred } from "@/lib/env";
import { mergeStructuredData } from "@/lib/services/merge-utils";

function normalizeDocumentSummary(summary) {
  return mergeStructuredData(
    {
      ...mockDocumentSeed,
      institutionSummary:
        mockDocumentSeed.institutionSummary ||
        "机构视角更偏向把亮点与风险放在同一张表里审视，重点关注后续兑现是否能够跟上当前预期。"
    },
    summary
  );
}

export const getDocumentWorkbenchSeed = cache(async function getDocumentWorkbenchSeed() {
  return buildServiceEnvelope("/v1/documents/seed", normalizeDocumentSummary(mockDocumentSeed));
});

export async function summarizeDocumentInput({ text = "", file = null, sourceName = "", sourceType = "" }) {
  const parsedUpload = file ? await parseUploadedDocument(file) : null;
  const extractedText = parsedUpload?.text?.trim() || text.trim();
  const normalizedSourceName = parsedUpload?.fileName || sourceName || "粘贴文本";
  const normalizedSourceType = parsedUpload?.sourceType || sourceType || "text";

  if (!extractedText) {
    throw new Error("请先上传文档或粘贴需要提炼的文本。");
  }

  const localSummary = normalizeDocumentSummary(
    summarizeInvestmentDocument({
      text: extractedText,
      fileName: normalizedSourceName,
      sourceType: normalizedSourceType
    })
  );

  if (canUseFastApi()) {
    try {
      const remotePayload = await fetchFastApiJson("/v1/documents/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: extractedText,
          source_name: normalizedSourceName,
          source_type: normalizedSourceType
        })
      });

      return buildServiceEnvelope("/v1/documents/summarize", normalizeDocumentSummary(remotePayload?.data ?? remotePayload), {
        source: remotePayload?.meta?.source ?? "fastapi"
      });
    } catch (error) {
      if (isFastApiPreferred()) {
        throw error;
      }

      return buildServiceEnvelope("/v1/documents/summarize", localSummary, {
        fallback: true,
        errorMessage: error.message
      });
    }
  }

  return buildServiceEnvelope("/v1/documents/summarize", localSummary);
}
