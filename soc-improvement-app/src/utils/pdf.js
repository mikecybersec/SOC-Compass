import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportPdf = async ({ scoresRef, actionPlanRef, metaRef }) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  let cursorY = 40;

  const addSection = async (title, element) => {
    doc.setFontSize(16);
    doc.text(title, 32, cursorY);
    cursorY += 16;

    if (!element) {
      doc.setFontSize(12);
      doc.text('No data available yet.', 32, cursorY + 12);
      cursorY += 32;
      return;
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth() - 64;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, 'PNG', 32, cursorY + 12, pdfWidth, pdfHeight);
    cursorY += pdfHeight + 40;
  };

  if (metaRef?.current) {
    doc.setFontSize(18);
    doc.text('SOC Improvement Assessment', 32, cursorY);
    cursorY += 24;
    doc.setFontSize(12);
    doc.text(metaRef.current.innerText || '', 32, cursorY);
    cursorY += 32;
  }

  await addSection('Scores & Charts', scoresRef?.current);
  await addSection('Action Plan', actionPlanRef?.current);

  doc.save('soc-assessment.pdf');
};
