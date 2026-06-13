'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';

// ===== 市場データ =====

interface IndustryProfile {
  label: string;
  icon: string;
  medianByAge: Record<number, number>;
  changePremium: number; // 転職時の上乗せ率
  stayGrowth: number;     // 現職での年間昇給率
  changeGrowth: number;   // 転職後の年間昇給率
  skillDecayRate: number; // スキル陳腐化の速さ
}

const INDUSTRIES: Record<string, IndustryProfile> = {
  it: {
    label: 'IT・Web', icon: '💻',
    medianByAge: { 25: 420, 28: 480, 30: 530, 33: 580, 35: 630, 38: 680, 40: 720, 45: 770, 50: 790 },
    changePremium: 0.18, stayGrowth: 0.012, changeGrowth: 0.035, skillDecayRate: 0.08,
  },
  finance: {
    label: '金融・保険', icon: '🏦',
    medianByAge: { 25: 450, 28: 530, 30: 600, 33: 680, 35: 750, 38: 820, 40: 870, 45: 930, 50: 960 },
    changePremium: 0.15, stayGrowth: 0.015, changeGrowth: 0.03, skillDecayRate: 0.05,
  },
  consulting: {
    label: 'コンサル', icon: '💡',
    medianByAge: { 25: 480, 28: 560, 30: 650, 33: 750, 35: 830, 38: 900, 40: 960, 45: 1020, 50: 1050 },
    changePremium: 0.20, stayGrowth: 0.018, changeGrowth: 0.04, skillDecayRate: 0.06,
  },
  manufacturer: {
    label: 'メーカー', icon: '🏭',
    medianByAge: { 25: 380, 28: 430, 30: 480, 33: 530, 35: 570, 38: 610, 40: 650, 45: 700, 50: 720 },
    changePremium: 0.12, stayGrowth: 0.01, changeGrowth: 0.025, skillDecayRate: 0.04,
  },
  trading: {
    label: '商社', icon: '🚢',
    medianByAge: { 25: 430, 28: 510, 30: 580, 33: 660, 35: 730, 38: 800, 40: 850, 45: 900, 50: 920 },
    changePremium: 0.14, stayGrowth: 0.015, changeGrowth: 0.03, skillDecayRate: 0.05,
  },
  medical: {
    label: '医療・製薬', icon: '💊',
    medianByAge: { 25: 400, 28: 470, 30: 530, 33: 590, 35: 640, 38: 690, 40: 730, 45: 780, 50: 810 },
    changePremium: 0.13, stayGrowth: 0.012, changeGrowth: 0.028, skillDecayRate: 0.04,
  },
  realestate: {
    label: '不動産・建設', icon: '🏗️',
    medianByAge: { 25: 390, 28: 450, 30: 510, 33: 560, 35: 600, 38: 640, 40: 680, 45: 720, 50: 740 },
    changePremium: 0.12, stayGrowth: 0.01, changeGrowth: 0.025, skillDecayRate: 0.04,
  },
  hr: {
    label: '人材・教育', icon: '🎓',
    medianByAge: { 25: 370, 28: 420, 30: 470, 33: 520, 35: 560, 38: 600, 40: 630, 45: 670, 50: 690 },
    changePremium: 0.15, stayGrowth: 0.01, changeGrowth: 0.03, skillDecayRate: 0.06,
  },
  ad_media: {
    label: '広告・メディア', icon: '📺',
    medianByAge: { 25: 380, 28: 440, 30: 500, 33: 550, 35: 600, 38: 640, 40: 680, 45: 720, 50: 740 },
    changePremium: 0.14, stayGrowth: 0.01, changeGrowth: 0.028, skillDecayRate: 0.06,
  },
  entertainment: {
    label: 'エンタメ・ゲーム', icon: '🎮',
    medianByAge: { 25: 390, 28: 450, 30: 510, 33: 570, 35: 620, 38: 660, 40: 700, 45: 740, 50: 760 },
    changePremium: 0.16, stayGrowth: 0.011, changeGrowth: 0.032, skillDecayRate: 0.07,
  },
  retail: {
    label: '小売・流通', icon: '🛍️',
    medianByAge: { 25: 350, 28: 390, 30: 430, 33: 470, 35: 510, 38: 540, 40: 570, 45: 600, 50: 620 },
    changePremium: 0.12, stayGrowth: 0.008, changeGrowth: 0.022, skillDecayRate: 0.05,
  },
  logistics: {
    label: '物流・運輸', icon: '🚚',
    medianByAge: { 25: 350, 28: 390, 30: 430, 33: 470, 35: 500, 38: 530, 40: 560, 45: 590, 50: 600 },
    changePremium: 0.11, stayGrowth: 0.008, changeGrowth: 0.02, skillDecayRate: 0.04,
  },
  service: {
    label: '外食・サービス', icon: '🍽️',
    medianByAge: { 25: 340, 28: 380, 30: 420, 33: 460, 35: 500, 38: 530, 40: 560, 45: 590, 50: 610 },
    changePremium: 0.12, stayGrowth: 0.008, changeGrowth: 0.022, skillDecayRate: 0.05,
  },
  infra: {
    label: 'インフラ・通信', icon: '⚡',
    medianByAge: { 25: 410, 28: 470, 30: 530, 33: 590, 35: 640, 38: 690, 40: 730, 45: 780, 50: 810 },
    changePremium: 0.13, stayGrowth: 0.013, changeGrowth: 0.026, skillDecayRate: 0.03,
  },
  public: {
    label: '公務員・団体', icon: '🏛️',
    medianByAge: { 25: 360, 28: 410, 30: 460, 33: 520, 35: 570, 38: 620, 40: 660, 45: 720, 50: 760 },
    changePremium: 0.10, stayGrowth: 0.018, changeGrowth: 0.02, skillDecayRate: 0.03,
  },
};

