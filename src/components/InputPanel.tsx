'use client';

import React, { useState } from 'react';
import {
  Person, LifeEvent, Skill, Scenario, CareerBlock, Memo,
  HousingLoan, RecurringExpense, InvestmentAccount, MacroAssumptions,
  LifeEventCategory, RecurringExpenseCategory, WorkStyle, MajorCategory,
  LIFE_EVENT_CATEGORIES, RECURRING_EXPENSE_CATEGORIES, MAJOR_CATEGORIES,
  WORK_STYLE_LABELS, INVESTMENT_TYPES,
} from '@/types';
import {
  calcMonthlyPayment, calcTotalPayment, assessHousingLoan, calcAffordableRent,
  calcEmployeeTakeHome, calcFreelanceTakeHome, calcCorporateOwnerTakeHome,
  getIncomeAtAge, formatMoney,
} from '@/utils/calculations';
import PresetPicker from './PresetPicker';
import CoverageChecklist from './CoverageChecklist';

// ===== Types =====
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

type TopicKey = 'family' | 'career' | 'money' | 'housing' | 'lifeplan' | 'investment' | 'checklist' | 'settings';

const TOPICS: { key: TopicKey; icon: string; label: string; desc: string }[] = [
  { key: 'family', icon: '👨‍👩‍👧', label: '家族構成', desc: '家族メンバーの登録' },
  { key: 'career', icon: '💼', label: 'キャリア', desc: '仕事の経歴・将来プラン' },
  { key: 'money', icon: '💰', label: '収支・固定費', desc: '生活費・保険・サブスク等' },
  { key: 'housing', icon: '🏠', label: '住まい', desc: '家賃・住宅ローン' },
  { key: 'lifeplan', icon: '📌', label: 'ライフイベント', desc: '結婚・出産・教育・老後など' },
  { key: 'investment', icon: '📈', label: '資産運用', desc: 'NISA・iDeCo・貯蓄' },
  { key: 'checklist', icon: '✅', label: 'チェックリスト', desc: '34項目の対応状況' },
  { key: 'settings', icon: '⚙️', label: '設定', desc: '前提条件・メモ・資格' },
];

// ===== Shared Styles =====
const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';
const btnPrimary = 'w-full py-2.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium';
const btnDanger = 'text-xs text-red-400 hover:text-red-600 transition-colors';
const cardCls = 'bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between';

