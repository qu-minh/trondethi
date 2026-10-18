import type { Question, MixConfig, ShuffledExam, ShuffledQuestion, ShuffledOption } from '../types/exam';

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle with custom RNG
 */
function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Standard option labels
 */
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Simple hash from string to 32-bit integer
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Execute mixing algorithm with full verification
 */
export function mixExam(
  questions: Question[],
  config: MixConfig
): ShuffledExam[] {
  const resultExams: ShuffledExam[] = [];

  for (let codeIdx = 0; codeIdx < config.codes.length; codeIdx++) {
    const code = config.codes[codeIdx];
    // Create seed specific to this code and global seed
    const codeSeed = (config.seed + hashString(code) + (codeIdx * 10007)) >>> 0;
    const rng = createPRNG(codeSeed);

    // 1. QUESTION POSITION HANDLING
    let orderedQuestions: Question[] = [];

    if (!config.shuffleQuestions) {
      // Keep exact original order
      orderedQuestions = [...questions];
    } else {
      // Separate locked and unlocked questions
      // Create empty array of length questions.length
      const slots: (Question | null)[] = new Array(questions.length).fill(null);
      const unlockedQuestions: Question[] = [];

      questions.forEach((q) => {
        if (q.lockQuestionPosition) {
          // Keep at original index (0-based)
          const targetIndex = q.originalIndex - 1;
          if (targetIndex >= 0 && targetIndex < slots.length && slots[targetIndex] === null) {
            slots[targetIndex] = q;
          } else {
            // Fallback if index collision
            unlockedQuestions.push(q);
          }
        } else {
          unlockedQuestions.push(q);
        }
      });

      // Shuffle unlocked questions
      const shuffledUnlocked = seededShuffle(unlockedQuestions, rng);

      // Fill empty slots with shuffled questions
      let unlockIdx = 0;
      for (let i = 0; i < slots.length; i++) {
        if (slots[i] === null) {
          slots[i] = shuffledUnlocked[unlockIdx++];
        }
      }

      orderedQuestions = slots.filter((q): q is Question => q !== null);
    }

    // 2. OPTIONS SHUFFLE & ACCURATE KEY MAPPING
    const shuffledQuestions: ShuffledQuestion[] = [];
    const answerKeyMap: Record<number, string> = {};
    let allIntegrityValid = true;

    for (let newIndex0 = 0; newIndex0 < orderedQuestions.length; newIndex0++) {
      const origQ = orderedQuestions[newIndex0];
      const newQuestionIndex = newIndex0 + 1; // 1-based

      let finalOptions: ShuffledOption[] = [];
      let newCorrectKeys: string[] = [];

      if (!config.shuffleOptions || origQ.lockOptionsShuffle || origQ.options.length <= 1) {
        // Do NOT shuffle options
        finalOptions = origQ.options.map((opt, idx) => ({
          ...opt,
          label: LABELS[idx] || opt.label,
          originalLabel: opt.label,
        }));
        newCorrectKeys = [...origQ.correctKeys];
      } else {
        // Shuffle options
        // Prepare options with their originalLabel recorded
        const optionsWithOrig = origQ.options.map(opt => ({
          id: opt.id,
          content: opt.content,
          originalLabel: opt.label,
        }));

        const shuffled = seededShuffle(optionsWithOrig, rng);

        // Assign new labels A, B, C, D...
        finalOptions = shuffled.map((opt, idx) => ({
          id: opt.id,
          content: opt.content,
          label: LABELS[idx] || `${idx + 1}`,
          originalLabel: opt.originalLabel,
        }));

        // Compute new correct keys:
        // For each original correct key, find which new option had that originalLabel
        for (const origKey of origQ.correctKeys) {
          const matchedOpt = finalOptions.find(o => o.originalLabel.toUpperCase() === origKey.toUpperCase());
          if (matchedOpt) {
            newCorrectKeys.push(matchedOpt.label);
          }
        }

        // Sort keys alphabetically (e.g. ['A', 'C'])
        newCorrectKeys.sort();
      }

      // 3. INTEGRITY ASSERTION (Crucial requirement!)
      // Verify that the answer text pointed to by newCorrectKeys matches the original answer text!
      const originalCorrectTexts = origQ.options
        .filter(o => origQ.correctKeys.includes(o.label))
        .map(o => o.content.trim())
        .sort();

      const newCorrectTexts = finalOptions
        .filter(o => newCorrectKeys.includes(o.label))
        .map(o => o.content.trim())
        .sort();

      const isKeyIntegrityEqual =
        originalCorrectTexts.length === newCorrectTexts.length &&
        originalCorrectTexts.every((text, i) => text === newCorrectTexts[i]);

      if (!isKeyIntegrityEqual) {
        allIntegrityValid = false;
        console.error(`Integrity check failed for Question ${newQuestionIndex} in Exam Code ${code}!`);
      }

      shuffledQuestions.push({
        id: `shuffled-${code}-${origQ.id}`,
        originalId: origQ.id,
        originalIndex: origQ.originalIndex,
        newIndex: newQuestionIndex,
        content: origQ.content,
        options: finalOptions,
        correctKeys: newCorrectKeys,
        originalCorrectKeys: origQ.correctKeys,
        lockQuestionPosition: origQ.lockQuestionPosition,
        lockOptionsShuffle: origQ.lockOptionsShuffle,
        warnings: origQ.warnings,
        passageGroup: origQ.passageGroup,
      });

      answerKeyMap[newQuestionIndex] = newCorrectKeys.join(',');
    }

    // Checksum for validation
    const checksum = `SUM-${code}-${shuffledQuestions.length}-${Object.values(answerKeyMap).join('')}`;

    resultExams.push({
      code,
      questions: shuffledQuestions,
      answerKeyMap,
      integrityCheckPassed: allIntegrityValid,
      checksum,
    });
  }

  return resultExams;
}
