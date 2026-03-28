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

type TopicKey = 'family' | 'work' | 'monthly' | 'house' | 'events' | 'saving' | 'check' | 'other';

// ===== Styles =====
const input = 'w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none bg-white';
const label = 'text-xs text-gray-500 mb-1 block';
const addBtn = 'w-full py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-all text-sm';
const delBtn = 'text-xs text-red-400 hover:text-red-600';
const card = 'bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between';

// ===== Main =====
export default function InputPanel(props: InputPanelProps) {
  const [open, setOpen] = useState<TopicKey | null>(null);

  const topics: { key: TopicKey; emoji: string; title: string; hint: string; count: number }[] = [
    { key: 'family', emoji: '👨‍👩‍👧', title: '家族', hint: 'いっしょに暮らす人を登録', count: props.persons.length },
    { key: 'work', emoji: '💼', title: 'しごと', hint: '今の仕事・将来のキャリア', count: props.scenarios.reduce((n, s) => n + s.careerBlocks.length, 0) },
    { key: 'monthly', emoji: '💸', title: '毎月かかるお金', hint: '生活費・保険・サブスクなど', count: props.recurringExpenses.length },
    { key: 'house', emoji: '🏠', title: '住まい', hint: '家賃・住宅ローン', count: props.housingLoans.length },
    { key: 'events', emoji: '🎉', title: '人生のイベント', hint: '結婚・出産・車の購入など', count: props.lifeEvents.length },
    { key: 'saving', emoji: '🐷', title: '貯金・投資', hint: 'NISA・iDeCo・ちょきんなど', count: props.investmentAccounts.length },
    { key: 'check', emoji: '✅', title: 'チェックリスト', hint: '見落としがないか確認', count: 0 },
    { key: 'other', emoji: '⚙️', title: 'その他の設定', hint: '資格・メモ・前提条件', count: props.skills.length + props.memos.length },
  ];

  // Detail view
  if (open) {
    const topic = topics.find((t) => t.key === open)!;
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button onClick={() => setOpen(null)} className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 border-b hover:bg-gray-100 transition-colors">
          <span className="text-gray-400 text-lg">←</span>
          <span className="text-xl">{topic.emoji}</span>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-800">{topic.title}</div>
            <div className="text-xs text-gray-400">{topic.hint}</div>
          </div>
        </button>
        <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {open === 'family' && <FamilyPage {...props} />}
          {open === 'work' && <WorkPage {...props} />}
          {open === 'monthly' && <MonthlyPage {...props} />}
          {open === 'house' && <HousePage {...props} />}
          {open === 'events' && <EventsPage {...props} />}
          {open === 'saving' && <SavingPage {...props} />}
          {open === 'check' && (
            <CoverageChecklist
              lifeEvents={props.lifeEvents} recurringExpenses={props.recurringExpenses}
              skills={props.skills} memos={props.memos} housingLoans={props.housingLoans}
              investmentAccounts={props.investmentAccounts} scenarios={props.scenarios}
              manualCheckmarks={props.manualCheckmarks} onToggleCheckmark={props.onToggleCheckmark}
              onSelectCategory={() => {}}
            />
          )}
          {open === 'other' && <OtherPage {...props} />}
        </div>
      </div>
    );
  }

  // Menu
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-5 py-4 bg-gray-50 border-b">
        <h2 className="text-base font-bold text-gray-800">プランの編集</h2>
        <p className="text-xs text-gray-400 mt-0.5">タップして情報を追加・変更できます</p>
      </div>

      <div className="p-3">
        {topics.map((t) => (
          <button key={t.key} onClick={() => setOpen(t.key)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-sky-50 transition-all text-left group mb-1">
            <span className="text-2xl">{t.emoji}</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-800 group-hover:text-sky-600">{t.title}</div>
              <div className="text-xs text-gray-400">{t.hint}</div>
            </div>
            {t.count > 0 && <span className="text-xs bg-sky-100 text-sky-600 px-2.5 py-1 rounded-full font-bold">{t.count}</span>}
            <span className="text-gray-300 group-hover:text-sky-400 text-lg">›</span>
          </button>
        ))}
      </div>

      <div className="border-t p-4 space-y-2">
        <button onClick={props.onLoadSample} className="w-full py-2.5 bg-sky-50 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-100">
          サンプルデータで試す
        </button>
        <button onClick={props.onResetAll} className="w-full py-2 text-xs text-gray-400 hover:text-red-500">
          ぜんぶ消す
        </button>
      </div>
    </div>
  );
}

