'use client';

import React, { useState } from 'react';
import { WorkStyle } from '@/types';

interface WizardFlowProps {
  onComplete: (data: WizardData) => void;
  onSkip: () => void;
}

export interface WizardData {
  name: string;
  birthYear: number;
  hasSpouse: boolean;
  spouseName: string;
  spouseBirthYear: number;
  spouseIncome: number;
  children: { name: string; birthYear: number }[];
  planMoreChildren: boolean;
  moreChildrenCount: number;
  workStyle: WorkStyle;
  company: string;
  position: string;
  income: number;
  planJobChange: boolean;
  jobChangeAge: number;
  jobChangeIncome: number;
  planFreelance: boolean;
  freelanceAge: number;
  freelanceIncome: number;
  retireAge: number;
  expectRetirementBonus: boolean;
  retirementBonus: number;
  currentlyRenting: boolean;
  monthlyRent: number;
  planBuyHouse: boolean;
  houseBuyAge: number;
  housePrice: number;
  houseDownPayment: number;
  monthlySaving: number;
  hasNisa: boolean;
  nisaMonthly: number;
  hasIdeco: boolean;
  idecoMonthly: number;
  hasLifeInsurance: boolean;
  lifeInsuranceCost: number;
  hasMedicalInsurance: boolean;
  medicalInsuranceCost: number;
  hasCar: boolean;
  carCost: number;
  monthlyLiving: number;
  hasDebt: boolean;
  debtAmount: number;
  debtMonthly: number;
  planWedding: boolean;
  weddingAge: number;
  weddingCost: number;
  planChildEducation: 'public' | 'private_arts' | 'private_science';
  planStudyAbroad: boolean;
  studyAbroadAge: number;
  planParentCare: boolean;
  parentCareAge: number;
}

const DEFAULTS: WizardData = {
  name: '', birthYear: 1995,
  hasSpouse: false, spouseName: '', spouseBirthYear: 1995, spouseIncome: 0,
  children: [], planMoreChildren: false, moreChildrenCount: 1,
  workStyle: 'employee', company: '', position: '', income: 350,
  planJobChange: false, jobChangeAge: 35, jobChangeIncome: 500,
  planFreelance: false, freelanceAge: 35, freelanceIncome: 800,
  retireAge: 65, expectRetirementBonus: true, retirementBonus: 1000,
  currentlyRenting: true, monthlyRent: 8, planBuyHouse: false, houseBuyAge: 35, housePrice: 4000, houseDownPayment: 400,
  monthlySaving: 3, hasNisa: false, nisaMonthly: 3, hasIdeco: false, idecoMonthly: 2.3,
  hasLifeInsurance: false, lifeInsuranceCost: 1.5, hasMedicalInsurance: false, medicalInsuranceCost: 0.3,
  hasCar: false, carCost: 3, monthlyLiving: 15, hasDebt: false, debtAmount: 0, debtMonthly: 0,
  planWedding: false, weddingAge: 30, weddingCost: 300,
  planChildEducation: 'public', planStudyAbroad: false, studyAbroadAge: 20,
  planParentCare: false, parentCareAge: 60,
};

const STEPS = [
  { emoji: '👤', title: '基本情報', color: 'sky' },
  { emoji: '👨‍👩‍👧', title: '家族構成', color: 'pink' },
  { emoji: '💼', title: 'キャリア', color: 'amber' },
  { emoji: '🏠', title: '住まい', color: 'green' },
  { emoji: '💰', title: '家計・資産形成', color: 'violet' },
  { emoji: '📅', title: '将来のライフイベント', color: 'orange' },
];

