export const formatNumber = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('id-ID').format(numValue);
};

export const formatCurrency = (value: number | string, currency: string = 'IDR'): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

export const formatRupiah = (value: number | string): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  return `Rp ${formatNumber(numValue)}`;
};

export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  
  const cleanValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const addThousandSeparator = (value: string): string => {
  if (!value) return '';
  
  const numValue = value.replace(/[^\d]/g, '');
  if (!numValue) return '';
  
  return formatNumber(parseInt(numValue));
};

export const handleNumberInput = (
  value: string,
  onChange: (value: string) => void,
  options?: {
    allowDecimal?: boolean;
    maxLength?: number;
    min?: number;
    max?: number;
  }
): void => {
  const { allowDecimal = false, maxLength, min, max } = options || {};
  
  let cleanValue = value.replace(/[^\d]/g, '');
  
  if (allowDecimal) {
    cleanValue = value.replace(/[^\d,]/g, '');
    if (cleanValue.includes(',')) {
      const parts = cleanValue.split(',');
      if (parts.length > 2) {
        cleanValue = parts[0] + ',' + parts[1];
      }
    }
  }
  
  if (maxLength && cleanValue.length > maxLength) {
    cleanValue = cleanValue.substring(0, maxLength);
  }
  
  const numValue = parseFormattedNumber(cleanValue);
  
  if (min !== undefined && numValue < min) {
    return;
  }
  
  if (max !== undefined && numValue > max) {
    return;
  }
  
  const formatted = allowDecimal ? cleanValue : formatNumber(parseInt(cleanValue) || 0);
  onChange(formatted);
};