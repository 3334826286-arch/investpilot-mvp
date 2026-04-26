const SUMMARY_KEYWORDS = ["收入", "利润", "订单", "毛利", "现金流", "需求", "景气", "增长", "改善", "指引"];
const HIGHLIGHT_KEYWORDS = ["增长", "改善", "超预期", "回暖", "上调", "提升", "修复", "扩张", "增持"];
const RISK_KEYWORDS = ["风险", "回撤", "下滑", "压力", "波动", "不确定", "减值", "诉讼", "汇率", "价格战", "放缓"];
const INSTITUTION_KEYWORDS = ["机构", "券商", "买入", "增持", "中性", "审慎", "上调", "下调", "维持"];

function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function splitSentences(text) {
  return normalizeText(text)
    .split(/(?<=[。！？；;.!?])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function scoreSentence(sentence, keywords) {
  const keywordScore = keywords.reduce((score, keyword) => score + (sentence.includes(keyword) ? 3 : 0), 0);
  const numericScore = /\d/.test(sentence) ? 2 : 0;
  const lengthScore = sentence.length >= 16 && sentence.length <= 90 ? 1 : 0;
  return keywordScore + numericScore + lengthScore;
}

function pickTopSentences(sentences, keywords, limit) {
  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: scoreSentence(sentence, keywords)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score === left.score) {
        return left.index - right.index;
      }

      return right.score - left.score;
    })
    .slice(0, limit)
    .toSorted((left, right) => left.index - right.index)
    .map((item) => item.sentence);
}

function extractTitle(fileName, text) {
  const fromText = normalizeText(text)
    .split("\n")
    .find((line) => line.trim().length >= 6 && line.trim().length <= 40);

  if (fromText) {
    return fromText.trim();
  }

  if (fileName) {
    return fileName.replace(/\.[^/.]+$/, "");
  }

  return "文档提炼结果";
}

function extractKeyData(text) {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /\d/.test(line) && line.length <= 96)
    .slice(0, 5);
}

function buildInstitutionSummary(highlights, risks, institutionSentences) {
  if (institutionSentences.length) {
    return `机构观点更集中在以下几条主线：${institutionSentences.slice(0, 2).join("；")}`;
  }

  if (highlights.length >= risks.length + 1) {
    return "机构视角更偏向确认基本面改善与盈利兑现，重点在于后续数据能否跟上当前预期。";
  }

  if (risks.length > highlights.length) {
    return "机构视角更强调需求、利润率与估值承接的验证，当前更适合把乐观预期落到具体数据上。";
  }

  return "机构视角整体偏中性，既认可材料中的积极变化，也强调后续验证的重要性。";
}

function buildConclusion(highlights, risks) {
  if (highlights.length >= risks.length + 1) {
    return "结论偏中性偏多。当前材料更支持基本面改善，但更适合在后续业绩兑现后再提高信心。";
  }

  if (risks.length > highlights.length) {
    return "结论偏中性偏谨慎。当前风险项仍然较多，参与前应先明确盈利验证路径与风险边界。";
  }

  return "结论偏中性。材料中既有亮点也有约束，更适合继续跟踪后续财报、订单和行业数据。";
}

export async function parseUploadedDocument(file) {
  const fileName = file?.name ?? "";
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (!file) {
    return {
      text: "",
      fileName: "",
      sourceType: "text"
    };
  }

  if (["txt", "md", "csv", "json", "html", "htm"].includes(extension) || file.type?.startsWith("text/")) {
    return {
      text: await file.text(),
      fileName,
      sourceType: extension || "text"
    };
  }

  if (extension === "docx") {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default ?? mammothModule;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      fileName,
      sourceType: extension
    };
  }

  if (extension === "pdf") {
    const pdfModule = await import("pdf-parse");
    const pdfParse = pdfModule.default ?? pdfModule;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    return {
      text: result.text,
      fileName,
      sourceType: extension
    };
  }

  throw new Error("当前仅支持 txt、md、csv、json、html、pdf、docx 等可提取文本的文件。");
}

export function summarizeInvestmentDocument({ text, fileName = "", sourceType = "text" }) {
  const normalized = normalizeText(text);

  if (!normalized) {
    throw new Error("未检测到可分析的文本内容。");
  }

  const sentences = splitSentences(normalized);
  const summarySentences = pickTopSentences(sentences, SUMMARY_KEYWORDS, 2);
  const highlightSentences = pickTopSentences(sentences, HIGHLIGHT_KEYWORDS, 4);
  const riskSentences = pickTopSentences(sentences, RISK_KEYWORDS, 3);
  const institutionSentences = pickTopSentences(sentences, INSTITUTION_KEYWORDS, 2);
  const fallbackHighlights = sentences.slice(0, 4);
  const fallbackRisks = sentences.filter((sentence) => sentence.length <= 90).slice(-3);

  const highlights = highlightSentences.length ? highlightSentences : fallbackHighlights;
  const risks = riskSentences.length
    ? riskSentences
    : fallbackRisks.length
      ? fallbackRisks
      : ["当前文本未出现明确风险句，但仍需结合财报、公告与行业数据继续复核。"];

  return {
    title: extractTitle(fileName, normalized),
    sourceName: fileName || "粘贴文本",
    sourceType,
    characterCount: normalized.length,
    summary:
      summarySentences.join("") ||
      "文本已经成功提取，但当前材料中可直接提炼的结构化线索较少，建议继续补充业绩、利润率、订单或风险条目。",
    highlights,
    keyData: extractKeyData(normalized),
    risks,
    institutionSummary: buildInstitutionSummary(highlights, risks, institutionSentences),
    conclusion: buildConclusion(highlights, risks)
  };
}
