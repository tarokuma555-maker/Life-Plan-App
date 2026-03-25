'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const timeline = document.getElementById('timeline-export');
      const charts = document.getElementById('charts-export');

      if (!timeline) return;

      const canvas1 = await html2canvas(timeline, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: timeline.scrollWidth,
        windowHeight: timeline.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add timeline
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas1.height * imgWidth) / canvas1.width;
      pdf.addImage(
        canvas1.toDataURL('image/png'),
        'PNG',
        10,
        10,
        imgWidth,
        Math.min(imgHeight, pageHeight - 20)
      );

      // Add charts on new page
      if (charts) {
        const canvas2 = await html2canvas(charts, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        pdf.addPage();
        const img2Width = pageWidth - 20;
        const img2Height = (canvas2.height * img2Width) / canvas2.width;
        pdf.addImage(
          canvas2.toDataURL('image/png'),
          'PNG',
          10,
          10,
          img2Width,
          Math.min(img2Height, pageHeight - 20)
        );
      }

      pdf.save('life-plan.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDFの書き出しに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  const exportImage = async () => {
    setExporting(true);
    try {
      const timeline = document.getElementById('timeline-export');
      if (!timeline) return;

      const canvas = await html2canvas(timeline, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: timeline.scrollWidth,
        windowHeight: timeline.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = 'life-plan.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
      alert('画像の書き出しに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportPDF}
        disabled={exporting}
        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {exporting ? '書き出し中...' : 'PDF書き出し'}
      </button>
      <button
        onClick={exportImage}
        disabled={exporting}
        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
      >
        {exporting ? '書き出し中...' : '画像書き出し'}
      </button>
    </div>
  );
}
