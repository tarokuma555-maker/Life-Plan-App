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
import { Scenario, LifeEvent } from '@/types';
import { getIncomeData, getCumulativeData, getLifetimeIncome, formatMoney } from '@/utils/calculations';

interface IncomeChartProps {
  scenarios: Scenario[];
  activeScenarioIds: string[];
  lifeEvents: LifeEvent[];
  currentAge: number;
}

export default function IncomeChart({
  scenarios,
  activeScenarioIds,
  lifeEvents,
  currentAge,
}: IncomeChartProps) {
  const activeScenarios = scenarios.filter((s) =>
    activeScenarioIds.includes(s.id)
  );

  const incomeData = getIncomeData(scenarios, activeScenarioIds, 18, 80);
  const cumulativeData = getCumulativeData(
    scenarios,
    activeScenarioIds,
    lifeEvents,
    18,
    80
  );

  // Merge expense data into incomeData
  for (const entry of incomeData) {
    const age = entry.age as number;
    const expenses = lifeEvents
      .filter((e) => e.isExpense && e.age === age)
      .reduce((sum, e) => sum + e.cost, 0);
    entry.expenses = expenses > 0 ? expenses : 0;
  }

  return (
    <div className="space-y-6">
      {/* Lifetime Income Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          生涯年収の比較（22〜65歳）
        </h3>
        <div className="flex gap-4 flex-wrap">
          {activeScenarios.map((scenario) => {
            const lifetime = getLifetimeIncome(scenario.careerBlocks);
            return (
              <div
                key={scenario.id}
                className="flex-1 min-w-[200px] rounded-lg p-4 border-2"
                style={{ borderColor: scenario.color }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: scenario.color }}
                >
                  {scenario.name}
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-1">
                  {formatMoney(lifetime)}
                </div>
              </div>
            );
          })}
          {activeScenarios.length >= 2 && (
            <div className="flex-1 min-w-[200px] rounded-lg p-4 border-2 border-green-400 bg-green-50">
              <div className="text-sm font-medium text-green-600">差額</div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {formatMoney(
                  Math.abs(
                    getLifetimeIncome(activeScenarios[0].careerBlocks) -
                      getLifetimeIncome(activeScenarios[1].careerBlocks)
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Annual Income Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">年収推移</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}歳`}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}万`}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value}万円`,
                name,
              ]}
              labelFormatter={(label) => `${label}歳`}
            />
            <Legend />
            <ReferenceLine
              x={currentAge}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{ value: '現在', fill: '#EF4444', fontSize: 11 }}
            />
            {activeScenarios.map((scenario) => (
              <Area
                key={scenario.id}
                type="stepAfter"
                dataKey={scenario.name}
                stroke={scenario.color}
                fill={scenario.color}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            {/* Expense bars */}
            <Bar
              dataKey="expenses"
              fill="#EF4444"
              opacity={0.6}
              name="支出イベント"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          累計収支（収入 - 支出イベント）
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}歳`}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}万`}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(0)}万円`,
                name,
              ]}
              labelFormatter={(label) => `${label}歳`}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#EF4444" strokeWidth={2} />
            <ReferenceLine
              x={currentAge}
              stroke="#EF4444"
              strokeDasharray="5 5"
            />
            {activeScenarios.map((scenario) => (
              <Area
                key={scenario.id}
                type="monotone"
                dataKey={scenario.name}
                stroke={scenario.color}
                fill={scenario.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
