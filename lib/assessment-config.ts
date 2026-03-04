// ============================================================
// PCT Tool Competency Assessment — Client-Facing Questions
// Setup-related questions excluded (clients don't configure tools)
// ============================================================

export interface AssessmentQuestion {
  key: string
  text: string
}

export interface AssessmentSection {
  key: string
  label: string
  questions: AssessmentQuestion[]
}

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    key: 'title-profile',
    label: 'Title Profile',
    questions: [
      { key: 'q1', text: 'Do you know how to access Title Profile?' },
      { key: 'q2', text: 'Can you run property profiles?' },
      { key: 'q3', text: 'Can you explain profile sections to a client?' },
      { key: 'q4', text: 'Can you search by APN, owner, or address?' },
    ],
  },
  {
    key: 'title-toolbox',
    label: 'Title Toolbox',
    questions: [
      { key: 'q1', text: 'Do you know how to log in and access the Title Toolbox?' },
      { key: 'q2', text: 'Do you know how to create a client farm?' },
      { key: 'q3', text: 'Can you create farm lists?' },
      { key: 'q4', text: 'Can you build targeted lists (NOD, equity, absentee, etc.)?' },
      { key: 'q5', text: 'Can you export lists?' },
    ],
  },
  {
    key: 'pacific-agent-one',
    label: 'Pacific Agent ONE',
    questions: [
      { key: 'q1', text: 'Do you know how to access and install the app?' },
      { key: 'q2', text: 'Do you know how to add clients into the app?' },
      { key: 'q3', text: 'Can you generate seller net sheets and buyer estimates?' },
      { key: 'q4', text: 'Can you share branded live net sheets with clients?' },
    ],
  },
  {
    key: 'pct-smart-direct',
    label: 'PCT Smart Direct',
    questions: [
      { key: 'q1', text: 'Do you know how to access Smart Direct?' },
      { key: 'q2', text: 'Can you create mailing lists?' },
      { key: 'q3', text: 'Can you generate postcards?' },
      { key: 'q4', text: 'Can you filter properly (distress, equity, absentee, etc.)?' },
    ],
  },
  {
    key: 'pct-website',
    label: 'PCT Website',
    questions: [
      { key: 'q1', text: 'Do you know how to navigate the PCT website?' },
      { key: 'q2', text: 'Can you find all available resources on the site?' },
      { key: 'q3', text: 'Can you guide clients through the site?' },
    ],
  },
  {
    key: 'trainings',
    label: 'Trainings Offered by PCT',
    questions: [
      { key: 'q1', text: 'Do you know what trainings are available?' },
      { key: 'q2', text: 'Do you know how to access training schedules?' },
      { key: 'q3', text: 'Do you know how to enroll in trainings?' },
      { key: 'q4', text: 'Do you know how to leverage training content?' },
    ],
  },
  {
    key: 'sales-dashboard',
    label: 'Sales Dashboard',
    questions: [
      { key: 'q1', text: 'Do you know how to access the PCT Sales Dashboard?' },
      { key: 'q2', text: 'Do you know how to read your numbers?' },
      { key: 'q3', text: 'Are you checking weekly? (Sales Units, Refi Units, Revenue, Pipeline, Assigned Accounts, Activity Metrics)' },
      { key: 'q4', text: 'Do you know how to track personal goals, monthly targets, year-over-year comparison, and daily activity requirements?' },
    ],
  },
]

/** Total yes/no questions across all sections */
export const TOTAL_QUESTIONS = ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0)

/** Confidence rating categories for each tool */
export const CONFIDENCE_CATEGORIES = [
  { key: 'awareness',    label: 'Awareness',          desc: 'General knowledge of the tool' },
  { key: 'access',       label: 'Know How to Access',  desc: 'Can log in and navigate to the tool' },
  { key: 'setup',        label: 'Know How to Setup',   desc: 'Can configure the tool for use' },
  { key: 'usage',        label: 'Usage',               desc: 'Proficiency in day-to-day use' },
  { key: 'needTraining', label: 'Need Training',       desc: 'Self-assessed need for additional training' },
] as const

export const CONFIDENCE_SCALE = [
  { value: 1, label: 'No Knowledge' },
  { value: 2, label: 'Basic Awareness' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Proficient' },
  { value: 5, label: 'Expert Level' },
] as const
