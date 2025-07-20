// Risk Assessment Calculation Utilities

// 1. Tren Capaian
export const calculateTrendChoice = (trend: number): { pilihan: string; nilai: number } => {
  if (trend >= 41) return { pilihan: "Naik ≥ 41%", nilai: 1 };
  if (trend >= 21) return { pilihan: "Naik 21% - 40%", nilai: 2 };
  if (trend >= 0) return { pilihan: "Naik 0% - 20%", nilai: 3 };
  if (trend >= -25) return { pilihan: "Turun < 25%", nilai: 4 };
  return { pilihan: "Turun ≥ 25%", nilai: 5 };
};

// 2. Realisasi Anggaran
export const calculateBudgetChoice = (percentage: number): { pilihan: string; nilai: number } => {
  if (percentage > 98) return { pilihan: "> 98%", nilai: 1 };
  if (percentage > 95) return { pilihan: "95% - 97%", nilai: 2 };
  if (percentage > 90) return { pilihan: "90% - 94%", nilai: 3 };
  if (percentage >= 85) return { pilihan: "85% - 89%", nilai: 4 };
  return { pilihan: "< 85%", nilai: 5 };
};

// 3. Tren Ekspor
export const calculateExportTrendChoice = (value: number): { pilihan: string; nilai: number } => {
  if (value >= 35) return { pilihan: "Naik ≥ 35%", nilai: 1 };
  if (value >= 20) return { pilihan: "Naik 20% - 34%", nilai: 2 };
  if (value >= 0) return { pilihan: "Naik 0% - 19%", nilai: 3 };
  if (value >= -25) return { pilihan: "Turun < 25%", nilai: 4 };
  return { pilihan: "Turun ≥ 25%", nilai: 5 };
};

// 4. Audit Itjen
export const calculateAuditValue = (pilihan: string): number => {
  const mapping: Record<string, number> = {
    "1 Tahun": 1,
    "2 Tahun": 2,
    "3 Tahun": 3,
    "4 Tahun": 4,
    "Belum pernah diaudit": 5
  };
  return mapping[pilihan] || 0;
};

// 5. Perjanjian Perdagangan
export const calculateTradeAgreementValue = (pilihan: string): number => {
  const mapping: Record<string, number> = {
    "Tidak ada perjanjian internasional": 1,
    "Sedang diusulkan/ Being Proposed": 2,
    "Masih berproses/ on going": 3,
    "Sudah disepakati namun belum diratifikasi": 4,
    "Sudah diimplementasikan": 5
  };
  return mapping[pilihan] || 0;
};

// 6. Peringkat Ekspor
export const calculateExportRankingChoice = (ranking: number): { pilihan: string; nilai: number } => {
  if (ranking >= 1 && ranking <= 6) return { pilihan: "Peringkat 1 - 6", nilai: 1 };
  if (ranking >= 7 && ranking <= 12) return { pilihan: "Peringkat 7 - 12", nilai: 2 };
  if (ranking >= 13 && ranking <= 18) return { pilihan: "Peringkat 13 - 18", nilai: 3 };
  if (ranking >= 19 && ranking <= 23) return { pilihan: "Peringkat 19 - 23", nilai: 4 };
  return { pilihan: "Peringkat diatas 23", nilai: 5 };
};

// 7. Persentase IK
export const calculateIKChoice = (percentage: number): { pilihan: string; nilai: number } => {
  if (percentage <= 5) return { pilihan: "< 5%", nilai: 1 };
  if (percentage <= 10) return { pilihan: "6% - 10%", nilai: 2 };
  if (percentage <= 15) return { pilihan: "11% - 15%", nilai: 3 };
  if (percentage <= 20) return { pilihan: "16% - 20%", nilai: 4 };
  return { pilihan: "> 20%", nilai: 5 };
};

// 8. TEI
export const calculateTEIChoice = (percentage: number, isZeroDivision: boolean): { pilihan: string; nilai: number } => {
  if (isZeroDivision) return { pilihan: "Belum Ada Realisasi", nilai: 5 };
  if (percentage > 70) return { pilihan: "> 70%", nilai: 1 };
  if (percentage >= 50) return { pilihan: "50% - 70%", nilai: 2 };
  if (percentage >= 25) return { pilihan: "25% - 49%", nilai: 3 };
  return { pilihan: "< 25%", nilai: 4 };
};

// 9. Total Risk Calculation
export const calculateTotalRisk = (
  nilai1: number, // tren_capaian
  nilai2: number, // realisasi_anggaran  
  nilai3: number, // tren_ekspor
  nilai4: number, // audit_itjen
  nilai5: number, // perjanjian_perdagangan
  nilai6: number, // peringkat_ekspor
  nilai7: number, // persentase_ik
  nilai8: number  // realisasi_tei
): number => {
  return ((nilai1 * 15) + (nilai2 * 10) + (nilai3 * 15) + (nilai4 * 25) + (nilai5 * 5) + (nilai6 * 10) + (nilai7 * 10) + (nilai8 * 10)) / 5;
};