'use client';

import React, { useState, useMemo } from 'react';
import {
  LifeEvent,
  RecurringExpense,
  Skill,
  Memo,
  HousingLoan,
  InvestmentAccount,
  Scenario,
  MajorCategory,
  MAJOR_CATEGORIES,
} from '@/types';

interface CoverageChecklistProps {
  lifeEvents: LifeEvent[];
  recurringExpenses: RecurringExpense[];
  skills: Skill[];
  memos: Memo[];
  housingLoans: HousingLoan[];
  investmentAccounts: InvestmentAccount[];
  scenarios: Scenario[];
  manualCheckmarks: Record<string, boolean>;
  onToggleCheckmark: (id: string) => void;
  onSelectCategory: (category: MajorCategory) => void;
}

interface CategoryStatus {
  autoDetected: boolean;
  itemCount: number;
  items: { type: string; label: string }[];
}

function getCategoryStatus(
  category: MajorCategory,
  lifeEvents: LifeEvent[],
  recurringExpenses: RecurringExpense[],
  skills: Skill[],
  memos: Memo[],
  housingLoans: HousingLoan[],
  investmentAccounts: InvestmentAccount[],
  scenarios: Scenario[]
): CategoryStatus {
  const items: { type: string; label: string }[] = [];

  // Check LifeEvents matching majorCategory
  for (const ev of lifeEvents) {
    if (ev.majorCategory === category) {
      items.push({ type: 'イベント', label: ev.title });
    }
  }

  // Check RecurringExpenses matching majorCategory
  for (const re of recurringExpenses) {
    if (re.majorCategory === category) {
      items.push({ type: '固定費', label: re.name });
    }
  }

  // Check Skills - skills are always mapped to 'skills' category
  if (category === 'skills') {
    for (const sk of skills) {
      items.push({ type: 'スキル', label: sk.name });
    }
  }

  // Check Memos matching majorCategory
  for (const memo of memos) {
    if (memo.majorCategory === category) {
      items.push({ type: 'メモ', label: memo.content.slice(0, 40) + (memo.content.length > 40 ? '...' : '') });
    }
  }

  // Special checks for specific categories
  if (category === 'housing' && housingLoans.length > 0) {
    for (const loan of housingLoans) {
      items.push({ type: '住宅ローン', label: loan.name });
    }
  }

  if (category === 'investment' && investmentAccounts.length > 0) {
    for (const acc of investmentAccounts) {
      items.push({ type: '投資口座', label: acc.name });
    }
  }

  if (category === 'income_career') {
    for (const sc of scenarios) {
      if (sc.careerBlocks.length > 0) {
        for (const block of sc.careerBlocks) {
          items.push({ type: `シナリオ: ${sc.name}`, label: `${block.company} (${block.startAge}〜${block.endAge}歳)` });
        }
      }
    }
  }

  return {
    autoDetected: items.length > 0,
    itemCount: items.length,
    items,
  };
}

export default function CoverageChecklist({
  lifeEvents,
  recurringExpenses,
  skills,
  memos,
  housingLoans,
  investmentAccounts,
  scenarios,
  manualCheckmarks,
  onToggleCheckmark,
  onSelectCategory,
}: CoverageChecklistProps) {
  const [expandedCategory, setExpandedCategory] = useState<MajorCategory | null>(null);

  const categoryEntries = useMemo(() => {
    return (Object.entries(MAJOR_CATEGORIES) as [MajorCategory, { number: number; label: string; icon: string }][])
      .sort((a, b) => a[1].number - b[1].number);
  }, []);

  const statuses = useMemo(() => {
    const map: Record<string, CategoryStatus> = {};
    for (const [key] of categoryEntries) {
      map[key] = getCategoryStatus(
        key,
        lifeEvents,
        recurringExpenses,
        skills,
        memos,
        housingLoans,
        investmentAccounts,
        scenarios
      );
    }
    return map;
  }, [categoryEntries, lifeEvents, recurringExpenses, skills, memos, housingLoans, investmentAccounts, scenarios]);

  const coveredCount = useMemo(() => {
    return categoryEntries.filter(([key]) => {
      return statuses[key].autoDetected || manualCheckmarks[key];
    }).length;
  }, [categoryEntries, statuses, manualCheckmarks]);

  const handleToggleExpand = (category: MajorCategory) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">カバレッジチェックリスト</h2>
          <span className="text-sm font-medium text-gray-600">
            <span className={coveredCount >= 34 ? 'text-green-600 font-bold' : coveredCount >= 20 ? 'text-yellow-600' : 'text-gray-600'}>
              {coveredCount}
            </span>
            {' / 34 カテゴリ対応済み'}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(coveredCount / 34) * 100}%`,
              backgroundColor: coveredCount >= 34 ? '#16a34a' : coveredCount >= 20 ? '#ca8a04' : '#6b7280',
            }}
          />
        </div>
      </div>

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto">
        {categoryEntries.map(([key, meta]) => {
          const status = statuses[key];
          const isManual = manualCheckmarks[key] ?? false;
          const isCovered = status.autoDetected || isManual;
          const isExpanded = expandedCategory === key;

          let dotColor = 'bg-gray-300';
          if (status.autoDetected) dotColor = 'bg-green-500';
          else if (isManual) dotColor = 'bg-yellow-500';

          return (
            <div key={key} className="border-b border-gray-100">
              <div
                className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectCategory(key)}
              >
                {/* Status dot */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />

                {/* Number */}
                <span className="ml-2 text-xs text-gray-400 w-5 text-right flex-shrink-0">
                  {meta.number}
                </span>

                {/* Icon and name */}
                <span className="ml-2 text-sm flex-shrink-0">{meta.icon}</span>
                <span className={`ml-1.5 text-sm flex-1 truncate ${isCovered ? 'text-gray-800' : 'text-gray-400'}`}>
                  {meta.label}
                </span>

                {/* Item count badge */}
                {status.itemCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700 flex-shrink-0">
                    {status.itemCount}
                  </span>
                )}

                {/* Manual checkmark toggle */}
                <button
                  className={`ml-2 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isManual
                      ? 'bg-yellow-400 border-yellow-500 text-white'
                      : status.autoDetected
                        ? 'bg-green-400 border-green-500 text-white'
                        : 'border-gray-300 text-transparent hover:border-gray-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheckmark(key);
                  }}
                  title={isManual ? '手動チェックを解除' : '手動でチェック'}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                {/* Expand toggle */}
                {status.itemCount > 0 && (
                  <button
                    className="ml-1 w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(key);
                    }}
                    title="詳細を表示"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Expandable items list */}
              {isExpanded && status.items.length > 0 && (
                <div className="px-4 pb-2 ml-10">
                  {status.items.map((item, idx) => (
                    <div key={idx} className="flex items-center py-1 text-xs text-gray-500">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 mr-2 flex-shrink-0">
                        {item.type}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
