import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Use cdn worker or bundled worker URL
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Extracts plain text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<{ text: string; numPages: number; titleHint?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    // Extract text from each page (up to 40 pages for performance)
    const maxPages = Math.min(numPages, 40);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems = textContent.items
        .map((item: any) => item.str || '')
        .filter((str: string) => str.trim().length > 0);

      const pageText = pageItems.join(' ');
      if (pageText.trim()) {
        fullText += `\n\n--- [صفحة ${i}] ---\n` + pageText;
      }
    }

    // Clean up excessive whitespace
    fullText = fullText.replace(/ +/g, ' ').trim();

    // Try to extract document title or subject hint from filename or first page
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const firstLines = fullText.slice(0, 300).split('\n').map(l => l.trim()).filter(Boolean);
    const titleHint = firstLines.length > 0 ? (firstLines[0].length < 80 ? firstLines[0] : cleanFileName) : cleanFileName;

    return {
      text: fullText,
      numPages,
      titleHint,
    };
  } catch (error) {
    console.warn('PDF parsing error via pdfjs:', error);
    // Fallback if parsing fails or encrypted
    return {
      text: `[مستند PDF: ${file.name} - تعذر استخراج النص الكامل برمجياً، يمكن لصق النصوص الهامة يدوياً].`,
      numPages: 1,
      titleHint: file.name.replace(/\.[^/.]+$/, ''),
    };
  }
}
