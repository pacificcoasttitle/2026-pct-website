/**
 * Asset Delivery piece types — what Marketing actually emails to reps.
 *
 * Cadence:
 *   IG Story      — Wednesdays (PNG/JPG)
 *   Flyer         — Thursdays (PDF)
 *   PDF Calendar  — 1st of the month (PDF)
 *
 * Stored on asset_delivery_batches.lane. File rows use format:
 *   social-story | flyer | calendar
 */

export const PIECE_TYPES = ['ig-story', 'flyer', 'calendar'] as const
export type PieceType = (typeof PIECE_TYPES)[number]

export const PIECE_OPTIONS: Array<{
  value:     PieceType
  label:     string
  schedule:  string
  fileHint:  string
}> = [
  {
    value:    'ig-story',
    label:    'IG Story',
    schedule: 'Wednesdays',
    fileHint: 'PNG or JPG · 1080×1920',
  },
  {
    value:    'flyer',
    label:    'Flyer',
    schedule: 'Thursdays',
    fileHint: 'PDF',
  },
  {
    value:    'calendar',
    label:    'PDF Calendar',
    schedule: '1st of the month',
    fileHint: 'PDF',
  },
]

export const PIECE_LABELS: Record<PieceType, string> = {
  'ig-story': 'IG Story',
  flyer:      'Flyer',
  calendar:   'PDF Calendar',
}

/** Formats stored on asset_delivery_files.format for the current product set. */
export const FILE_FORMATS = ['social-story', 'flyer', 'calendar'] as const
export type FileFormat = (typeof FILE_FORMATS)[number]

export const FILE_FORMAT_LABELS: Record<FileFormat, string> = {
  'social-story': 'IG Story',
  flyer:          'Flyer',
  calendar:       'PDF Calendar',
}

/** Map a batch.lane value (including legacy lanes) to a current piece type. */
export function normalizePieceType(lane: string | null | undefined): PieceType {
  const raw = (lane || '').trim().toLowerCase()
  if (raw === 'ig-story' || raw === 'social' || raw === 'social-story') return 'ig-story'
  if (raw === 'calendar') return 'calendar'
  // flyer + legacy marketing-piece / weekly-email / other / blank
  return 'flyer'
}

export function pieceLabel(lane: string | null | undefined): string {
  return PIECE_LABELS[normalizePieceType(lane)]
}

export function pieceSchedule(lane: string | null | undefined): string {
  const piece = normalizePieceType(lane)
  return PIECE_OPTIONS.find((o) => o.value === piece)?.schedule ?? ''
}

/** Short how-to line for the delivery email body. */
export function pieceTip(lane: string | null | undefined): string {
  switch (normalizePieceType(lane)) {
    case 'ig-story':
      return 'Post to Instagram Stories this week. Sized for 1080×1920.'
    case 'flyer':
      return 'Print or forward the PDF to clients and referral partners.'
    case 'calendar':
      return "Share this month's calendar with your desk and key contacts."
  }
}

/** Human label for a stored file.format (includes legacy values). */
export function fileFormatLabel(format: string | null | undefined): string {
  const raw = (format || '').trim().toLowerCase()
  if (raw === 'social-story' || raw === 'social') return FILE_FORMAT_LABELS['social-story']
  if (raw === 'calendar') return FILE_FORMAT_LABELS.calendar
  if (raw === 'flyer' || raw === 'print' || raw === 'email-insert') return FILE_FORMAT_LABELS.flyer
  return format || 'File'
}

/**
 * Derive the file format from piece type + extension.
 * Returns an error string when the file type doesn't match the piece.
 */
export function deriveFileFormat(
  piece: PieceType,
  ext:   string,
): { ok: true; format: FileFormat } | { ok: false; error: string } {
  const e = ext.toLowerCase()
  const isPdf   = e === 'pdf'
  const isImage = e === 'png' || e === 'jpg' || e === 'jpeg'

  if (piece === 'ig-story') {
    if (!isImage) {
      return { ok: false, error: 'IG Story campaigns need PNG or JPG files (1080×1920).' }
    }
    return { ok: true, format: 'social-story' }
  }

  if (piece === 'flyer') {
    if (!isPdf) {
      return { ok: false, error: 'Flyer campaigns need PDF files.' }
    }
    return { ok: true, format: 'flyer' }
  }

  // calendar
  if (!isPdf) {
    return { ok: false, error: 'PDF Calendar campaigns need PDF files.' }
  }
  return { ok: true, format: 'calendar' }
}
