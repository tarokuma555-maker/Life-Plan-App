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
  SCENARIO_COLORS,
} from '@/types';

const STORAGE_KEY = 'life-plan-app-data';

const defaultState: AppState = {
  persons: [],
  lifeEvents: [],
  skills: [],
  scenarios: [],
  memos: [],
  activeScenarioIds: [],
};

function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
      const newBlock: CareerBlock = { ...block, id: uuidv4(), scenarioId };
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

    const sampleState: AppState = {
      persons: [
        { id: selfId, name: '山田 太郎', birthYear: 1991, relation: 'self' },
        { id: spouseId, name: '山田 花子', birthYear: 1993, relation: 'spouse' },
        { id: childId, name: '山田 一郎', birthYear: 2021, relation: 'child' },
      ],
      lifeEvents: [
        { id: uuidv4(), personId: selfId, age: 30, title: '結婚', cost: 300, category: 'family', isExpense: true },
        { id: uuidv4(), personId: childId, age: 6, title: '小学校入学', cost: 0, category: 'education', isExpense: true },
        { id: uuidv4(), personId: childId, age: 12, title: '中学校入学', cost: 0, category: 'education', isExpense: true },
        { id: uuidv4(), personId: childId, age: 15, title: '高校入学', cost: 150, category: 'education', isExpense: true },
        { id: uuidv4(), personId: childId, age: 18, title: '大学入学', cost: 500, category: 'education', isExpense: true },
        { id: uuidv4(), personId: selfId, age: 35, title: '住宅購入', cost: 3500, category: 'housing', isExpense: true },
        { id: uuidv4(), personId: selfId, age: 65, title: '退職', cost: 0, category: 'retirement', isExpense: false },
      ],
      skills: [
        { id: uuidv4(), personId: selfId, name: 'MBA取得', targetAge: 37, cost: 300, note: 'キャリアアップのため' },
        { id: uuidv4(), personId: selfId, name: 'PMP資格', targetAge: 33, cost: 30, note: 'マネジメント力強化' },
      ],
      scenarios: [
        {
          id: scenario1Id,
          name: '現職継続',
          color: SCENARIO_COLORS[0],
          careerBlocks: [
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 22, endAge: 30, company: 'A社', position: '営業', annualIncome: 400, color: '#60A5FA' },
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 30, endAge: 45, company: 'A社', position: 'マネージャー', annualIncome: 600, color: '#3B82F6' },
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 45, endAge: 60, company: 'A社', position: '部長', annualIncome: 800, color: '#2563EB' },
            { id: uuidv4(), scenarioId: scenario1Id, personId: selfId, startAge: 60, endAge: 65, company: 'A社', position: '顧問', annualIncome: 500, color: '#1D4ED8' },
          ],
        },
        {
          id: scenario2Id,
          name: '35歳で転職',
          color: SCENARIO_COLORS[1],
          careerBlocks: [
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 22, endAge: 30, company: 'A社', position: '営業', annualIncome: 400, color: '#FCA5A5' },
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 30, endAge: 35, company: 'A社', position: 'マネージャー', annualIncome: 600, color: '#F87171' },
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 35, endAge: 50, company: 'B社', position: 'PM', annualIncome: 900, color: '#EF4444' },
            { id: uuidv4(), scenarioId: scenario2Id, personId: selfId, startAge: 50, endAge: 65, company: 'B社', position: '事業部長', annualIncome: 1100, color: '#DC2626' },
          ],
        },
      ],
      memos: [
        { id: uuidv4(), personId: selfId, age: 35, content: 'この時期に転職を検討。住宅ローンとの兼ね合いに注意。', createdAt: new Date().toISOString() },
        { id: uuidv4(), personId: selfId, age: 48, content: '子供の大学進学と重なるため、収入安定が重要。', createdAt: new Date().toISOString() },
      ],
      activeScenarioIds: [scenario1Id, scenario2Id],
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
    resetAll,
    loadSampleData,
  };
}
