'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';

// ===== 市場データ =====

interface IndustryProfile {
  label: string;
  medianByAge: Record<number, number>;
  changePremium: number;
  stayGrowth: number;
  changeGrowth: number;
  skillDecayRate: number;
}

const INDUSTRIES: Record<string, IndustryProfile> = {
  it: {
    label: 'IT・Web',
    medianByAge: { 25: 420, 28: 480, 30: 530, 33: 580, 35: 630, 38: 680, 40: 720, 45: 770, 50: 790 },
    changePremium: 0.18,
    stayGrowth: 0.012,
    changeGrowth: 0.035,
    skillDecayRate: 0.08,
  },
  finance: {
    label: '金融',
    medianByAge: { 25: 450, 28: 530, 30: 600, 33: 680, 35: 750, 38: 820, 40: 870, 45: 930, 50: 960 },
    changePremium: 0.15,
    stayGrowth: 0.015,
    changeGrowth: 0.03,
    skillDecayRate: 0.05,
  },
  consulting: {
    label: 'コンサル',
    medianByAge: { 25: 480, 28: 560, 30: 650, 33: 750, 35: 830, 38: 900, 40: 960, 45: 1020, 50: 1050 },
    changePremium: 0.20,
    stayGrowth: 0.018,
    changeGrowth: 0.04,
    skillDecayRate: 0.06,
  },
  manufacturer: {
    label: 'メーカー',
    medianByAge: { 25: 380, 28: 430, 30: 480, 33: 530, 35: 570, 38: 610, 40: 650, 45: 700, 50: 720 },
    changePremium: 0.12,
    stayGrowth: 0.01,
    changeGrowth: 0.025,
    skillDecayRate: 0.04,
  },
  trading: {
    label: '商社',
    medianByAge: { 25: 430, 28: 510, 30: 580, 33: 660, 35: 730, 38: 800, 40: 850, 45: 900, 50: 920 },
    changePremium: 0.14,
    stayGrowth: 0.015,
    changeGrowth: 0.03,
    skillDecayRate: 0.05,
  },
  medical: {
    label: '医療・製薬',
    medianByAge: { 25: 400, 28: 470, 30: 530, 33: 590, 35: 640, 38: 690, 40: 730, 45: 780, 50: 810 },
    changePremium: 0.13,
    stayGrowth: 0.012,
    changeGrowth: 0.028,
    skillDecayRate: 0.04,
  },
  realestate: {
    label: '不動産',
    medianByAge: { 25: 390, 28: 450, 30: 510, 33: 560, 35: 600, 38: 640, 40: 680, 45: 720, 50: 740 },
    changePremium: 0.12,
    stayGrowth: 0.01,
    changeGrowth: 0.025,
    skillDecayRate: 0.04,
  },
  hr: {
    label: '人材',
    medianByAge: { 25: 370, 28: 420, 30: 470, 33: 520, 35: 560, 38: 600, 40: 630, 45: 670, 50: 690 },
    changePremium: 0.15,
    stayGrowth: 0.01,
    changeGrowth: 0.03,
    skillDecayRate: 0.06,
  },
  ad_media: {
    label: '広告・メディア',
    medianByAge: { 25: 380, 28: 440, 30: 500, 33: 550, 35: 600, 38: 640, 40: 680, 45: 720, 50: 740 },
    changePremium: 0.14,
    stayGrowth: 0.01,
    changeGrowth: 0.028,
    skillDecayRate: 0.06,
  },
  service: {
    label: 'サービス',
    medianByAge: { 25: 340, 28: 380, 30: 420, 33: 460, 35: 500, 38: 530, 40: 560, 45: 590, 50: 610 },
    changePremium: 0.12,
    stayGrowth: 0.008,
    changeGrowth: 0.022,
    skillDecayRate: 0.05,
  },
};

const YEARS_OPTIONS = [
  { value: 1, label: '1年未満' },
  { value: 2, label: '1〜3年' },
  { value: 4, label: '3〜5年' },
  { value: 7, label: '5〜10年' },
  { value: 12, label: '10〜15年' },
  { value: 18, label: '15年以上' },
];

