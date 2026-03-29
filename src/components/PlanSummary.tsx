'use client';

import React from 'react';
import { Scenario, LifeEvent, HousingLoan, RecurringExpense, InvestmentAccount, MacroAssumptions } from '@/types';
import {
  getLifetimeIncome,
  getTakeHomeAtAge,
  calcPensionEstimate,
  getInvestmentBalanceAtAge,
  calcRetirementGap,
  getTotalExpenseAtAge,
  formatMoney,
} from '@/utils/calculations';

interface PlanSummaryProps {
  scenarios: Scenario[];
  activeScenarioIds: string[];
  lifeEvents: LifeEvent[];
  housingLoans: HousingLoan[];
  recurringExpenses: RecurringExpense[];
  investmentAccounts: InvestmentAccount[];
  macroAssumptions: MacroAssumptions;
  currentAge: number;
}

export default function PlanSummary({
  scenarios, activeScenarioIds, lifeEvents, housingLoans,
  recurringExpenses, investmentAccounts, macroAssumptions, currentAge,
}: PlanSummaryProps) {
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));
  if (activeScenarios.length === 0) return null;

  const primary = activeScenarios[0];
  const retireAge = macroAssumptions.pensionStartAge;
  const lifeExpectancy = macroAssumptions.lifeExpectancy;

  // 生涯収入
  const lifetimeGross = getLifetimeIncome(primary.careerBlocks);
  let lifetimeTakeHome = 0;
  for (let a = 22; a < retireAge; a++) lifetimeTakeHome += getTakeHomeAtAge(primary.careerBlocks, a);

  // 生涯支出
  let lifetimeExpense = 0;
  for (let a = 22; a <= lifeExpectancy; a++) {
    lifetimeExpense += getTotalExpenseAtAge(lifeEvents, housingLoans, recurringExpenses, a);
  }

  // 老後
  const pension = calcPensionEstimate(primary.careerBlocks, retireAge);
  const investmentBalance = getInvestmentBalanceAtAge(investmentAccounts, retireAge);
  const desiredLiving = 300;
  const gap = calcRetirementGap(pension.annualPension, investmentBalance, desiredLiving, retireAge, lifeExpectancy);

  // 純資産
  const netWorth = lifetimeTakeHome - lifetimeExpense + investmentBalance;
  const isPositive = gap.gap <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-sm font-bold text-gray-700 mb-4">プランの概要</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 生涯収入 */}
        <MetricCard
          label="生涯収入（手取り）"
          value={formatMoney(Math.round(lifetimeTakeHome))}
          sub={`額面: ${formatMoney(lifetimeGross)}`}
          color="blue"
        />

        {/* 生涯支出 */}
        <MetricCard
          label="生涯支出"
          value={formatMoney(Math.round(lifetimeExpense))}
          sub={`${22}〜${lifeExpectancy}歳の合計`}
          color="red"
        />

        {/* 年金見込み */}
        <MetricCard
          label="年金見込み"
          value={`${formatMoney(Math.round(pension.annualPension))}/年`}
          sub={`${retireAge}歳から受給`}
          color="purple"
        />

        {/* 老後の資金 */}
        <MetricCard
          label={isPositive ? '老後の余裕' : '老後の不足'}
          value={formatMoney(Math.abs(gap.gap))}
          sub={`${retireAge}〜${lifeExpectancy}歳（${gap.yearsCovered}年カバー）`}
          color={isPositive ? 'green' : 'red'}
          highlight
        />
      </div>

      {/* 老後バー */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>老後の資金カバー率</span>
          <span>{Math.round((gap.yearsCovered / (lifeExpectancy - retireAge)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${isPositive ? 'bg-green-500' : 'bg-red-400'}`}
            style={{ width: `${Math.min(100, (gap.yearsCovered / (lifeExpectancy - retireAge)) * 100)}%` }}
          />
        </div>
        {!isPositive && (
          <div className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg p-2">
            💡 不足を解消するには：あと月{Math.round(gap.gap / ((retireAge - currentAge) * 12))}万円の貯蓄/投資、
            または{Math.ceil(gap.gap / (pension.annualPension > 0 ? pension.annualPension : 200))}年長く働くと改善できます
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color, highlight }: {
  label: string; value: string; sub: string; color: string; highlight?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
  };
  const textColors: Record<string, string> = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`rounded-xl border-2 p-3 ${colors[color]} ${highlight ? 'ring-2 ring-offset-1 ring-' + color + '-300' : ''}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${textColors[color]}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}
