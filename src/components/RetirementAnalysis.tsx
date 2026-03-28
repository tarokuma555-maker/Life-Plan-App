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
} from 'recharts';
import { Scenario, InvestmentAccount, MacroAssumptions, INVESTMENT_TYPES } from '@/types';
import {
  calcPensionEstimate,
  calcRetirementGap,
  getInvestmentBalanceAtAge,
  calcCompoundGrowth,
  formatMoney,
} from '@/utils/calculations';

interface RetirementAnalysisProps {
  scenarios: Scenario[];
  activeScenarioIds: string[];
  investmentAccounts: InvestmentAccount[];
  macroAssumptions: MacroAssumptions;
  currentAge: number;
}

export default function RetirementAnalysis({
  scenarios,
  activeScenarioIds,
  investmentAccounts,
  macroAssumptions,
  currentAge,
}: RetirementAnalysisProps) {
  const activeScenarios = scenarios.filter((s) => activeScenarioIds.includes(s.id));
  if (activeScenarios.length === 0) return null;

  const retireAge = macroAssumptions.pensionStartAge;
  const lifeExpectancy = macroAssumptions.lifeExpectancy;
  const desiredAnnualLiving = 300; // 老後の希望年間生活費（万円）

  // 各シナリオの年金見込み
  const scenarioAnalysis = activeScenarios.map((scenario) => {
    const pension = calcPensionEstimate(scenario.careerBlocks, retireAge);
    const investmentBalance = getInvestmentBalanceAtAge(investmentAccounts, retireAge);
    const gap = calcRetirementGap(
      pension.annualPension,
      investmentBalance,
      desiredAnnualLiving,
      retireAge,
      lifeExpectancy
    );
    return { scenario, pension, investmentBalance, gap };
  });

  // 投資残高推移チャートデータ
  const investmentChartData = [];
  for (let age = 20; age <= 90; age++) {
    const entry: Record<string, number | string> = { age };
    entry['投資残高'] = getInvestmentBalanceAtAge(investmentAccounts, age);
    investmentChartData.push(entry);
  }

  return (
    <div className="space-y-6">
      {/* Investment Growth Chart */}
      {investmentAccounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">資産運用シミュレーション</h3>

          {/* Account Summary */}
          <div className="flex gap-3 flex-wrap mb-4">
            {investmentAccounts.map((acc) => {
              const typeInfo = INVESTMENT_TYPES[acc.type];
              const balance = calcCompoundGrowth(
                acc.monthlyContribution,
                acc.expectedReturn,
                acc.endAge - acc.startAge
              );
              return (
                <div key={acc.id} className="flex-1 min-w-[160px] bg-indigo-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-indigo-700">{acc.name}</div>
                  <div className="text-xs text-gray-500">{typeInfo.label}</div>
                  <div className="text-sm font-bold text-indigo-800 mt-1">
                    月{acc.monthlyContribution}万 x {acc.endAge - acc.startAge}年
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    元本: {formatMoney(Math.round(acc.monthlyContribution * 12 * (acc.endAge - acc.startAge)))}
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    運用後: {formatMoney(Math.round(balance))}
                  </div>
                </div>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={investmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(0)}万円`, '投資残高']}
                labelFormatter={(label) => `${label}歳`}
              />
              <ReferenceLine x={currentAge} stroke="#EF4444" strokeDasharray="5 5" label={{ value: '現在', fill: '#EF4444', fontSize: 11 }} />
              <ReferenceLine x={retireAge} stroke="#8B5CF6" strokeDasharray="5 5" label={{ value: '退職', fill: '#8B5CF6', fontSize: 11 }} />
              <Area type="monotone" dataKey="投資残高" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Retirement Gap Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          老後資金分析（{retireAge}歳退職 → {lifeExpectancy}歳想定）
        </h3>
        <div className="text-xs text-gray-500 mb-3">
          希望年間生活費: {formatMoney(desiredAnnualLiving)} / 退職後{lifeExpectancy - retireAge}年間
        </div>

        <div className="space-y-4">
          {scenarioAnalysis.map(({ scenario, pension, investmentBalance, gap }) => {
            const isOk = gap.gap <= 0;
            return (
              <div
                key={scenario.id}
                className={`rounded-lg p-4 border-2 ${isOk ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }} />
                  <span className="text-sm font-bold" style={{ color: scenario.color }}>
                    {scenario.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500">国民年金（基礎）</div>
                    <div className="font-bold">{formatMoney(Math.round(pension.basicPension))}/年</div>
                  </div>
                  <div>
                    <div className="text-gray-500">厚生年金</div>
                    <div className="font-bold">{formatMoney(Math.round(pension.employeePension))}/年</div>
                  </div>
                  <div>
                    <div className="text-gray-500">年金合計</div>
                    <div className="font-bold text-blue-600">{formatMoney(Math.round(pension.annualPension))}/年</div>
                  </div>
                  <div>
                    <div className="text-gray-500">投資残高（{retireAge}歳時）</div>
                    <div className="font-bold text-indigo-600">{formatMoney(Math.round(investmentBalance))}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500">必要総額</div>
                      <div className="font-bold">{formatMoney(gap.totalNeeded)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">確保済み</div>
                      <div className="font-bold text-green-600">{formatMoney(gap.totalHave)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">{isOk ? '余裕' : '不足'}</div>
                      <div className={`font-bold ${isOk ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(Math.abs(gap.gap))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">
                      カバー年数: {gap.yearsCovered}年 / {lifeExpectancy - retireAge}年
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isOk ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, (gap.yearsCovered / (lifeExpectancy - retireAge)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
