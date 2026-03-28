'use client';

import React, { useState } from 'react';
import { Person, WorkStyle, WORK_STYLE_LABELS } from '@/types';

interface WizardFlowProps {
  onComplete: (data: WizardData) => void;
  onSkip: () => void;
}

export interface WizardData {
  name: string;
  birthYear: number;
  spouseName: string;
  spouseBirthYear: number;
  hasSpouse: boolean;
  children: { name: string; birthYear: number }[];
  currentCompany: string;
  currentPosition: string;
  currentIncome: number;
  workStyle: WorkStyle;
  planMarriage: boolean;
  marriageAge: number;
  planChildren: boolean;
  childCount: number;
  planHouse: boolean;
  houseAge: number;
  housePrice: number;
  retireAge: number;
}

const defaultData: WizardData = {
  name: '',
  birthYear: 1990,
  spouseName: '',
  spouseBirthYear: 1990,
  hasSpouse: false,
  children: [],
  currentCompany: '',
  currentPosition: '',
  currentIncome: 400,
  workStyle: 'employee',
  planMarriage: false,
  marriageAge: 30,
  planChildren: false,
  childCount: 1,
  planHouse: false,
  houseAge: 35,
  housePrice: 4000,
  retireAge: 65,
};

export default function WizardFlow({ onComplete, onSkip }: WizardFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(defaultData);

  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - data.birthYear;

  const steps = [
    { title: 'あなたのこと', desc: 'まずは基本情報から' },
    { title: '家族について', desc: 'パートナーやお子さまは？' },
    { title: '今のお仕事', desc: '現在のキャリアを教えてください' },
    { title: '今後のライフプラン', desc: 'これからの予定を大まかに' },
  ];

  const canNext = (() => {
    switch (step) {
      case 0: return data.name.trim().length > 0;
      case 1: return true;
      case 2: return data.currentCompany.trim().length > 0;
      case 3: return true;
      default: return true;
    }
  })();

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Progress bar */}
        <div className="bg-gray-50 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">ステップ {step + 1} / {steps.length}</span>
            <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 underline">
              スキップしてサンプルを見る
            </button>
          </div>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
            ))}
          </div>
          <h2 className="text-lg font-bold text-gray-800 mt-4">{steps[step].title}</h2>
          <p className="text-sm text-gray-500">{steps[step].desc}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {step === 0 && (
            <>
              <Field label="お名前" required>
                <input className={inputCls} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="例：山田 太郎" autoFocus />
              </Field>
              <Field label="生まれた年" hint={`現在 ${currentAge}歳`}>
                <input className={inputCls} type="number" value={data.birthYear} onChange={(e) => setData({ ...data, birthYear: Number(e.target.value) })} />
              </Field>
              <Field label="何歳でリタイアしたいですか？">
                <div className="flex items-center gap-3">
                  <input className={inputCls} type="number" value={data.retireAge} onChange={(e) => setData({ ...data, retireAge: Number(e.target.value) })} />
                  <span className="text-sm text-gray-500 whitespace-nowrap">歳</span>
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="配偶者・パートナーはいますか？">
                <div className="flex gap-3">
                  <ToggleButton active={data.hasSpouse} onClick={() => setData({ ...data, hasSpouse: true })}>はい</ToggleButton>
                  <ToggleButton active={!data.hasSpouse} onClick={() => setData({ ...data, hasSpouse: false })}>いいえ</ToggleButton>
                </div>
              </Field>
              {data.hasSpouse && (
                <>
                  <Field label="パートナーのお名前">
                    <input className={inputCls} value={data.spouseName} onChange={(e) => setData({ ...data, spouseName: e.target.value })} placeholder="例：山田 花子" />
                  </Field>
                  <Field label="パートナーの生まれた年">
                    <input className={inputCls} type="number" value={data.spouseBirthYear} onChange={(e) => setData({ ...data, spouseBirthYear: Number(e.target.value) })} />
                  </Field>
                </>
              )}
              <Field label="お子さまはいますか？">
                <div className="space-y-3">
                  {data.children.map((child, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <input
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        value={child.name}
                        onChange={(e) => {
                          const children = [...data.children];
                          children[i] = { ...children[i], name: e.target.value };
                          setData({ ...data, children });
                        }}
                        placeholder="お名前"
                      />
                      <input
                        className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        type="number"
                        value={child.birthYear}
                        onChange={(e) => {
                          const children = [...data.children];
                          children[i] = { ...children[i], birthYear: Number(e.target.value) };
                          setData({ ...data, children });
                        }}
                        placeholder="生年"
                      />
                      <span className="text-xs text-gray-400 whitespace-nowrap">{currentYear - child.birthYear}歳</span>
                      <button
                        onClick={() => setData({ ...data, children: data.children.filter((_, j) => j !== i) })}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setData({ ...data, children: [...data.children, { name: '', birthYear: currentYear }] })}
                    className="w-full py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    + お子さまを追加
                  </button>
                </div>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="働き方">
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(WORK_STYLE_LABELS) as [WorkStyle, typeof WORK_STYLE_LABELS[WorkStyle]][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setData({ ...data, workStyle: key })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        data.workStyle === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium">{val.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{val.description}</div>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="会社名・屋号" required>
                  <input className={inputCls} value={data.currentCompany} onChange={(e) => setData({ ...data, currentCompany: e.target.value })} placeholder="例：A株式会社" />
                </Field>
                <Field label="職種・役職">
                  <input className={inputCls} value={data.currentPosition} onChange={(e) => setData({ ...data, currentPosition: e.target.value })} placeholder="例：営業" />
                </Field>
              </div>
              <Field label={data.workStyle === 'freelance' ? '年間売上（万円）' : data.workStyle === 'corporate_owner' ? '役員報酬（万円/年）' : '年収（万円）'} hint="税金や手取りは自動で計算します">
                <input className={inputCls} type="number" value={data.currentIncome} onChange={(e) => setData({ ...data, currentIncome: Number(e.target.value) })} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              {!data.hasSpouse && (
                <Field label="結婚の予定はありますか？">
                  <div className="flex gap-3 items-center">
                    <ToggleButton active={data.planMarriage} onClick={() => setData({ ...data, planMarriage: true })}>はい</ToggleButton>
                    <ToggleButton active={!data.planMarriage} onClick={() => setData({ ...data, planMarriage: false })}>いいえ / 未定</ToggleButton>
                    {data.planMarriage && (
                      <div className="flex items-center gap-2 ml-2">
                        <input className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg" type="number" value={data.marriageAge} onChange={(e) => setData({ ...data, marriageAge: Number(e.target.value) })} />
                        <span className="text-sm text-gray-500">歳頃</span>
                      </div>
                    )}
                  </div>
                </Field>
              )}

              {data.children.length === 0 && (
                <Field label="お子さまの予定はありますか？">
                  <div className="flex gap-3 items-center">
                    <ToggleButton active={data.planChildren} onClick={() => setData({ ...data, planChildren: true })}>はい</ToggleButton>
                    <ToggleButton active={!data.planChildren} onClick={() => setData({ ...data, planChildren: false })}>いいえ / 未定</ToggleButton>
                    {data.planChildren && (
                      <div className="flex items-center gap-2 ml-2">
                        <select className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg" value={data.childCount} onChange={(e) => setData({ ...data, childCount: Number(e.target.value) })}>
                          <option value={1}>1人</option>
                          <option value={2}>2人</option>
                          <option value={3}>3人</option>
                        </select>
                      </div>
                    )}
                  </div>
                </Field>
              )}

              <Field label="マイホーム購入の予定はありますか？">
                <div className="flex gap-3 items-center">
                  <ToggleButton active={data.planHouse} onClick={() => setData({ ...data, planHouse: true })}>はい</ToggleButton>
                  <ToggleButton active={!data.planHouse} onClick={() => setData({ ...data, planHouse: false })}>いいえ / 未定</ToggleButton>
                </div>
                {data.planHouse && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <span className="text-xs text-gray-500">購入時期</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg" type="number" value={data.houseAge} onChange={(e) => setData({ ...data, houseAge: Number(e.target.value) })} />
                        <span className="text-sm text-gray-500">歳頃</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">予算の目安</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg" type="number" value={data.housePrice} onChange={(e) => setData({ ...data, housePrice: Number(e.target.value) })} />
                        <span className="text-sm text-gray-500">万円</span>
                      </div>
                    </div>
                  </div>
                )}
              </Field>

              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                このあと、より詳しい項目（保険・教育費・投資・老後など）を自由に追加できます。
                まずはここまでの情報でプランを作成しましょう。
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex gap-3">
          {step > 0 && (
            <button onClick={handleBack} className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              戻る
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-colors ${
              canNext
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === steps.length - 1 ? 'プランを作成する' : '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Helper Components =====

const inputCls = 'w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400';

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${
        active ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
