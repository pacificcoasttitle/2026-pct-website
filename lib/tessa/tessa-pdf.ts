// ============================================================
// TESSA™ PDF Extraction
// Client-side PDF text extraction using PDF.js.
// Runs entirely in the browser — PDF never sent to storage.
// ============================================================

'use client'

const MAX_CHARS = 50000

export async function extractPdfText(file: File): Promise<string> {
  // Dynamically import pdfjs-dist to keep it client-side only
  const pdfjsLib = await import('pdfjs-dist')

  // Use pdfjsLib.version so the CDN worker always matches the installed package exactly.
  // This prevents the "API version does not match Worker version" error.
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  const totalPages = pdf.numPages

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    let pageText = ''
    for (const item of textContent.items) {
      const chunk = (item as { str?: string; hasEOL?: boolean }).str || ''
      pageText += chunk
      if ((item as { hasEOL?: boolean }).hasEOL) {
        pageText += '\n'
      } else {
        pageText += ' '
      }
    }

    // Heuristic: force a newline before "NN. " bullets if they got flattened by the PDF
    pageText = pageText.replace(/(\s{2,})(\d{1,3})\.\s/g, '\n$2. ')
    fullText += pageText + '\n\n'
  }

  const trimmed = fullText.trim()

  if (trimmed.length < 100) {
    throw new Error(
      'Unable to extract sufficient text from PDF. The document may be image-based or corrupted.'
    )
  }

  return trimmed.length > MAX_CHARS ? trimmed.substring(0, MAX_CHARS) : trimmed
}
