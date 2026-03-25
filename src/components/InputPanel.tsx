'use client';

import React, { useState } from 'react';
import {
  Person,
  LifeEvent,
  Skill,
  Scenario,
  CareerBlock,
  Memo,
  LifeEventCategory,
  LIFE_EVENT_CATEGORIES,
  SCENARIO_COLORS,
} from '@/types';

interface InputPanelProps {
  persons: Person[];
  scenarios: Scenario[];
  lifeEvents: LifeEvent[];
  skills: Skill[];
  memos: Memo[];
  activeScenarioIds: string[];
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  onRemovePerson: (id: string) => void;
  onAddScenario: (name: string) => string;
  onRemoveScenario: (id: string) => void;
  onToggleScenario: (id: string) => void;
  onAddCareerBlock: (
    scenarioId: string,
    block: Omit<CareerBlock, 'id' | 'scenarioId'>
  ) => void;
  onRemoveCareerBlock: (scenarioId: string, blockId: string) => void;
  onAddLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  onRemoveLifeEvent: (id: string) => void;
  onAddSkill: (skill: Omit<Skill, 'id'>) => void;
  onRemoveSkill: (id: string) => void;
  onAddMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => void;
  onRemoveMemo: (id: string) => void;
  onLoadSample: () => void;
  onResetAll: () => void;
}

type Tab = 'person' | 'career' | 'event' | 'skill' | 'memo';

