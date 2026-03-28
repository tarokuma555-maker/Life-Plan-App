'use client';

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  AppState,
  Person,
  CareerBlock,
  LifeEvent,
  Skill,
  Scenario,
  Memo,
  HousingLoan,
  RecurringExpense,
  InvestmentAccount,
  MacroAssumptions,
  DEFAULT_MACRO,
  SCENARIO_COLORS,
} from '@/types';

const STORAGE_KEY = 'life-plan-app-data';

const defaultState: AppState = {
  persons: [],
  lifeEvents: [],
  skills: [],
  scenarios: [],
  memos: [],
  housingLoans: [],
  recurringExpenses: [],
  investmentAccounts: [],
  macroAssumptions: { ...DEFAULT_MACRO },
  activeScenarioIds: [],
  manualCheckmarks: {},
};

function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        housingLoans: parsed.housingLoans || [],
        recurringExpenses: parsed.recurringExpenses || [],
        investmentAccounts: parsed.investmentAccounts || [],
        macroAssumptions: parsed.macroAssumptions || { ...DEFAULT_MACRO },
        manualCheckmarks: parsed.manualCheckmarks || {},
      };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(loadState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  // Persons
  const addPerson = useCallback((person: Omit<Person, 'id'>) => {
    setState((s) => ({ ...s, persons: [...s.persons, { ...person, id: uuidv4() }] }));
  }, []);

  const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
    setState((s) => ({
      ...s,
      persons: s.persons.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const removePerson = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      persons: s.persons.filter((p) => p.id !== id),
      lifeEvents: s.lifeEvents.filter((e) => e.personId !== id),
      skills: s.skills.filter((sk) => sk.personId !== id),
      memos: s.memos.filter((m) => m.personId !== id),
      housingLoans: s.housingLoans.filter((h) => h.personId !== id),
      recurringExpenses: s.recurringExpenses.filter((r) => r.personId !== id),
      investmentAccounts: s.investmentAccounts.filter((ia) => ia.personId !== id),
      scenarios: s.scenarios.map((sc) => ({
        ...sc,
        careerBlocks: sc.careerBlocks.filter((cb) => cb.personId !== id),
      })),
    }));
  }, []);

  // Scenarios
  const addScenario = useCallback((name: string) => {
    const id = uuidv4();
    setState((s) => ({
      ...s,
      scenarios: [
        ...s.scenarios,
        {
          id,
          name,
          color: SCENARIO_COLORS[s.scenarios.length % SCENARIO_COLORS.length],
          careerBlocks: [],
        },
      ],
      activeScenarioIds: [...s.activeScenarioIds, id],
    }));
    return id;
  }, []);

  const removeScenario = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.filter((sc) => sc.id !== id),
      activeScenarioIds: s.activeScenarioIds.filter((sid) => sid !== id),
    }));
  }, []);

  const toggleScenarioActive = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      activeScenarioIds: s.activeScenarioIds.includes(id)
        ? s.activeScenarioIds.filter((sid) => sid !== id)
        : [...s.activeScenarioIds, id],
    }));
  }, []);

  // Career Blocks
  const addCareerBlock = useCallback(
    (scenarioId: string, block: Omit<CareerBlock, 'id' | 'scenarioId'>) => {
      const newBlock: CareerBlock = {
        ...block,
        id: uuidv4(),
        scenarioId,
        workStyle: block.workStyle || 'employee',
      };
      setState((s) => ({
        ...s,
        scenarios: s.scenarios.map((sc) =>
          sc.id === scenarioId
            ? { ...sc, careerBlocks: [...sc.careerBlocks, newBlock] }
            : sc
        ),
      }));
    },
    []
  );

  const updateCareerBlock = useCallback(
    (scenarioId: string, blockId: string, updates: Partial<CareerBlock>) => {
      setState((s) => ({
        ...s,
        scenarios: s.scenarios.map((sc) =>
          sc.id === scenarioId
            ? {
                ...sc,
                careerBlocks: sc.careerBlocks.map((cb) =>
                  cb.id === blockId ? { ...cb, ...updates } : cb
                ),
              }
            : sc
        ),
      }));
    },
    []
  );

  const removeCareerBlock = useCallback((scenarioId: string, blockId: string) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.map((sc) =>
        sc.id === scenarioId
          ? { ...sc, careerBlocks: sc.careerBlocks.filter((cb) => cb.id !== blockId) }
          : sc
      ),
    }));
  }, []);

  // Life Events
  const addLifeEvent = useCallback((event: Omit<LifeEvent, 'id'>) => {
    setState((s) => ({
      ...s,
      lifeEvents: [...s.lifeEvents, { ...event, id: uuidv4() }],
    }));
  }, []);

  const updateLifeEvent = useCallback((id: string, updates: Partial<LifeEvent>) => {
    setState((s) => ({
      ...s,
      lifeEvents: s.lifeEvents.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const removeLifeEvent = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      lifeEvents: s.lifeEvents.filter((e) => e.id !== id),
    }));
  }, []);

  // Skills
  const addSkill = useCallback((skill: Omit<Skill, 'id'>) => {
    setState((s) => ({
      ...s,
      skills: [...s.skills, { ...skill, id: uuidv4() }],
    }));
  }, []);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setState((s) => ({
      ...s,
      skills: s.skills.map((sk) => (sk.id === id ? { ...sk, ...updates } : sk)),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      skills: s.skills.filter((sk) => sk.id !== id),
    }));
  }, []);

  // Memos
  const addMemo = useCallback((memo: Omit<Memo, 'id' | 'createdAt'>) => {
    setState((s) => ({
      ...s,
      memos: [
        ...s.memos,
        { ...memo, id: uuidv4(), createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const updateMemo = useCallback((id: string, content: string) => {
    setState((s) => ({
      ...s,
      memos: s.memos.map((m) => (m.id === id ? { ...m, content } : m)),
    }));
  }, []);

  const removeMemo = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      memos: s.memos.filter((m) => m.id !== id),
    }));
  }, []);

  // Housing Loans
  const addHousingLoan = useCallback((loan: Omit<HousingLoan, 'id'>) => {
    setState((s) => ({
      ...s,
      housingLoans: [...s.housingLoans, { ...loan, id: uuidv4() }],
    }));
  }, []);

  const updateHousingLoan = useCallback((id: string, updates: Partial<HousingLoan>) => {
    setState((s) => ({
      ...s,
      housingLoans: s.housingLoans.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  }, []);

  const removeHousingLoan = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      housingLoans: s.housingLoans.filter((h) => h.id !== id),
    }));
  }, []);

  // Recurring Expenses
  const addRecurringExpense = useCallback((expense: Omit<RecurringExpense, 'id'>) => {
    setState((s) => ({
      ...s,
      recurringExpenses: [...s.recurringExpenses, { ...expense, id: uuidv4() }],
    }));
  }, []);

  const updateRecurringExpense = useCallback((id: string, updates: Partial<RecurringExpense>) => {
    setState((s) => ({
      ...s,
      recurringExpenses: s.recurringExpenses.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, []);

  const removeRecurringExpense = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recurringExpenses: s.recurringExpenses.filter((r) => r.id !== id),
    }));
  }, []);

  // Investment Accounts
  const addInvestmentAccount = useCallback((account: Omit<InvestmentAccount, 'id'>) => {
    setState((s) => ({
      ...s,
      investmentAccounts: [...s.investmentAccounts, { ...account, id: uuidv4() }],
    }));
  }, []);

  const updateInvestmentAccount = useCallback((id: string, updates: Partial<InvestmentAccount>) => {
    setState((s) => ({
      ...s,
      investmentAccounts: s.investmentAccounts.map((ia) => (ia.id === id ? { ...ia, ...updates } : ia)),
    }));
  }, []);

  const removeInvestmentAccount = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      investmentAccounts: s.investmentAccounts.filter((ia) => ia.id !== id),
    }));
  }, []);

  // Macro Assumptions
  const setMacroAssumptions = useCallback((updates: Partial<MacroAssumptions>) => {
    setState((s) => ({
      ...s,
      macroAssumptions: { ...s.macroAssumptions, ...updates },
    }));
  }, []);

  // Manual Checkmarks
  const toggleCheckmark = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      manualCheckmarks: {
        ...s.manualCheckmarks,
        [key]: !s.manualCheckmarks[key],
      },
    }));
  }, []);

  // Reset
  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  // Load sample data
  const loadSampleData = useCallback(() => {
    const selfId = uuidv4();
    const spouseId = uuidv4();
    const childId = uuidv4();
    const scenario1Id = uuidv4();
    const scenario2Id = uuidv4();
    const scenario3Id = uuidv4();

    const sampleState: AppState = {
      persons: [
        { id: selfId, name: '山田 太郎', birthYear: 1991, relation: 'self' },
        { id: spouseId, name: '山田 花子', birthYear: 1993, relation: 'spouse' },
        { id: childId, name: '山田 一郎', birthYear: 2021, relation: 'child' },
      ],
      lifeEvents: [
        { id: uuidv4(), personId: selfId, age: 30, title: '結婚', cost: 300, category: 'marriage', majorCategory: 'marriage_partnership', isExpense: true },
        { id: uuidv4(), personId: childId, age: 6, title: '小学校入学', cost: 0, category: 'education', majorCategory: 'childcare_education', isExpense: true },
        { id: uuidv4(), personId: childId, age: 12, title: '中学校入学', cost: 0, category: 'education', majorCategory: 'childcare_education', isExpense: true },
        { id: uuidv4(), personId: childId, age: 15, title: '高校入学', cost: 150, category: 'education', majorCategory: 'childcare_education', isExpense: true },
        { id: uuidv4(), personId: childId, age: 18, title: '大学入学', cost: 500, category: 'education', majorCategory: 'childcare_education', isExpense: true },
        { id: uuidv4(), personId: selfId, age: 35, title: '住宅購入', cost: 500, category: 'housing', majorCategory: 'housing', isExpense: true },
        { id: uuidv4(), personId: selfId, age: 65, title: '退職', cost: 0, category: 'retirement', majorCategory: 'retirement', isExpense: false },
      ],
      skills: [
        { id: uuidv4(), personId: selfId, name: 'MBA取得', targetAge: 37, cost: 300, note: 'キャリアアップのため' },
        { id: uuidv4(), personId: selfId, name: 'PMP資格', targetAge: 33, cost: 30, note: 'マネジメント力強化' },
      ],
      scenarios: [
        {
          id: scenario1Id,
          name: '現職継続（会社員）',
          color: SCENARIO_COLORS[0],
          careerBlocks: [
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 22, endAge: 30, company: 'A社', position: '営業', annualIncome: 400, color: '#60A5FA', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 30, endAge: 45, company: 'A社', position: 'マネージャー', annualIncome: 600, color: '#3B82F6', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 45, endAge: 60, company: 'A社', position: '部長', annualIncome: 800, color: '#2563EB', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 60, endAge: 65, company: 'A社', position: '顧問', annualIncome: 500, color: '#1D4ED8', workStyle: 'employee' },
          ],
        },
        {
          id: scenario2Id,
          name: '35歳でフリーランス',
          color: SCENARIO_COLORS[1],
          careerBlocks: [
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 22, endAge: 30, company: 'A社', position: '営業', annualIncome: 400, color: '#FCA5A5', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 30, endAge: 35, company: 'A社', position: 'マネージャー', annualIncome: 600, color: '#F87171', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 35, endAge: 50, company: 'フリーランス', position: 'ITコンサル', annualIncome: 1000, color: '#EF4444', workStyle: 'freelance', businessExpenseRate: 30 },
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 50, endAge: 70, company: 'フリーランス', position: 'コンサル（縮小）', annualIncome: 600, color: '#DC2626', workStyle: 'freelance', businessExpenseRate: 25 },
          ],
        },
        {
          id: scenario3Id,
          name: '40歳で法人化',
          color: SCENARIO_COLORS[2],
          careerBlocks: [
            { id: uuidv4(), scenarioId: scenario3Id, personId: selfId, startAge: 22, endAge: 30, company: 'A社', position: '営業', annualIncome: 400, color: '#6EE7B7', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario3Id, personId: selfId, startAge: 30, endAge: 40, company: 'A社', position: 'マネージャー', annualIncome: 600, color: '#34D399', workStyle: 'employee' },
            { id: uuidv4(), scenarioId: scenario3Id, personId: selfId, startAge: 40, endAge: 65, company: '(株)ヤマダコンサル', position: '代表取締役', annualIncome: 700, color: '#10B981', workStyle: 'corporate_owner', corporateRevenue: 2000, officerSalary: 700 },
          ],
        },
      ],
      memos: [
        { id: uuidv4(), personId: selfId, age: 35, content: 'この時期に転職/独立を検討。住宅ローンとの兼ね合いに注意。フリーランスの場合、ローン審査が通りにくくなる。', createdAt: new Date().toISOString() },
        { id: uuidv4(), personId: selfId, age: 48, content: '子供の大学進学と重なるため、収入安定が重要。法人化していれば役員報酬の調整で節税可能。', createdAt: new Date().toISOString() },
      ],
      housingLoans: [
        {
          id: uuidv4(),
          personId: selfId,
          name: '自宅マンション',
          purchaseAge: 35,
          propertyPrice: 4500,
          downPayment: 500,
          loanAmount: 4000,
          interestRate: 0.5,
          loanTermYears: 35,
        },
      ],
      recurringExpenses: [
        { id: uuidv4(), personId: selfId, name: '家賃（賃貸）', startAge: 22, endAge: 34, annualCost: 120, category: 'rent', majorCategory: 'housing' },
        { id: uuidv4(), personId: childId, name: '保育園', startAge: 1, endAge: 5, annualCost: 36, category: 'childcare', majorCategory: 'childcare_education' },
        { id: uuidv4(), personId: childId, name: '小学校（学費+習い事）', startAge: 6, endAge: 11, annualCost: 40, category: 'childcare', majorCategory: 'childcare_education' },
        { id: uuidv4(), personId: childId, name: '中学校', startAge: 12, endAge: 14, annualCost: 48, category: 'childcare', majorCategory: 'childcare_education' },
        { id: uuidv4(), personId: childId, name: '高校', startAge: 15, endAge: 17, annualCost: 51, category: 'childcare', majorCategory: 'childcare_education' },
        { id: uuidv4(), personId: childId, name: '大学（私立文系）', startAge: 18, endAge: 21, annualCost: 152, category: 'childcare', majorCategory: 'childcare_education' },
        { id: uuidv4(), personId: selfId, name: '生命保険', startAge: 30, endAge: 65, annualCost: 24, category: 'insurance', majorCategory: 'insurance' },
        { id: uuidv4(), personId: selfId, name: '生活費（食費・光熱費等）', startAge: 22, endAge: 100, annualCost: 200, category: 'living', majorCategory: 'expenses_living' },
      ],
      investmentAccounts: [
        { id: uuidv4(), personId: selfId, name: '新NISA（つみたて）', type: 'nisa', monthlyContribution: 5, startAge: 22, endAge: 65, expectedReturn: 4.0 },
        { id: uuidv4(), personId: selfId, name: 'iDeCo', type: 'ideco', monthlyContribution: 2.3, startAge: 35, endAge: 65, expectedReturn: 3.0 },
      ],
      macroAssumptions: { ...DEFAULT_MACRO },
      activeScenarioIds: [scenario1Id, scenario2Id, scenario3Id],
      manualCheckmarks: {},
    };

    setState(sampleState);
  }, []);

  return {
    ...state,
    loaded,
    addPerson,
    updatePerson,
    removePerson,
    addScenario,
    removeScenario,
    toggleScenarioActive,
    addCareerBlock,
    updateCareerBlock,
    removeCareerBlock,
    addLifeEvent,
    updateLifeEvent,
    removeLifeEvent,
    addSkill,
    updateSkill,
    removeSkill,
    addMemo,
    updateMemo,
    removeMemo,
    addHousingLoan,
    updateHousingLoan,
    removeHousingLoan,
    addRecurringExpense,
    updateRecurringExpense,
    removeRecurringExpense,
    addInvestmentAccount,
    updateInvestmentAccount,
    removeInvestmentAccount,
    setMacroAssumptions,
    toggleCheckmark,
    resetAll,
    loadSampleData,
  };
}