// ===== Main Component =====
export default function InputPanel(props: InputPanelProps) {
  const [activeTopic, setActiveTopic] = useState<TopicKey | null>(null);
  const selfPerson = props.persons.find((p) => p.relation === 'self');

  if (activeTopic) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Topic header */}
        <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b">
          <button onClick={() => setActiveTopic(null)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              {TOPICS.find((t) => t.key === activeTopic)?.icon} {TOPICS.find((t) => t.key === activeTopic)?.label}
            </h3>
            <p className="text-xs text-gray-400">{TOPICS.find((t) => t.key === activeTopic)?.desc}</p>
          </div>
        </div>

        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {activeTopic === 'family' && <FamilyTopic {...props} />}
          {activeTopic === 'career' && <CareerTopic {...props} />}
          {activeTopic === 'money' && <MoneyTopic {...props} />}
          {activeTopic === 'housing' && <HousingTopic {...props} />}
          {activeTopic === 'lifeplan' && <LifeplanTopic {...props} />}
          {activeTopic === 'investment' && <InvestmentTopic {...props} />}
          {activeTopic === 'checklist' && (
            <CoverageChecklist
              lifeEvents={props.lifeEvents} recurringExpenses={props.recurringExpenses}
              skills={props.skills} memos={props.memos} housingLoans={props.housingLoans}
              investmentAccounts={props.investmentAccounts} scenarios={props.scenarios}
              manualCheckmarks={props.manualCheckmarks} onToggleCheckmark={props.onToggleCheckmark}
              onSelectCategory={() => {}}
            />
          )}
          {activeTopic === 'settings' && <SettingsTopic {...props} />}
        </div>
      </div>
    );
  }

  // Topic menu
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="text-sm font-bold text-gray-800">ライフプランの編集</h3>
        <p className="text-xs text-gray-400">項目を選んで情報を入力してください</p>
      </div>

      <div className="p-3 space-y-1.5">
        {TOPICS.map((topic) => {
          const count = getTopicCount(topic.key, props);
          return (
            <button
              key={topic.key}
              onClick={() => setActiveTopic(topic.key)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="text-xl">{topic.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">{topic.label}</div>
                <div className="text-xs text-gray-400">{topic.desc}</div>
              </div>
              {count > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  {count}
                </span>
              )}
              <span className="text-gray-300 group-hover:text-blue-400">→</span>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="border-t p-3 space-y-2">
        <button onClick={props.onLoadSample} className="w-full py-2.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium">
          サンプルデータで試す
        </button>
        <button onClick={props.onResetAll} className="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors">
          すべてリセット
        </button>
      </div>
    </div>
  );
}

function getTopicCount(key: TopicKey, props: InputPanelProps): number {
  switch (key) {
    case 'family': return props.persons.length;
    case 'career': return props.scenarios.reduce((sum, s) => sum + s.careerBlocks.length, 0);
    case 'money': return props.recurringExpenses.length;
    case 'housing': return props.housingLoans.length;
    case 'lifeplan': return props.lifeEvents.length;
    case 'investment': return props.investmentAccounts.length;
    case 'settings': return props.skills.length + props.memos.length;
    default: return 0;
  }
}

// ===== Topic: Family =====
function FamilyTopic({ persons, onAddPerson, onRemovePerson }: InputPanelProps) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1990);
  const [relation, setRelation] = useState<Person['relation']>('self');
  const handleAdd = () => {
    if (!name.trim()) return;
    onAddPerson({ name: name.trim(), birthYear, relation });
    setName('');
  };
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">ライフプランに含める家族メンバーを登録してください。</p>

      {/* Existing members */}
      {persons.length > 0 && (
        <div className="space-y-2">
          {persons.map((p) => (
            <div key={p.id} className={cardCls}>
              <div>
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {currentYear - p.birthYear}歳
                  （{p.relation === 'self' ? '本人' : p.relation === 'spouse' ? '配偶者' : p.relation === 'child' ? '子ども' : 'その他'}）
                </span>
              </div>
              <button onClick={() => onRemovePerson(p.id)} className={btnDanger}>削除</button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="text-xs font-medium text-blue-700">家族を追加</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>お名前</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="山田 太郎" /></div>
          <div><label className={labelCls}>生まれた年</label><input className={inputCls} type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} /></div>
        </div>
        <div><label className={labelCls}>続柄</label>
          <div className="grid grid-cols-4 gap-2">
            {(['self', 'spouse', 'child', 'other'] as const).map((r) => {
              const labels = { self: '本人', spouse: '配偶者', child: '子ども', other: 'その他' };
              return (
                <button key={r} onClick={() => setRelation(r)} className={`py-2 text-xs rounded-lg border-2 transition-colors ${relation === r ? 'border-blue-500 bg-white text-blue-700 font-medium' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{labels[r]}</button>
              );
            })}
          </div>
        </div>
        <button onClick={handleAdd} className={btnPrimary}>追加する</button>
      </div>
    </div>
  );
}

// ===== Topic: Career =====
function CareerTopic({ persons, scenarios, activeScenarioIds, onAddScenario, onRemoveScenario, onToggleScenario, onAddCareerBlock, onRemoveCareerBlock }: InputPanelProps) {
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

  const takeHome = (() => {
    switch (workStyle) {
      case 'employee': return calcEmployeeTakeHome(income).takeHome;
      case 'freelance': return calcFreelanceTakeHome(income, businessExpenseRate).takeHome;
      case 'corporate_owner': return calcCorporateOwnerTakeHome(corporateRevenue, officerSalary).personalTakeHome;
    }
  })();

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        複数のキャリアパスを「シナリオ」として比較できます。
        例：「現職を続ける」「転職する」「独立する」
      </p>

      {/* Scenario management */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600">シナリオ一覧</div>
        {scenarios.map((sc) => (
          <div key={sc.id} className={cardCls}>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={activeScenarioIds.includes(sc.id)} onChange={() => onToggleScenario(sc.id)} className="rounded" />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sc.color }} />
              <span className="text-sm">{sc.name}</span>
              <span className="text-xs text-gray-400">({sc.careerBlocks.length}件)</span>
            </div>
            <button onClick={() => onRemoveScenario(sc.id)} className={btnDanger}>削除</button>
          </div>
        ))}
        <div className="flex gap-2">
          <input className={inputCls} value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="新しいシナリオ名（例：転職する）" />
          <button onClick={handleAddScenario} className="px-4 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap font-medium">追加</button>
        </div>
      </div>

      {/* Add career block */}
      {scenarios.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
          <div className="text-xs font-medium text-blue-700">キャリアブロックを追加</div>
          <div className="text-xs text-gray-400">シナリオごとに、いつ・どこで・いくらで働くかを登録します</div>

          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelCls}>シナリオ</label><select className={inputCls} value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}><option value="">選択してください</option>{scenarios.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}</select></div>
            <div><label className={labelCls}>対象者</label><select className={inputCls} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          </div>

          <div><label className={labelCls}>働き方</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(WORK_STYLE_LABELS) as [WorkStyle, typeof WORK_STYLE_LABELS[WorkStyle]][]).map(([k, v]) => (
                <button key={k} onClick={() => setWorkStyle(k)} className={`py-2 text-xs rounded-lg border-2 text-center transition-colors ${workStyle === k ? 'border-blue-500 bg-white text-blue-700 font-medium' : 'border-gray-200 text-gray-500'}`}>{v.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelCls}>開始年齢</label><input className={inputCls} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
            <div><label className={labelCls}>終了年齢</label><input className={inputCls} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelCls}>会社名・屋号</label><input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            <div><label className={labelCls}>職種・役職</label><input className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)} /></div>
          </div>

          {workStyle === 'employee' && <div><label className={labelCls}>年収（万円）</label><input className={inputCls} type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} /></div>}
          {workStyle === 'freelance' && (<div className="grid grid-cols-2 gap-2"><div><label className={labelCls}>年間売上（万円）</label><input className={inputCls} type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} /></div><div><label className={labelCls}>経費率（%）</label><input className={inputCls} type="number" value={businessExpenseRate} onChange={(e) => setBusinessExpenseRate(Number(e.target.value))} /></div></div>)}
          {workStyle === 'corporate_owner' && (<div className="grid grid-cols-2 gap-2"><div><label className={labelCls}>法人売上（万円/年）</label><input className={inputCls} type="number" value={corporateRevenue} onChange={(e) => setCorporateRevenue(Number(e.target.value))} /></div><div><label className={labelCls}>役員報酬（万円/年）</label><input className={inputCls} type="number" value={officerSalary} onChange={(e) => setOfficerSalary(Number(e.target.value))} /></div></div>)}

          <div className="bg-white rounded-lg p-2 text-xs text-gray-500">
            手取り目安: 約<span className="font-bold text-blue-600">{formatMoney(Math.round(takeHome))}</span>/年
          </div>

          <button onClick={handleAddBlock} className={btnPrimary}>追加する</button>
        </div>
      )}

      {/* Existing blocks */}
      {scenarios.map((sc) => sc.careerBlocks.length > 0 && (
        <div key={sc.id}>
          <div className="text-xs font-medium mb-1" style={{ color: sc.color }}>{sc.name}</div>
          {sc.careerBlocks.map((cb) => (
            <div key={cb.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-1">
              <span className="text-xs text-gray-700">{cb.startAge}〜{cb.endAge}歳 {cb.company} / {cb.position} — {cb.annualIncome}万円 ({WORK_STYLE_LABELS[cb.workStyle || 'employee'].label})</span>
              <button onClick={() => onRemoveCareerBlock(sc.id, cb.id)} className={btnDanger}>削除</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ===== Topic: Money (Recurring Expenses) =====
function MoneyTopic({ persons, recurringExpenses, onAddRecurringExpense, onRemoveRecurringExpense, onAddLifeEvent, lifeEvents }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(65);
  const [annualCost, setAnnualCost] = useState(0);
  const [category, setCategory] = useState<RecurringExpenseCategory>('living');
  const handleAdd = () => { if (!name.trim()) return; onAddRecurringExpense({ personId: personId || persons[0]?.id, name: name.trim(), startAge, endAge, annualCost, category, majorCategory: 'expenses_living' }); setName(''); setAnnualCost(0); };

  const selfPerson = persons.find((p) => p.relation === 'self');

  // Quick presets
  const quickPresets = [
    { name: '生活費（食費・光熱費）', cost: 180, start: 22, end: 100, cat: 'living' as const },
    { name: '通信費（スマホ・回線）', cost: 12, start: 18, end: 100, cat: 'subscription' as const },
    { name: '生命保険', cost: 24, start: 30, end: 65, cat: 'insurance' as const },
    { name: '医療保険', cost: 6, start: 30, end: 80, cat: 'insurance' as const },
    { name: 'サブスク（動画・音楽等）', cost: 6, start: 20, end: 80, cat: 'subscription' as const },
    { name: '被服費', cost: 24, start: 22, end: 80, cat: 'beauty' as const },
    { name: '車の維持費', cost: 50, start: 20, end: 75, cat: 'vehicle' as const },
    { name: 'ジム・フィットネス', cost: 12, start: 25, end: 70, cat: 'health' as const },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">毎月・毎年かかる固定費を登録します。よくある項目はワンクリックで追加できます。</p>

      {/* Quick add */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">よくある固定費（クリックで追加）</div>
        <div className="grid grid-cols-2 gap-1.5">
          {quickPresets.map((p, i) => (
            <button key={i} onClick={() => { if (selfPerson) onAddRecurringExpense({ personId: selfPerson.id, name: p.name, startAge: p.start, endAge: p.end, annualCost: p.cost, category: p.cat, majorCategory: 'expenses_living' }); }} className="text-left text-xs bg-gray-50 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors border border-gray-100">
              <div className="font-medium text-gray-700">{p.name}</div>
              <div className="text-gray-400">{p.cost}万円/年</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom add */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="text-xs font-medium text-blue-700">カスタム追加</div>
        <select className={inputCls} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <div><label className={labelCls}>費目名</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="例：家賃、保育園、保険など" /></div>
        <div><label className={labelCls}>種類</label><select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as RecurringExpenseCategory)}>{Object.entries(RECURRING_EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className={labelCls}>開始年齢</label><input className={inputCls} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
          <div><label className={labelCls}>終了年齢</label><input className={inputCls} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
          <div><label className={labelCls}>年額（万円）</label><input className={inputCls} type="number" value={annualCost} onChange={(e) => setAnnualCost(Number(e.target.value))} /></div>
        </div>
        <button onClick={handleAdd} className={btnPrimary}>追加する</button>
      </div>

      {/* List */}
      {recurringExpenses.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">登録済みの固定費（{recurringExpenses.length}件）</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {recurringExpenses.map((exp) => {
              const cat = RECURRING_EXPENSE_CATEGORIES[exp.category];
              return (
                <div key={exp.id} className={cardCls}>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} /><span className="text-xs text-gray-700">{exp.name} — {exp.annualCost}万/年 ({exp.startAge}〜{exp.endAge}歳)</span></div>
                  <button onClick={() => onRemoveRecurringExpense(exp.id)} className={btnDanger}>削除</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Topic: Housing =====
function HousingTopic({ persons, scenarios, activeScenarioIds, housingLoans, onAddHousingLoan, onRemoveHousingLoan, recurringExpenses, onAddRecurringExpense, onRemoveRecurringExpense }: InputPanelProps) {
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
    <div className="space-y-4">
      <p className="text-xs text-gray-400">住宅購入のシミュレーションや、賃貸の家賃を登録できます。</p>

      {/* Rent affordability */}
      {incomeAtPurchase > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 text-xs space-y-1">
          <div className="font-bold text-amber-700">あなたが住める家賃の目安</div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-white rounded-lg p-2 text-center"><div className="text-gray-400">堅実</div><div className="font-bold text-amber-700">{affordableRent.conservative}万/月</div></div>
            <div className="bg-white rounded-lg p-2 text-center"><div className="text-gray-400">標準</div><div className="font-bold text-amber-700">{affordableRent.standard}万/月</div></div>
            <div className="bg-white rounded-lg p-2 text-center"><div className="text-gray-400">上限</div><div className="font-bold text-amber-700">{affordableRent.aggressive}万/月</div></div>
          </div>
        </div>
      )}

      {/* Loan form */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="text-xs font-medium text-blue-700">住宅ローンのシミュレーション</div>
        <select className={inputCls} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <div><label className={labelCls}>物件名</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="例：自宅マンション" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>購入年齢</label><input className={inputCls} type="number" value={purchaseAge} onChange={(e) => setPurchaseAge(Number(e.target.value))} /></div>
          <div><label className={labelCls}>物件価格（万円）</label><input className={inputCls} type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>頭金（万円）</label><input className={inputCls} type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} /></div>
          <div><label className={labelCls}>借入額</label><div className="px-3 py-2.5 text-sm bg-white rounded-lg text-gray-700">{formatMoney(loanAmount)}</div></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>金利（年%）</label><input className={inputCls} type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} /></div>
          <div><label className={labelCls}>返済期間（年）</label><input className={inputCls} type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))} /></div>
        </div>

        {/* Assessment result */}
        <div className={`rounded-xl p-4 space-y-2 ${assessment.isApproved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`text-xs font-bold ${assessment.isApproved ? 'text-green-700' : 'text-red-700'}`}>
            {assessment.isApproved ? '✓ 審査通過の見込みあり' : '✗ 審査は厳しい見込み'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">月額返済: </span><span className="font-bold">{monthly.toFixed(1)}万円</span></div>
            <div><span className="text-gray-500">返済総額: </span><span className="font-bold">{formatMoney(Math.round(totalPayment))}</span></div>
            <div><span className="text-gray-500">返済比率: </span><span className={`font-bold ${assessment.debtToIncomeRatio > 35 ? 'text-red-600' : 'text-green-600'}`}>{assessment.debtToIncomeRatio.toFixed(1)}%</span></div>
            <div><span className="text-gray-500">完済年齢: </span><span className={`font-bold ${assessment.completionAge > 80 ? 'text-red-600' : 'text-green-600'}`}>{assessment.completionAge}歳</span></div>
          </div>
          {assessment.warnings.map((w, i) => <div key={i} className="text-xs text-red-600">⚠ {w}</div>)}
        </div>

        <button onClick={handleAdd} className={btnPrimary}>ローンを追加する</button>
      </div>

      {/* Existing loans */}
      {housingLoans.map((loan) => (
        <div key={loan.id} className={cardCls}>
          <div><div className="text-xs font-medium">{loan.name}</div><div className="text-xs text-gray-400">{loan.purchaseAge}歳〜 {formatMoney(loan.loanAmount)} {calcMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears).toFixed(1)}万/月</div></div>
          <button onClick={() => onRemoveHousingLoan(loan.id)} className={btnDanger}>削除</button>
        </div>
      ))}
    </div>
  );
}

// ===== Topic: Life Events =====
function LifeplanTopic({ persons, lifeEvents, onAddLifeEvent, onRemoveLifeEvent }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [age, setAge] = useState(30);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(0);
  const [category, setCategory] = useState<LifeEventCategory>('family');
  const [isExpense, setIsExpense] = useState(true);
  const handleAdd = () => { if (!title.trim()) return; onAddLifeEvent({ personId: personId || persons[0]?.id, age, title: title.trim(), cost, category, majorCategory: 'life_events', isExpense }); setTitle(''); setCost(0); };

  const selfPerson = persons.find((p) => p.relation === 'self');
  const childPersons = persons.filter((p) => p.relation === 'child');

  // Quick presets
  const quickPresets = [
    { title: '結婚', age: 30, cost: 300, cat: 'marriage' as const },
    { title: '出産', age: 32, cost: 50, cat: 'pregnancy_birth' as const },
    { title: '住宅購入（頭金）', age: 35, cost: 500, cat: 'housing' as const },
    { title: '車の購入', age: 30, cost: 300, cat: 'vehicle' as const },
    { title: 'リフォーム', age: 55, cost: 500, cat: 'housing' as const },
    { title: '退職', age: 65, cost: 0, cat: 'retirement' as const },
    { title: '退職金', age: 65, cost: 1500, cat: 'retirement' as const, income: true },
    { title: '介護費用', age: 80, cost: 600, cat: 'retirement' as const },
    { title: '葬儀費用', age: 90, cost: 200, cat: 'ending' as const },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">人生で起こるイベントとその費用を登録します。</p>

      {/* Quick add */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">よくあるイベント（クリックで追加）</div>
        <div className="grid grid-cols-3 gap-1.5">
          {quickPresets.map((p, i) => (
            <button key={i} onClick={() => { if (selfPerson) onAddLifeEvent({ personId: selfPerson.id, age: p.age, title: p.title, cost: p.cost, category: p.cat, majorCategory: 'life_events', isExpense: !('income' in p) }); }} className="text-left text-xs bg-gray-50 hover:bg-blue-50 rounded-lg px-2 py-2 transition-colors border border-gray-100">
              <div className="font-medium text-gray-700">{p.title}</div>
              <div className="text-gray-400">{p.cost > 0 ? `${p.cost}万円` : '—'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset picker link */}
      <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-600">
        さらに多くのイベント（保険・相続・留学・冠婚葬祭など）は、メインメニューの「チェックリスト」から追加できます。
      </div>

      {/* Custom add */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="text-xs font-medium text-blue-700">カスタム追加</div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>対象者</label><select className={inputCls} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className={labelCls}>年齢</label><input className={inputCls} type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
        </div>
        <div><label className={labelCls}>イベント名</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：結婚・出産・留学など" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>金額（万円）</label><input className={inputCls} type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
          <div><label className={labelCls}>支出/収入</label>
            <div className="flex gap-2">
              <button onClick={() => setIsExpense(true)} className={`flex-1 py-2 text-xs rounded-lg border-2 ${isExpense ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}>支出</button>
              <button onClick={() => setIsExpense(false)} className={`flex-1 py-2 text-xs rounded-lg border-2 ${!isExpense ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 text-gray-500'}`}>収入</button>
            </div>
          </div>
        </div>
        <button onClick={handleAdd} className={btnPrimary}>追加する</button>
      </div>

      {/* List */}
      {lifeEvents.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">登録済みイベント（{lifeEvents.length}件）</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {lifeEvents.map((e) => {
              const person = persons.find((p) => p.id === e.personId);
              const cat = LIFE_EVENT_CATEGORIES[e.category];
              return (
                <div key={e.id} className={cardCls}>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#999' }} /><span className="text-xs">{person?.name} {e.age}歳: {e.title}{e.cost > 0 && <span className="text-gray-400 ml-1">{e.isExpense ? '-' : '+'}{e.cost}万</span>}</span></div>
                  <button onClick={() => onRemoveLifeEvent(e.id)} className={btnDanger}>削除</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Topic: Investment =====
function InvestmentTopic({ persons, investmentAccounts, onAddInvestmentAccount, onRemoveInvestmentAccount }: InputPanelProps) {
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentAccount['type']>('nisa');
  const [monthlyContribution, setMonthlyContribution] = useState(5);
  const [startAge, setStartAge] = useState(25);
  const [endAge, setEndAge] = useState(65);
  const [expectedReturn, setExpectedReturn] = useState(4);
  const handleAdd = () => { if (!name.trim()) return; onAddInvestmentAccount({ personId: personId || persons[0]?.id, name: name.trim(), type, monthlyContribution, startAge, endAge, expectedReturn }); setName(''); };

  const quickPresets = [
    { name: '新NISA（つみたて）', type: 'nisa' as const, monthly: 5, ret: 4, desc: '月5万・年利4%想定' },
    { name: 'iDeCo', type: 'ideco' as const, monthly: 2.3, ret: 3, desc: '月2.3万・年利3%想定' },
    { name: '預貯金', type: 'savings' as const, monthly: 5, ret: 0.1, desc: '月5万・年利0.1%' },
  ];

  const selfPerson = persons.find((p) => p.relation === 'self');

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">NISA・iDeCo・貯蓄などの資産運用口座を登録すると、将来の資産推移がシミュレーションされます。</p>

      {/* Quick presets */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">おすすめの積立（クリックで追加）</div>
        <div className="space-y-1.5">
          {quickPresets.map((p, i) => (
            <button key={i} onClick={() => { if (selfPerson) onAddInvestmentAccount({ personId: selfPerson.id, name: p.name, type: p.type, monthlyContribution: p.monthly, startAge: 25, endAge: 65, expectedReturn: p.ret }); }} className="w-full text-left text-xs bg-gray-50 hover:bg-blue-50 rounded-lg px-4 py-3 transition-colors border border-gray-100 flex justify-between items-center">
              <div><div className="font-medium text-gray-700">{p.name}</div><div className="text-gray-400">{p.desc}</div></div>
              <span className="text-blue-500 font-medium">+ 追加</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom add */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <div className="text-xs font-medium text-blue-700">カスタム追加</div>
        <div><label className={labelCls}>口座名</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="例：新NISA / iDeCo" /></div>
        <div><label className={labelCls}>種類</label><select className={inputCls} value={type} onChange={(e) => setType(e.target.value as InvestmentAccount['type'])}>{Object.entries(INVESTMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.description}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>月額（万円）</label><input className={inputCls} type="number" step="0.1" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} /></div>
          <div><label className={labelCls}>期待リターン（年%）</label><input className={inputCls} type="number" step="0.1" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>開始年齢</label><input className={inputCls} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
          <div><label className={labelCls}>終了年齢</label><input className={inputCls} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
        </div>
        <button onClick={handleAdd} className={btnPrimary}>追加する</button>
      </div>

      {/* List */}
      {investmentAccounts.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">登録済み口座（{investmentAccounts.length}件）</div>
          {investmentAccounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-1">
              <div><div className="text-xs font-medium">{acc.name}</div><div className="text-xs text-gray-400">月{acc.monthlyContribution}万 {acc.startAge}〜{acc.endAge}歳 (年{acc.expectedReturn}%)</div></div>
              <button onClick={() => onRemoveInvestmentAccount(acc.id)} className={btnDanger}>削除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Topic: Settings =====
function SettingsTopic({ persons, skills, memos, macroAssumptions, onAddSkill, onRemoveSkill, onAddMemo, onRemoveMemo, onSetMacroAssumptions }: InputPanelProps) {
  const [skillName, setSkillName] = useState('');
  const [skillAge, setSkillAge] = useState(30);
  const [skillCost, setSkillCost] = useState(0);
  const [memoAge, setMemoAge] = useState(30);
  const [memoContent, setMemoContent] = useState('');

  const selfPerson = persons.find((p) => p.relation === 'self');

  return (
    <div className="space-y-5">
      {/* Macro assumptions */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">シミュレーションの前提条件</div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>インフレ率（年%）</label><input className={inputCls} type="number" step="0.1" value={macroAssumptions.inflationRate} onChange={(e) => onSetMacroAssumptions({ inflationRate: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>投資リターン（年%）</label><input className={inputCls} type="number" step="0.1" value={macroAssumptions.investmentReturn} onChange={(e) => onSetMacroAssumptions({ investmentReturn: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>年金の受給開始</label><input className={inputCls} type="number" value={macroAssumptions.pensionStartAge} onChange={(e) => onSetMacroAssumptions({ pensionStartAge: Number(e.target.value) })} /></div>
            <div><label className={labelCls}>想定する寿命</label><input className={inputCls} type="number" value={macroAssumptions.lifeExpectancy} onChange={(e) => onSetMacroAssumptions({ lifeExpectancy: Number(e.target.value) })} /></div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">資格・スキルの取得計画</div>
        <div className="flex gap-2">
          <input className={inputCls} value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="資格名（例：MBA）" />
          <input className="w-16 px-2 py-2 text-sm border border-gray-200 rounded-lg" type="number" value={skillAge} onChange={(e) => setSkillAge(Number(e.target.value))} />
          <span className="text-xs text-gray-400 self-center">歳</span>
          <button onClick={() => { if (skillName.trim() && selfPerson) { onAddSkill({ personId: selfPerson.id, name: skillName.trim(), targetAge: skillAge, cost: skillCost, note: '' }); setSkillName(''); } }} className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap">追加</button>
        </div>
        {skills.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mt-1">
            <span className="text-xs">{s.targetAge}歳: {s.name}{s.cost > 0 && ` (${s.cost}万円)`}</span>
            <button onClick={() => onRemoveSkill(s.id)} className={btnDanger}>削除</button>
          </div>
        ))}
      </div>

      {/* Memos */}
      <div>
        <div className="text-xs font-medium text-gray-600 mb-2">面談メモ・アドバイザーノート</div>
        <div className="flex gap-2 items-start">
          <input className="w-16 px-2 py-2 text-sm border border-gray-200 rounded-lg" type="number" value={memoAge} onChange={(e) => setMemoAge(Number(e.target.value))} />
          <span className="text-xs text-gray-400 self-center">歳</span>
          <textarea className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg h-16 resize-none" value={memoContent} onChange={(e) => setMemoContent(e.target.value)} placeholder="メモを入力..." />
          <button onClick={() => { if (memoContent.trim() && selfPerson) { onAddMemo({ personId: selfPerson.id, age: memoAge, content: memoContent.trim() }); setMemoContent(''); } }} className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap self-end">追加</button>
        </div>
        {memos.map((m) => (
          <div key={m.id} className="flex items-start justify-between bg-yellow-50 rounded-lg px-3 py-2 mt-1">
            <div><span className="text-xs text-gray-400">{m.age}歳:</span> <span className="text-xs">{m.content}</span></div>
            <button onClick={() => onRemoveMemo(m.id)} className={btnDanger}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
