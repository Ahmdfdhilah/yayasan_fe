export interface ExcelColumn {
  width: number;
  key?: string;
  header: string;
}

export interface ExcelHeaderInfo {
  label: string;
  value: string;
}

export interface ExcelExportConfig {
  title: string;
  fileName: string;
  columns: ExcelColumn[];
  headerInfo?: ExcelHeaderInfo[];
  data: any[];
  sheetName?: string;
  noDataMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface ToastFunction {
  (options: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
  }): void;
}

export interface ExcelStyles {
  title?: {
    font?: any;
    alignment?: any;
    fill?: any;
    border?: any;
    height?: number;
  };
  headerInfo?: {
    font?: any;
    alignment?: any;
    fill?: any;
    border?: any;
    height?: number;
  };
  tableHeader?: {
    font?: any;
    alignment?: any;
    fill?: any;
    border?: any;
    height?: number;
  };
  tableData?: {
    font?: any;
    alignment?: any;
    border?: any;
    wrapText?: boolean;
  };
  noData?: {
    font?: any;
    alignment?: any;
  };
}

const defaultStyles: ExcelStyles = {
  title: {
    font: { bold: true, size: 18, color: { argb: 'FF1565C0' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } },
    height: 35
  },
  headerInfo: {
    font: { bold: true, size: 12, color: { argb: 'FF424242' } },
    alignment: { horizontal: 'left', vertical: 'middle' },
    height: 25
  },
  tableHeader: {
    font: { bold: true, size: 13, color: { argb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    },
    height: 30
  },
  tableData: {
    font: { size: 11, color: { argb: 'FF212121' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    },
    wrapText: true
  },
  noData: {
    font: { italic: true, size: 11 },
    alignment: { horizontal: 'center', vertical: 'middle' }
  }
};

export const exportToExcel = async (config: ExcelExportConfig, toastFn: ToastFunction, customStyles?: ExcelStyles): Promise<void> => {
  try {
    const ExcelJS = await import('exceljs');
    const styles = { ...defaultStyles, ...customStyles };
    
    const {
      title,
      fileName,
      columns,
      headerInfo = [],
      data,
      sheetName = 'Sheet1',
      noDataMessage = 'Tidak ada data',
      successMessage = 'Data berhasil diekspor ke Excel.'
    } = config;

    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Set column widths
    worksheet.columns = columns.map(col => ({ width: col.width }));

    let currentRow = 1;

    // Add title (merged cell)
    const titleRange = `A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`;
    worksheet.mergeCells(titleRange);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = title;
    
    if (styles.title) {
      titleCell.font = styles.title.font;
      titleCell.alignment = styles.title.alignment;
      titleCell.fill = styles.title.fill;
      if (styles.title.height) {
        worksheet.getRow(currentRow).height = styles.title.height;
      }
    }

    currentRow++;

    // Add empty row
    worksheet.addRow([]);
    currentRow++;

    // Add header information
    if (headerInfo.length > 0) {
      headerInfo.forEach((info) => {
        const headerRange = `A${currentRow}:${String.fromCharCode(64 + columns.length)}${currentRow}`;
        worksheet.mergeCells(headerRange);
        const cell = worksheet.getCell(`A${currentRow}`);
        cell.value = `${info.label}: ${info.value}`;
        
        if (styles.headerInfo) {
          cell.font = styles.headerInfo.font;
          cell.alignment = styles.headerInfo.alignment;
          if (styles.headerInfo.height) {
            worksheet.getRow(currentRow).height = styles.headerInfo.height;
          }
        }
        
        currentRow++;
      });

      // Add empty row
      worksheet.addRow([]);
      currentRow++;
    }

    if (data.length > 0) {
      // Add table headers
      const headerRow = worksheet.addRow(columns.map(col => col.header));
      
      if (styles.tableHeader) {
        if (styles.tableHeader.height) {
          headerRow.height = styles.tableHeader.height;
        }
        
        headerRow.eachCell((cell) => {
          cell.font = styles.tableHeader?.font;
          cell.alignment = styles.tableHeader?.alignment;
          cell.fill = styles.tableHeader?.fill;
          cell.border = styles.tableHeader?.border;
        });
      }

      // Add data rows
      data.forEach((rowData, index) => {
        const dataRow = worksheet.addRow(
          columns.map((col, colIndex) => {
            if (col.key) {
              return rowData[col.key];
            }
            // For numbered columns or custom mapping
            if (colIndex === 0 && col.header.toLowerCase().includes('no')) {
              return index + 1;
            }
            return rowData[colIndex] || '';
          })
        );

        // Style data cells
        if (styles.tableData) {
          dataRow.eachCell((cell, colNumber) => {
            cell.font = styles.tableData?.font;
            cell.alignment = {
              ...styles.tableData?.alignment,
              horizontal: colNumber === 1 ? 'center' : styles.tableData?.alignment?.horizontal || 'left'
            };
            cell.border = styles.tableData?.border;
            if (styles.tableData?.wrapText) {
              cell.alignment = { ...cell.alignment, wrapText: true };
            }
          });
        }
      });
    } else {
      // Add no data message
      const noDataRow = worksheet.addRow([noDataMessage]);
      const noDataRange = `A${noDataRow.number}:${String.fromCharCode(64 + columns.length)}${noDataRow.number}`;
      worksheet.mergeCells(noDataRange);
      const cell = worksheet.getCell(`A${noDataRow.number}`);
      
      if (styles.noData) {
        cell.alignment = styles.noData.alignment;
        cell.font = styles.noData.font;
      }
    }

    // Set workbook properties
    workbook.creator = 'Sistem Evaluasi';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    toastFn({
      title: 'Export Berhasil',
      description: successMessage,
      variant: 'default'
    });

  } catch (error) {
    console.error('Failed to export Excel:', error);
    toastFn({
      title: 'Export Gagal',
      description: 'Gagal mengekspor data ke Excel. Silakan coba lagi.',
      variant: 'destructive'
    });
  }
};

// Specific utility for Evaluation Reports export
export const exportEvaluationReportToExcel = async (
  stats: any, 
  period: any, 
  toastFn: ToastFunction
): Promise<void> => {
  const today = new Date().toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Prepare teacher data from top_performers (show all teachers)
  const teacherData = stats.top_performers?.map((teacher: any, index: number) => ({
    no: index + 1,
    teacher_name: teacher.teacher_name,
    organization_name: teacher.organization_name,
    total_score: teacher.total_score,
    average_score: teacher.average_score.toFixed(2),
    final_grade: teacher.final_grade.toFixed(2),
    final_grade_letter: teacher.final_grade_letter
  })) || [];

  // Prepare grade distribution data
  const gradeData = [
    { grade: 'A - Sangat Baik', count: stats.final_grade_distribution?.A || 0 },
    { grade: 'B - Baik', count: stats.final_grade_distribution?.B || 0 },
    { grade: 'C - Cukup', count: stats.final_grade_distribution?.C || 0 },
    { grade: 'D - Perlu Perbaikan', count: stats.final_grade_distribution?.D || 0 }
  ];

  const completionPercentage = stats.completion_percentage || 0;
  const averageScore = stats.average_score ? stats.average_score.toFixed(2) : '0.00';

  const config: ExcelExportConfig = {
    title: `Laporan Evaluasi Kinerja Guru`,
    fileName: `Laporan_Evaluasi_${period.academic_year}_${period.semester}_${new Date().getFullYear()}.xlsx`,
    sheetName: 'Ringkasan Guru',
    columns: [
      { width: 5, header: 'No' },
      { width: 30, header: 'Nama Guru', key: 'teacher_name' },
      { width: 25, header: 'Sekolah', key: 'organization_name' },
      { width: 15, header: 'Total Skor', key: 'total_score' },
      { width: 18, header: 'Rata-rata Skor', key: 'average_score' },
      { width: 18, header: 'Nilai Akhir', key: 'final_grade' },
      { width: 15, header: 'Index', key: 'final_grade_letter' }
    ],
    headerInfo: [
      { label: 'Yayasan', value: 'Yayasan Baitul Muslim Lampung Timur' },
      { label: 'Alamat', value: 'Jl. Ir. H. Djuanda No. 19 Labuhan Ratu Satu, Way Jepara, Lampung Timur' },
      { label: 'Periode Evaluasi', value: `${period.academic_year} - ${period.semester}` },
      { label: 'Tanggal Laporan', value: today },
      { label: 'Total Guru', value: stats.total_teachers.toString() },
      { label: 'Total Evaluasi', value: `${stats.completed_evaluations} dari ${stats.total_evaluations}` },
      { label: 'Persentase Selesai', value: `${completionPercentage.toFixed(1)}%` },
      { label: 'Rata-rata Keseluruhan', value: `${averageScore} / 4.0` }
    ],
    data: teacherData,
    noDataMessage: 'Tidak ada data guru',
    successMessage: `Laporan evaluasi periode ${period.academic_year} - ${period.semester} berhasil diekspor ke Excel.`,
    errorMessage: 'Gagal mengekspor laporan ke Excel. Silakan coba lagi.'
  };

  // Custom styles for evaluation report
  const customStyles = {
    title: {
      font: { bold: true, size: 16, color: { argb: 'FF047857' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFFA' } },
      height: 35
    },
    tableHeader: {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      },
      height: 30
    }
  };

  await exportToExcel(config, toastFn, customStyles);

  // Create second sheet for grade distribution
  try {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const gradeSheet = workbook.addWorksheet('Distribusi Nilai');

    // Grade distribution sheet
    gradeSheet.columns = [
      { width: 25, header: 'Nilai' },
      { width: 15, header: 'Jumlah' },
      { width: 15, header: 'Persentase' }
    ];

    let currentRow = 1;

    // Add title
    const titleRange = `A${currentRow}:C${currentRow}`;
    gradeSheet.mergeCells(titleRange);
    const titleCell = gradeSheet.getCell(`A${currentRow}`);
    titleCell.value = 'Distribusi Nilai Evaluasi';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF047857' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFFA' } };
    gradeSheet.getRow(currentRow).height = 35;

    currentRow += 3;

    // Add headers
    const headerRow = gradeSheet.addRow(['Nilai', 'Jumlah', 'Persentase']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add grade data
    const totalGrades = gradeData.reduce((sum, grade) => sum + grade.count, 0);
    gradeData.forEach((grade) => {
      const percentage = totalGrades > 0 ? ((grade.count / totalGrades) * 100).toFixed(1) : '0.0';
      const dataRow = gradeSheet.addRow([grade.grade, grade.count, `${percentage}%`]);
      
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { size: 11 };
        cell.alignment = { 
          horizontal: colNumber === 1 ? 'left' : 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

  } catch (error) {
    console.error('Error creating grade distribution sheet:', error);
  }
};