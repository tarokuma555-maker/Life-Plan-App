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
  skillDecayRate: number; // スキルの古くなりやすさ
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

// 職種 — 仕事の種類による年収の上がりやすさ
const JOB_TYPES = [
  { value: 'engineer', label: 'エンジニア・技術', icon: '🛠️', mult: 1.10 },
  { value: 'consultant', label: '専門職・士業', icon: '🎖️', mult: 1.12 },
  { value: 'planning', label: '企画・マーケ', icon: '📊', mult: 1.05 },
  { value: 'sales', label: '営業', icon: '📞', mult: 1.02 },
  { value: 'creative', label: 'クリエイティブ', icon: '🎨', mult: 1.0 },
  { value: 'corporate', label: '管理・事務', icon: '📋', mult: 0.92 },
  { value: 'support', label: '販売・接客', icon: '🤝', mult: 0.88 },
];

// 会社の大きさ — 昇給スピードと転職メリットの違い
const COMPANY_SIZES = [
  { value: 'startup', label: 'スタートアップ', icon: '🚀', stayMod: 1.3, premiumMod: 1.1, changeGrowthMod: 1.2 },
  { value: 'small', label: '中小企業', icon: '🏪', stayMod: 0.6, premiumMod: 1.15, changeGrowthMod: 1.0 },
  { value: 'mid', label: '中堅企業', icon: '🏬', stayMod: 0.85, premiumMod: 1.0, changeGrowthMod: 1.0 },
  { value: 'large', label: '大手企業', icon: '🏢', stayMod: 0.9, premiumMod: 0.85, changeGrowthMod: 0.95 },
  { value: 'foreign', label: '外資系', icon: '🌐', stayMod: 1.1, premiumMod: 1.0, changeGrowthMod: 1.1 },
];

// 働く場所 — 地域による給料の相場の違い
const REGIONS = [
  { value: 'tokyo', label: '東京23区', icon: '🗼', mult: 1.10 },
  { value: 'shutoken', label: '首都圏', icon: '🏙️', mult: 1.0 },
  { value: 'kansai', label: '関西', icon: '🏯', mult: 0.96 },
  { value: 'tokai', label: '中京・東海', icon: '🏭', mult: 0.95 },
  { value: 'local', label: '地方都市', icon: '🌾', mult: 0.86 },
  { value: 'remote', label: 'フルリモート', icon: '💻', mult: 1.05 },
];