const SALARY_OPTIONS = [300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 1000];

const POSITION_OPTIONS = [
  { value: 'staff', label: '一般社員', salaryMult: 1.0 },
  { value: 'lead', label: '主任・リーダー', salaryMult: 1.08 },
  { value: 'manager', label: '課長・マネージャー', salaryMult: 1.18 },
  { value: 'director', label: '部長以上', salaryMult: 1.30 },
];

const AGE_OPTIONS = [25, 28, 30, 33, 35, 38, 40, 45, 50];

// ===== 計算ロジック =====

function interpolateMedian(profile: IndustryProfile, age: number): number {
  const ages = Object.keys(profile.medianByAge).map(Number).sort((a, b) => a - b);
  if (age <= ages[0]) return profile.medianByAge[ages[0]];
  if (age >= ages[ages.length - 1]) return profile.medianByAge[ages[ages.length - 1]];

  for (let i = 0; i < ages.length - 1; i++) {
    if (age >= ages[i] && age <= ages[i + 1]) {
      const ratio = (age - ages[i]) / (ages[i + 1] - ages[i]);
      return Math.round(profile.medianByAge[ages[i]] + (profile.medianByAge[ages[i + 1]] - profile.medianByAge[ages[i]]) * ratio);
    }
  }
  return profile.medianByAge[ages[0]];
}

interface AnalysisResult {
  marketMedian: number;
  expectedAfterChange: number;
  annualLoss: number;
  lifetimeLoss: number;
  costOfWaitingOneYear: number;
  salaryProjection: { age: number; stay: number; change: number; market: number }[];
  cumulativeProjection: { age: number; stay: number; change: number; diff: number }[];
  waitingCost: { years: number; label: string; cost: number }[];
  riskFactors: { label: string; value: number; description: string }[];
  yearsToRetirement: number;
}

