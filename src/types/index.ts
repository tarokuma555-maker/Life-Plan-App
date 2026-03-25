export interface Person {
  id: string;
  name: string;
  birthYear: number;
  relation: 'self' | 'spouse' | 'child' | 'other';
}

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
}

export interface LifeEvent {
  id: string;
  personId: string;
  age: number;
  title: string;
  cost: number;
  category: LifeEventCategory;
  isExpense: boolean;
}

export type LifeEventCategory =
  | 'education'
  | 'career'
  | 'housing'
  | 'family'
  | 'retirement'
  | 'other';

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
}

export interface AppState {
  persons: Person[];
  lifeEvents: LifeEvent[];
  skills: Skill[];
  scenarios: Scenario[];
  memos: Memo[];
  activeScenarioIds: string[];
}

export const LIFE_EVENT_CATEGORIES: Record<LifeEventCategory, { label: string; color: string }> = {
  education: { label: '教育', color: '#3B82F6' },
  career: { label: 'キャリア', color: '#10B981' },
  housing: { label: '住宅', color: '#F59E0B' },
  family: { label: '家族', color: '#EC4899' },
  retirement: { label: '退職・老後', color: '#8B5CF6' },
  other: { label: 'その他', color: '#6B7280' },
};

export const SCENARIO_COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
];
