import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface EvaluationReportData {
  teacherName: string;
  teacherNip?: string;
  evaluatorName: string;
  periodAcademicYear: string;
  periodSemester: string;
  evaluationDate: string;
  organizationName?: string;
  evaluationResults: {
    category: string;
    aspects: {
      aspectName: string;
      description?: string;
      grade: string;
      score: number;
    }[];
  }[];
  averageScore: number;
  notes?: string;
}

export class TeacherEvaluationPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  private addHeader(data: EvaluationReportData) {
    // Kop Surat
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    
    const centerX = this.pageWidth / 2;
    
    // Logo space - 20mm from left
    // TODO: Add logo image here when assets are ready
    // this.doc.addImage(logoBase64, 'PNG', 20, this.currentY - 5, 15, 15);
    
    this.doc.text('YAYASAN BAITUL MUSLIM', centerX, this.currentY, { align: 'center' });
    this.currentY += 6;
    
    this.doc.text('LAMPUNG TIMUR', centerX, this.currentY, { align: 'center' });
    this.currentY += 6;
    
    if (data.organizationName) {
      this.doc.text(data.organizationName.toUpperCase(), centerX, this.currentY, { align: 'center' });
      this.currentY += 6;
    }
    
    // Alamat
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Jl. Ir. H. Djuanda No. 19 Labuhan Ratu Satu', centerX, this.currentY, { align: 'center' });
    this.currentY += 4;
    this.doc.text('Way Jepara, Lampung Timur | Website: baitul-muslim.sch.id', centerX, this.currentY, { align: 'center' });
    this.currentY += 8;
    
    // Garis bawah kop
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
    
    // Judul Dokumen
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('LAPORAN HASIL EVALUASI KINERJA GURU', centerX, this.currentY, { align: 'center' });
    this.currentY += 8;
    
    // Nomor dan tanggal
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const reportNumber = `Nomor: ${Math.floor(Math.random() * 1000)}/EVAL/DISDIK/${new Date().getFullYear()}`;
    this.doc.text(reportNumber, centerX, this.currentY, { align: 'center' });
    this.currentY += 6;
    
    const reportDate = `Tanggal: ${new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}`;
    this.doc.text(reportDate, centerX, this.currentY, { align: 'center' });
    this.currentY += 15;
  }

  private addTeacherInfo(data: EvaluationReportData) {
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DATA GURU YANG DIEVALUASI', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFont('helvetica', 'normal');
    const infoData = [
      ['Nama Guru', ':', data.teacherName],
      ['NIP', ':', data.teacherNip || '-'],
      ['Periode Evaluasi', ':', `${data.periodAcademicYear} - ${data.periodSemester}`],
      ['Tanggal Evaluasi', ':', data.evaluationDate],
      ['Nama Evaluator', ':', data.evaluatorName],
    ];
    
    infoData.forEach(([label, colon, value]) => {
      this.doc.text(label, this.margin, this.currentY);
      this.doc.text(colon, this.margin + 40, this.currentY);
      this.doc.text(value, this.margin + 45, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  private addEvaluationResults(data: EvaluationReportData) {
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('HASIL EVALUASI', this.margin, this.currentY);
    this.currentY += 8;
    
    // Ringkasan Skor
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Rata-rata Skor: ${data.averageScore.toFixed(2)} / 4.0`, this.margin, this.currentY);
    this.currentY += 8;
    
    // Tabel hasil evaluasi per kategori
    data.evaluationResults.forEach((category, categoryIndex) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      // Category header
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${categoryIndex + 1}. ${category.category}`, this.margin, this.currentY);
      this.currentY += 6;
      
      // Aspects table
      const tableData = category.aspects.map((aspect, index) => [
        (index + 1).toString(),
        aspect.aspectName,
        aspect.grade,
        aspect.score.toString(),
        this.getGradeDescription(aspect.grade)
      ]);
      
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['No', 'Aspek Penilaian', 'Nilai', 'Skor', 'Keterangan']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 80 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 50 },
        },
        margin: { left: this.margin, right: this.margin },
      });
      
      this.currentY = (this.doc as any).lastAutoTable.finalY + 8;
    });
  }

  private addNotes(data: EvaluationReportData) {
    if (data.notes && data.notes.trim()) {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('CATATAN EVALUASI', this.margin, this.currentY);
      this.currentY += 8;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      // Split notes into lines that fit the page width
      const maxWidth = this.pageWidth - (2 * this.margin);
      const noteLines = this.doc.splitTextToSize(data.notes, maxWidth);
      
      noteLines.forEach((line: string) => {
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        this.doc.text(line, this.margin, this.currentY);
        this.currentY += 5;
      });
      
      this.currentY += 10;
    }
  }


  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // Page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Halaman ${i} dari ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
      
      // Footer text
      this.doc.text(
        'Laporan Evaluasi Kinerja Guru - Dinas Pendidikan',
        this.pageWidth / 2,
        this.pageHeight - 6,
        { align: 'center' }
      );
    }
  }

  private getGradeDescription(grade: string): string {
    switch (grade) {
      case 'A':
        return 'Sangat Baik';
      case 'B':
        return 'Baik';
      case 'C':
        return 'Cukup';
      case 'D':
        return 'Perlu Perbaikan';
      default:
        return '-';
    }
  }

  public generatePDF(data: EvaluationReportData): jsPDF {
    this.addHeader(data);
    this.addTeacherInfo(data);
    this.addEvaluationResults(data);
    this.addNotes(data);
    this.addFooter();
    
    return this.doc;
  }

  public downloadPDF(data: EvaluationReportData, filename?: string): void {
    const pdf = this.generatePDF(data);
    const fileName = filename || `Evaluasi_${data.teacherName.replace(/\s+/g, '_')}_${data.periodAcademicYear}_${data.periodSemester}.pdf`;
    pdf.save(fileName);
  }

}

// Export utility functions
export const generateEvaluationPDF = (data: EvaluationReportData, filename?: string) => {
  const generator = new TeacherEvaluationPDFGenerator();
  generator.downloadPDF(data, filename);
};