// ===== 👨‍👩‍👧 家族 =====
function FamilyPage({ persons, onAddPerson, onRemovePerson }: InputPanelProps) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(1990);
  const [relation, setRelation] = useState<Person['relation']>('self');
  const y = new Date().getFullYear();
  const relLabels: Record<string, string> = { self: '👤 自分', spouse: '💑 パートナー', child: '👶 子ども', other: '👥 その他' };

  return (
    <div className="space-y-5">
      {/* 登録済み */}
      {persons.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-500">登録されている人</div>
          {persons.map((p) => (
            <div key={p.id} className={card}>
              <div>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2">{y - p.birthYear}歳 ({relLabels[p.relation]})</span>
              </div>
              <button onClick={() => onRemovePerson(p.id)} className={delBtn}>消す</button>
            </div>
          ))}
        </div>
      )}

      {/* 追加 */}
      <div className="bg-sky-50 rounded-2xl p-5 space-y-4">
        <div className="text-sm font-bold text-sky-700">家族を追加する</div>
        <div><label className={label}>名前</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="たろう" /></div>
        <div><label className={label}>生まれた年</label>
          <div className="flex items-center gap-2">
            <input className={`${input} w-32`} type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} />
            <span className="text-sm text-gray-500">年 （{y - birthYear}歳）</span>
          </div>
        </div>
        <div><label className={label}>だれ？</label>
          <div className="grid grid-cols-2 gap-2">
            {(['self', 'spouse', 'child', 'other'] as const).map((r) => (
              <button key={r} onClick={() => setRelation(r)} className={`py-3 rounded-xl border-2 text-sm transition-all ${relation === r ? 'border-sky-500 bg-white font-bold text-sky-700' : 'border-gray-200 bg-white text-gray-500'}`}>{relLabels[r]}</button>
            ))}
          </div>
        </div>
        <button onClick={() => { if (name.trim()) { onAddPerson({ name: name.trim(), birthYear, relation }); setName(''); } }} className={addBtn}>追加する</button>
      </div>
    </div>
  );
}

