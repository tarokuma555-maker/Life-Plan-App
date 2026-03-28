'use client';

import React, { useState } from 'react';
import {
  Person,
  LifeEvent,
  Skill,
  Scenario,
  CareerBlock,
  Memo,
  HousingLoan,
  RecurringExpense,
  InvestmentAccount,
  MacroAssumptions,
  LifeEventCategory,
  RecurringExpenseCategory,
  WorkStyle,
  MajorCategory,
  LIFE_EVENT_CATEGORIES,
  RECURRING_EXPENSE_CATEGORIES,
  MAJOR_CATEGORIES,
  WORK_STYLE_LABELS,
  INVESTMENT_TYPES,
} from '@/types';
import {
  calcMonthlyPayment,
  calcTotalPayment,
  assessHousingLoan,
  calcAffordableRent,
  calcEmployeeTakeHome,
  calcFreelanceTakeHome,
  calcCorporateOwnerTakeHome,
  getIncomeAtAge,
  formatMoney,
} from '@/utils/calculations';
import PresetPicker from './PresetPicker';
import CoverageChecklist from './CoverageChecklist';

interface InputPanelProps {
  persons: Person[];
  scenarios: Scenario[];
  lifeEvents: LifeEvent[];
  skills: Skill[];
  memos: Memo[];
  housingLoans: HousingLoan[];
  recurringExpenses: RecurringExpense[];
  investmentAccounts: InvestmentAccount[];
  macroAssumptions: MacroAssumptions;
  activeScenarioIds: string[];
  manualCheckmarks: Record<string, boolean>;
  onAddPerson: (person: Omit<Person, 'id'>) => void;
  onRemovePerson: (id: string) => void;
  onAddScenario: (name: string) => string;
  onRemoveScenario: (id: string) => void;
  onToggleScenario: (id: string) => void;
  onAddCareerBlock: (scenarioId: string, block: Omit<CareerBlock, 'id' | 'scenarioId'>) => void;
  onRemoveCareerBlock: (scenarioId: string, blockId: string) => void;
  onAddLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  onRemoveLifeEvent: (id: string) => void;
  onAddSkill: (skill: Omit<Skill, 'id'>) => void;
  onRemoveSkill: (id: string) => void;
  onAddMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => void;
  onRemoveMemo: (id: string) => void;
  onAddHousingLoan: (loan: Omit<HousingLoan, 'id'>) => void;
  onRemoveHousingLoan: (id: string) => void;
  onAddRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  onRemoveRecurringExpense: (id: string) => void;
  onAddInvestmentAccount: (account: Omit<InvestmentAccount, 'id'>) => void;
  onRemoveInvestmentAccount: (id: string) => void;
  onSetMacroAssumptions: (updates: Partial<MacroAssumptions>) => void;
  onToggleCheckmark: (key: string) => void;
  onLoadSample: () => void;
  onResetAll: () => void;
}

type Section = 'basic' | 'financial' | 'presets' | 'checklist';

