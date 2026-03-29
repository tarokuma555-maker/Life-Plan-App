'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Scenario, InvestmentAccount, MacroAssumptions, INVESTMENT_TYPES } from '@/types';
import {
  calcPensionEstimate, getInvestmentBalanceAtAge, calcCompoundGrowth, formatMoney,
} from '@/utils/calculations';

interface RetirementAnalysisProps {
  scenarios: Scenario[];
  activeScenarioIds: string[];
  investmentAccounts: InvestmentAccount[];
  macroAssumptions: MacroAssumptions;
  currentAge: number;
}

export default function RetirementAnalysis({
  scenarios, activeScenarioIds, investmentAccounts, macroAssumptions, currentAge,
}: RetirementAnalysisProps) {
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));
  if (activeScenarios.length === 0) return null;

  const retireAge = macroAssumptions.pensionStartAge;

  // 投資残高チャート
  const chartData = [];
  for (let age = 20; age <= 90; age++) {
    chartData.push({ age, 投資残高: Math.round(getInvestmentBalanceAtAge(investmentAccounts, age)) });
  }

  return (
    <div className="space-y-4">
      {/* 投資残高推移 */}
      {investmentAccounts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-1">投資・貯蓄の成長</h3>
          <p className="text-xs text-gray-400 mb-3">積立による資産形成の推移</p>

          {/* 口座サマリー */}
          <div className="flex gap-2 flex-wrap mb-4">
            {investmentAccounts.map((acc) => {
              const years = acc.endAge - acc.startAge;
              const principal = Math.round(acc.monthlyContribution * 12 * years);
              const balance = Math.round(calcCompoundGrowth(acc.monthlyContribution, acc.expectedReturn, years));
              const gain = balance - principal;
              return (
                <div key={acc.id} className="flex-1 min-w-[140px] bg-indigo-50 rounded-xl p-3 text-xs">
                  <div className="font-bold text-indigo-700">{acc.name}</div>
                  <div className="text-gray-500 mt-1">月{acc.monthlyContribution}万 × {years}年</div>
                  <div className="mt-1">
                    <span className="text-gray-600">元本 {formatMoney(principal)}</span>
                    <span className="text-green-600 ml-1">+{formatMoney(gain)}</span>
                  </div>
                  <div className="font-bold text-indigo-800 mt-0.5">{formatMoney(balance)}</div>
                </div>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(0)}万円`, '投資残高']} labelFormatter={(l) => `${l}歳`} />
              <ReferenceLine x={currentAge} stroke="#EF4444" strokeDasharray="5 5" />
              <ReferenceLine x={retireAge} stroke="#8B5CF6" strokeDasharray="5 5" label={{ value: '退職', fill: '#8B5CF6', fontSize: 10 }} />
              <Area type="monotone" dataKey="投資残高" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 年金見込み（シンプル版） */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-3">年金の見込み額</h3>
        <div className="space-y-3">
          {activeScenarios.map((sc) => {
            const p = calcPensionEstimate(sc.careerBlocks, retireAge);
            return (
              <div key={sc.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sc.color }} />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">{sc.name}</div>
                  <div className="text-base font-bold text-gray-800">{formatMoney(Math.round(p.annualPension))}<span className="text-xs font-normal text-gray-400">/年</span></div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>基礎年金 {formatMoney(Math.round(p.basicPension))}</div>
                  <div>厚生年金 {formatMoney(Math.round(p.employeePension))}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