// ===== 💼 しごと =====
function WorkPage({ persons, scenarios, activeScenarioIds, onAddScenario, onRemoveScenario, onToggleScenario, onAddCareerBlock, onRemoveCareerBlock }: InputPanelProps) {
  const [scenarioName, setScenarioName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [personId, setPersonId] = useState(persons[0]?.id || '');
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(65);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [income, setIncome] = useState(400);
  const [workStyle, setWorkStyle] = useState<WorkStyle>('employee');

  const takeHome = (() => {
    switch (workStyle) {
      case 'employee': return calcEmployeeTakeHome(income).takeHome;
      case 'freelance': return calcFreelanceTakeHome(income, 30).takeHome;
      case 'corporate_owner': return calcCorporateOwnerTakeHome(income * 2, income).personalTakeHome;
    }
  })();

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-700">
        💡 <b>「シナリオ」って？</b><br />
        「もし転職したら？」「もし独立したら？」のように、<b>いろんな将来のパターン</b>を比べられる機能です。
        まずは1つ作ってみましょう。
      </div>

      {/* シナリオ一覧 */}
      {scenarios.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-500">シナリオ一覧</div>
          {scenarios.map((sc) => (
            <div key={sc.id} className={card}>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={activeScenarioIds.includes(sc.id)} onChange={() => onToggleScenario(sc.id)} className="w-4 h-4 rounded" />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sc.color }} />
                <span className="text-sm font-medium">{sc.name}</span>
              </div>
              <button onClick={() => onRemoveScenario(sc.id)} className={delBtn}>消す</button>
            </div>
          ))}
        </div>
      )}

      {/* 新しいシナリオ */}
      <div className="flex gap-2">
        <input className={input} value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="例：今の仕事をつづける" />
        <button onClick={() => { if (scenarioName.trim()) { const id = onAddScenario(scenarioName.trim()); setSelectedScenario(id); setScenarioName(''); } }} className="px-4 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-sky-600">作る</button>
      </div>

      {/* 仕事の詳細を追加 */}
      {scenarios.length > 0 && (
        <div className="bg-sky-50 rounded-2xl p-5 space-y-4">
          <div className="text-sm font-bold text-sky-700">仕事の詳細を追加</div>
          <div className="text-xs text-gray-500">いつ・どこで・いくらで働くかを登録します</div>

          <div><label className={label}>どのシナリオに追加する？</label><select className={input} value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}><option value="">えらんでください</option>{scenarios.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}</select></div>
          {persons.length > 1 && <div><label className={label}>だれの仕事？</label><select className={input} value={personId} onChange={(e) => setPersonId(e.target.value)}>{persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>}

          <div><label className={label}>働き方</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'employee' as WorkStyle, emoji: '🏢', name: '会社員' },
                { key: 'freelance' as WorkStyle, emoji: '💻', name: 'フリーランス' },
                { key: 'corporate_owner' as WorkStyle, emoji: '👔', name: '社長・役員' },
              ]).map((w) => (
                <button key={w.key} onClick={() => setWorkStyle(w.key)} className={`py-3 rounded-xl border-2 text-center transition-all ${workStyle === w.key ? 'border-sky-500 bg-white shadow-sm' : 'border-gray-200 bg-white'}`}>
                  <div className="text-lg">{w.emoji}</div>
                  <div className="text-xs mt-0.5">{w.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>何歳から</label><input className={input} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
            <div><label className={label}>何歳まで</label><input className={input} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>会社名やお店の名前</label><input className={input} value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            <div><label className={label}>仕事の内容</label><input className={input} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="例：営業" /></div>
          </div>
          <div><label className={label}>1年にもらえるお金（万円）</label>
            <input className={input} type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
            <div className="text-xs text-gray-400 mt-1">→ 税金を引くと、手元に残るのは約<b className="text-sky-600">{formatMoney(Math.round(takeHome))}</b>/年 くらい</div>
          </div>

          <button onClick={() => {
            if (!selectedScenario || !company.trim()) return;
            const sc = scenarios.find((s) => s.id === selectedScenario);
            onAddCareerBlock(selectedScenario, {
              personId: personId || persons[0]?.id, startAge, endAge, company: company.trim(), position: position.trim(), annualIncome: income, color: sc?.color || '#3B82F6', workStyle,
              ...(workStyle === 'freelance' ? { businessExpenseRate: 30 } : {}),
              ...(workStyle === 'corporate_owner' ? { corporateRevenue: income * 2, officerSalary: income } : {}),
            });
            setCompany(''); setPosition('');
          }} className={addBtn}>追加する</button>
        </div>
      )}

      {/* 登録済み */}
      {scenarios.map((sc) => sc.careerBlocks.length > 0 && (
        <div key={sc.id}>
          <div className="text-xs font-bold mb-1" style={{ color: sc.color }}>{sc.name}</div>
          {sc.careerBlocks.map((cb) => (
            <div key={cb.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 mb-1">
              <span className="text-xs">{cb.startAge}〜{cb.endAge}歳 {cb.company} {cb.annualIncome}万円/年</span>
              <button onClick={() => onRemoveCareerBlock(sc.id, cb.id)} className={delBtn}>消す</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ===== 💸 毎月かかるお金 =====
function MonthlyPage({ persons, recurringExpenses, onAddRecurringExpense, onRemoveRecurringExpense }: InputPanelProps) {
  const [name, setName] = useState('');
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(80);
  const [annualCost, setAnnualCost] = useState(0);
  const selfPerson = persons.find((p) => p.relation === 'self');

  const quickItems = [
    { name: '食費・光熱費など', cost: 180, emoji: '🍚' },
    { name: 'スマホ・ネット', cost: 12, emoji: '📱' },
    { name: '動画・音楽サブスク', cost: 6, emoji: '🎬' },
    { name: '生命保険', cost: 24, emoji: '🛡️' },
    { name: '洋服代', cost: 24, emoji: '👕' },
    { name: '車の維持費', cost: 50, emoji: '🚗' },
    { name: 'ジム・習いごと', cost: 12, emoji: '🏃' },
    { name: '美容院', cost: 12, emoji: '💇' },
  ];

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500">毎月・毎年、決まってかかるお金です。ボタンをタップすると追加されます。</div>

      {/* クイック追加 */}
      <div className="grid grid-cols-2 gap-2">
        {quickItems.map((item, i) => (
          <button key={i} onClick={() => {
            if (selfPerson) onAddRecurringExpense({ personId: selfPerson.id, name: item.name, startAge: 22, endAge: 80, annualCost: item.cost, category: 'living', majorCategory: 'expenses_living' });
          }} className="flex items-center gap-2 bg-gray-50 hover:bg-sky-50 border border-gray-100 rounded-xl px-3 py-3 text-left transition-all">
            <span className="text-xl">{item.emoji}</span>
            <div>
              <div className="text-xs font-bold text-gray-700">{item.name}</div>
              <div className="text-xs text-gray-400">年{item.cost}万円</div>
            </div>
          </button>
        ))}
      </div>

      {/* カスタム */}
      <div className="bg-sky-50 rounded-2xl p-5 space-y-3">
        <div className="text-sm font-bold text-sky-700">自分で追加する</div>
        <div><label className={label}>何のお金？</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="例：家賃、保育園など" /></div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className={label}>何歳から</label><input className={input} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
          <div><label className={label}>何歳まで</label><input className={input} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
          <div><label className={label}>1年でいくら（万円）</label><input className={input} type="number" value={annualCost} onChange={(e) => setAnnualCost(Number(e.target.value))} /></div>
        </div>
        <button onClick={() => { if (name.trim() && selfPerson) { onAddRecurringExpense({ personId: selfPerson.id, name: name.trim(), startAge, endAge, annualCost, category: 'living', majorCategory: 'expenses_living' }); setName(''); setAnnualCost(0); } }} className={addBtn}>追加する</button>
      </div>

      {/* 一覧 */}
      {recurringExpenses.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-500 mb-2">登録ずみ（{recurringExpenses.length}件）</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {recurringExpenses.map((e) => (
              <div key={e.id} className={card}>
                <span className="text-xs">{e.name} — 年{e.annualCost}万円 ({e.startAge}〜{e.endAge}歳)</span>
                <button onClick={() => onRemoveRecurringExpense(e.id)} className={delBtn}>消す</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 🏠 住まい =====
function HousePage({ persons, scenarios, activeScenarioIds, housingLoans, onAddHousingLoan, onRemoveHousingLoan }: InputPanelProps) {
  const [name, setName] = useState('マイホーム');
  const [purchaseAge, setPurchaseAge] = useState(35);
  const [propertyPrice, setPropertyPrice] = useState(4000);
  const [downPayment, setDownPayment] = useState(400);
  const [interestRate, setInterestRate] = useState(0.5);
  const [loanTermYears, setLoanTermYears] = useState(35);
  const selfPerson = persons.find((p) => p.relation === 'self');
  const loanAmount = propertyPrice - downPayment;
  const monthly = calcMonthlyPayment(loanAmount, interestRate, loanTermYears);
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));
  const incomeAtPurchase = activeScenarios.length > 0 ? getIncomeAtAge(activeScenarios[0].careerBlocks, purchaseAge) : 0;
  const tempLoan: HousingLoan = { id: '', personId: selfPerson?.id || '', name, purchaseAge, propertyPrice, downPayment, loanAmount, interestRate, loanTermYears };
  const assessment = assessHousingLoan(tempLoan, incomeAtPurchase);

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500">家を買ったら毎月いくら払う？審査は通る？をシミュレーションできます。</div>

      <div className="bg-sky-50 rounded-2xl p-5 space-y-4">
        <div><label className={label}>物件の名前</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label}>何歳で買う？</label><input className={input} type="number" value={purchaseAge} onChange={(e) => setPurchaseAge(Number(e.target.value))} /></div>
          <div><label className={label}>物件の値段（万円）</label><input className={input} type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label}>最初に払うお金（万円）</label><input className={input} type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} /></div>
          <div><label className={label}>借りる金額</label><div className="px-4 py-3 bg-white rounded-xl text-sm text-gray-700 border-2 border-gray-200">{formatMoney(loanAmount)}</div></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label}>金利（年 %）</label><input className={input} type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} /></div>
          <div><label className={label}>何年で返す？</label><input className={input} type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))} /></div>
        </div>

        {/* 結果 */}
        <div className={`rounded-2xl p-4 ${assessment.isApproved ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
          <div className={`text-sm font-bold mb-2 ${assessment.isApproved ? 'text-green-700' : 'text-red-700'}`}>
            {assessment.isApproved ? '✅ ローンが通りそうです！' : '⚠️ ローンが難しいかもしれません'}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded-lg p-2"><div className="text-gray-400">毎月の返済</div><div className="font-bold text-lg">{monthly.toFixed(1)}<span className="text-sm">万円</span></div></div>
            <div className="bg-white rounded-lg p-2"><div className="text-gray-400">返し終わる歳</div><div className="font-bold text-lg">{assessment.completionAge}<span className="text-sm">歳</span></div></div>
          </div>
          {assessment.warnings.map((w, i) => <div key={i} className="text-xs text-red-600 mt-2">⚠ {w}</div>)}
        </div>

        <button onClick={() => { if (selfPerson) { onAddHousingLoan({ personId: selfPerson.id, name, purchaseAge, propertyPrice, downPayment, loanAmount, interestRate, loanTermYears }); } }} className={addBtn}>ローンを追加する</button>
      </div>

      {housingLoans.map((loan) => (
        <div key={loan.id} className={card}>
          <div><div className="text-xs font-bold">{loan.name}</div><div className="text-xs text-gray-400">{loan.purchaseAge}歳〜 月{calcMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears).toFixed(1)}万円</div></div>
          <button onClick={() => onRemoveHousingLoan(loan.id)} className={delBtn}>消す</button>
        </div>
      ))}
    </div>
  );
}

// ===== 🎉 人生のイベント =====
function EventsPage({ persons, lifeEvents, onAddLifeEvent, onRemoveLifeEvent }: InputPanelProps) {
  const [age, setAge] = useState(30);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState(0);
  const [isExpense, setIsExpense] = useState(true);
  const selfPerson = persons.find((p) => p.relation === 'self');

  const quickEvents = [
    { emoji: '💍', title: '結婚', age: 30, cost: 300 },
    { emoji: '👶', title: '出産', age: 32, cost: 50 },
    { emoji: '🚗', title: '車を買う', age: 30, cost: 300 },
    { emoji: '🏠', title: '家のリフォーム', age: 55, cost: 500 },
    { emoji: '🎓', title: '子どもの大学', age: 48, cost: 500 },
    { emoji: '✈️', title: '海外旅行', age: 40, cost: 50 },
    { emoji: '🏥', title: '入院・手術', age: 50, cost: 100 },
    { emoji: '🎉', title: '退職金をもらう', age: 65, cost: 1500, income: true },
    { emoji: '🏖️', title: '老後の介護', age: 80, cost: 600 },
  ];

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500">人生で起こるできごとと、その費用を追加します。</div>

      <div className="grid grid-cols-3 gap-2">
        {quickEvents.map((ev, i) => (
          <button key={i} onClick={() => {
            if (selfPerson) onAddLifeEvent({ personId: selfPerson.id, age: ev.age, title: ev.title, cost: ev.cost, category: 'other', majorCategory: 'life_events', isExpense: !('income' in ev) });
          }} className="bg-gray-50 hover:bg-sky-50 border border-gray-100 rounded-xl p-3 text-center transition-all">
            <div className="text-2xl">{ev.emoji}</div>
            <div className="text-xs font-bold text-gray-700 mt-1">{ev.title}</div>
            <div className="text-xs text-gray-400">{ev.cost}万円</div>
          </button>
        ))}
      </div>

      <div className="bg-sky-50 rounded-2xl p-5 space-y-3">
        <div className="text-sm font-bold text-sky-700">自分で追加する</div>
        <div><label className={label}>何がある？</label><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：結婚、留学、引っ越し…" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label}>何歳のとき？</label><input className={input} type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
          <div><label className={label}>いくら？（万円）</label><input className={input} type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
        </div>
        <div><label className={label}>お金が出ていく？入ってくる？</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setIsExpense(true)} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${isExpense ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}>💸 出ていく</button>
            <button onClick={() => setIsExpense(false)} className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${!isExpense ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'}`}>💰 入ってくる</button>
          </div>
        </div>
        <button onClick={() => { if (title.trim() && selfPerson) { onAddLifeEvent({ personId: selfPerson.id, age, title: title.trim(), cost, category: 'other', majorCategory: 'life_events', isExpense }); setTitle(''); setCost(0); } }} className={addBtn}>追加する</button>
      </div>

      {lifeEvents.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-500 mb-2">登録ずみ（{lifeEvents.length}件）</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {lifeEvents.map((e) => (
              <div key={e.id} className={card}>
                <span className="text-xs">{e.age}歳: {e.title}{e.cost > 0 && <span className="text-gray-400 ml-1">{e.isExpense ? '-' : '+'}{e.cost}万</span>}</span>
                <button onClick={() => onRemoveLifeEvent(e.id)} className={delBtn}>消す</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 🐷 貯金・投資 =====
function SavingPage({ persons, investmentAccounts, onAddInvestmentAccount, onRemoveInvestmentAccount }: InputPanelProps) {
  const selfPerson = persons.find((p) => p.relation === 'self');

  const quickItems = [
    { emoji: '📊', name: '新NISA（つみたて）', type: 'nisa' as const, monthly: 5, ret: 4, hint: '月5万円・年4%で増える想定' },
    { emoji: '🏦', name: 'iDeCo（イデコ）', type: 'ideco' as const, monthly: 2.3, ret: 3, hint: '月2.3万円・税金がお得に' },
    { emoji: '💰', name: 'ふつうの貯金', type: 'savings' as const, monthly: 5, ret: 0.1, hint: '月5万円・銀行に預ける' },
  ];

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500">将来のためにお金を貯めたり、投資したりする計画を追加します。</div>

      <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-700">
        💡 <b>投資って？</b><br />
        銀行に預けるだけでなく、NISAやiDeCoを使うと<b>お金が少しずつ増えていく</b>可能性があります。
        ここではその計画を登録できます。
      </div>

      <div className="space-y-2">
        {quickItems.map((item, i) => (
          <button key={i} onClick={() => {
            if (selfPerson) onAddInvestmentAccount({ personId: selfPerson.id, name: item.name, type: item.type, monthlyContribution: item.monthly, startAge: 25, endAge: 65, expectedReturn: item.ret });
          }} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-sky-50 border border-gray-100 rounded-xl px-4 py-4 text-left transition-all">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-700">{item.name}</div>
              <div className="text-xs text-gray-400">{item.hint}</div>
            </div>
            <span className="text-sky-500 text-xs font-bold">+追加</span>
          </button>
        ))}
      </div>

      {investmentAccounts.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-500 mb-2">登録ずみ（{investmentAccounts.length}件）</div>
          {investmentAccounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-1">
              <div><div className="text-xs font-bold">{acc.name}</div><div className="text-xs text-gray-400">月{acc.monthlyContribution}万円 ({acc.startAge}〜{acc.endAge}歳)</div></div>
              <button onClick={() => onRemoveInvestmentAccount(acc.id)} className={delBtn}>消す</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== ⚙️ その他 =====
function OtherPage({ persons, skills, memos, macroAssumptions, onAddSkill, onRemoveSkill, onAddMemo, onRemoveMemo, onSetMacroAssumptions }: InputPanelProps) {
  const [skillName, setSkillName] = useState('');
  const [skillAge, setSkillAge] = useState(30);
  const [memoAge, setMemoAge] = useState(30);
  const [memoContent, setMemoContent] = useState('');
  const selfPerson = persons.find((p) => p.relation === 'self');

  return (
    <div className="space-y-6">
      {/* 前提条件 */}
      <div>
        <div className="text-sm font-bold text-gray-700 mb-2">⚙️ 計算の前提条件</div>
        <div className="text-xs text-gray-400 mb-3">ふつうはこのままでOKです</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={label}>物価の上昇率（年%）</label><input className={input} type="number" step="0.1" value={macroAssumptions.inflationRate} onChange={(e) => onSetMacroAssumptions({ inflationRate: Number(e.target.value) })} /></div>
          <div><label className={label}>投資のリターン（年%）</label><input className={input} type="number" step="0.1" value={macroAssumptions.investmentReturn} onChange={(e) => onSetMacroAssumptions({ investmentReturn: Number(e.target.value) })} /></div>
          <div><label className={label}>年金をもらい始める歳</label><input className={input} type="number" value={macroAssumptions.pensionStartAge} onChange={(e) => onSetMacroAssumptions({ pensionStartAge: Number(e.target.value) })} /></div>
          <div><label className={label}>何歳まで生きる想定？</label><input className={input} type="number" value={macroAssumptions.lifeExpectancy} onChange={(e) => onSetMacroAssumptions({ lifeExpectancy: Number(e.target.value) })} /></div>
        </div>
      </div>

      {/* 資格 */}
      <div>
        <div className="text-sm font-bold text-gray-700 mb-2">🎓 取りたい資格・スキル</div>
        <div className="flex gap-2">
          <input className={input} value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="例：MBA、運転免許…" />
          <input className="w-16 px-3 py-3 border-2 border-gray-200 rounded-xl text-sm text-center" type="number" value={skillAge} onChange={(e) => setSkillAge(Number(e.target.value))} />
          <span className="text-xs text-gray-400 self-center">歳</span>
          <button onClick={() => { if (skillName.trim() && selfPerson) { onAddSkill({ personId: selfPerson.id, name: skillName.trim(), targetAge: skillAge, cost: 0, note: '' }); setSkillName(''); } }} className="px-4 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold whitespace-nowrap">追加</button>
        </div>
        {skills.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 mt-1">
            <span className="text-xs">{s.targetAge}歳: {s.name}</span>
            <button onClick={() => onRemoveSkill(s.id)} className={delBtn}>消す</button>
          </div>
        ))}
      </div>

      {/* メモ */}
      <div>
        <div className="text-sm font-bold text-gray-700 mb-2">📝 メモ</div>
        <div className="flex gap-2 items-end">
          <div className="flex-shrink-0">
            <input className="w-16 px-3 py-3 border-2 border-gray-200 rounded-xl text-sm text-center" type="number" value={memoAge} onChange={(e) => setMemoAge(Number(e.target.value))} />
            <div className="text-xs text-gray-400 text-center">歳</div>
          </div>
          <textarea className="flex-1 px-3 py-3 border-2 border-gray-200 rounded-xl text-sm h-16 resize-none" value={memoContent} onChange={(e) => setMemoContent(e.target.value)} placeholder="メモを書く…" />
          <button onClick={() => { if (memoContent.trim() && selfPerson) { onAddMemo({ personId: selfPerson.id, age: memoAge, content: memoContent.trim() }); setMemoContent(''); } }} className="px-4 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold whitespace-nowrap">追加</button>
        </div>
        {memos.map((m) => (
          <div key={m.id} className="flex items-start justify-between bg-yellow-50 rounded-xl px-4 py-2 mt-1">
            <div><span className="text-xs text-gray-400">{m.age}歳:</span> <span className="text-xs">{m.content}</span></div>
            <button onClick={() => onRemoveMemo(m.id)} className={delBtn}>消す</button>
          </div>
        ))}
      </div>
    </div>
  );
}