export default function InputPanel(props: InputPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>('basic');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<MajorCategory | null>(null);
  const selfPerson = props.persons.find((p) => p.relation === 'self');

  const sections: { key: Section; label: string }[] = [
    { key: 'basic', label: '基本設定' },
    { key: 'financial', label: '資金計画' },
    { key: 'presets', label: 'プリセット' },
    { key: 'checklist', label: 'チェック' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Section Tabs */}
      <div className="flex border-b">
        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeSection === sec.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
        {activeSection === 'basic' && <BasicSection {...props} />}
        {activeSection === 'financial' && <FinancialSection {...props} />}
        {activeSection === 'presets' && (
          <PresetPicker
            selectedCategory={selectedPresetCategory}
            onAddLifeEvent={props.onAddLifeEvent}
            onAddRecurringExpense={props.onAddRecurringExpense}
            personId={selfPerson?.id || props.persons[0]?.id || ''}
          />
        )}
        {activeSection === 'checklist' && (
          <CoverageChecklist
            lifeEvents={props.lifeEvents}
            recurringExpenses={props.recurringExpenses}
            skills={props.skills}
            memos={props.memos}
            housingLoans={props.housingLoans}
            investmentAccounts={props.investmentAccounts}
            scenarios={props.scenarios}
            manualCheckmarks={props.manualCheckmarks}
            onToggleCheckmark={props.onToggleCheckmark}
            onSelectCategory={(cat) => {
              setSelectedPresetCategory(cat);
              setActiveSection('presets');
            }}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t p-4 flex gap-2">
        <button onClick={props.onLoadSample} className="flex-1 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          サンプルデータ
        </button>
        <button onClick={props.onResetAll} className="flex-1 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          リセット
        </button>
      </div>
    </div>
  );
}

// ===== Shared styles =====
const inputClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1';
const btnPrimary = 'w-full py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors';
const btnDanger = 'text-xs text-red-400 hover:text-red-600 transition-colors';
const sectionTitle = 'text-sm font-bold text-gray-700 mb-3 pb-2 border-b';

// ===== Basic Section: Person, Career, Macro, Skills, Memos =====
function BasicSection(props: InputPanelProps) {
  const [subTab, setSubTab] = useState<'person' | 'career' | 'macro' | 'skill' | 'memo'>('person');
  const tabs = [
    { key: 'person' as const, label: '家族' },
    { key: 'career' as const, label: 'キャリア' },
    { key: 'macro' as const, label: '前提条件' },
    { key: 'skill' as const, label: '資格' },
    { key: 'memo' as const, label: 'メモ' },
  ];
  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setSubTab(t.key)} className={`px-2 py-1 text-xs rounded ${subTab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label}</button>
        ))}
      </div>
      {subTab === 'person' && <PersonForm {...props} />}
      {subTab === 'career' && <CareerForm {...props} />}
      {subTab === 'macro' && <MacroForm macroAssumptions={props.macroAssumptions} onSet={props.onSetMacroAssumptions} />}
      {subTab === 'skill' && <SkillForm {...props} />}
      {subTab === 'memo' && <MemoForm {...props} />}
    </div>
  );
}

// ===== Financial Section: Events, Housing, Expenses, Investment =====
function FinancialSection(props: InputPanelProps) {
  const [subTab, setSubTab] = useState<'event' | 'housing' | 'expense' | 'investment'>('event');
  const tabs = [
    { key: 'event' as const, label: 'イベント' },
    { key: 'housing' as const, label: '住宅ローン' },
    { key: 'expense' as const, label: '固定費' },
    { key: 'investment' as const, label: '資産運用' },
  ];
  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setSubTab(t.key)} className={`px-2 py-1 text-xs rounded ${subTab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label}</button>
        ))}
      </div>
      {subTab === 'event' && <EventForm {...props} />}
      {subTab === 'housing' && <HousingLoanForm {...props} />}
      {subTab === 'expense' && <RecurringExpenseForm {...props} />}
      {subTab === 'investment' && <InvestmentForm {...props} />}
    </div>
  );
}

