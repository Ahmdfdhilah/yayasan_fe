// apps/vite-react-app/src/services/teacher-evaluations/utils.ts

import { EvaluationGrade, EVALUATION_GRADES } from './types';

/**
 * Format score display for nullable values
 */
export const formatScore = (score: number | null): string => {
  if (score === null || score === undefined) {
    return 'Belum dinilai';
  }
  return score.toString();
};

/**
 * Format average score display for nullable values
 */
export const formatAverageScore = (score: number | null): string => {
  if (score === null || score === undefined) {
    return 'Belum dinilai';
  }
  return score.toFixed(2);
};

/**
 * Format final grade display for nullable values
 */
export const formatFinalGrade = (grade: number | null): string => {
  if (grade === null || grade === undefined) {
    return 'Belum dinilai';
  }
  return grade.toFixed(2);
};

/**
 * Get grade label for display
 */
export const getGradeLabel = (grade: EvaluationGrade | null): string => {
  if (grade === null || grade === undefined) {
    return 'Belum dinilai';
  }
  return EVALUATION_GRADES[grade].label;
};

/**
 * Get grade description with score
 */
export const getGradeDescription = (grade: EvaluationGrade | null): string => {
  if (grade === null || grade === undefined) {
    return 'Belum dinilai';
  }
  const gradeInfo = EVALUATION_GRADES[grade];
  return `${gradeInfo.label} (${grade}) - ${gradeInfo.score} poin`;
};

/**
 * Convert final grade to letter grade
 */
export const getFinalGradeLetter = (finalGrade: number | null): string => {
  if (finalGrade === null || finalGrade === undefined) {
    return 'Belum dinilai';
  }
  
  if (finalGrade >= 87.5) return 'A';
  if (finalGrade >= 62.5) return 'B';
  if (finalGrade >= 37.5) return 'C';
  return 'D';
};

/**
 * Get final grade description
 */
export const getFinalGradeDescription = (finalGrade: number | null): string => {
  if (finalGrade === null || finalGrade === undefined) {
    return 'Belum dinilai';
  }
  
  const letter = getFinalGradeLetter(finalGrade);
  const descriptions = {
    A: 'Excellent',
    B: 'Good', 
    C: 'Satisfactory',
    D: 'Needs Improvement'
  };
  
  return `${descriptions[letter as keyof typeof descriptions]} (${letter})`;
};

/**
 * Calculate completion percentage from items
 */
export const calculateCompletionPercentage = (items: Array<{ grade: EvaluationGrade | null }>): number => {
  if (!items || items.length === 0) return 0;
  
  const evaluatedItems = items.filter(item => item.grade !== null && item.grade !== undefined);
  return (evaluatedItems.length / items.length) * 100;
};

/**
 * Check if evaluation is complete
 */
export const isEvaluationComplete = (items: Array<{ grade: EvaluationGrade | null }>): boolean => {
  if (!items || items.length === 0) return false;
  return items.every(item => item.grade !== null && item.grade !== undefined);
};

/**
 * Get evaluation status text
 */
export const getEvaluationStatus = (items: Array<{ grade: EvaluationGrade | null }>): string => {
  if (!items || items.length === 0) return 'Tidak ada aspek';
  
  const evaluatedCount = items.filter(item => item.grade !== null && item.grade !== undefined).length;
  const totalCount = items.length;
  
  if (evaluatedCount === 0) return 'Belum dimulai';
  if (evaluatedCount === totalCount) return 'Selesai';
  return `${evaluatedCount}/${totalCount} dinilai`;
};

/**
 * Format percentage display
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

/**
 * Get color class for grade
 */
export const getGradeColorClass = (grade: EvaluationGrade | null): string => {
  if (grade === null || grade === undefined) {
    return 'text-gray-500';
  }
  
  const colorMap = {
    A: 'text-green-600',
    B: 'text-blue-600', 
    C: 'text-yellow-600',
    D: 'text-red-600'
  };
  
  return colorMap[grade];
};

/**
 * Get badge color class for final grade
 */
// export const getFinalGradeBadgeClass = (finalGrade: number | null): string => {
//   if (finalGrade === null || finalGrade === undefined) {
//     return 'bg-gray-100 text-gray-700';
//   }
  
//   if (finalGrade >= 87.5) return 'bg-green-100 text-green-800';
//   if (finalGrade >= 62.5) return 'bg-blue-100 text-blue-800';
//   if (finalGrade >= 37.5) return 'bg-yellow-100 text-yellow-800';
//   return 'bg-red-100 text-red-800';
// };