function analyze(
  age: number,
  industry: string,
  yearsAtCompany: number,
  currentSalary: number,
  position: string,
): AnalysisResult {
  const profile = INDUSTRIES[industry];
  const retireAge = 65;
  const yearsToRetirement = Math.max(0, retireAge - age);

  const marketMedian = interpolateMedian(profile, age);

  const posOpt = POSITION_OPTIONS.find((p) => p.value === position);
  const positionMult = posOpt?.salaryMult ?? 1.0;

  const changePremium = profile.changePremium * (1 + Math.min(yearsAtCompany, 10) * 0.01);
  const expectedAfterChange = Math.round(
    Math.max(currentSalary * (1 + changePremium), marketMedian * positionMult)
  );

  const stayGrowthPenalty = Math.max(0, (yearsAtCompany - 5) * 0.001);
  const effectiveStayGrowth = Math.max(0.002, profile.stayGrowth - stayGrowthPenalty);

  const salaryProjection: AnalysisResult['salaryProjection'] = [];
  const cumulativeProjection: AnalysisResult['cumulativeProjection'] = [];
  let cumStay = 0;
  let cumChange = 0;

  for (let y = 0; y <= yearsToRetirement; y++) {
    const a = age + y;
    const staySalary = Math.round(currentSalary * Math.pow(1 + effectiveStayGrowth, y));
    const changeSalary = Math.round(expectedAfterChange * Math.pow(1 + profile.changeGrowth, y));
    const marketSalary = interpolateMedian(profile, a);

    salaryProjection.push({ age: a, stay: staySalary, change: changeSalary, market: marketSalary });

    cumStay += staySalary;
    cumChange += changeSalary;
    cumulativeProjection.push({
      age: a,
      stay: Math.round(cumStay),
      change: Math.round(cumChange),
      diff: Math.round(cumChange - cumStay),
    });
  }

  const lifetimeLoss = cumulativeProjection.length > 0
    ? cumulativeProjection[cumulativeProjection.length - 1].diff
    : 0;

  const annualLoss = expectedAfterChange - currentSalary;

  let costIfWait1Year = 0;
  if (salaryProjection.length > 1) {
    const lostFirstYear = salaryProjection[0].change - salaryProjection[0].stay;
    const reducedPremium = changePremium * 0.95;
    const delayedChangeSalary = currentSalary * (1 + effectiveStayGrowth) * (1 + reducedPremium);
    const stayFirst = salaryProjection[0].stay;
    costIfWait1Year = Math.round(lostFirstYear + (expectedAfterChange * Math.pow(1 + profile.changeGrowth, yearsToRetirement - 1) - delayedChangeSalary * Math.pow(1 + profile.changeGrowth, yearsToRetirement - 2)));
    costIfWait1Year = Math.max(costIfWait1Year, Math.round(annualLoss * 1.3));
  }

  const waitingCost: AnalysisResult['waitingCost'] = [
    { years: 1, label: '1年後', cost: costIfWait1Year },
    { years: 2, label: '2年後', cost: Math.round(costIfWait1Year * 2.1) },
    { years: 3, label: '3年後', cost: Math.round(costIfWait1Year * 3.3) },
    { years: 5, label: '5年後', cost: Math.round(costIfWait1Year * 5.8) },
  ];

  const skillDecay = Math.min(95, Math.round(profile.skillDecayRate * yearsAtCompany * 100 / 1.5));
  const salaryGap = currentSalary < marketMedian
    ? Math.min(95, Math.round((1 - currentSalary / marketMedian) * 200))
    : Math.max(5, Math.round((1 - currentSalary / marketMedian) * -50 + 20));
  const careerNarrowing = Math.min(95, Math.round((age - 22) * 1.5 + yearsAtCompany * 2));
  const stagnation = Math.min(95, Math.round(yearsAtCompany * 6 + Math.max(0, age - 35) * 1.5));
  const peerGap = currentSalary < marketMedian
    ? Math.min(95, Math.round((marketMedian - currentSalary) / marketMedian * 150))
    : Math.max(5, 30 - Math.round((currentSalary - marketMedian) / marketMedian * 50));

  const riskFactors: AnalysisResult['riskFactors'] = [
    { label: 'スキル陳腐化リスク', value: skillDecay, description: `同じ環境${yearsAtCompany}年で市場スキルとの乖離が拡大` },
    { label: '年収停滞リスク', value: stagnation, description: `現職の昇給ペース(年${(effectiveStayGrowth * 100).toFixed(1)}%)は市場成長を下回る` },
    { label: 'キャリア選択肢の減少', value: careerNarrowing, description: `${age}歳・勤続${yearsAtCompany}年で転職市場での選択肢が縮小中` },
    { label: '同世代との年収差', value: peerGap, description: `業界中央値${marketMedian}万円に対して${currentSalary < marketMedian ? `${marketMedian - currentSalary}万円下回る` : `${currentSalary - marketMedian}万円上回る`}` },
  ];

  return {
    marketMedian,
    expectedAfterChange,
    annualLoss,
    lifetimeLoss,
    costOfWaitingOneYear: costIfWait1Year,
    salaryProjection,
    cumulativeProjection,
    waitingCost,
    riskFactors,
    yearsToRetirement,
  };
}

// ===== コンポーネント =====

