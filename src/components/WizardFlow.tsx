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

export default function WizardFlow({ onComplete, onSkip }: WizardFlowProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState(2000);
  const [income, setIncome] = useState(300);
  const [company, setCompany] = useState('');
  const [workStyle, setWorkStyle] = useState<WorkStyle>('employee');
  const [hasSpouse, setHasSpouse] = useState(false);
  const [spouseName, setSpouseName] = useState('');
  const [planHouse, setPlanHouse] = useState(false);

  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  const handleFinish = () => {
    onComplete({
      name, birthYear,
      spouseName, spouseBirthYear: birthYear + 2, hasSpouse,
      children: [],
      currentCompany: company, currentPosition: '', currentIncome: income,
      workStyle,
      planMarriage: false, marriageAge: 30,
      planChildren: false, childCount: 0,
      planHouse, houseAge: Math.max(age + 5, 30), housePrice: 4000,
      retireAge: 65,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">

        {/* ステップ1: 名前と生まれ年 */}
        {step === 0 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">👋</div>
              <h1 className="text-2xl font-bold text-gray-800">はじめまして！</h1>
              <p className="text-gray-500 mt-2">あなたの人生設計をいっしょに考えましょう</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">お名前を教えてください</label>
                <input
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="やまだ たろう"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">生まれた年は？</label>
                <div className="flex items-center gap-3">
                  <input
                    className="w-32 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none text-center"
                    type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}
                  />
                  <span className="text-lg text-gray-500">年生まれ</span>
                  <span className="text-lg font-bold text-sky-600">（{age}歳）</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => name.trim() && setStep(1)}
              disabled={!name.trim()}
              className={`w-full mt-8 py-4 rounded-xl text-lg font-bold transition-all ${
                name.trim()
                  ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              次へすすむ →
            </button>

            <button onClick={onSkip} className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600">
              サンプルデータで見てみる
            </button>
          </div>
        )}

        {/* ステップ2: かんたんな質問 */}
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📝</div>
              <h2 className="text-xl font-bold text-gray-800">{name}さん、いくつか教えてください</h2>
              <p className="text-sm text-gray-400 mt-1">あとから変えられるので、だいたいでOK！</p>
            </div>

            <div className="space-y-6">

              {/* 仕事 */}
              <div className="bg-sky-50 rounded-2xl p-4">
                <div className="text-sm font-bold text-sky-700 mb-3">💼 お仕事について</div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">どこで働いていますか？（会社名やお店の名前）</label>
                    <input className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:outline-none" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="例：○○株式会社" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">1年間にもらえるお金は？（税金を引く前で大丈夫）</label>
                    <div className="flex items-center gap-2">
                      <input className="w-28 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-center focus:border-sky-400 focus:outline-none" type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
                      <span className="text-sm text-gray-500">万円/年</span>
                      <span className="text-xs text-gray-400">（月{Math.round(income / 12)}万円くらい）</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">働き方は？</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { key: 'employee' as WorkStyle, label: '会社員', emoji: '🏢' },
                        { key: 'freelance' as WorkStyle, label: 'フリーランス', emoji: '💻' },
                        { key: 'corporate_owner' as WorkStyle, label: '会社の社長', emoji: '👔' },
                      ]).map((w) => (
                        <button key={w.key} onClick={() => setWorkStyle(w.key)}
                          className={`py-3 rounded-xl border-2 text-center transition-all ${workStyle === w.key ? 'border-sky-500 bg-white shadow-sm' : 'border-gray-200 bg-white'}`}>
                          <div className="text-xl">{w.emoji}</div>
                          <div className="text-xs mt-1">{w.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 家族 */}
              <div className="bg-pink-50 rounded-2xl p-4">
                <div className="text-sm font-bold text-pink-700 mb-3">💑 パートナーはいますか？</div>
                <div className="flex gap-3">
                  <BigToggle active={hasSpouse} onClick={() => setHasSpouse(true)} label="いる" />
                  <BigToggle active={!hasSpouse} onClick={() => setHasSpouse(false)} label="いない" />
                </div>
                {hasSpouse && (
                  <input className="w-full mt-3 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-pink-400 focus:outline-none" value={spouseName} onChange={(e) => setSpouseName(e.target.value)} placeholder="パートナーのお名前" />
                )}
              </div>

              {/* マイホーム */}
              <div className="bg-amber-50 rounded-2xl p-4">
                <div className="text-sm font-bold text-amber-700 mb-3">🏠 マイホームを買う予定は？</div>
                <div className="flex gap-3">
                  <BigToggle active={planHouse} onClick={() => setPlanHouse(true)} label="買いたい" />
                  <BigToggle active={!planHouse} onClick={() => setPlanHouse(false)} label="今はない" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="px-6 py-3.5 border-2 border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                ← 戻る
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3.5 bg-sky-500 text-white rounded-xl text-base font-bold hover:bg-sky-600 shadow-lg shadow-sky-200 transition-all"
              >
                プランを作る！ 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BigToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
        active ? 'border-sky-500 bg-white text-sky-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500'
      }`}>
      {label}
    </button>
  );
}
