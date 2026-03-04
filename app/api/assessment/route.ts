import { NextRequest, NextResponse } from 'next/server'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment-config'
import { createAssessment, getEmployeeAdminBySlug, getEmployeeBySmsCode } from '@/lib/admin-db'

type BoolMap = Record<string, boolean>
type NumMap = Record<string, number>

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const respondentName = String(body.respondentName || '').trim()
    const respondentEmail = String(body.respondentEmail || '').trim()
    const respondentPhone = String(body.respondentPhone || '').trim()
    const repCode = String(body.repCode || '').trim()
    const responses = (body.responses || {}) as Record<string, BoolMap>
    const confidenceRatings = (body.confidenceRatings || {}) as Record<string, NumMap>

    if (!respondentName || !respondentEmail) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    let yesCount = 0
    let totalQuestions = 0
    for (const section of ASSESSMENT_SECTIONS) {
      const r = responses[section.key] || {}
      for (const q of section.questions) {
        totalQuestions += 1
        if (r[q.key] === true) yesCount += 1
      }
    }

    let confidenceTotal = 0
    let confidenceCount = 0
    for (const section of ASSESSMENT_SECTIONS) {
      const c = confidenceRatings[section.key] || {}
      for (const key of ['awareness', 'access', 'setup', 'usage', 'needTraining']) {
        const value = Number(c[key])
        if (Number.isFinite(value) && value >= 1 && value <= 5) {
          confidenceTotal += value
          confidenceCount += 1
        }
      }
    }

    const capabilityScore = totalQuestions > 0 ? (yesCount / totalQuestions) * 100 : 0
    const avgConfidence = confidenceCount > 0 ? confidenceTotal / confidenceCount : 0

    let repId: string | undefined
    let repName: string | undefined
    if (repCode) {
      const byCode = await getEmployeeBySmsCode(repCode)
      if (byCode) {
        repId = repCode
        repName = byCode.name
      } else {
        const bySlug = await getEmployeeAdminBySlug(repCode)
        if (bySlug) {
          repId = bySlug.slug
          repName = bySlug.name
        }
      }
    }

    const record = await createAssessment({
      respondent_name: respondentName,
      respondent_email: respondentEmail,
      respondent_phone: respondentPhone || undefined,
      rep_id: repId,
      rep_name: repName,
      source_channel: 'web',
      capability_score: Number(capabilityScore.toFixed(2)),
      avg_confidence_score: Number(avgConfidence.toFixed(2)),
      responses_json: responses,
      confidence_json: confidenceRatings,
      user_agent: req.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      id: record.id,
      capability_score: record.capability_score,
      avg_confidence_score: record.avg_confidence_score,
    })
  } catch (err) {
    console.error('Assessment submit error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

