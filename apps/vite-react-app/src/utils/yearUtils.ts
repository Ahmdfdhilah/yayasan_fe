// apps/vite-react-app/src/utils/yearUtils.ts

import { PeriodeEvaluasi } from '../services/periodeEvaluasi/types';
import { periodeEvaluasiService } from '../services/periodeEvaluasi/service';

export const getYearsFromPeriodeEvaluasi = (periodeEvaluasi: PeriodeEvaluasi[]): number[] => {
  return periodeEvaluasi
    .map(periode => periode.tahun)
    .sort((a, b) => b - a);
};

export const getActiveYears = (periodeEvaluasi: PeriodeEvaluasi[]): number[] => {
  return periodeEvaluasi
    .filter(periode => periode.status === 'aktif')
    .map(periode => periode.tahun)
    .sort((a, b) => b - a);
};

export const getAvailableYears = (periodeEvaluasi: PeriodeEvaluasi[]): number[] => {
  return periodeEvaluasi
    .filter(periode => !periode.is_locked)
    .map(periode => periode.tahun)
    .sort((a, b) => b - a);
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getYearRange = (startYear: number, endYear?: number): number[] => {
  const end = endYear || getCurrentYear();
  const years: number[] = [];
  
  for (let year = startYear; year <= end; year++) {
    years.push(year);
  }
  
  return years.sort((a, b) => b - a);
};

export const getDefaultYearOptions = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await periodeEvaluasiService.getPeriodeEvaluasi({ 
      size: 100, 
      include_statistics: true 
    });
    
    const years = getYearsFromPeriodeEvaluasi(response.items);
    
    return [
      { value: 'all', label: 'Semua Tahun' },
      ...years.map(year => ({
        value: year.toString(),
        label: year.toString()
      }))
    ];
  } catch (error) {
    console.error('Failed to fetch periode evaluasi for year options:', error);
    // Fallback to static years
    const currentYear = getCurrentYear();
    const years = getYearRange(currentYear - 2, currentYear);
    
    return [
      { value: 'all', label: 'Semua Tahun' },
      ...years.map(year => ({
        value: year.toString(),
        label: year.toString()
      }))
    ];
  }
};

export const getPeriodeEvaluasiYearOptions = (periodeEvaluasi: PeriodeEvaluasi[]): { value: string; label: string }[] => {
  const years = getYearsFromPeriodeEvaluasi(periodeEvaluasi);
  
  return [
    { value: 'all', label: 'Semua Tahun' },
    ...years.map(year => ({
      value: year.toString(),
      label: year.toString()
    }))
  ];
};

export const fetchPeriodeEvaluasiYearOptions = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await periodeEvaluasiService.getPeriodeEvaluasi({ 
      size: 100, 
      include_statistics: true 
    });
    
    const years = getYearsFromPeriodeEvaluasi(response.items);
    
    return [
      { value: 'all', label: 'Semua Tahun' },
      ...years.map(year => ({
        value: year.toString(),
        label: year.toString()
      }))
    ];
  } catch (error) {
    console.error('Failed to fetch periode evaluasi for year options:', error);
    return getDefaultYearOptions();
  }
};

export const findPeriodeByYear = (periodeEvaluasi: PeriodeEvaluasi[], year: number): PeriodeEvaluasi | undefined => {
  return periodeEvaluasi.find(periode => periode.tahun === year);
};

export const isYearAvailable = (periodeEvaluasi: PeriodeEvaluasi[], year: number): boolean => {
  const periode = findPeriodeByYear(periodeEvaluasi, year);
  return periode ? !periode.is_locked : false;
};

export const getLatestPeriode = (periodeEvaluasi: PeriodeEvaluasi[]): PeriodeEvaluasi | undefined => {
  if (periodeEvaluasi.length === 0) return undefined;
  
  return periodeEvaluasi.reduce((latest, current) => 
    current.tahun > latest.tahun ? current : latest
  );
};