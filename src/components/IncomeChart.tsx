'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
} from 'recharts';
import { HousingLoan, InvestmentAccount, LifeEvent, RecurringExpense, Scenario } from '@/types';
import {
  getIncomeData,
  getCumulativeData,
  getLifetimeIncome,
  getLoanPaymentAtAge,
  getRecurringExpenseAtAge,
  getTakeHomeAtAge,
  formatMoney,
} from '@/utils/calculations';

interface IncomeChartProps {
  scenarios: Scenario[];
  activeScenarioIds: string[];
  lifeEvents: LifeEvent[];
  housingLoans: HousingLoan[];
  recurringExpenses: RecurringExpense[];
  investmentAccounts: InvestmentAccount[];
  currentAge: number;
}

export default function IncomeChart({
  scenarios,
  activeScenarioIds,
  lifeEvents,
  housingLoans,
  recurringExpenses,
  investmentAccounts,
  currentAge,
}: IncomeChartProps) {
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));

  const incomeData = getIncomeData(scenarios, activeScenarioIds, 18, 80);
  const cumulativeData = getCumulativeData(scenarios, activeScenarioIds, lifeEvents, 18, 80, housingLoans, recurringExpenses, investmentAccounts);

  for (const entry of incomeData) {
    const age = entry.age as number;
    const eventExpenses = lifeEvents.filter((e) => e.isExpense && e.age === age).reduce((sum, e) => sum + e.cost, 0);
    const loanPayment = getLoanPaymentAtAge(housingLoans, age);
    const recurring = getRecurringExpenseAtAge(recurringExpenses, age);
    entry.eventExpenses = eventExpenses > 0 ? eventExpenses : 0;
    entry.loanPayment = loanPayment > 0 ? loanPayment : 0;
    entry.recurringExpenses = recurring > 0 ? recurring : 0;
    for (const scenario of activeScenarios) {
      entry[`${scenario.name}_手取り`] = getTakeHomeAtAge(scenario.careerBlocks, age);
    }
  }

  return (
    <div className="space-y-6">
      {/* Lifetime Income Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">生涯年収の比較（22〜65歳）</h3>
        <div className="flex gap-3 flex-wrap">
          {activeScenarios.map((scenario) => {
            const lifetime = getLifetimeIncome(scenario.careerBlocks);
            let lifetimeTakeHome = 0;
            for (let age = 22; age < 65; age++) lifetimeTakeHome += getTakeHomeAtAge(scenario.careerBlocks, age);
            return (
              <div key={scenario.id} className="flex-1 min-w-[160px] rounded-lg p-3 border-2" style={{ borderColor: scenario.color }}>
                <div className="text-xs font-medium" style={{ color: scenario.color }}>{scenario.name}</div>
                <div className="text-lg font-bold text-gray-800 mt-1">{formatMoney(lifetime)}</div>
                <div className="text-xs text-gray-500">手取り: 約{formatMoney(Math.round(lifetimeTakeHome))}</div>
              </div>
            );
          })}
          {activeScenarios.length >= 2 && (
            <div className="flex-1 min-w-[160px] rounded-lg p-3 border-2 border-green-400 bg-green-50">
              <div className="text-xs font-medium text-green-600">差額</div>
              <div className="text-lg font-bold text-green-700 mt-1">{formatMoney(Math.abs(getLifetimeIncome(activeScenarios[0].careerBlocks) - getLifetimeIncome(activeScenarios[1].careerBlocks)))}</div>
            </div>
          )}
        </div>
      </div>

      {/* Annual Income Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">年収推移（額面 vs 手取り）</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(0)}万円`, name]} labelFormatter={(l) => `${l}歳`} />
            <Legend />
            <ReferenceLine x={currentAge} stroke="#EF4444" strokeDasharray="5 5" label={{ value: '現在', fill: '#EF4444', fontSize: 11 }} />
            {activeScenarios.map((sc) => (
              <React.Fragment key={sc.id}>
                <Area type="stepAfter" dataKey={sc.name} stroke={sc.color} fill={sc.color} fillOpacity={0.1} strokeWidth={2} name={`${sc.name}（額面）`} />
                <Area type="stepAfter" dataKey={`${sc.name}_手取り`} stroke={sc.color} fill={sc.color} fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 2" name={`${sc.name}（手取り）`} />
              </React.Fragment>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">支出内訳</h3>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(0)}万円`, name]} labelFormatter={(l) => `${l}歳`} />
            <Legend />
            <Bar dataKey="recurringExpenses" stackId="exp" fill="#6B7280" opacity={0.7} name="固定費" />
            <Bar dataKey="loanPayment" stackId="exp" fill="#F59E0B" opacity={0.7} name="ローン返済" />
            <Bar dataKey="eventExpenses" stackId="exp" fill="#EF4444" opacity={0.7} name="イベント支出" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">累計収支（手取り - 全支出 + 投資運用益）</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
            <Tooltip formatter={(value, name) => [`${Number(value).toFixed(0)}万円`, name]} labelFormatter={(l) => `${l}歳`} />
            <Legend />
            <ReferenceLine y={0} stroke="#EF4444" strokeWidth={2} />
            <ReferenceLine x={currentAge} stroke="#EF4444" strokeDasharray="5 5" />
            {activeScenarios.map((sc) => (
              <Area key={sc.id} type="monotone" dataKey={sc.name} stroke={sc.color} fill={sc.color} fillOpacity={0.15} strokeWidth={2} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
