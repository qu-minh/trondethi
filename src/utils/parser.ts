import mammoth from 'mammoth';
import type { Question, OptionItem, QuestionWarning } from '../types/exam';

// Regex patterns for reference detection
const REFERENCE_PATTERNS = [
  /\b[A-D]\s*(?:và|hoặc|,|&)\s*[A-D]\b/i,
  /\b(?:cả|tất cả|hai|ba|bốn|2|3|4)\s*(?:đáp án|phương án|ý|câu|lựa chọn)\s*(?:trên|này)?\s*(?:đều|là|đúng|sai)?/i,
  /\b(?:tất cả|cả)\s*(?:đều|các)\s*(?:đúng|sai)\b/i,
  /\bđáp án\s*[A-D]\s*đúng\b/i,
  /\bý\s*[A-D]\s*đúng\b/i,
  /\bphương án\s*[A-D]\b/i,
];

export function detectWarnings(questionContent: string, options: OptionItem[], correctKeys: string[]): QuestionWarning[] {
  const warnings: QuestionWarning[] = [];

  // Check empty content
  if (!questionContent.trim()) {
    warnings.push({
      type: 'missing_options',
      message: 'Nội dung câu hỏi đang để trống.',
    });
  }

  // 1. Missing keys
  if (!correctKeys || correctKeys.length === 0) {
    warnings.push({
      type: 'missing_key',
      message: 'Chưa nhận diện được đáp án đúng. Vui lòng chọn đáp án trước khi trộn.',
      suggestedAction: 'set_key',
    });
  }

  // 2. Missing options
  if (options.length < 2) {
    warnings.push({
      type: 'missing_options',
      message: 'Câu hỏi có ít hơn 2 phương án trả lời.',
    });
  }

  // 3. Option reference detection (critical requirement!)
  let hasReference = false;
  let referenceDetail = '';

  for (const opt of options) {
    for (const pattern of REFERENCE_PATTERNS) {
      const match = opt.content.match(pattern);
      if (match) {
        hasReference = true;
        referenceDetail = match[0];
        break;
      }
    }
    if (hasReference) break;
  }

  if (hasReference) {
    warnings.push({
      type: 'reference',
      message: `Phương án có chứa tham chiếu nhãn ("${referenceDetail}"). Khuyến nghị khóa trộn đáp án câu này để tránh sai nghĩa khi đổi chỗ.`,
      suggestedAction: 'lock_options',
    });
  }

  // 4. Duplicate option texts
  const seenTexts = new Set<string>();
  for (const opt of options) {
    const trimmed = opt.content.trim().toLowerCase();
    if (trimmed && seenTexts.has(trimmed)) {
      warnings.push({
        type: 'duplicate_options',
        message: 'Có phương án trả lời bị trùng lặp nội dung.',
      });
      break;
    }
    seenTexts.add(trimmed);
  }

  return warnings;
}

/**
 * Parse structured [MIX:...] tagged text
 */
export function parseTaggedText(text: string): Question[] {
  const questions: Question[] = [];
  const questionBlocks = text.split(/\[MIX:Q\]/gi);

  let qIndex = 1;
  for (const block of questionBlocks) {
    if (!block.trim()) continue;

    // Split before [MIX:END] or next tag
    const endPos = block.indexOf('[MIX:END]');
    const rawContent = endPos !== -1 ? block.substring(0, endPos) : block;

    // Extract Question text: from start to the first [MIX:A]
    const firstOptionIdx = rawContent.search(/\[MIX:[A-Z]\]/i);
    let questionText = '';
    let optionsPart = '';

    if (firstOptionIdx !== -1) {
      questionText = rawContent.substring(0, firstOptionIdx).trim();
      optionsPart = rawContent.substring(firstOptionIdx);
    } else {
      questionText = rawContent.trim();
    }

    // Clean "Câu X." prefix from questionText if present
    questionText = questionText.replace(/^(?:Câu|Bài|Question)\s*\d+[\s:.-]*/i, '').trim();

    // Extract options
    const options: OptionItem[] = [];
    const optRegex = /\[MIX:([A-Z])\]([\s\S]*?)(?=(?:\[MIX:[A-Z]\]|\[MIX:KEY\]|$))/gi;
    let optMatch: RegExpExecArray | null;

    while ((optMatch = optRegex.exec(optionsPart)) !== null) {
      const label = optMatch[1].toUpperCase();
      const content = optMatch[2].trim();
      options.push({
        id: `opt-${qIndex}-${label}`,
        label,
        content,
      });
    }

    // Extract Key: [MIX:KEY] A or [MIX:KEY] A,C
    const keyMatch = optionsPart.match(/\[MIX:KEY\]\s*([A-Za-z,\s]+)/i);
    const correctKeys: string[] = [];
    if (keyMatch) {
      const rawKeys = keyMatch[1].toUpperCase().split(/[,\s]+/);
      for (const k of rawKeys) {
        if (k && /^[A-Z]$/.test(k)) {
          correctKeys.push(k);
        }
      }
    }

    const warnings = detectWarnings(questionText, options, correctKeys);
    const shouldLockOptions = warnings.some(w => w.type === 'reference');

    questions.push({
      id: `q-${Date.now()}-${qIndex}`,
      originalIndex: qIndex,
      content: questionText,
      options,
      correctKeys,
      lockQuestionPosition: false,
      lockOptionsShuffle: shouldLockOptions,
      warnings,
    });

    qIndex++;
  }

  return questions;
}

