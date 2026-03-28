export interface Person {
  id: string;
  name: string;
  birthYear: number;
  relation: 'self' | 'spouse' | 'child' | 'other';
}

export type WorkStyle = 'employee' | 'freelance' | 'corporate_owner';

export interface CareerBlock {
  id: string;
  scenarioId: string;
  personId: string;
  startAge: number;
  endAge: number;
  company: string;
  position: string;
  annualIncome: number;
  color: string;
  workStyle: WorkStyle;
  businessExpenseRate?: number;
  corporateRevenue?: number;
  officerSalary?: number;
}

export interface LifeEvent {
  id: string;
  personId: string;
  age: number;
  title: string;
  cost: number;
  category: LifeEventCategory;
  majorCategory: MajorCategory;
  isExpense: boolean;
}

export type LifeEventCategory =
  | 'education'
  | 'career'
  | 'housing'
  | 'family'
  | 'retirement'
  | 'marriage'
  | 'pregnancy_birth'
  | 'health_medical'
  | 'vehicle'
  | 'ceremony'
  | 'inheritance'
  | 'international'
  | 'hobby'
  | 'ending'
  | 'legal'
  | 'insurance_event'
  | 'investment_event'
  | 'other';

export type RecurringExpenseCategory =
  | 'rent'
  | 'childcare'
  | 'insurance'
  | 'living'
  | 'business'
  | 'health'
  | 'vehicle'
  | 'beauty'
  | 'hobby'
  | 'digital_it'
  | 'pension_savings'
  | 'subscription'
  | 'network'
  | 'other';

export type MajorCategory =
  | 'income_career'
  | 'expenses_living'
  | 'housing'
  | 'marriage_partnership'
  | 'pregnancy_birth'
  | 'childcare_education'
  | 'social_insurance'
  | 'tax'
  | 'insurance'
  | 'investment'
  | 'debt'
  | 'health_medical'
  | 'workstyle'
  | 'skills'
  | 'network'
  | 'parents'
  | 'ceremonies'
  | 'legal'
  | 'inheritance'
  | 'vehicle'
  | 'beauty'
  | 'digital_it'
  | 'business_risk'
  | 'legal_trouble'
  | 'international'
  | 'risk_emergency'
  | 'retirement'
  | 'hobby'
  | 'values'
  | 'gender_diversity'
  | 'macro'
  | 'time_management'
  | 'life_events'
  | 'ending';

export interface Skill {
  id: string;
  personId: string;
  name: string;
  targetAge: number;
  cost: number;
  note: string;
}

export interface Scenario {
  id: string;
  name: string;
  color: string;
  careerBlocks: CareerBlock[];
}

export interface Memo {
  id: string;
  personId: string;
  age: number;
  content: string;
  createdAt: string;
  majorCategory?: MajorCategory;
}

export interface HousingLoan {
  id: string;
  personId: string;
  name: string;
  purchaseAge: number;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
}

export interface RecurringExpense {
  id: string;
  personId: string;
  name: string;
  startAge: number;
  endAge: number;
  annualCost: number;
  category: RecurringExpenseCategory;
  majorCategory: MajorCategory;
}

export interface MacroAssumptions {
  inflationRate: number;
  investmentReturn: number;
  pensionStartAge: number;
  wageGrowthRate: number;
  lifeExpectancy: number;
}

export interface InvestmentAccount {
  id: string;
  personId: string;
  name: string;
  type: 'ideco' | 'nisa' | 'savings' | 'corporate_pension' | 'other';
  monthlyContribution: number;
  startAge: number;
  endAge: number;
  expectedReturn: number;
}

export interface AppState {
  persons: Person[];
  lifeEvents: LifeEvent[];
  skills: Skill[];
  scenarios: Scenario[];
  memos: Memo[];
  housingLoans: HousingLoan[];
  recurringExpenses: RecurringExpense[];
  investmentAccounts: InvestmentAccount[];
  macroAssumptions: MacroAssumptions;
  activeScenarioIds: string[];
  manualCheckmarks: Record<string, boolean>;
}

// ===== Constants =====

export const LIFE_EVENT_CATEGORIES: Record<LifeEventCategory, { label: string; color: string }> = {
  education: { label: '教育', color: '#3B82F6' },
  career: { label: 'キャリア', color: '#10B981' },
  housing: { label: '住宅', color: '#F59E0B' },
  family: { label: '家族', color: '#EC4899' },
  retirement: { label: '退職・老後', color: '#8B5CF6' },
  marriage: { label: '結婚', color: '#F472B6' },
  pregnancy_birth: { label: '妊娠・出産', color: '#FB7185' },
  health_medical: { label: '健康・医療', color: '#14B8A6' },
  vehicle: { label: '車・移動', color: '#F97316' },
  ceremony: { label: '冠婚葬祭', color: '#A855F7' },
  inheritance: { label: '相続・贈与', color: '#6366F1' },
  international: { label: '国際', color: '#0EA5E9' },
  hobby: { label: '趣味・自己実現', color: '#84CC16' },
  ending: { label: 'エンディング', color: '#78716C' },
  legal: { label: '法的手続き', color: '#64748B' },
  insurance_event: { label: '保険', color: '#D946EF' },
  investment_event: { label: '資産運用', color: '#0D9488' },
  other: { label: 'その他', color: '#6B7280' },
};

