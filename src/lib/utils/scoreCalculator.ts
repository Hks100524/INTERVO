/**
 * Calculates the score percentage from a saved interview session's data array.
 * 
 * @param sessionData - Array of session data objects containing ai_feedback
 * @returns Score as a whole number percentage (0-100)
 * 
 * @example
 * const sessionData = [
 *   { question: "...", ai_feedback: { is_correct_enough: true } },
 *   { question: "...", ai_feedback: { is_correct_enough: false } },
 *   { question: "...", ai_feedback: { is_correct_enough: true } },
 *   { question: "...", ai_feedback: { is_correct_enough: true } }
 * ];
 * const score = calculateSessionScore(sessionData); // Returns 75 (3 out of 4 correct)
 */
export function calculateSessionScore(sessionData: any[]): number {
  // Handle edge cases
  if (!sessionData || sessionData.length === 0) {
    return 0;
  }

  // Count total questions
  const totalQuestions = sessionData.length;
  
  // Count correct answers
  let correctAnswers = 0;
  
  for (const item of sessionData) {
    // Check if ai_feedback exists and is_correct_enough is true
    if (item?.ai_feedback?.is_correct_enough === true) {
      correctAnswers++;
    }
  }
  
  // Calculate percentage score
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  // Return as whole number (integer)
  return Math.round(percentage);
}

/**
 * Gets detailed scoring information from session data.
 * 
 * @param sessionData - Array of session data objects
 * @returns Object containing detailed score information
 */
export function getDetailedScore(sessionData: any[]) {
  if (!sessionData || sessionData.length === 0) {
    return {
      total: 0,
      correct: 0,
      incorrect: 0,
      percentage: 0,
    };
  }

  const total = sessionData.length;
  let correct = 0;

  for (const item of sessionData) {
    if (item?.ai_feedback?.is_correct_enough === true) {
      correct++;
    }
  }

  const incorrect = total - correct;
  const percentage = Math.round((correct / total) * 100);

  return {
    total,
    correct,
    incorrect,
    percentage,
  };
}