// ===== PersonForm =====
function PersonForm({ persons, onAddPerson, onRemovePerson }: InputPanelProps) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1990);
  const [relation, setRelation] = useState<Person['relation']>('self');
  const handleAdd = () => { if (!name.trim()) return; onAddPerson({ name: name.trim(), birthYear, relation }); setName(''); };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>名前</label><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" /></div>
        <div><label className={labelClass}>生年</label><input className={inputClass} type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} /></div>
      </div>
      <div><label className={labelClass}>続柄</label><select className={inputClass} value={relation} onChange={(e) => setRelation(e.target.value as Person['relation'])}><option value="self">本人</option><option value="spouse">配偶者</option><option value="child">子供</option><option value="other">その他</option></select></div>
      <button onClick={handleAdd} className={btnPrimary}>追加</button>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {persons.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <div><span className="text-sm font-medium">{p.name}</span><span className="text-xs text-gray-500 ml-2">{p.birthYear}年生（{new Date().getFullYear() - p.birthYear}歳）</span></div>
            <button onClick={() => onRemovePerson(p.id)} className={btnDanger}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== CareerForm =====
function CareerForm({ persons, scenarios, activeScenarioIds, onAddScenario, onRemoveScenario, onToggleScenario, onAddCareerBlock, onRemoveCareerBlock }: InputPanelProps) {
  const [scenarioName, setScenarioName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(35);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [income, setIncome] = useState(400);
  const [workStyle, setWorkStyle] = useState<WorkStyle>('employee');
  const [businessExpenseRate, setBusinessExpenseRate] = useState(30);
  const [corporateRevenue, setCorporateRevenue] = useState(1500);
  const [officerSalary, setOfficerSalary] = useState(600);

  const handleAddScenario = () => { if (!scenarioName.trim()) return; const id = onAddScenario(scenarioName.trim()); setSelectedScenario(id); setScenarioName(''); };
  const handleAddBlock = () => {
    if (!selectedScenario || !company.trim()) return;
    const scenario = scenarios.find((s) => s.id === selectedScenario);
    onAddCareerBlock(selectedScenario, {
      personId: personId || persons[0]?.id, startAge, endAge, company: company.trim(), position: position.trim(), annualIncome: income, color: scenario?.color || '#3B82F6', workStyle,
      ...(workStyle === 'freelance' ? { businessExpenseRate } : {}),
      ...(workStyle === 'corporate_owner' ? { corporateRevenue, officerSalary } : {}),
    });
    setCompany(''); setPosition('');
  };

  const takeHomePreview = (() => {
    switch (workStyle) {
      case 'employee': return calcEmployeeTakeHome(income);
      case 'freelance': return calcFreelanceTakeHome(income, businessExpenseRate);
      case 'corporate_owner': return calcCorporateOwnerTakeHome(corporateRevenue, officerSalary);
    }
  })();

  return (
    <div className="space-y-3">
      <div><label className={labelClass}>シナリオ追加</label><div className="flex gap-2"><input className={inputClass} value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="現職 / フリーランス / 法人化" /><button onClick={handleAddScenario} className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap">追加</button></div></div>
      <div className="space-y-1">{scenarios.map((sc) => (
        <div key={sc.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
          <input type="checkbox" checked={activeScenarioIds.includes(sc.id)} onChange={() => onToggleScenario(sc.id)} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sc.color }} />
          <span className="text-xs flex-1">{sc.name}</span>
          <button onClick={() => onRemoveScenario(sc.id)} className={btnDanger}>削除</button>
        </div>
      ))}</div>
      {scenarios.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <label className={labelClass}>キャリアブロック追加</label>
          <select className={inputClass} value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
            <option value="">シナリオを選択</option>
            {scenarios.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
          </select>
          <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>
            {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div><label className={labelClass}>働き方</label><select className={inputClass} value={workStyle} onChange={(e) => setWorkStyle(e.target.value as WorkStyle)}>
            {Object.entries(WORK_STYLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label} - {v.description}</option>)}
          </select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>開始年齢</label><input className={inputClass} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
            <div><label className={labelClass}>終了年齢</label><input className={inputClass} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>会社名/屋号</label><input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            <div><label className={labelClass}>職種/役職</label><input className={inputClass} value={position} onChange={(e) => setPosition(e.target.value)} /></div>
          </div>
          {workStyle === 'employee' && <div><label className={labelClass}>年収（万円）</label><input className={inputClass} type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} /></div>}
          {workStyle === 'freelance' && (<><div><label className={labelClass}>年間売上（万円）</label><input className={inputClass} type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} /></div><div><label className={labelClass}>経費率（%）</label><input className={inputClass} type="number" value={businessExpenseRate} onChange={(e) => setBusinessExpenseRate(Number(e.target.value))} /></div></>)}
          {workStyle === 'corporate_owner' && (<><div><label className={labelClass}>法人売上（万円/年）</label><input className={inputClass} type="number" value={corporateRevenue} onChange={(e) => setCorporateRevenue(Number(e.target.value))} /></div><div><label className={labelClass}>役員報酬（万円/年）</label><input className={inputClass} type="number" value={officerSalary} onChange={(e) => setOfficerSalary(Number(e.target.value))} /></div></>)}
          {takeHomePreview && (
            <div className="bg-blue-50 rounded-lg p-2 text-xs">
              <span className="font-bold text-blue-700">手取り概算: </span>
              {'takeHome' in takeHomePreview && <span className="text-blue-600">約{formatMoney(takeHomePreview.takeHome)}/年</span>}
              {'personalTakeHome' in takeHomePreview && <span className="text-blue-600">個人{formatMoney(takeHomePreview.personalTakeHome)}/年 法人利益{formatMoney(takeHomePreview.corporateProfit)}</span>}
            </div>
          )}
          <button onClick={handleAddBlock} className={btnPrimary}>ブロック追加</button>
          {scenarios.map((sc) => sc.careerBlocks.length > 0 && (
            <div key={sc.id} className="mt-2">
              <div className="text-xs font-medium mb-1" style={{ color: sc.color }}>{sc.name}</div>
              {sc.careerBlocks.map((cb) => (
                <div key={cb.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 mb-0.5">
                  <span className="text-xs">{cb.startAge}〜{cb.endAge}歳 {cb.company}/{cb.position} {cb.annualIncome}万 [{WORK_STYLE_LABELS[cb.workStyle || 'employee'].label}]</span>
                  <button onClick={() => onRemoveCareerBlock(sc.id, cb.id)} className={btnDanger}>削除</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== MacroForm =====
function MacroForm({ macroAssumptions, onSet }: { macroAssumptions: MacroAssumptions; onSet: (u: Partial<MacroAssumptions>) => void }) {
  return (
    <div className="space-y-3">
      <div className={sectionTitle}>マクロ前提条件</div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>インフレ率（%）</label><input className={inputClass} type="number" step="0.1" value={macroAssumptions.inflationRate} onChange={(e) => onSet({ inflationRate: Number(e.target.value) })} /></div>
        <div><label className={labelClass}>投資期待リターン（%）</label><input className={inputClass} type="number" step="0.1" value={macroAssumptions.investmentReturn} onChange={(e) => onSet({ investmentReturn: Number(e.target.value) })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>年金受給開始年齢</label><input className={inputClass} type="number" value={macroAssumptions.pensionStartAge} onChange={(e) => onSet({ pensionStartAge: Number(e.target.value) })} /></div>
        <div><label className={labelClass}>想定寿命</label><input className={inputClass} type="number" value={macroAssumptions.lifeExpectancy} onChange={(e) => onSet({ lifeExpectancy: Number(e.target.value) })} /></div>
      </div>
      <div><label className={labelClass}>賃金上昇率（%）</label><input className={inputClass} type="number" step="0.1" value={macroAssumptions.wageGrowthRate} onChange={(e) => onSet({ wageGrowthRate: Number(e.target.value) })} /></div>
      <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500">
        これらの値は資産運用シミュレーション・老後資金分析に反映されます。
      </div>
    </div>
  );
}

// ===== EventForm =====
function EventForm({ persons, lifeEvents, onAddLifeEvent, onRemoveLifeEvent }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [age, setAge] = useState(30);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(0);
  const [category, setCategory] = useState<LifeEventCategory>('family');
  const [majorCategory, setMajorCategory] = useState<MajorCategory>('life_events');
  const [isExpense, setIsExpense] = useState(true);
  const handleAdd = () => { if (!title.trim()) return; onAddLifeEvent({ personId: personId || persons[0]?.id, age, title: title.trim(), cost, category, majorCategory, isExpense }); setTitle(''); setCost(0); };
  return (
    <div className="space-y-3">
      <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>年齢</label><input className={inputClass} type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
        <div><label className={labelClass}>表示カテゴリ</label><select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as LifeEventCategory)}>{Object.entries(LIFE_EVENT_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
      </div>
      <div><label className={labelClass}>大分類</label><select className={inputClass} value={majorCategory} onChange={(e) => setMajorCategory(e.target.value as MajorCategory)}>{Object.entries(MAJOR_CATEGORIES).sort(([,a],[,b]) => a.number - b.number).map(([k, v]) => <option key={k} value={k}>{v.number}. {v.label}</option>)}</select></div>
      <div><label className={labelClass}>イベント名</label><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="結婚 / 住宅購入 など" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>費用（万円）</label><input className={inputClass} type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
        <div><label className={labelClass}>種別</label><select className={inputClass} value={isExpense ? 'expense' : 'income'} onChange={(e) => setIsExpense(e.target.value === 'expense')}><option value="expense">支出</option><option value="income">収入</option></select></div>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>追加</button>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {lifeEvents.map((e) => {
          const person = persons.find((p) => p.id === e.personId);
          const cat = LIFE_EVENT_CATEGORIES[e.category];
          return (
            <div key={e.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-xs">{person?.name} {e.age}歳: {e.title}{e.cost > 0 && <span className="text-gray-400 ml-1">{e.isExpense ? '-' : '+'}{e.cost}万</span>}</span></div>
              <button onClick={() => onRemoveLifeEvent(e.id)} className={btnDanger}>削除</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== HousingLoanForm =====
function HousingLoanForm({ persons, scenarios, activeScenarioIds, housingLoans, onAddHousingLoan, onRemoveHousingLoan }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [purchaseAge, setPurchaseAge] = useState(35);
  const [propertyPrice, setPropertyPrice] = useState(4000);
  const [downPayment, setDownPayment] = useState(400);
  const [interestRate, setInterestRate] = useState(0.5);
  const [loanTermYears, setLoanTermYears] = useState(35);
  const loanAmount = propertyPrice - downPayment;
  const monthly = calcMonthlyPayment(loanAmount, interestRate, loanTermYears);
  const totalPayment = calcTotalPayment(loanAmount, interestRate, loanTermYears);
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));
  const incomeAtPurchase = activeScenarios.length > 0 ? getIncomeAtAge(activeScenarios[0].careerBlocks, purchaseAge) : 0;
  const tempLoan: HousingLoan = { id: '', personId, name, purchaseAge, propertyPrice, downPayment, loanAmount, interestRate, loanTermYears };
  const assessment = assessHousingLoan(tempLoan, incomeAtPurchase);
  const affordableRent = calcAffordableRent(incomeAtPurchase);
  const handleAdd = () => { if (!name.trim()) return; onAddHousingLoan({ personId: personId || persons[0]?.id, name: name.trim(), purchaseAge, propertyPrice, downPayment, loanAmount, interestRate, loanTermYears }); setName(''); };

  return (
    <div className="space-y-3">
      <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div><label className={labelClass}>物件名</label><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="自宅マンション" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>購入年齢</label><input className={inputClass} type="number" value={purchaseAge} onChange={(e) => setPurchaseAge(Number(e.target.value))} /></div>
        <div><label className={labelClass}>物件価格（万円）</label><input className={inputClass} type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>頭金（万円）</label><input className={inputClass} type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} /></div>
        <div><label className={labelClass}>借入額</label><div className="px-3 py-2 text-sm bg-gray-100 rounded-lg">{formatMoney(loanAmount)}</div></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>金利（%）</label><input className={inputClass} type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} /></div>
        <div><label className={labelClass}>返済期間（年）</label><input className={inputClass} type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))} /></div>
      </div>
      <div className={`rounded-lg p-3 text-xs space-y-1 ${assessment.isApproved ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className={`font-bold ${assessment.isApproved ? 'text-green-700' : 'text-red-700'}`}>住宅ローン審査シミュレーション{incomeAtPurchase > 0 && `（${purchaseAge}歳時 年収${incomeAtPurchase}万円）`}</div>
        <div>月額返済: <span className="font-bold">{monthly.toFixed(1)}万円</span></div>
        <div>返済総額: {formatMoney(Math.round(totalPayment))}（利息: {formatMoney(Math.round(totalPayment - loanAmount))}）</div>
        <div>返済比率: <span className={`font-bold ${assessment.debtToIncomeRatio > 35 ? 'text-red-600' : 'text-green-600'}`}>{assessment.debtToIncomeRatio.toFixed(1)}%</span></div>
        <div>完済年齢: <span className={`font-bold ${assessment.completionAge > 80 ? 'text-red-600' : 'text-green-600'}`}>{assessment.completionAge}歳</span></div>
        <div>借入可能上限: {formatMoney(assessment.maxLoanAmount)}</div>
        {assessment.warnings.map((w, i) => <div key={i} className="text-red-600">⚠ {w}</div>)}
        <div className={`mt-1 font-bold ${assessment.isApproved ? 'text-green-600' : 'text-red-600'}`}>{assessment.isApproved ? '✓ 審査通過の見込みあり' : '✗ 審査は厳しい可能性'}</div>
      </div>
      {incomeAtPurchase > 0 && (
        <div className="bg-amber-50 rounded-lg p-2 text-xs">
          <div className="font-bold text-amber-700">適正家賃の目安</div>
          <div>堅実{affordableRent.conservative}万/月 標準{affordableRent.standard}万/月 上限{affordableRent.aggressive}万/月</div>
        </div>
      )}
      <button onClick={handleAdd} className={btnPrimary}>ローン追加</button>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {housingLoans.map((loan) => {
          const mp = calcMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears);
          return (
            <div key={loan.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
              <span className="text-xs">{loan.name} {loan.purchaseAge}歳〜 {formatMoney(loan.loanAmount)} {mp.toFixed(1)}万/月</span>
              <button onClick={() => onRemoveHousingLoan(loan.id)} className={btnDanger}>削除</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== RecurringExpenseForm =====
function RecurringExpenseForm({ persons, recurringExpenses, onAddRecurringExpense, onRemoveRecurringExpense }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(65);
  const [annualCost, setAnnualCost] = useState(0);
  const [category, setCategory] = useState<RecurringExpenseCategory>('living');
  const [majorCategory, setMajorCategory] = useState<MajorCategory>('expenses_living');
  const handleAdd = () => { if (!name.trim()) return; onAddRecurringExpense({ personId: personId || persons[0]?.id, name: name.trim(), startAge, endAge, annualCost, category, majorCategory }); setName(''); setAnnualCost(0); };

  return (
    <div className="space-y-3">
      <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div><label className={labelClass}>費目名</label><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="家賃 / 保険 / サブスク など" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>表示カテゴリ</label><select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as RecurringExpenseCategory)}>{Object.entries(RECURRING_EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div><label className={labelClass}>大分類</label><select className={inputClass} value={majorCategory} onChange={(e) => setMajorCategory(e.target.value as MajorCategory)}>{Object.entries(MAJOR_CATEGORIES).sort(([,a],[,b]) => a.number - b.number).map(([k, v]) => <option key={k} value={k}>{v.number}. {v.label}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className={labelClass}>開始年齢</label><input className={inputClass} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
        <div><label className={labelClass}>終了年齢</label><input className={inputClass} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
        <div><label className={labelClass}>年額（万円）</label><input className={inputClass} type="number" value={annualCost} onChange={(e) => setAnnualCost(Number(e.target.value))} /></div>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>追加</button>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {recurringExpenses.map((exp) => {
          const cat = RECURRING_EXPENSE_CATEGORIES[exp.category];
          return (
            <div key={exp.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-xs">{exp.startAge}〜{exp.endAge}歳 {exp.name} {exp.annualCost}万/年</span></div>
              <button onClick={() => onRemoveRecurringExpense(exp.id)} className={btnDanger}>削除</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== InvestmentForm =====
function InvestmentForm({ persons, investmentAccounts, onAddInvestmentAccount, onRemoveInvestmentAccount }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentAccount['type']>('nisa');
  const [monthlyContribution, setMonthlyContribution] = useState(5);
  const [startAge, setStartAge] = useState(25);
  const [endAge, setEndAge] = useState(65);
  const [expectedReturn, setExpectedReturn] = useState(4);
  const handleAdd = () => { if (!name.trim()) return; onAddInvestmentAccount({ personId: personId || persons[0]?.id, name: name.trim(), type, monthlyContribution, startAge, endAge, expectedReturn }); setName(''); };
  const typeInfo = INVESTMENT_TYPES[type];

  return (
    <div className="space-y-3">
      <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div><label className={labelClass}>口座名</label><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="新NISA / iDeCo など" /></div>
      <div><label className={labelClass}>種類</label><select className={inputClass} value={type} onChange={(e) => setType(e.target.value as InvestmentAccount['type'])}>{Object.entries(INVESTMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label} - {v.description}</option>)}</select></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>月額（万円）</label><input className={inputClass} type="number" step="0.1" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} />{typeInfo.maxMonthly < 100 && <div className="text-xs text-gray-400 mt-0.5">上限: 月{typeInfo.maxMonthly}万円</div>}</div>
        <div><label className={labelClass}>期待リターン（%）</label><input className={inputClass} type="number" step="0.1" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>開始年齢</label><input className={inputClass} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
        <div><label className={labelClass}>終了年齢</label><input className={inputClass} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>追加</button>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {investmentAccounts.map((acc) => (
          <div key={acc.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
            <span className="text-xs">{acc.name} 月{acc.monthlyContribution}万 {acc.startAge}〜{acc.endAge}歳 ({acc.expectedReturn}%)</span>
            <button onClick={() => onRemoveInvestmentAccount(acc.id)} className={btnDanger}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== SkillForm =====
function SkillForm({ persons, skills, onAddSkill, onRemoveSkill }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [targetAge, setTargetAge] = useState(30);
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState('');
  const handleAdd = () => { if (!name.trim()) return; onAddSkill({ personId: personId || persons[0]?.id, name: name.trim(), targetAge, cost, note: note.trim() }); setName(''); setCost(0); setNote(''); };
  return (
    <div className="space-y-3">
      <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>資格/スキル名</label><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className={labelClass}>目標年齢</label><input className={inputClass} type="number" value={targetAge} onChange={(e) => setTargetAge(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className={labelClass}>費用（万円）</label><input className={inputClass} type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
        <div><label className={labelClass}>メモ</label><input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      </div>
      <button onClick={handleAdd} className={btnPrimary}>追加</button>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {skills.map((s) => (<div key={s.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"><span className="text-xs">{s.targetAge}歳: {s.name}{s.cost > 0 && ` ${s.cost}万`}</span><button onClick={() => onRemoveSkill(s.id)} className={btnDanger}>削除</button></div>))}
      </div>
    </div>
  );
}

// ===== MemoForm =====
function MemoForm({ persons, memos, onAddMemo, onRemoveMemo }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [age, setAge] = useState(30);
  const [content, setContent] = useState('');
  const handleAdd = () => { if (!content.trim()) return; onAddMemo({ personId: personId || persons[0]?.id, age, content: content.trim() }); setContent(''); };
  return (
    <div className="space-y-3">
      <select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div><label className={labelClass}>年齢</label><input className={inputClass} type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
      <div><label className={labelClass}>面談メモ</label><textarea className={`${inputClass} h-20 resize-none`} value={content} onChange={(e) => setContent(e.target.value)} placeholder="アドバイザーとしてのメモ..." /></div>
      <button onClick={handleAdd} className={btnPrimary}>追加</button>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {memos.map((m) => (<div key={m.id} className="flex items-start justify-between bg-yellow-50 rounded px-2 py-1"><div><div className="text-xs text-gray-500">{m.age}歳</div><div className="text-xs">{m.content}</div></div><button onClick={() => onRemoveMemo(m.id)} className={btnDanger}>削除</button></div>))}
      </div>
    </div>
  );
}