// 職種 — 市場価値の補正
const JOB_TYPES = [
  { value: 'engineer', label: 'エンジニア・技術', icon: '🛠️', mult: 1.10 },
  { value: 'consultant', label: '専門職・士業', icon: '🎖️', mult: 1.12 },
  { value: 'planning', label: '企画・マーケ', icon: '📊', mult: 1.05 },
  { value: 'sales', label: '営業', icon: '📞', mult: 1.02 },
  { value: 'creative', label: 'クリエイティブ', icon: '🎨', mult: 1.0 },
  { value: 'corporate', label: '管理・事務', icon: '📋', mult: 0.92 },
  { value: 'support', label: '販売・接客', icon: '🤝', mult: 0.88 },
];

// 会社規模 — 昇給ペース・転職妙味の補正
const COMPANY_SIZES = [
  { value: 'startup', label: 'スタートアップ', icon: '🚀', stayMod: 1.3, premiumMod: 1.1, changeGrowthMod: 1.2 },
  { value: 'small', label: '中小企業', icon: '🏪', stayMod: 0.6, premiumMod: 1.15, changeGrowthMod: 1.0 },
  { value: 'mid', label: '中堅企業', icon: '🏬', stayMod: 0.85, premiumMod: 1.0, changeGrowthMod: 1.0 },
  { value: 'large', label: '大手企業', icon: '🏢', stayMod: 0.9, premiumMod: 0.85, changeGrowthMod: 0.95 },
  { value: 'foreign', label: '外資系', icon: '🌐', stayMod: 1.1, premiumMod: 1.0, changeGrowthMod: 1.1 },
];

// エリア — 年収水準の補正
const REGIONS = [
  { value: 'tokyo', label: '東京23区', icon: '🗼', mult: 1.10 },
  { value: 'shutoken', label: '首都圏', icon: '🏙️', mult: 1.0 },
  { value: 'kansai', label: '関西', icon: '🏯', mult: 0.96 },
  { value: 'tokai', label: '中京・東海', icon: '🏭', mult: 0.95 },
  { value: 'local', label: '地方都市', icon: '🌾', mult: 0.86 },
  { value: 'remote', label: 'フルリモート', icon: '💻', mult: 1.05 },
];

