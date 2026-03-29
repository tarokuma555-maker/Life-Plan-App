'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Bar,
} from 'recharts';
import { HousingLoan, InvestmentAccount, LifeEvent, RecurringExpense, Scenario } from '@/types';
import {
  getIncomeData, getCumulativeData, getLoanPaymentAtAge,
  getRecurringExpenseAtAge, getTakeHomeAtAge, formatMoney,
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
  scenarios, activeScenarioIds, lifeEvents, housingLoans,
  recurringExpenses, investmentAccounts, currentAge,
}: IncomeChartProps) {
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));
  if (activeScenarios.length === 0) return null;

  const incomeData = getIncomeData(scenarios, activeScenarioIds, 18, 80);
  const cumulativeData = getCumulativeData(scenarios, activeScenarioIds, lifeEvents, 18, 80, housingLoans, recurringExpenses, investmentAccounts);

  for (const entry of incomeData) {
    const age = entry.age as number;
    const loanPayment = getLoanPaymentAtAge(housingLoans, age);
    const recurring = getRecurringExpenseAtAge(recurringExpenses, age);
    const eventExp = lifeEvents.filter((e) => e.isExpense && e.age === age).reduce((s, e) => s + e.cost, 0);
    entry.totalExpense = loanPayment + recurring + eventExp;
    for (const sc of activeScenarios) {
      entry[`${sc.name}_手取り`] = getTakeHomeAtAge(sc.careerBlocks, age);
    }
  }

  return (
    <div className="space-y-4">
      {/* 年収 vs 支出 */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-1">収入と支出の推移</h3>
        <p className="text-xs text-gray-400 mb-3">手取り収入（実線）と年間支出合計（赤）の比較</p>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
            <Tooltip formatter={(v, n) => [`${Number(v).toFixed(0)}万円`, n]} labelFormatter={(l) => `${l}歳`} />
            <Legend />
            <ReferenceLine x={currentAge} stroke="#EF4444" strokeDasharray="5 5" label={{ value: '現在', fill: '#EF4444', fontSize: 11 }} />
            {activeScenarios.map((sc) => (
              <Area key={sc.id} type="stepAfter" dataKey={`${sc.name}_手取り`} stroke={sc.color} fill={sc.color} fillOpacity={0.08} strokeWidth={2} name={`${sc.name}（手取り）`} />
            ))}
            <Bar dataKey="totalExpense" fill="#EF4444" opacity={0.3} name="年間支出合計" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 累計資産 */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-1">累計資産の推移</h3>
        <p className="text-xs text-gray-400 mb-3">手取り収入から全支出を引き、投資運用益を加えた純資産の推移</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
            <Tooltip formatter={(v, n) => [`${Number(v).toFixed(0)}万円`, n]} labelFormatter={(l) => `${l}歳`} />
            <Legend />
            <ReferenceLine y={0} stroke="#EF4444" strokeWidth={2} label={{ value: '0', fill: '#EF4444', fontSize: 10, position: 'left' }} />
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