// 転職回数 — 転職市場での動きやすさ
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
  marketMedian: number;       // プロフィール補正後の相場（あなたと同じ条件の人の平均年収）
  baseMarketMedian: number;   // 業界×年齢の素の相場
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

  // 業界×年齢の素の相場
  const baseMarketMedian = interpolateMedian(profile, age);
  // 職種・地域で補正した「あなたと同じ条件の人の平均年収（相場）」
  const marketMedian = Math.round(baseMarketMedian * jobOpt.mult * regionOpt.mult);

  // 転職時の上乗せ率（会社規模・転職回数・勤続年数で変動）
  const changePremium =
    profile.changePremium *
    sizeOpt.premiumMod *
    jcOpt.premiumMod *
    (1 + Math.min(yearsAtCompany, 12) * 0.01);

  // 転職後の想定年収 = 「今の年収＋上乗せ」 と 「相場×役職」 の高い方
  const expectedAfterChange = Math.round(
    Math.max(currentSalary * (1 + changePremium), marketMedian * posOpt.mult)
  );

  // 現職での実際の昇給率（会社規模・長く在籍するほど鈍くなる）
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

  // 1年待つコスト = 初年度の差 + 上乗せの目減り分を生涯換算
  let costIfWait1Year = Math.round(Math.max(annualLoss, 0) * 1.3);
  if (yearsToRetirement >= 2) {
    const lostFirstYear = Math.max(0, annualLoss);
    const premiumErosion = expectedAfterChange * 0.03; // 1年遅れると上乗せが目減り
    costIfWait1Year = Math.round(lostFirstYear + premiumErosion * (yearsToRetirement - 1) * 0.4);
    costIfWait1Year = Math.max(costIfWait1Year, Math.round(annualLoss * 1.3));
  }

  const waitingCost: AnalysisResult['waitingCost'] = [
    { years: 1, label: '1年後', cost: costIfWait1Year },
    { years: 2, label: '2年後', cost: Math.round(costIfWait1Year * 2.1) },
    { years: 3, label: '3年後', cost: Math.round(costIfWait1Year * 3.3) },
    { years: 5, label: '5年後', cost: Math.round(costIfWait1Year * 5.8) },
  ];

  // リスク指標（0〜100。大きいほど危険）
  const skillDecay = Math.min(95, Math.round(profile.skillDecayRate * yearsAtCompany * 100 / 1.5 * (jobType === 'engineer' || jobType === 'creative' ? 1.2 : 1)));
  const stagnation = Math.min(95, Math.round(yearsAtCompany * 5 + Math.max(0, age - 35) * 1.5 + (sizeOpt.stayMod < 0.8 ? 15 : 0)));
  const careerNarrowing = Math.min(95, Math.round((age - 22) * 1.6 + yearsAtCompany * 1.5));
  const peerGap = currentSalary < marketMedian
    ? Math.min(95, Math.round((marketMedian - currentSalary) / marketMedian * 160))
    : Math.max(5, 28 - Math.round((currentSalary - marketMedian) / marketMedian * 50));

  const yearsText = yearsAtCompany >= 25 ? '20年以上' : yearsAtCompany >= 18 ? '15年以上' : `${yearsAtCompany}年`;

  const riskFactors: AnalysisResult['riskFactors'] = [
    {
      label: 'スキルが古くなる',
      value: skillDecay,
      description: `同じ環境に${yearsText}いると、世の中で求められるスキルとのズレが広がります`,
    },
    {
      label: '給料が上がりにくい',
      value: stagnation,
      description: `今の会社の昇給は年 約${(effectiveStayGrowth * 100).toFixed(1)}%。転職後なら年 約${(changeGrowth * 100).toFixed(1)}%まで上がります`,
    },
    {
      label: '転職できる先が減っていく',
      value: careerNarrowing,
      description: `年齢が上がるほど応募できる求人は減ります（今 ${age}歳・勤続${yearsAtCompany}年）`,
    },
    {
      label: '同年代より給料が低い',
      value: peerGap,
      description: currentSalary < marketMedian
        ? `あなたの相場は ${marketMedian}万円。今の年収は それより ${marketMedian - currentSalary}万円 低い状態です`
        : `あなたの相場は ${marketMedian}万円。今の年収は それより ${currentSalary - marketMedian}万円 高めです`,
    },
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
      <div className="flex items-baseline gap-2 mb-1">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-[10px] font-bold flex-shrink-0">{step}</span>
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-bold text-gray-800">{label}</span>
        {current && (
          <span className="ml-auto text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {format ? format(value) : current.label}
          </span>
        )}
      </div>
      <div className="text-[11px] text-gray-400 mb-2 pl-7">{hint}</div>
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

function RiskBar({ label, value, description }: { label: string; value: number; description: string }) {
  const color = value >= 70 ? 'bg-red-500' : value >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
  const textColor = value >= 70 ? 'text-red-600' : value >= 40 ? 'text-amber-600' : 'text-emerald-600';
  const levelLabel = value >= 70 ? '危険' : value >= 40 ? '注意' : 'まあ安心';
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{levelLabel}（{value}/100）</span>
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
  const raisePct = Math.round(((result.expectedAfterChange - currentSalary) / currentSalary) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-900/80 backdrop-blur border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💸</span>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">今の会社、続けるといくら損？</h1>
              <p className="text-xs text-gray-400">転職した場合とくらべて、あなたが受け取れていないお金を計算します</p>
            </div>
          </div>
          <a
            href="https://hagiten.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 transition-all hover:scale-105 whitespace-nowrap"
          >
            <span>🏠</span>
            <span>トップへ戻る</span>
          </a>
        </div>
      </header>

      {/* 診断結果（常に画面上部に固定表示） */}
      <div className="sticky top-[60px] z-20 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 shadow-2xl">
        <div className="max-w-5xl mx-auto px-3 py-2.5">
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-3 mb-2 text-center">
            <div className="text-[11px] font-medium text-red-200 mb-0.5">このまま定年（65歳）まで今の会社にいると…</div>
            <div className="text-3xl md:text-4xl font-black text-white tracking-tight">{fmtMoney(result.lifetimeLoss)}</div>
            <div className="text-[10px] text-red-200 mt-0.5">転職した場合とくらべて、これだけ受け取れません（{age}歳〜65歳の合計）</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            <div className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100 p-2">
              <span className="inline-block text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-red-500 mb-0.5">損している</span>
              <div className="text-[10px] text-gray-500">1年でいくら損してる？</div>
              <div className="text-sm font-black text-red-700">{fmtMoney(Math.max(0, result.annualLoss))}</div>
            </div>
            <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100 p-2">
              <span className="inline-block text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-emerald-500 mb-0.5">増える</span>
              <div className="text-[10px] text-gray-500">転職したらいくら？</div>
              <div className="text-sm font-black text-emerald-700">{fmtMoney(result.expectedAfterChange)}</div>
              <div className="text-[9px] text-emerald-600">今より{raisePct >= 0 ? '+' : ''}{raisePct}%</div>
            </div>
            <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 p-2">
              <span className="inline-block text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-amber-500 mb-0.5">注意</span>
              <div className="text-[10px] text-gray-500">あと1年ためらうと？</div>
              <div className="text-sm font-black text-amber-700">{fmtMoney(result.costOfWaitingOneYear)}</div>
            </div>
            <div className={`rounded-xl border-2 p-2 ${isUnderpaid ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100' : 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
              <span className={`inline-block text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full mb-0.5 ${isUnderpaid ? 'bg-red-500' : 'bg-emerald-500'}`}>{isUnderpaid ? '相場より低い' : '相場より高い'}</span>
              <div className="text-[10px] text-gray-500">相場とくらべて</div>
              <div className={`text-sm font-black ${isUnderpaid ? 'text-red-700' : 'text-emerald-700'}`}>{currentSalary >= result.marketMedian ? '+' : ''}{currentSalary - result.marketMedian}万円</div>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 mt-1 text-center">※「損」＝転職していればもらえたお金 ／ 「相場」＝同条件の人の平均年収</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 仕組みのやさしい説明 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h2 className="text-sm font-black text-gray-800">30秒でわかる！ このツールの仕組み</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            日本では、同じ会社にいると給料は<b>毎年ほんの少しずつ</b>しか上がりません。
            でも転職すると、給料は<b className="text-red-600">「今のあなたの実力（市場価値）」で決まり直す</b>ので、一気に上がることがよくあります。
            このツールは、下の項目を選ぶだけで「転職した場合」と「今の会社に残った場合」の年収をくらべ、
            その差が一生でいくらになるかをグラフにします。
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg mb-1">①</div>
              <div className="text-xs text-gray-600 font-medium leading-tight">あてはまる項目を<br />タップ</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg mb-1">②</div>
              <div className="text-xs text-gray-600 font-medium leading-tight">下のグラフが<br />その場で変化</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg mb-1">③</div>
              <div className="text-xs text-gray-600 font-medium leading-tight">一生の損が<br />ひと目でわかる</div>
            </div>
          </div>
        </div>

        {/* ===== ステータス選択：基本情報 ===== */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="text-lg">🧑</span>
            <h2 className="text-sm font-black text-gray-800">STEP 1 ── あなたのことを教えて</h2>
          </div>

          <StatusSection step={1} icon="🎂" label="年齢" hint="65歳の定年まで、あと何年あるかを計算します" options={ageOptions} value={age} onChange={setAge} />
          <StatusSection step={2} icon="🏢" label="業界" hint="どの業界で働いているか。業界ごとに給料の相場が大きく違います" options={industryOptions} value={industry} onChange={setIndustry} />
          <StatusSection step={3} icon="🧰" label="職種" hint="どんな仕事をしているか。専門性が高い仕事ほど年収が上がりやすい傾向です" options={JOB_TYPES} value={jobType} onChange={setJobType} />
          <StatusSection step={4} icon="💴" label="今の年収" hint="今もらっている年収（手取りではなく、ボーナス込みの総額）" options={salaryOptions} value={currentSalary} onChange={setCurrentSalary} format={(v) => `${v}万`} />
        </div>

        {/* ===== ステータス選択：働き方・環境 ===== */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <span className="text-lg">⚙️</span>
            <h2 className="text-sm font-black text-gray-800">STEP 2 ── 今の働き方は？（答えるほど正確になります）</h2>
          </div>

          <StatusSection step={5} icon="📐" label="会社の大きさ" hint="大きい会社ほど安定だけど昇給はゆっくり、など傾向が変わります" options={COMPANY_SIZES} value={companySize} onChange={setCompanySize} />
          <StatusSection step={6} icon="📍" label="働く場所" hint="勤務地。東京など都市部は給料の相場が高めです" options={REGIONS} value={region} onChange={setRegion} />
          <StatusSection step={7} icon="⏳" label="今の会社で働いた年数" hint="長く働くほど昇給がゆっくりになりがちです" options={YEARS_OPTIONS} value={yearsAtCompany} onChange={setYearsAtCompany} />
          <StatusSection step={8} icon="🎖️" label="今の役職" hint="今の立場。上の役職ほど転職でも有利になります" options={POSITION_OPTIONS} value={position} onChange={setPosition} />
          <StatusSection step={9} icon="🔁" label="これまでの転職回数" hint="転職が初めてでも大丈夫。市場での動きやすさの目安になります" options={JOB_CHANGE_COUNTS} value={jobChangeCount} onChange={setJobChangeCount} />
        </div>

        {/* プロフィール要約 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-xs">
          {[`${age}歳`, `${ind.icon} ${ind.label}`, `${job.icon} ${job.label}`, `${size.icon} ${size.label}`, `${reg.icon} ${reg.label}`, `${pos.icon} ${pos.label}`, `年収${currentSalary}万円`].map((chip, i) => (
            <span key={i} className="bg-white/15 text-gray-200 px-3 py-1 rounded-full border border-white/10">{chip}</span>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mb-6">↓ 項目をタップすると、上の診断結果がリアルタイムで変わります ↓</p>

        {/* 年収推移チャート */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-black text-gray-800 mb-1">📈 これから年収はどう変わる？</h3>
          <p className="text-xs text-gray-500 mb-1 leading-relaxed">
            <span className="text-emerald-600 font-bold">上の緑の線</span>＝今 転職した場合 ／
            <span className="text-red-500 font-bold"> 下の赤の線</span>＝今の会社に残った場合。
          </p>
          <p className="text-xs text-gray-400 mb-4">この2本のすき間が、あなたが本当は受け取れるはずのお金です。</p>
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
                labelFormatter={(l) => `${l}歳のとき`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <ReferenceLine x={age} stroke="#6B7280" strokeDasharray="5 5" label={{ value: '今', fill: '#6B7280', fontSize: 11 }} />
              <Area type="monotone" dataKey="change" stroke="#10B981" fill="url(#gradChange)" strokeWidth={2.5} name="今 転職した場合" />
              <Area type="monotone" dataKey="stay" stroke="#EF4444" fill="url(#gradStay)" strokeWidth={2.5} name="今の会社に残った場合" />
              <Area type="monotone" dataKey="market" stroke="#6366F1" fill="none" strokeWidth={1.5} strokeDasharray="6 4" name="相場の平均" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 累計収入差チャート */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-black text-gray-800 mb-1">💰 損はこうやって積み重なる</h3>
          <p className="text-xs text-gray-400 mb-4">年を取るほど赤い山が高くなります。＝ 損がどんどん増えていく、ということです。</p>
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
                formatter={(v) => [fmtMoney(Number(v)), 'ここまでの損の合計']}
                labelFormatter={(l) => `${l}歳の時点`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="diff" stroke="#EF4444" fill="url(#gradDiff)" strokeWidth={2.5} name="ここまでの損の合計" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 遅らせるコスト + リスク分析 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-sm font-black text-gray-800 mb-1">⏰ ためらうほど損が増える</h3>
            <p className="text-xs text-gray-400 mb-4">転職を先延ばしにするほど、損の合計はふくらんでいきます。</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={result.waitingCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
                <Tooltip
                  formatter={(v) => [fmtMoney(Number(v)), '損の合計']}
                  labelFormatter={(l) => `転職を ${l} に延ばすと`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]} name="損の合計">
                  {result.waitingCost.map((_, idx) => (
                    <Cell key={idx} fill={['#FCA5A5', '#F87171', '#EF4444', '#DC2626'][idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-sm font-black text-gray-800 mb-1">⚠️ 今の会社に残り続けると…</h3>
            <p className="text-xs text-gray-400 mb-4">棒が長いほど「危険」。今の状況のリスクを4つの面でチェックしました。</p>
            {result.riskFactors.map((rf) => (
              <RiskBar key={rf.label} label={rf.label} value={rf.value} description={rf.description} />
            ))}
          </div>
        </div>

        {/* まとめメッセージ */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 mb-6 text-center">
          <div className="text-amber-400 text-sm font-bold mb-3">あなたの診断結果</div>
          <div className="text-white text-lg md:text-xl font-bold mb-4 leading-relaxed">
            {age}歳・{ind.label}・{job.label}・年収{currentSalary}万円のあなたは、<br />
            <span className="text-red-400">毎月およそ {Math.max(0, Math.round(result.annualLoss / 12)).toLocaleString()}万円</span>ずつ
            「もらい損ね」が積み上がっています。
          </div>
          <div className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
            このまま定年を迎えると、転職した場合より
            <span className="text-red-400 font-bold"> {fmtMoney(result.lifetimeLoss)} </span>
            少なくなります。しかも転職を1年延ばすごとに、
            <span className="text-amber-400 font-bold"> {fmtMoney(result.costOfWaitingOneYear)} </span>
            ずつ損が増えていきます。
            {isUnderpaid && <>今のあなたの年収は、相場より <span className="text-red-400 font-bold">{result.marketMedian - currentSalary}万円</span> 低い状態です。</>}
          </div>
          <div className="mt-6 inline-block bg-red-600 text-white px-8 py-3 rounded-2xl font-bold text-base shadow-lg shadow-red-900/30">
            転職市場でのあなたの想定年収：{fmtMoney(result.expectedAfterChange)}
          </div>
        </div>

        {/* 用語と計算のやさしい解説（開閉式） */}
        <div className="bg-white/95 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <button
            onClick={() => setShowExplainer((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-sm font-bold text-gray-700">❓ 言葉の意味と、計算のしくみをやさしく解説</span>
            <span className="text-gray-400 text-lg">{showExplainer ? '−' : '+'}</span>
          </button>
          {showExplainer && (
            <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed space-y-3 border-t border-gray-100 pt-4">
              <div>
                <p className="font-bold text-gray-700">🔹 「相場（市場価値）」ってなに？</p>
                <p>あなたと同じ業界・年齢・職種・地域の人たちが、転職市場で平均的にもらっている年収のことです。「世間の平均的なあなたの値段」とイメージしてください。</p>
              </div>
              <div>
                <p className="font-bold text-gray-700">🔹 なんで転職すると年収が上がるの？</p>
                <p>今の会社の給料は、入社時の額をベースにゆっくり上がります。一方、転職するときは「今のあなたの実力」で値段が決まり直すので、相場まで一気に追いつくことが多いんです。</p>
              </div>
              <div>
                <p className="font-bold text-gray-700">🔹 「損（もらい損ね）」ってどう計算してるの？</p>
                <p>「転職した場合にもらえる年収」から「今の会社に残った場合の年収」を引いた差を、定年（65歳）まで毎年たし合わせた金額です。グラフの2本の線のすき間の面積、と考えるとわかりやすいです。</p>
              </div>
              <div>
                <p className="font-bold text-gray-700">🔹 数字はどこまで正確？</p>
                <p>一般的な市場データをもとにした<b>ざっくりの試算</b>です。実際の年収や転職結果を保証するものではありません。「自分は損しているかも？」と気づき、キャリアを考えるきっかけとして使ってください。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