function ChipSelector<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="mb-3">
      <div className="text-xs font-bold text-gray-500 mb-1.5 tracking-wide">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
              value === opt.value
                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {format ? format(opt.value) : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LossCard({
  label,
  value,
  sub,
  variant = 'loss',
  large = false,
}: {
  label: string;
  value: string;
  sub: string;
  variant?: 'loss' | 'gain' | 'warn';
  large?: boolean;
}) {
  const styles = {
    loss: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
    gain: 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100',
    warn: 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100',
  };
  const textStyles = {
    loss: 'text-red-700',
    gain: 'text-emerald-700',
    warn: 'text-amber-700',
  };

  return (
    <div className={`rounded-2xl border-2 p-4 ${styles[variant]} ${large ? 'col-span-2' : ''}`}>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className={`${large ? 'text-3xl' : 'text-xl'} font-black ${textStyles[variant]} tracking-tight`}>
        {variant === 'loss' || variant === 'warn' ? '▲ ' : '◎ '}{value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function RiskBar({ label, value, description }: { label: string; value: number; description: string }) {
  const color = value >= 70 ? 'bg-red-500' : value >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = value >= 70 ? 'text-red-600' : value >= 40 ? 'text-amber-600' : 'text-emerald-600';
  const levelLabel = value >= 70 ? '高リスク' : value >= 40 ? '中リスク' : '低リスク';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{levelLabel} ({value}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{description}</div>
    </div>
  );
}

function fmtMoney(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億円`;
  return `${v.toLocaleString()}万円`;
}

export default function JobChangeDashboard() {
  const [age, setAge] = useState(30);
  const [industry, setIndustry] = useState('it');
  const [yearsAtCompany, setYearsAtCompany] = useState(4);
  const [currentSalary, setCurrentSalary] = useState(500);
  const [position, setPosition] = useState('staff');

  const result = useMemo(
    () => analyze(age, industry, yearsAtCompany, currentSalary, position),
    [age, industry, yearsAtCompany, currentSalary, position]
  );

  const industryOptions = Object.entries(INDUSTRIES).map(([k, v]) => ({ value: k, label: v.label }));
  const ageOptions = AGE_OPTIONS.map((a) => ({ value: a, label: `${a}歳` }));
  const salaryOptions = SALARY_OPTIONS.map((s) => ({ value: s, label: `${s}万` }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-900/80 backdrop-blur border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💸</span>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">現状維持コスト診断</h1>
              <p className="text-xs text-gray-400">今の会社にいることで、あなたが失っている金額</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ステータス選択エリア */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h2 className="text-sm font-black text-gray-800">あなたのステータス</h2>
            <span className="text-xs text-gray-400 ml-2">選択すると下の診断結果がリアルタイムで変わります</span>
          </div>

          <ChipSelector label="年齢" options={ageOptions} value={age} onChange={setAge} />
          <ChipSelector label="業界" options={industryOptions} value={industry} onChange={setIndustry} />
          <ChipSelector label="勤続年数" options={YEARS_OPTIONS} value={yearsAtCompany} onChange={setYearsAtCompany} />
          <ChipSelector label="現在の年収" options={salaryOptions} value={currentSalary} onChange={setCurrentSalary} />
          <ChipSelector label="役職" options={POSITION_OPTIONS} value={position} onChange={setPosition} />
        </div>

        {/* ===== ビジュアル結果エリア ===== */}

        {/* メインの損失数字 */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl shadow-2xl p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="text-sm font-medium text-red-200 mb-2">
              このまま{result.yearsToRetirement}年間 今の会社にいると失う金額
            </div>
            <div className="text-5xl md:text-6xl font-black text-white tracking-tight mb-3">
              {fmtMoney(result.lifetimeLoss)}
            </div>
            <div className="text-sm text-red-200">
              転職した場合との生涯収入の差額（{age}歳〜65歳）
            </div>
          </div>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <LossCard
            label="年間の機会損失"
            value={fmtMoney(result.annualLoss)}
            sub="転職初年度の年収差"
            variant="loss"
          />
          <LossCard
            label="転職後の想定年収"
            value={fmtMoney(result.expectedAfterChange)}
            sub={`現年収+${Math.round(((result.expectedAfterChange - currentSalary) / currentSalary) * 100)}%`}
            variant="gain"
          />
          <LossCard
            label="1年待つコスト"
            value={fmtMoney(result.costOfWaitingOneYear)}
            sub="転職を1年遅らせた場合の損失"
            variant="warn"
          />
          <LossCard
            label="業界中央値との差"
            value={`${currentSalary >= result.marketMedian ? '+' : ''}${currentSalary - result.marketMedian}万円`}
            sub={`${INDUSTRIES[industry].label}の${age}歳中央値: ${result.marketMedian}万円`}
            variant={currentSalary >= result.marketMedian ? 'gain' : 'loss'}
          />
        </div>

        {/* 年収推移チャート */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-black text-gray-800 mb-1">年収推移シミュレーション</h3>
          <p className="text-xs text-gray-400 mb-4">現職を続けた場合 vs 今転職した場合 の年収推移</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={result.salaryProjection}>
              <defs>
                <linearGradient id="gradStay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradChange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
              <Tooltip
                formatter={(v, n) => [`${Number(v).toLocaleString()}万円`, n]}
                labelFormatter={(l) => `${l}歳`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <ReferenceLine x={age} stroke="#6B7280" strokeDasharray="5 5" label={{ value: '現在', fill: '#6B7280', fontSize: 11 }} />
              <Area type="monotone" dataKey="stay" stroke="#EF4444" fill="url(#gradStay)" strokeWidth={2.5} name="現職を続けた場合" />
              <Area type="monotone" dataKey="change" stroke="#10B981" fill="url(#gradChange)" strokeWidth={2.5} name="今転職した場合" />
              <Area type="monotone" dataKey="market" stroke="#6366F1" fill="none" strokeWidth={1.5} strokeDasharray="6 4" name="業界中央値" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 累計収入差チャート */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-black text-gray-800 mb-1">生涯手取り収入の差</h3>
          <p className="text-xs text-gray-400 mb-4">累計でどれだけ差が開くか — 赤い領域があなたの「損失」</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={result.cumulativeProjection}>
              <defs>
                <linearGradient id="gradDiff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 10000 ? `${(v / 10000).toFixed(1)}億` : `${v}万`} />
              <Tooltip
                formatter={(v) => [fmtMoney(Number(v)), '累計損失額']}
                labelFormatter={(l) => `${l}歳`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="diff" stroke="#EF4444" fill="url(#gradDiff)" strokeWidth={2.5} name="累計損失額" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 遅らせるコスト + リスク分析 - 2カラム */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 転職を遅らせるコスト */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-sm font-black text-gray-800 mb-1">転職を遅らせるコスト</h3>
            <p className="text-xs text-gray-400 mb-4">待てば待つほど損失が加速する</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={result.waitingCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                <Tooltip
                  formatter={(v) => [fmtMoney(Number(v)), '累計損失']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]} name="累計損失額">
                  {result.waitingCost.map((_, idx) => (
                    <Cell key={idx} fill={['#FCA5A5', '#F87171', '#EF4444', '#DC2626'][idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* リスク分析 */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-sm font-black text-gray-800 mb-1">現状維持リスク分析</h3>
            <p className="text-xs text-gray-400 mb-4">今の会社にいることのリスクを多角的に評価</p>
            {result.riskFactors.map((rf) => (
              <RiskBar key={rf.label} label={rf.label} value={rf.value} description={rf.description} />
            ))}
          </div>
        </div>

        {/* まとめメッセージ */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 mb-8 text-center">
          <div className="text-amber-400 text-sm font-bold mb-3">あなたの診断結果まとめ</div>
          <div className="text-white text-lg md:text-xl font-bold mb-4 leading-relaxed">
            {age}歳・{INDUSTRIES[industry].label}・年収{currentSalary}万円のあなたは、<br />
            <span className="text-red-400">毎月 {Math.round(result.annualLoss / 12).toLocaleString()}万円</span>ずつ
            機会損失が積み上がっています。
          </div>
          <div className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {result.yearsToRetirement}年後の定年時には、転職した場合と比べて
            <span className="text-red-400 font-bold"> {fmtMoney(result.lifetimeLoss)} </span>
            の差になります。
            転職を1年遅らせるだけで
            <span className="text-amber-400 font-bold"> {fmtMoney(result.costOfWaitingOneYear)} </span>
            の追加損失が発生します。
          </div>
          <div className="mt-6 inline-block bg-red-600 text-white px-8 py-3 rounded-2xl font-bold text-base shadow-lg shadow-red-900/30">
            転職市場での想定年収: {fmtMoney(result.expectedAfterChange)}
          </div>
        </div>
      </div>
    </div>
  );
}