export default function WizardFlow({ onComplete, onSkip }: WizardFlowProps) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<WizardData>(DEFAULTS);
  const u = (updates: Partial<WizardData>) => setD((prev) => ({ ...prev, ...updates }));

  const currentYear = new Date().getFullYear();
  const age = currentYear - d.birthYear;
  const canNext = step === 0 ? d.name.trim().length > 0 : true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">ステップ {step + 1} / {STEPS.length}</span>
            <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 underline">サンプルを確認する</button>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? 'bg-sky-500' : i === step ? 'bg-sky-400' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-2xl">{STEPS[step].emoji}</span>
            <h2 className="text-lg font-bold text-gray-800">{STEPS[step].title}</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-5">

          {/* ===== Step 0: 基本情報 ===== */}
          {step === 0 && <>
            <Q label="お名前">
              <Input value={d.name} onChange={(v) => u({ name: v })} placeholder="山田 太郎" autoFocus />
            </Q>
            <Q label="生年" hint={`現在 ${age}歳`}>
              <Num value={d.birthYear} onChange={(v) => u({ birthYear: v })} suffix="年生まれ" />
            </Q>
            <Q label="何歳まで働く予定ですか？">
              <Num value={d.retireAge} onChange={(v) => u({ retireAge: v })} suffix="歳" />
            </Q>
          </>}

          {/* ===== Step 1: 家族構成 ===== */}
          {step === 1 && <>
            <Q label="配偶者・パートナーはいますか？">
              <YesNo value={d.hasSpouse} onChange={(v) => u({ hasSpouse: v })} />
            </Q>
            {d.hasSpouse && <>
              <Q label="パートナーの氏名">
                <Input value={d.spouseName} onChange={(v) => u({ spouseName: v })} placeholder="山田 花子" />
              </Q>
              <Q label="パートナーの生年">
                <Num value={d.spouseBirthYear} onChange={(v) => u({ spouseBirthYear: v })} suffix="年" />
              </Q>
              <Q label="パートナーの年収（万円）" hint="不明な場合は0で構いません">
                <Num value={d.spouseIncome} onChange={(v) => u({ spouseIncome: v })} suffix="万円/年" />
              </Q>
            </>}

            <Q label="お子さまについて">
              {d.children.map((c, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <Input value={c.name} onChange={(v) => { const ch = [...d.children]; ch[i] = { ...ch[i], name: v }; u({ children: ch }); }} placeholder="氏名" />
                  <Num value={c.birthYear} onChange={(v) => { const ch = [...d.children]; ch[i] = { ...ch[i], birthYear: v }; u({ children: ch }); }} suffix={`年（${currentYear - c.birthYear}歳）`} />
                  <button onClick={() => u({ children: d.children.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 text-lg px-2">×</button>
                </div>
              ))}
              <button onClick={() => u({ children: [...d.children, { name: '', birthYear: currentYear }] })} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-sky-400 hover:text-sky-500 transition-colors">+ お子さまを追加</button>
            </Q>

            {d.children.length === 0 && (
              <Q label="今後お子さまの予定はありますか？">
                <YesNo value={d.planMoreChildren} onChange={(v) => u({ planMoreChildren: v })} />
                {d.planMoreChildren && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-500">何人の予定ですか？</label>
                    <div className="flex gap-2 mt-1">
                      {[1, 2, 3].map((n) => (
                        <Chip key={n} active={d.moreChildrenCount === n} onClick={() => u({ moreChildrenCount: n })} label={`${n}人`} />
                      ))}
                    </div>
                  </div>
                )}
              </Q>
            )}
          </>}

          {/* ===== Step 2: キャリア ===== */}
          {step === 2 && <>
            <Q label="現在の働き方">
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'employee' as WorkStyle, emoji: '🏢', name: '会社員' },
                  { key: 'freelance' as WorkStyle, emoji: '💻', name: 'フリーランス' },
                  { key: 'corporate_owner' as WorkStyle, emoji: '👔', name: '経営者・役員' },
                ]).map((w) => (
                  <Chip key={w.key} active={d.workStyle === w.key} onClick={() => u({ workStyle: w.key })} label={`${w.emoji} ${w.name}`} large />
                ))}
              </div>
            </Q>
            <Q label="勤務先・屋号">
              <Input value={d.company} onChange={(v) => u({ company: v })} placeholder="例：○○株式会社" />
            </Q>
            <Q label="職種・役職">
              <Input value={d.position} onChange={(v) => u({ position: v })} placeholder="例：営業、エンジニア" />
            </Q>
            <Q label="年収（税引き前）" hint={`月収換算で約${Math.round(d.income / 12)}万円`}>
              <Num value={d.income} onChange={(v) => u({ income: v })} suffix="万円/年" />
            </Q>

            <Q label="転職の予定はありますか？">
              <YesNo value={d.planJobChange} onChange={(v) => u({ planJobChange: v })} />
              {d.planJobChange && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="text-xs text-gray-500">想定時期</label><Num value={d.jobChangeAge} onChange={(v) => u({ jobChangeAge: v })} suffix="歳頃" /></div>
                  <div><label className="text-xs text-gray-500">転職後の想定年収</label><Num value={d.jobChangeIncome} onChange={(v) => u({ jobChangeIncome: v })} suffix="万円" /></div>
                </div>
              )}
            </Q>

            {d.workStyle === 'employee' && (
              <Q label="独立・フリーランス転向の予定はありますか？">
                <YesNo value={d.planFreelance} onChange={(v) => u({ planFreelance: v })} />
                {d.planFreelance && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div><label className="text-xs text-gray-500">想定時期</label><Num value={d.freelanceAge} onChange={(v) => u({ freelanceAge: v })} suffix="歳頃" /></div>
                    <div><label className="text-xs text-gray-500">想定売上</label><Num value={d.freelanceIncome} onChange={(v) => u({ freelanceIncome: v })} suffix="万円/年" /></div>
                  </div>
                )}
              </Q>
            )}

            <Q label="退職金の見込みはありますか？">
              <YesNo value={d.expectRetirementBonus} onChange={(v) => u({ expectRetirementBonus: v })} yesLabel="見込みあり" noLabel="見込みなし" />
              {d.expectRetirementBonus && (
                <div className="mt-3"><label className="text-xs text-gray-500">概算の金額</label><Num value={d.retirementBonus} onChange={(v) => u({ retirementBonus: v })} suffix="万円程度" /></div>
              )}
            </Q>
          </>}

          {/* ===== Step 3: 住まい ===== */}
          {step === 3 && <>
            <Q label="現在の住居形態は？">
              <YesNo value={d.currentlyRenting} onChange={(v) => u({ currentlyRenting: v })} yesLabel="賃貸" noLabel="持ち家・その他" />
              {d.currentlyRenting && (
                <div className="mt-3"><label className="text-xs text-gray-500">月額家賃</label><Num value={d.monthlyRent} onChange={(v) => u({ monthlyRent: v })} suffix="万円/月" /></div>
              )}
            </Q>

            <Q label="住宅の購入予定はありますか？">
              <YesNo value={d.planBuyHouse} onChange={(v) => u({ planBuyHouse: v })} yesLabel="購入予定あり" noLabel="今のところなし" />
              {d.planBuyHouse && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-gray-500">購入時期</label><Num value={d.houseBuyAge} onChange={(v) => u({ houseBuyAge: v })} suffix="歳頃" /></div>
                    <div><label className="text-xs text-gray-500">物件価格の目安</label><Num value={d.housePrice} onChange={(v) => u({ housePrice: v })} suffix="万円" /></div>
                  </div>
                  <div><label className="text-xs text-gray-500">頭金（初期資金）</label><Num value={d.houseDownPayment} onChange={(v) => u({ houseDownPayment: v })} suffix="万円" /></div>
                </div>
              )}
            </Q>
          </>}

          {/* ===== Step 4: 家計・資産形成 ===== */}
          {step === 4 && <>
            <Q label="月々の生活費はどの程度ですか？" hint="食費・光熱費・通信費・日用品など合計">
              <Num value={d.monthlyLiving} onChange={(v) => u({ monthlyLiving: v })} suffix="万円/月" />
            </Q>

            <Q label="月々の貯蓄額は？">
              <Num value={d.monthlySaving} onChange={(v) => u({ monthlySaving: v })} suffix="万円/月" />
            </Q>

            <Q label="NISA（少額投資非課税制度）を利用していますか？" hint="運用益が非課税になる投資制度">
              <YesNo value={d.hasNisa} onChange={(v) => u({ hasNisa: v })} yesLabel="利用中/開始予定" noLabel="利用しない" />
              {d.hasNisa && <div className="mt-3"><label className="text-xs text-gray-500">毎月の積立額</label><Num value={d.nisaMonthly} onChange={(v) => u({ nisaMonthly: v })} suffix="万円/月" /></div>}
            </Q>

            <Q label="iDeCo（個人型確定拠出年金）を利用していますか？" hint="掛金が全額所得控除になる年金制度">
              <YesNo value={d.hasIdeco} onChange={(v) => u({ hasIdeco: v })} yesLabel="利用中/開始予定" noLabel="利用しない" />
              {d.hasIdeco && <div className="mt-3"><label className="text-xs text-gray-500">毎月の掛金</label><Num value={d.idecoMonthly} onChange={(v) => u({ idecoMonthly: v })} suffix="万円/月" /></div>}
            </Q>

            <Q label="生命保険に加入していますか？">
              <YesNo value={d.hasLifeInsurance} onChange={(v) => u({ hasLifeInsurance: v })} />
              {d.hasLifeInsurance && <div className="mt-3"><label className="text-xs text-gray-500">月額保険料</label><Num value={d.lifeInsuranceCost} onChange={(v) => u({ lifeInsuranceCost: v })} suffix="万円/月" /></div>}
            </Q>

            <Q label="自動車を所有していますか（または予定）？">
              <YesNo value={d.hasCar} onChange={(v) => u({ hasCar: v })} />
              {d.hasCar && <div className="mt-3"><label className="text-xs text-gray-500">月額の維持費（車検・保険・ガソリン等）</label><Num value={d.carCost} onChange={(v) => u({ carCost: v })} suffix="万円/月" /></div>}
            </Q>

            <Q label="住宅ローン以外の借入はありますか？" hint="奨学金、カードローン等">
              <YesNo value={d.hasDebt} onChange={(v) => u({ hasDebt: v })} yesLabel="あり" noLabel="なし" />
              {d.hasDebt && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="text-xs text-gray-500">残高合計</label><Num value={d.debtAmount} onChange={(v) => u({ debtAmount: v })} suffix="万円" /></div>
                  <div><label className="text-xs text-gray-500">月々の返済額</label><Num value={d.debtMonthly} onChange={(v) => u({ debtMonthly: v })} suffix="万円/月" /></div>
                </div>
              )}
            </Q>
          </>}

          {/* ===== Step 5: 将来のライフイベント ===== */}
          {step === 5 && <>
            {!d.hasSpouse && (
              <Q label="結婚式の予定はありますか？">
                <YesNo value={d.planWedding} onChange={(v) => u({ planWedding: v })} />
                {d.planWedding && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div><label className="text-xs text-gray-500">想定時期</label><Num value={d.weddingAge} onChange={(v) => u({ weddingAge: v })} suffix="歳頃" /></div>
                    <div><label className="text-xs text-gray-500">予算</label><Num value={d.weddingCost} onChange={(v) => u({ weddingCost: v })} suffix="万円" /></div>
                  </div>
                )}
              </Q>
            )}

            {(d.children.length > 0 || d.planMoreChildren) && (
              <Q label="お子さまの教育方針は？">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'public' as const, label: '公立中心', hint: '費用を抑えたい' },
                    { key: 'private_arts' as const, label: '私立文系', hint: '標準的な費用' },
                    { key: 'private_science' as const, label: '私立理系', hint: '費用がかかる' },
                  ]).map((opt) => (
                    <Chip key={opt.key} active={d.planChildEducation === opt.key} onClick={() => u({ planChildEducation: opt.key })} label={`${opt.label}\n(${opt.hint})`} large />
                  ))}
                </div>
              </Q>
            )}

            {(d.children.length > 0 || d.planMoreChildren) && (
              <Q label="お子さまの留学は検討していますか？">
                <YesNo value={d.planStudyAbroad} onChange={(v) => u({ planStudyAbroad: v })} />
              </Q>
            )}

            <Q label="親の介護が必要になる見込みはありますか？">
              <YesNo value={d.planParentCare} onChange={(v) => u({ planParentCare: v })} yesLabel="見込みあり" noLabel="その予定はない" />
              {d.planParentCare && <div className="mt-3"><label className="text-xs text-gray-500">ご自身が何歳頃から？</label><Num value={d.parentCareAge} onChange={(v) => u({ parentCareAge: v })} suffix="歳頃" /></div>}
            </Q>

            {/* 完了メッセージ */}
            <div className="bg-sky-50 rounded-2xl p-5 space-y-2">
              <div className="text-sm font-bold text-sky-700">ご入力ありがとうございました</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>入力いただいた情報をもとに、ライフプランを自動生成します。</div>
                <div>生成後も自由に編集・追加が可能です。</div>
              </div>
            </div>
          </>}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pb-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3.5 border-2 border-gray-200 rounded-xl text-sm hover:bg-gray-50 font-medium">
              戻る
            </button>
          )}
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : onComplete(d)}
            disabled={!canNext}
            className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all ${
              canNext
                ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === STEPS.length - 1 ? 'ライフプランを生成する' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== UI Components =====

function Q({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="text-sm font-bold text-gray-800 mb-3">{label}</div>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, autoFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return <input className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} />;
}

function Num({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input className="w-28 px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none text-center" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {suffix && <span className="text-sm text-gray-500 whitespace-nowrap">{suffix}</span>}
    </div>
  );
}

function YesNo({ value, onChange, yesLabel, noLabel }: { value: boolean; onChange: (v: boolean) => void; yesLabel?: string; noLabel?: string }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onChange(true)} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${value ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500'}`}>{yesLabel || 'はい'}</button>
      <button onClick={() => onChange(false)} className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${!value ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500'}`}>{noLabel || 'いいえ'}</button>
    </div>
  );
}

function Chip({ active, onClick, label, large }: { active: boolean; onClick: () => void; label: string; large?: boolean }) {
  return (
    <button onClick={onClick} className={`${large ? 'py-3' : 'py-2'} px-3 rounded-xl border-2 text-xs font-medium text-center transition-all whitespace-pre-line ${active ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
      {label}
    </button>
  );
}