// 転職回数 — 市場での動きやすさの補正
const JOB_CHANGE_COUNTS = [
  { value: 0, label: 'はじめて', icon: '🆕', premiumMod: 0.95 },
  { value: 1, label: '1回', icon: '1️⃣', premiumMod: 1.0 },
  { value: 2, label: '2回', icon: '2️⃣', premiumMod: 1.05 },
  { value: 3, label: '3回以上', icon: '3️⃣', premiumMod: 1.0 },
];

const YEARS_OPTIONS = [
  { value: 1, label: '1年未満', icon: '🌱' },
  { value: 2, label: '1〜3年', icon: '🌿' },
  { value: 4, label: '3〜5年', icon: '🌳' },
  { value: 7, label: '5〜10年', icon: '🌲' },
  { value: 12, label: '10〜15年', icon: '🗻' },
  { value: 18, label: '15〜20年', icon: '🏔️' },
  { value: 25, label: '20年以上', icon: '⛰️' },
];

const POSITION_OPTIONS = [
  { value: 'staff', label: '一般社員', icon: '👤', mult: 1.0 },
  { value: 'lead', label: '主任・リーダー', icon: '👥', mult: 1.08 },
  { value: 'manager', label: '課長・マネージャー', icon: '🧑‍💼', mult: 1.18 },
  { value: 'senior', label: '部長・次長', icon: '👔', mult: 1.30 },
  { value: 'exec', label: '役員・事業責任者', icon: '🎩', mult: 1.50 },
];

const AGE_OPTIONS = [24, 26, 28, 30, 32, 34, 36, 38, 40, 43, 46, 50, 55];

const SALARY_OPTIONS = [300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 1000, 1200];

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

interface AnalysisInput {
  age: number;
  industry: string;
  jobType: string;
  companySize: string;
  region: string;
  yearsAtCompany: number;
  currentSalary: number;
  position: string;
  jobChangeCount: number;
}

interface AnalysisResult {
  marketMedian: number;       // プロフィール補正後の市場中央値
  baseMarketMedian: number;   // 業界×年齢の素の中央値
  expectedAfterChange: number;
  annualLoss: number;
  lifetimeLoss: number;
  costOfWaitingOneYear: number;
  salaryProjection: { age: number; stay: number; change: number; market: number }[];
  cumulativeProjection: { age: number; stay: number; change: number; diff: number }[];
  waitingCost: { years: number; label: string; cost: number }[];
  riskFactors: { label: string; value: number; description: string }[];
  yearsToRetirement: number;
  effectiveStayGrowth: number;
  changeGrowth: number;
}