/**
 * Parse plain natural text (standard Vietnamese exam format)
 * Handles:
 * Câu 1. ...
 * A. ...
 * B. ...
 * C. ...
 * D. ...
 * Đáp án: A
 */
export function parsePlainText(text: string): Question[] {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Check if tagged format first
  if (normalized.includes('[MIX:Q]')) {
    return parseTaggedText(normalized);
  }

  // Look for end-of-exam Answer Key table if any (e.g., "ĐÁP ÁN: 1.A 2.B 3.C...")
  const answerKeyMap: Record<number, string[]> = {};
  const answerSectionRegex = /(?:BẢNG\s+)?(?:ĐÁP\s+ÁN|CÂU\s+TRẢ\s+LỜI)[\s\S]*$/i;
  const answerSectionMatch = normalized.match(answerSectionRegex);

  let examBody = normalized;
  if (answerSectionMatch) {
    const answerSectionText = answerSectionMatch[0];
    examBody = normalized.substring(0, answerSectionMatch.index);

    // Extract "1.A" or "1: A" or "1-A" or "Câu 1: A"
    const pairRegex = /(?:Câu\s*)?(\d+)[\s.:-]+([A-D](?:\s*,\s*[A-D])*)/gi;
    let m: RegExpExecArray | null;
    while ((m = pairRegex.exec(answerSectionText)) !== null) {
      const num = parseInt(m[1], 10);
      const keys = m[2].toUpperCase().split(/[,\s]+/).filter(k => /^[A-D]$/.test(k));
      if (keys.length > 0) {
        answerKeyMap[num] = keys;
      }
    }
  }

  // Split into questions using "Câu X:" or "Câu X." or "Bài X." or "Question X:"
  const questionSplitter = /(?:\n|^)(?=(?:Câu|Bài|Question)\s*\d+[\s:.-]+)/gi;
  const chunks = examBody.split(questionSplitter).map(c => c.trim()).filter(Boolean);

  const questions: Question[] = [];
  let qNumber = 1;

  for (const chunk of chunks) {
    // Check if this chunk starts with Question header
    const headerMatch = chunk.match(/^(?:Câu|Bài|Question)\s*(\d+)[\s:.-]+([\s\S]*)$/i);
    if (!headerMatch) {
      // Could be preamble/header, skip or attach if needed
      continue;
    }

    const detectedNum = parseInt(headerMatch[1], 10) || qNumber;
    const body = headerMatch[2].trim();

    // Look for inline or separated options A. B. C. D.
    // Notice options can be separated by newline or multiple spaces on same line
    // Regex matches: (newline or space)(A|B|C|D|E|F)[.:\)]
    const optionSplitRegex = /(?:^|\n|\s{2,})([A-F])[.:\)]\s+/g;

    const optionMatches: { label: string; index: number; fullLength: number }[] = [];
    let optM: RegExpExecArray | null;
    while ((optM = optionSplitRegex.exec(body)) !== null) {
      optionMatches.push({
        label: optM[1].toUpperCase(),
        index: optM.index,
        fullLength: optM[0].length,
      });
    }

    let questionContent = '';
    const options: OptionItem[] = [];
    let inlineAnswerKeys: string[] = [];

    // Check for inline "Đáp án: A" or "Chọn A" inside this question chunk
    const inlineAnswerMatch = body.match(/(?:Đáp\s*án(?:\s*đúng)?|Chọn|Key)[\s:.-]+([A-F](?:\s*,\s*[A-F])*)/i);
    if (inlineAnswerMatch) {
      inlineAnswerKeys = inlineAnswerMatch[1].toUpperCase().split(/[,\s]+/).filter(k => /^[A-F]$/.test(k));
    }

    if (optionMatches.length > 0) {
      // Question content is before the first option
      questionContent = body.substring(0, optionMatches[0].index).trim();

      for (let i = 0; i < optionMatches.length; i++) {
        const cur = optionMatches[i];
        const next = optionMatches[i + 1];
        const start = cur.index + cur.fullLength;
        const end = next ? next.index : body.length;

        let optText = body.substring(start, end).trim();

        // Strip inline answer if it was tacked at the end of the last option
        if (inlineAnswerMatch && optText.includes(inlineAnswerMatch[0])) {
          optText = optText.replace(inlineAnswerMatch[0], '').trim();
        }

        options.push({
          id: `opt-${detectedNum}-${cur.label}`,
          label: cur.label,
          content: optText,
        });
      }
    } else {
      questionContent = body;
    }

    // Determine correct keys: either inline or from end table
    let correctKeys = inlineAnswerKeys;
    if (correctKeys.length === 0 && answerKeyMap[detectedNum]) {
      correctKeys = answerKeyMap[detectedNum];
    }

    const warnings = detectWarnings(questionContent, options, correctKeys);
    const shouldLockOptions = warnings.some(w => w.type === 'reference');

    questions.push({
      id: `q-${Date.now()}-${detectedNum}`,
      originalIndex: detectedNum,
      content: questionContent,
      options,
      correctKeys,
      lockQuestionPosition: false,
      lockOptionsShuffle: shouldLockOptions,
      warnings,
    });

    qNumber++;
  }

  // Renumber originalIndex sequentially if needed
  questions.forEach((q, idx) => {
    q.originalIndex = idx + 1;
  });

  return questions;
}