export const RECURRING_EXPENSE_CATEGORIES: Record<RecurringExpenseCategory, { label: string; color: string }> = {
  rent: { label: '家賃', color: '#F59E0B' },
  childcare: { label: '子育て', color: '#EC4899' },
  insurance: { label: '保険', color: '#8B5CF6' },
  living: { label: '生活費', color: '#6B7280' },
  business: { label: '事業経費', color: '#10B981' },
  health: { label: '健康・医療', color: '#14B8A6' },
  vehicle: { label: '車・移動', color: '#F97316' },
  beauty: { label: '美容', color: '#F472B6' },
  hobby: { label: '趣味', color: '#84CC16' },
  digital_it: { label: 'デジタル/IT', color: '#0EA5E9' },
  pension_savings: { label: '年金・貯蓄', color: '#6366F1' },
  subscription: { label: 'サブスク', color: '#A855F7' },
  network: { label: '人脈・交際', color: '#D946EF' },
  other: { label: 'その他', color: '#9CA3AF' },
};

export const MAJOR_CATEGORIES: Record<MajorCategory, { number: number; label: string; icon: string }> = {
  income_career: { number: 1, label: '収入・キャリア', icon: '💼' },
  expenses_living: { number: 2, label: '支出・生活費', icon: '🛒' },
  housing: { number: 3, label: '住宅計画', icon: '🏠' },
  marriage_partnership: { number: 4, label: '結婚・パートナー', icon: '💍' },
  pregnancy_birth: { number: 5, label: '妊娠・出産', icon: '👶' },
  childcare_education: { number: 6, label: '子育て・教育費', icon: '📚' },
  social_insurance: { number: 7, label: '社会保険・年金', icon: '🏥' },
  tax: { number: 8, label: '税金・節税', icon: '📊' },
  insurance: { number: 9, label: '保険', icon: '🛡️' },
  investment: { number: 10, label: '資産運用・貯蓄', icon: '📈' },
  debt: { number: 11, label: '借入・債務', icon: '💳' },
  health_medical: { number: 12, label: '健康・医療', icon: '🩺' },
  workstyle: { number: 13, label: '働き方・時間設計', icon: '⏰' },
  skills: { number: 14, label: 'スキル・学び直し', icon: '🎓' },
  network: { number: 15, label: '人間関係・ネットワーク', icon: '🤝' },
  parents: { number: 16, label: '親・親族関連', icon: '👨‍👩‍👧' },
  ceremonies: { number: 17, label: '冠婚葬祭', icon: '🎊' },
  legal: { number: 18, label: '法的・制度的な備え', icon: '⚖️' },
  inheritance: { number: 19, label: '相続・贈与', icon: '📜' },
  vehicle: { number: 20, label: '車・移動手段', icon: '🚗' },
  beauty: { number: 21, label: '美容・身だしなみ', icon: '✨' },
  digital_it: { number: 22, label: 'デジタル・IT資産', icon: '💻' },
  business_risk: { number: 23, label: '事業リスク管理', icon: '⚠️' },
  legal_trouble: { number: 24, label: '訴訟・法的トラブル', icon: '🔨' },
  international: { number: 25, label: '国際的な要素', icon: '🌍' },
  risk_emergency: { number: 26, label: 'リスク・緊急時', icon: '🚨' },
  retirement: { number: 27, label: '老後・リタイアメント', icon: '🏖️' },
  hobby: { number: 28, label: '趣味・自己実現', icon: '🎨' },
  values: { number: 29, label: '心理・価値観', icon: '💭' },
  gender_diversity: { number: 30, label: 'ジェンダー・多様性', icon: '🌈' },
  macro: { number: 31, label: 'マクロ環境', icon: '🌐' },
  time_management: { number: 32, label: '時間軸管理', icon: '📅' },
  life_events: { number: 33, label: 'ライフイベント', icon: '📌' },
  ending: { number: 34, label: 'エンディング', icon: '🕊️' },
};

export const WORK_STYLE_LABELS: Record<WorkStyle, { label: string; color: string; description: string }> = {
  employee: { label: '会社員', color: '#3B82F6', description: '厚生年金・健康保険加入' },
  freelance: { label: 'フリーランス', color: '#F59E0B', description: '国民年金・国民健康保険' },
  corporate_owner: { label: '法人経営者', color: '#10B981', description: '役員報酬・法人税' },
};

export const SCENARIO_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
];

export const INVESTMENT_TYPES: Record<InvestmentAccount['type'], { label: string; maxMonthly: number; description: string }> = {
  nisa: { label: '新NISA', maxMonthly: 30, description: '年360万円（つみたて+成長）' },
  ideco: { label: 'iDeCo', maxMonthly: 6.8, description: '全額所得控除' },
  savings: { label: '預貯金', maxMonthly: 999, description: '元本保証' },
  corporate_pension: { label: '企業年金（DC）', maxMonthly: 5.5, description: '企業型確定拠出年金' },
  other: { label: 'その他投資', maxMonthly: 999, description: '株式・不動産等' },
};

export const DEFAULT_MACRO: MacroAssumptions = {
  inflationRate: 1.0,
  investmentReturn: 3.0,
  pensionStartAge: 65,
  wageGrowthRate: 0.5,
  lifeExpectancy: 90,
};

export const CHILDCARE_PRESETS = {
  nursery: { name: '保育園（0〜5歳）', startAge: 0, endAge: 5, annualCost: 36 },
  elementary: { name: '小学校', startAge: 6, endAge: 11, annualCost: 32 },
  juniorHigh: { name: '中学校', startAge: 12, endAge: 14, annualCost: 48 },
  highSchool: { name: '高校', startAge: 15, endAge: 17, annualCost: 51 },
  universityPublic: { name: '大学（国公立）', startAge: 18, endAge: 21, annualCost: 115 },
  universityPrivate: { name: '大学（私立文系）', startAge: 18, endAge: 21, annualCost: 152 },
  universityPrivateSci: { name: '大学（私立理系）', startAge: 18, endAge: 21, annualCost: 183 },
};
