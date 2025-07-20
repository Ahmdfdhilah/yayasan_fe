import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatRelativeTime = (dateString: string) => {
    try {
        const inputDate = new Date(dateString);

        // Offset untuk WIB (UTC+7) dalam milidetik
        const indonesiaOffset = 7 * 60 * 60 * 1000;

        // Konversi input date ke waktu Indonesia
        const indonesiaInputDate = new Date(inputDate.getTime() + indonesiaOffset);

        return formatDistanceToNow(indonesiaInputDate, {
            addSuffix: true,
            locale: enUS
        });
    } catch {
        return 'Unknown time';
    }
};

// Alternatif jika tidak menggunakan date-fns-tz
export const formatRelativeTimeSimple = (dateString: string) => {
    try {
        const inputDate = new Date(dateString);

        // Offset untuk WIB (UTC+7) dalam milidetik
        const indonesiaOffset = 7 * 60 * 60 * 1000;

        // Konversi input date ke waktu Indonesia
        const indonesiaInputDate = new Date(inputDate.getTime() + indonesiaOffset);

        return formatDistanceToNow(indonesiaInputDate, {
            addSuffix: true,
            locale: enUS
        });
    } catch {
        return 'Waktu tidak diketahui';
    }
};

// Format tanggal ke bahasa Indonesia
export const formatIndonesianDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    } catch {
        return 'Tanggal tidak valid';
    }
};

// Format range tanggal ke bahasa Indonesia
export const formatIndonesianDateRange = (startDate: string, endDate: string): string => {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        const startDay = start.getDate();
        const startMonth = months[start.getMonth()];
        const startYear = start.getFullYear();
        
        const endDay = end.getDate();
        const endMonth = months[end.getMonth()];
        const endYear = end.getFullYear();
        
        // Same month and year
        if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            return `${startDay} - ${endDay} ${startMonth} ${startYear}`;
        }
        
        // Same year, different months
        if (start.getFullYear() === end.getFullYear()) {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
        }
        
        // Different years
        return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    } catch {
        return 'Rentang tanggal tidak valid';
    }
};
