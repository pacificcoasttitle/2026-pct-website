export const ASSESSMENT_SECTIONS = [
  { key: 'title-profile', label: 'Title Profile', questions: 5 },
  { key: 'title-toolbox', label: 'Title Toolbox', questions: 6 },
  { key: 'pacific-agent-one', label: 'Pacific Agent One', questions: 5 },
  { key: 'pct-smart-direct', label: 'PCT Smart Direct', questions: 5 },
  { key: 'pct-website', label: 'PCT Website', questions: 4 },
  { key: 'trainings', label: 'Trainings', questions: 4 },
  { key: 'sales-dashboard', label: 'Sales Dashboard', questions: 4 },
] as const

export type AssessmentSectionKey = (typeof ASSESSMENT_SECTIONS)[number]['key']