/**
 * Parse .docx file using mammoth in the browser
 */
export async function parseDocxFile(file: File): Promise<{ questions: Question[]; rawText: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value;

  const questions = parsePlainText(rawText);
  return { questions, rawText };
}

/**
 * Generate standard sample tagged exam text
 */
export function getSampleTaggedExamText(): string {
  return `[MIX:Q]
Câu 1. Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?
[MIX:A] Thành phố Hồ Chí Minh
[MIX:B] Hà Nội
[MIX:C] Đà Nẵng
[MIX:D] Cần Thơ
[MIX:KEY] B
[MIX:END]

[MIX:Q]
Câu 2. Trong các phát biểu sau về số tự nhiên, phát biểu nào sau đây là đúng?
[MIX:A] Số 0 là số tự nhiên nhỏ nhất
[MIX:B] Số 1 là số nguyên tố chẵn duy nhất
[MIX:C] Mọi số nguyên tố đều là số lẻ
[MIX:D] A và C đều đúng
[MIX:KEY] A
[MIX:END]

[MIX:Q]
Câu 3. Kết quả của phép tính: 15 + 25 × 2 là bao nhiêu?
[MIX:A] 80
[MIX:B] 65
[MIX:C] 50
[MIX:D] 90
[MIX:KEY] B
[MIX:END]

[MIX:Q]
Câu 4. Những thành phố nào sau đây là thành phố trực thuộc Trung ương của Việt Nam?
[MIX:A] Hải Phòng
[MIX:B] Nha Trang
[MIX:C] Đà Nẵng
[MIX:D] Vũng Tàu
[MIX:KEY] A,C
[MIX:END]

[MIX:Q]
Câu 5. Kim loại nào sau đây dẫn điện tốt nhất ở điều kiện thường?
[MIX:A] Đồng (Cu)
[MIX:B] Nhôm (Al)
[MIX:C] Bạc (Ag)
[MIX:D] Vàng (Au)
[MIX:KEY] C
[MIX:END]

[MIX:Q]
Câu 6. Tác phẩm văn học "Tắt đèn" là của nhà văn nào?
[MIX:A] Nam Cao
[MIX:B] Ngô Tất Tố
[MIX:C] Vũ Trọng Phụng
[MIX:D] Nguyễn Công Hoan
[MIX:KEY] B
[MIX:END]

[MIX:Q]
Câu 7. Đại dương nào có diện tích lớn nhất trên Trái Đất?
[MIX:A] Đại Tây Dương
[MIX:B] Ấn Độ Dương
[MIX:C] Bắc Băng Dương
[MIX:D] Thái Bình Dương
[MIX:KEY] D
[MIX:END]

[MIX:Q]
Câu 8. Đơn vị đo cường độ dòng điện trong hệ SI là gì?
[MIX:A] Vôn (V)
[MIX:B] Ampe (A)
[MIX:C] Oát (W)
[MIX:D] Ôm (Ω)
[MIX:KEY] B
[MIX:END]`;
}