function analyze(input: AnalysisInput): AnalysisResult {
  const { age, industry, jobType, companySize, region, yearsAtCompany, currentSalary, position, jobChangeCount } = input;

  const profile = INDUSTRIES[industry];
  const retireAge = 65;
  const yearsToRetirement = Math.max(0, retireAge - age);

  const jobOpt = JOB_TYPES.find((j) => j.value === jobType) ?? JOB_TYPES[0];
  const sizeOpt = COMPANY_SIZES.find((c) => c.value === companySize) ?? COMPANY_SIZES[2];
  const regionOpt = REGIONS.find((r) => r.value === region) ?? REGIONS[1];
  const posOpt = POSITION_OPTIONS.find((p) => p.value === position) ?? POSITION_OPTIONS[0];
  const jcOpt = JOB_CHANGE_COUNTS.find((j) => j.value === jobChangeCount) ?? JOB_CHANGE_COUNTS[1];

  // 業界×年齢の素の中央値
  const baseMarketMedian = interpolateMedian(profile, age);
  // 職種・地域で補正した「あなたの市場価値の中央値」
  const marketMedian = Math.round(baseMarketMedian * jobOpt.mult * regionOpt.mult);

  // 転職プレミアム（会社規模・転職回数・勤続年数で補正）
  const changePremium =
    profile.changePremium *
    sizeOpt.premiumMod *
    jcOpt.premiumMod *
    (1 + Math.min(yearsAtCompany, 12) * 0.01);

  // 転職後の想定年収 = 「現年収にプレミアム」 と 「市場中央値×役職」 の高い方
  const expectedAfterChange = Math.round(
    Math.max(currentSalary * (1 + changePremium), marketMedian * posOpt.mult)
  );

  // 現職での実質昇給率（会社規模・長期在籍で鈍化）
  const stayGrowthPenalty = Math.max(0, (yearsAtCompany - 5) * 0.0008);
  const effectiveStayGrowth = Math.max(0.002, profile.stayGrowth * sizeOpt.stayMod - stayGrowthPenalty);
  // 転職後の昇給率
  const changeGrowth = profile.changeGrowth * sizeOpt.changeGrowthMod;

  const salaryProjection: AnalysisResult['salaryProjection'] = [];
  const cumulativeProjection: AnalysisResult['cumulativeProjection'] = [];
  let cumStay = 0;
  let cumChange = 0;

  for (let y = 0; y <= yearsToRetirement; y++) {
    const a = age + y;
    const staySalary = Math.round(currentSalary * Math.pow(1 + effectiveStayGrowth, y));
    const changeSalary = Math.round(expectedAfterChange * Math.pow(1 + changeGrowth, y));
    const marketSalary = Math.round(interpolateMedian(profile, a) * jobOpt.mult * regionOpt.mult);

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

  // 1年待つコスト = 初年度の差 + プレミアムの目減り分を生涯換算
  let costIfWait1Year = Math.round(Math.max(annualLoss, 0) * 1.3);
  if (yearsToRetirement >= 2) {
    const lostFirstYear = Math.max(0, annualLoss);
    const premiumErosion = expectedAfterChange * 0.03; // 1年遅れるとプレミアムが目減り
    costIfWait1Year = Math.round(lostFirstYear + premiumErosion * (yearsToRetirement - 1) * 0.4);
    costIfWait1Year = Math.max(costIfWait1Year, Math.round(annualLoss * 1.3));
  }

  const waitingCost: AnalysisResult['waitingCost'] = [
    { years: 1, label: '1年後', cost: costIfWait1Year },
    { years: 2, label: '2年後', cost: Math.round(costIfWait1Year * 2.1) },
    { years: 3, label: '3年後', cost: Math.round(costIfWait1Year * 3.3) },
    { years: 5, label: '5年後', cost: Math.round(costIfWait1Year * 5.8) },
  ];

  // リスク指標
  const skillDecay = Math.min(95, Math.round(profile.skillDecayRate * yearsAtCompany * 100 / 1.5 * (jobType === 'engineer' || jobType === 'creative' ? 1.2 : 1)));
  const stagnation = Math.min(95, Math.round(yearsAtCompany * 5 + Math.max(0, age - 35) * 1.5 + (sizeOpt.stayMod < 0.8 ? 15 : 0)));
  const careerNarrowing = Math.min(95, Math.round((age - 22) * 1.6 + yearsAtCompany * 1.5));
  const peerGap = currentSalary < marketMedian
    ? Math.min(95, Math.round((marketMedian - currentSalary) / marketMedian * 160))
    : Math.max(5, 28 - Math.round((currentSalary - marketMedian) / marketMedian * 50));

  const riskFactors: AnalysisResult['riskFactors'] = [
    { label: 'スキル陳腐化リスク', value: skillDecay, description: `同じ環境${yearsAtCompany >= 18 ? '長期' : yearsAtCompany + '年'}で市場で求められるスキルとの差が拡大` },
    { label: '年収停滞リスク', value: stagnation, description: `現職の昇給ペースは年${(effectiveStayGrowth * 100).toFixed(1)}%（転職後は年${(changeGrowth * 100).toFixed(1)}%）` },
    { label: 'キャリア選択肢の減少', value: careerNarrowing, description: `${age}歳・勤続${yearsAtCompany}年。年齢が上がるほど転職の選択肢は狭まる` },
    { label: '同世代との年収差', value: peerGap, description: `あなたの市場中央値${marketMedian}万円に対し ${currentSalary < marketMedian ? `${marketMedian - currentSalary}万円 下回る` : `${currentSalary - marketMedian}万円 上回る`}` },
  ];

  return {
    marketMedian,
    baseMarketMedian,
    expectedAfterChange,
    annualLoss,
    lifetimeLoss,
    costOfWaitingOneYear: costIfWait1Year,
    salaryProjection,
    cumulativeProjection,
    waitingCost,
    riskFactors,
    yearsToRetirement,
    effectiveStayGrowth,
    changeGrowth,
  };
}

// ===== 汎用UI =====

interface ChipOption<T> { value: T; label: string; icon?: string }

function StatusSection<T extends string | number>({
  step, icon, label, hint, options, value, onChange, format,
}: {
  step: number;
  icon: string;
  label: string;
  hint: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-[10px] font-bold flex-shrink-0">{step}</span>
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-bold text-gray-800">{label}</span>
        <span className="text-[11px] text-gray-400">{hint}</span>
        {current && (
          <span className="ml-auto text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {format ? format(value) : current.label}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border-2 flex items-center gap-1 ${
              value === opt.value
                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm scale-[1.03]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.icon && <span className="text-xs">{opt.icon}</span>}
            {format ? format(opt.value) : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LossCard({ label, value, sub, variant = 'loss' }: {
  label: string; value: string; sub: string; variant?: 'loss' | 'gain' | 'warn';
}) {
  const styles = {
    loss: 'border-red-300 bg-gradient-to-br from-red-50 to-red-100',
    gain: 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100',
    warn: 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100',
  };
  const textStyles = {
    loss: 'text-red-700', gain: 'text-emerald-700', warn: 'text-amber-700',
  };
  return (
    <div className={`rounded-2xl border-2 p-4 ${styles[variant]}`}>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-black ${textStyles[variant]} tracking-tight`}>
        {variant === 'loss' || variant === 'warn' ? '▲ ' : '◎ '}{value}
      </div>
      <div className="text-xs text-gray-500 mt-1 leading-tight">{sub}</div>
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
        <span className={`text-xs font-bold ${textColor}`}>{levelLabel}（{value}）</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{description}</div>
    </div>
  );
}

function fmtMoney(v: number): string {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}億円`;
  return `${v.toLocaleString()}万円`;
}

// ===== メイン =====

export default function JobChangeDashboard() {
  const [age, setAge] = useState(30);
  const [industry, setIndustry] = useState('it');
  const [jobType, setJobType] = useState('engineer');
  const [companySize, setCompanySize] = useState('large');
  const [region, setRegion] = useState('tokyo');
  const [yearsAtCompany, setYearsAtCompany] = useState(4);
  const [currentSalary, setCurrentSalary] = useState(500);
  const [position, setPosition] = useState('staff');
  const [jobChangeCount, setJobChangeCount] = useState(0);
  const [showExplainer, setShowExplainer] = useState(false);

  const result = useMemo(
    () => analyze({ age, industry, jobType, companySize, region, yearsAtCompany, currentSalary, position, jobChangeCount }),
    [age, industry, jobType, companySize, region, yearsAtCompany, currentSalary, position, jobChangeCount]
  );

  const ageOptions = AGE_OPTIONS.map((a) => ({ value: a, label: `${a}歳` }));
  const salaryOptions = SALARY_OPTIONS.map((s) => ({ value: s, label: `${s}万` }));
  const industryOptions = Object.entries(INDUSTRIES).map(([k, v]) => ({ value: k, label: v.label, icon: v.icon }));

  const ind = INDUSTRIES[industry];
  const job = JOB_TYPES.find((j) => j.value === jobType)!;
  const size = COMPANY_SIZES.find((c) => c.value === companySize)!;
  const reg = REGIONS.find((r) => r.value === region)!;
  const pos = POSITION_OPTIONS.find((p) => p.value === position)!;
  const isUnderpaid = currentSalary < result.marketMedian;

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
        {/* 使い方の一言 */}
        <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
          <span className="text-lg">👇</span>
          <p className="text-sm text-gray-200">
            あてはまる項目をタップするだけ。<span className="font-bold text-white">選んだ瞬間に下のグラフと金額がリアルタイムで変化</span>します。
          </p>
        </div>

        {/* ===== ステータス選択：基本情報 ===== */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="text-lg">🧑</span>
            <h2 className="text-sm font-black text-gray-800">STEP 1 ── あなたの基本情報</h2>
          </div>

          <StatusSection step={1} icon="🎂" label="年齢" hint="定年までの残り年数に影響" options={ageOptions} value={age} onChange={setAge} />
          <StatusSection step={2} icon="🏢" label="業界" hint="年収水準と転職プレミアムに影響" options={industryOptions} value={industry} onChange={setIndustry} />
          <StatusSection step={3} icon="🧰" label="職種" hint="市場での価値（年収倍率）に影響" options={JOB_TYPES} value={jobType} onChange={setJobType} />
          <StatusSection step={4} icon="💴" label="現在の年収" hint="比較の基準になります" options={salaryOptions} value={currentSalary} onChange={setCurrentSalary} format={(v) => `${v}万`} />
        </div>

        {/* ===== ステータス選択：働き方・環境 ===== */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="text-lg">⚙️</span>
            <h2 className="text-sm font-black text-gray-800">STEP 2 ── 働き方・環境（精度アップ）</h2>
          </div>

          <StatusSection step={5} icon="📐" label="会社規模" hint="昇給ペースと転職メリットに影響" options={COMPANY_SIZES} value={companySize} onChange={setCompanySize} />
          <StatusSection step={6} icon="📍" label="勤務エリア" hint="地域ごとの年収水準に影響" options={REGIONS} value={region} onChange={setRegion} />
          <StatusSection step={7} icon="⏳" label="勤続年数" hint="長いほど昇給が鈍化しやすい" options={YEARS_OPTIONS} value={yearsAtCompany} onChange={setYearsAtCompany} />
          <StatusSection step={8} icon="🎖️" label="役職" hint="転職後に狙えるポジションに影響" options={POSITION_OPTIONS} value={position} onChange={setPosition} />
          <StatusSection step={9} icon="🔁" label="転職回数" hint="市場での動きやすさに影響" options={JOB_CHANGE_COUNTS} value={jobChangeCount} onChange={setJobChangeCount} />
        </div>

        {/* プロフィール要約 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs">
          {[`${age}歳`, `${ind.icon} ${ind.label}`, `${job.icon} ${job.label}`, `${size.icon} ${size.label}`, `${reg.icon} ${reg.label}`, `${pos.icon} ${pos.label}`, `年収${currentSalary}万円`].map((chip, i) => (
            <span key={i} className="bg-white/15 text-gray-200 px-3 py-1 rounded-full border border-white/10">{chip}</span>
          ))}
        </div>

        {/* ===== 結果：メインの損失数字 ===== */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl shadow-2xl p-8 mb-6 text-center relative overflow-hidden">
          <div className="relative">
            <div className="text-sm font-medium text-red-200 mb-2">
              このまま {result.yearsToRetirement}年間 今の会社にいると失う金額
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
          <LossCard label="年間の機会損失" value={fmtMoney(result.annualLoss)} sub="転職初年度の年収差" variant="loss" />
          <LossCard label="転職後の想定年収" value={fmtMoney(result.expectedAfterChange)} sub={`現年収 +${Math.round(((result.expectedAfterChange - currentSalary) / currentSalary) * 100)}%`} variant="gain" />
          <LossCard label="1年待つコスト" value={fmtMoney(result.costOfWaitingOneYear)} sub="転職を1年遅らせた損失" variant="warn" />
          <LossCard
            label="あなたの市場価値との差"
            value={`${currentSalary >= result.marketMedian ? '+' : ''}${currentSalary - result.marketMedian}万円`}
            sub={`市場中央値 ${result.marketMedian}万円`}
            variant={currentSalary >= result.marketMedian ? 'gain' : 'loss'}
          />
        </div>

        {/* 年収推移チャート */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-black text-gray-800 mb-1">📈 年収推移シミュレーション</h3>
          <p className="text-xs text-gray-400 mb-4">
            <span className="text-red-500 font-bold">━ 現職を続けた場合</span> ／
            <span className="text-emerald-600 font-bold"> ━ 今転職した場合</span> ／
            <span className="text-indigo-500 font-bold"> ┄ あなたの市場中央値</span>
          </p>
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
              <Area type="monotone" dataKey="market" stroke="#6366F1" fill="none" strokeWidth={1.5} strokeDasharray="6 4" name="市場中央値" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 累計収入差チャート */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-black text-gray-800 mb-1">💰 生涯収入の差（累計）</h3>
          <p className="text-xs text-gray-400 mb-4">時間が経つほど差が広がる — 赤い領域があなたの「損失」の積み上がり</p>
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

        {/* 遅らせるコスト + リスク分析 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-sm font-black text-gray-800 mb-1">⏰ 転職を遅らせるコスト</h3>
            <p className="text-xs text-gray-400 mb-4">待てば待つほど損失が加速します</p>
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

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-sm font-black text-gray-800 mb-1">⚠️ 現状維持リスク分析</h3>
            <p className="text-xs text-gray-400 mb-4">今の会社にいることのリスクを多角的に評価（0〜100）</p>
            {result.riskFactors.map((rf) => (
              <RiskBar key={rf.label} label={rf.label} value={rf.value} description={rf.description} />
            ))}
          </div>
        </div>

        {/* まとめメッセージ */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 mb-6 text-center">
          <div className="text-amber-400 text-sm font-bold mb-3">あなたの診断結果まとめ</div>
          <div className="text-white text-lg md:text-xl font-bold mb-4 leading-relaxed">
            {age}歳・{ind.label}・{job.label}・年収{currentSalary}万円のあなたは、<br />
            <span className="text-red-400">毎月 約{Math.max(0, Math.round(result.annualLoss / 12)).toLocaleString()}万円</span>ずつ
            機会損失が積み上がっています。
          </div>
          <div className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {result.yearsToRetirement}年後の定年時には、転職した場合と比べて
            <span className="text-red-400 font-bold"> {fmtMoney(result.lifetimeLoss)} </span>
            の差になります。転職を1年遅らせるだけで
            <span className="text-amber-400 font-bold"> {fmtMoney(result.costOfWaitingOneYear)} </span>
            の追加損失が発生します。
            {isUnderpaid && <>あなたの年収は市場中央値を <span className="text-red-400 font-bold">{result.marketMedian - currentSalary}万円</span> 下回っています。</>}
          </div>
          <div className="mt-6 inline-block bg-red-600 text-white px-8 py-3 rounded-2xl font-bold text-base shadow-lg shadow-red-900/30">
            転職市場での想定年収: {fmtMoney(result.expectedAfterChange)}
          </div>
        </div>

        {/* 計算ロジックの説明（開閉式） */}
        <div className="bg-white/95 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <button
            onClick={() => setShowExplainer((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-sm font-bold text-gray-700">❓ この診断の見方・計算のしくみ</span>
            <span className="text-gray-400 text-lg">{showExplainer ? '−' : '+'}</span>
          </button>
          {showExplainer && (
            <div className="px-5 pb-5 text-xs text-gray-500 leading-relaxed space-y-2 border-t border-gray-100 pt-4">
              <p>・<b>市場中央値</b>＝「業界×年齢」の年収目安に、職種・勤務エリアの補正をかけて算出しています。</p>
              <p>・<b>転職後の想定年収</b>＝「今の年収＋転職プレミアム」と「市場中央値×役職」の高い方を採用。会社規模・転職回数・勤続年数でプレミアムが変動します。</p>
              <p>・<b>現職の年収カーブ</b>は会社規模ごとの昇給率を反映。中小・大手は昇給が鈍化しやすく設定しています。</p>
              <p>・<b>生涯損失</b>＝「転職した場合の累計年収」−「現職を続けた場合の累計年収」を定年（65歳）まで積み上げた額です。</p>
              <p className="text-gray-400 pt-2 border-t border-gray-100">
                ※ 本ツールは一般的な市場データをもとにした<b>概算シミュレーション</b>です。実際の年収・転職結果を保証するものではなく、キャリアを考えるきっかけとしてご活用ください。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