export default function InputPanel({
  persons,
  scenarios,
  lifeEvents,
  skills,
  memos,
  activeScenarioIds,
  onAddPerson,
  onRemovePerson,
  onAddScenario,
  onRemoveScenario,
  onToggleScenario,
  onAddCareerBlock,
  onRemoveCareerBlock,
  onAddLifeEvent,
  onRemoveLifeEvent,
  onAddSkill,
  onRemoveSkill,
  onAddMemo,
  onRemoveMemo,
  onLoadSample,
  onResetAll,
}: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('person');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'person', label: '家族' },
    { key: 'career', label: 'キャリア' },
    { key: 'event', label: 'イベント' },
    { key: 'skill', label: '資格' },
    { key: 'memo', label: 'メモ' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'person' && (
          <PersonForm
            persons={persons}
            onAdd={onAddPerson}
            onRemove={onRemovePerson}
          />
        )}
        {activeTab === 'career' && (
          <CareerForm
            persons={persons}
            scenarios={scenarios}
            activeScenarioIds={activeScenarioIds}
            onAddScenario={onAddScenario}
            onRemoveScenario={onRemoveScenario}
            onToggleScenario={onToggleScenario}
            onAddCareerBlock={onAddCareerBlock}
            onRemoveCareerBlock={onRemoveCareerBlock}
          />
        )}
        {activeTab === 'event' && (
          <EventForm
            persons={persons}
            lifeEvents={lifeEvents}
            onAdd={onAddLifeEvent}
            onRemove={onRemoveLifeEvent}
          />
        )}
        {activeTab === 'skill' && (
          <SkillForm
            persons={persons}
            skills={skills}
            onAdd={onAddSkill}
            onRemove={onRemoveSkill}
          />
        )}
        {activeTab === 'memo' && (
          <MemoForm
            persons={persons}
            memos={memos}
            onAdd={onAddMemo}
            onRemove={onRemoveMemo}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t p-4 flex gap-2">
        <button
          onClick={onLoadSample}
          className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          サンプルデータ
        </button>
        <button
          onClick={onResetAll}
          className="flex-1 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  );
}

// ---- Sub-forms ----

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1';
const btnPrimary =
  'w-full py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors';
const btnDanger =
  'text-xs text-red-400 hover:text-red-600 transition-colors';

function PersonForm({
  persons,
  onAdd,
  onRemove,
}: {
  persons: Person[];
  onAdd: (p: Omit<Person, 'id'>) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1990);
  const [relation, setRelation] = useState<Person['relation']>('self');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), birthYear, relation });
    setName('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>名前</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
          />
        </div>
        <div>
          <label className={labelClass}>生年</label>
          <input
            className={inputClass}
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>続柄</label>
        <select
          className={inputClass}
          value={relation}
          onChange={(e) => setRelation(e.target.value as Person['relation'])}
        >
          <option value="self">本人</option>
          <option value="spouse">配偶者</option>
          <option value="child">子供</option>
          <option value="other">その他</option>
        </select>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>
        追加
      </button>

      {/* List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {persons.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
          >
            <div>
              <span className="text-sm font-medium">{p.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                {p.birthYear}年生（{new Date().getFullYear() - p.birthYear}歳）
              </span>
            </div>
            <button onClick={() => onRemove(p.id)} className={btnDanger}>
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CareerForm({
  persons,
  scenarios,
  activeScenarioIds,
  onAddScenario,
  onRemoveScenario,
  onToggleScenario,
  onAddCareerBlock,
  onRemoveCareerBlock,
}: {
  persons: Person[];
  scenarios: Scenario[];
  activeScenarioIds: string[];
  onAddScenario: (name: string) => string;
  onRemoveScenario: (id: string) => void;
  onToggleScenario: (id: string) => void;
  onAddCareerBlock: (
    scenarioId: string,
    block: Omit<CareerBlock, 'id' | 'scenarioId'>
  ) => void;
  onRemoveCareerBlock: (scenarioId: string, blockId: string) => void;
}) {
  const [scenarioName, setScenarioName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(35);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [income, setIncome] = useState(400);

  const handleAddScenario = () => {
    if (!scenarioName.trim()) return;
    const id = onAddScenario(scenarioName.trim());
    setSelectedScenario(id);
    setScenarioName('');
  };

  const handleAddBlock = () => {
    if (!selectedScenario || !company.trim()) return;
    const scenario = scenarios.find((s) => s.id === selectedScenario);
    onAddCareerBlock(selectedScenario, {
      personId: personId || persons[0]?.id,
      startAge,
      endAge,
      company: company.trim(),
      position: position.trim(),
      annualIncome: income,
      color: scenario?.color || '#3B82F6',
    });
    setCompany('');
    setPosition('');
  };

  return (
    <div className="space-y-4">
      {/* Scenario management */}
      <div>
        <label className={labelClass}>シナリオ追加</label>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="現職継続 / 転職 など"
          />
          <button
            onClick={handleAddScenario}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
          >
            追加
          </button>
        </div>
      </div>

      {/* Scenario list */}
      <div className="space-y-1">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
          >
            <input
              type="checkbox"
              checked={activeScenarioIds.includes(sc.id)}
              onChange={() => onToggleScenario(sc.id)}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: sc.color }}
            />
            <span className="text-sm flex-1">{sc.name}</span>
            <span className="text-xs text-gray-400">
              {sc.careerBlocks.length}ブロック
            </span>
            <button
              onClick={() => onRemoveScenario(sc.id)}
              className={btnDanger}
            >
              削除
            </button>
          </div>
        ))}
      </div>

      {/* Add career block */}
      {scenarios.length > 0 && (
        <div className="border-t pt-4">
          <label className={labelClass}>キャリアブロック追加</label>
          <div className="space-y-2">
            <select
              className={inputClass}
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
            >
              <option value="">シナリオを選択</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>開始年齢</label>
                <input
                  className={inputClass}
                  type="number"
                  value={startAge}
                  onChange={(e) => setStartAge(Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>終了年齢</label>
                <input
                  className={inputClass}
                  type="number"
                  value={endAge}
                  onChange={(e) => setEndAge(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>会社名</label>
                <input
                  className={inputClass}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="A社"
                />
              </div>
              <div>
                <label className={labelClass}>役職</label>
                <input
                  className={inputClass}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="営業"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>年収（万円）</label>
              <input
                className={inputClass}
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
              />
            </div>
            <button onClick={handleAddBlock} className={btnPrimary}>
              ブロック追加
            </button>
          </div>

          {/* Block list per scenario */}
          {scenarios.map(
            (sc) =>
              sc.careerBlocks.length > 0 && (
                <div key={sc.id} className="mt-3">
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: sc.color }}
                  >
                    {sc.name}
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {sc.careerBlocks.map((cb) => (
                      <div
                        key={cb.id}
                        className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
                      >
                        <span className="text-xs">
                          {cb.startAge}〜{cb.endAge}歳 {cb.company}/{cb.position}{' '}
                          {cb.annualIncome}万
                        </span>
                        <button
                          onClick={() => onRemoveCareerBlock(sc.id, cb.id)}
                          className={btnDanger}
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}

function EventForm({
  persons,
  lifeEvents,
  onAdd,
  onRemove,
}: {
  persons: Person[];
  lifeEvents: LifeEvent[];
  onAdd: (e: Omit<LifeEvent, 'id'>) => void;
  onRemove: (id: string) => void;
}) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [age, setAge] = useState(30);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(0);
  const [category, setCategory] = useState<LifeEventCategory>('family');
  const [isExpense, setIsExpense] = useState(true);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      personId: personId || persons[0]?.id,
      age,
      title: title.trim(),
      cost,
      category,
      isExpense,
    });
    setTitle('');
    setCost(0);
  };

  return (
    <div className="space-y-4">
      <select
        className={inputClass}
        value={personId}
        onChange={(e) => setPersonId(e.target.value)}
      >
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>年齢</label>
          <input
            className={inputClass}
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>カテゴリ</label>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as LifeEventCategory)}
          >
            {Object.entries(LIFE_EVENT_CATEGORIES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>イベント名</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="結婚 / 住宅購入 など"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>費用（万円）</label>
          <input
            className={inputClass}
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>種別</label>
          <select
            className={inputClass}
            value={isExpense ? 'expense' : 'income'}
            onChange={(e) => setIsExpense(e.target.value === 'expense')}
          >
            <option value="expense">支出</option>
            <option value="income">収入</option>
          </select>
        </div>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>
        追加
      </button>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {lifeEvents.map((e) => {
          const person = persons.find((p) => p.id === e.personId);
          const cat = LIFE_EVENT_CATEGORIES[e.category];
          return (
            <div
              key={e.id}
              className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs">
                  {person?.name} {e.age}歳: {e.title}
                  {e.cost > 0 && (
                    <span className="text-gray-500 ml-1">
                      {e.isExpense ? '-' : '+'}
                      {e.cost}万
                    </span>
                  )}
                </span>
              </div>
              <button onClick={() => onRemove(e.id)} className={btnDanger}>
                削除
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillForm({
  persons,
  skills,
  onAdd,
  onRemove,
}: {
  persons: Person[];
  skills: Skill[];
  onAdd: (s: Omit<Skill, 'id'>) => void;
  onRemove: (id: string) => void;
}) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [targetAge, setTargetAge] = useState(30);
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      personId: personId || persons[0]?.id,
      name: name.trim(),
      targetAge,
      cost,
      note: note.trim(),
    });
    setName('');
    setCost(0);
    setNote('');
  };

  return (
    <div className="space-y-4">
      <select
        className={inputClass}
        value={personId}
        onChange={(e) => setPersonId(e.target.value)}
      >
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>資格/スキル名</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MBA / PMP など"
          />
        </div>
        <div>
          <label className={labelClass}>取得目標年齢</label>
          <input
            className={inputClass}
            type="number"
            value={targetAge}
            onChange={(e) => setTargetAge(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>費用（万円）</label>
          <input
            className={inputClass}
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>メモ</label>
          <input
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="取得理由など"
          />
        </div>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>
        追加
      </button>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {skills.map((s) => {
          const person = persons.find((p) => p.id === s.personId);
          return (
            <div
              key={s.id}
              className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5"
            >
              <span className="text-xs">
                {person?.name} {s.targetAge}歳: {s.name}
                {s.cost > 0 && (
                  <span className="text-gray-500 ml-1">{s.cost}万</span>
                )}
              </span>
              <button onClick={() => onRemove(s.id)} className={btnDanger}>
                削除
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemoForm({
  persons,
  memos,
  onAdd,
  onRemove,
}: {
  persons: Person[];
  memos: Memo[];
  onAdd: (m: Omit<Memo, 'id' | 'createdAt'>) => void;
  onRemove: (id: string) => void;
}) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [age, setAge] = useState(30);
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd({
      personId: personId || persons[0]?.id,
      age,
      content: content.trim(),
    });
    setContent('');
  };

  return (
    <div className="space-y-4">
      <select
        className={inputClass}
        value={personId}
        onChange={(e) => setPersonId(e.target.value)}
      >
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div>
        <label className={labelClass}>年齢</label>
        <input
          className={inputClass}
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </div>
      <div>
        <label className={labelClass}>面談メモ</label>
        <textarea
          className={`${inputClass} h-20 resize-none`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="アドバイザーとしてのメモを入力..."
        />
      </div>
      <button onClick={handleAdd} className={btnPrimary}>
        追加
      </button>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {memos.map((m) => {
          const person = persons.find((p) => p.id === m.personId);
          return (
            <div
              key={m.id}
              className="flex items-start justify-between bg-yellow-50 rounded px-2 py-1.5"
            >
              <div>
                <div className="text-xs text-gray-500">
                  {person?.name} {m.age}歳
                </div>
                <div className="text-xs text-gray-700 mt-0.5">
                  {m.content}
                </div>
              </div>
              <button onClick={() => onRemove(m.id)} className={btnDanger}>
                削除
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
