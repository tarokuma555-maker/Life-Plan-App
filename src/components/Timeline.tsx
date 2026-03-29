'use client';

import React, { useRef, useEffect } from 'react';
import {
  Person,
  Scenario,
  CareerBlock,
  LifeEvent,
  Skill,
  Memo,
  HousingLoan,
  RecurringExpense,
  LIFE_EVENT_CATEGORIES,
  WORK_STYLE_LABELS,
  RECURRING_EXPENSE_CATEGORIES,
} from '@/types';
import { getIncomeAtAge, calcMonthlyPayment, formatMoney } from '@/utils/calculations';

const AGE_RANGE = Array.from({ length: 101 }, (_, i) => i);
const CELL_WIDTH = 60;
const MAJOR_TICK = 10;

interface TimelineProps {
  persons: Person[];
  scenarios: Scenario[];
  activeScenarioIds: string[];
  lifeEvents: LifeEvent[];
  skills: Skill[];
  memos: Memo[];
  housingLoans: HousingLoan[];
  recurringExpenses: RecurringExpense[];
  currentYear: number;
  onEditCareerBlock?: (block: CareerBlock, scenarioId: string) => void;
  onEditLifeEvent?: (event: LifeEvent) => void;
  onEditHousingLoan?: (loan: HousingLoan) => void;
  onEditRecurringExpense?: (expense: RecurringExpense) => void;
  onEditSkill?: (skill: Skill) => void;
  onEditMemo?: (memo: Memo) => void;
}

export default function Timeline({
  persons,
  scenarios,
  activeScenarioIds,
  lifeEvents,
  skills,
  memos,
  housingLoans,
  recurringExpenses,
  currentYear,
  onEditCareerBlock,
  onEditLifeEvent,
  onEditHousingLoan,
  onEditRecurringExpense,
  onEditSkill,
  onEditMemo,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selfPerson = persons.find((p) => p.relation === 'self');
  const currentAge = selfPerson ? currentYear - selfPerson.birthYear : 0;

  const activeScenarios = scenarios.filter((s) =>
    activeScenarioIds.includes(s.id)
  );

  // Auto-scroll to current age on mount
  useEffect(() => {
    if (scrollRef.current && selfPerson) {
      const scrollTarget = Math.max(0, currentAge * CELL_WIDTH - scrollRef.current.clientWidth / 3);
      scrollRef.current.scrollLeft = scrollTarget;
    }
  }, [selfPerson, currentAge]);

  return (
    <div id="timeline-export" className="bg-white rounded-xl shadow-lg p-4 overflow-hidden">
      <div ref={scrollRef} className="overflow-x-auto pb-4">
        <div style={{ minWidth: AGE_RANGE.length * CELL_WIDTH + 120 }}>
          {/* Age Axis */}
          <div className="flex items-end mb-1 ml-[120px]">
            {AGE_RANGE.map((age) => (
              <div key={age} className="flex-shrink-0 text-center" style={{ width: CELL_WIDTH }}>
                {age % MAJOR_TICK === 0 && (
                  <span className="text-xs font-bold text-gray-700">{age}歳</span>
                )}
              </div>
            ))}
          </div>

          {/* Tick marks */}
          <div className="flex items-center ml-[120px] mb-2">
            {AGE_RANGE.map((age) => (
              <div key={age} className="flex-shrink-0 flex justify-center" style={{ width: CELL_WIDTH }}>
                <div className={`${
                  age % MAJOR_TICK === 0 ? 'w-0.5 h-4 bg-gray-600'
                    : age % 5 === 0 ? 'w-0.5 h-3 bg-gray-400'
                    : 'w-px h-2 bg-gray-300'
                }`} />
              </div>
            ))}
          </div>

          {/* Current age marker */}
          {selfPerson && (
            <div className="relative ml-[120px] h-0">
              <div
                className="absolute top-0 z-20"
                style={{ left: currentAge * CELL_WIDTH + CELL_WIDTH / 2 - 1 }}
              >
                <div className="w-0.5 bg-red-500 opacity-60" style={{ height: '800px' }} />
                <div className="absolute -top-6 -left-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                  現在
                </div>
              </div>
            </div>
          )}

          {/* Person rows */}
          {persons.map((person) => {
            const personEvents = lifeEvents.filter((e) => e.personId === person.id);
            const personSkills = skills.filter((s) => s.personId === person.id);
            const personMemos = memos.filter((m) => m.personId === person.id);
            const personLoans = housingLoans.filter((h) => h.personId === person.id);
            const personRecurring = recurringExpenses.filter((r) => r.personId === person.id);

            return (
              <div key={person.id} className="mb-6">
                {/* Career blocks per scenario */}
                {activeScenarios.map((scenario) => {
                  const blocks = scenario.careerBlocks.filter((cb) => cb.personId === person.id);
                  if (blocks.length === 0 && activeScenarios.length > 1) return null;

                  return (
                    <div key={scenario.id} className="flex items-center mb-1">
                      <div className="w-[120px] flex-shrink-0 pr-2 text-right">
                        <div className="text-sm font-bold text-gray-800 truncate">{person.name}</div>
                        {activeScenarios.length > 1 && (
                          <div className="text-xs truncate" style={{ color: scenario.color }}>{scenario.name}</div>
                        )}
                      </div>
                      <div className="flex relative" style={{ height: 44 }}>
                        {AGE_RANGE.map((age) => (
                          <div key={age} className="flex-shrink-0 border-l border-gray-100" style={{ width: CELL_WIDTH, height: 44 }} />
                        ))}
                        {blocks.map((block) => {
                          const wsLabel = WORK_STYLE_LABELS[block.workStyle || 'employee'];
                          return (
                            <div
                              key={block.id}
                              onClick={() => onEditCareerBlock?.(block, scenario.id)}
                              className={`absolute top-0 rounded-md flex flex-col items-center justify-center overflow-hidden text-white text-xs font-medium shadow-sm ${onEditCareerBlock ? 'cursor-pointer hover:brightness-110 hover:shadow-md transition-all' : 'cursor-default'}`}
                              style={{
                                left: block.startAge * CELL_WIDTH,
                                width: (block.endAge - block.startAge) * CELL_WIDTH,
                                height: 44,
                                backgroundColor: block.color || scenario.color,
                              }}
                              title={`${block.company} / ${block.position} (${block.startAge}〜${block.endAge}歳) 年収${block.annualIncome}万円 [${wsLabel.label}]`}
                            >
                              <div className="truncate px-1">
                                {block.company} / {block.position}
                                <span className="ml-1 opacity-80">{block.annualIncome}万</span>
                              </div>
                              <div className="text-xs opacity-70 truncate px-1">
                                [{wsLabel.label}]
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Life Events row */}
                {personEvents.length > 0 && (
                  <div className="flex items-center mb-1">
                    <div className="w-[120px] flex-shrink-0 pr-2 text-right">
                      <span className="text-xs text-gray-500">イベント</span>
                    </div>
                    <div className="flex relative" style={{ height: 48 }}>
                      {AGE_RANGE.map((age) => (
                        <div key={age} className="flex-shrink-0" style={{ width: CELL_WIDTH, height: 48 }} />
                      ))}
                      {personEvents.map((event) => {
                        const cat = LIFE_EVENT_CATEGORIES[event.category];
                        return (
                          <div
                            key={event.id}
                            onClick={() => onEditLifeEvent?.(event)}
                            className={`absolute top-0 flex flex-col items-center ${onEditLifeEvent ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                            style={{ left: event.age * CELL_WIDTH + CELL_WIDTH / 2 - 40, width: 80 }}
                          >
                            <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: cat.color }} />
                            <div className="text-xs font-medium mt-0.5 whitespace-nowrap" style={{ color: cat.color }}>{event.title}</div>
                            {event.cost > 0 && (
                              <div className="text-xs text-gray-500">{event.isExpense ? '-' : '+'}{formatMoney(event.cost)}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Housing Loans row */}
                {personLoans.length > 0 && (
                  <div className="flex items-center mb-1">
                    <div className="w-[120px] flex-shrink-0 pr-2 text-right">
                      <span className="text-xs text-gray-500">住宅ローン</span>
                    </div>
                    <div className="flex relative" style={{ height: 36 }}>
                      {AGE_RANGE.map((age) => (
                        <div key={age} className="flex-shrink-0" style={{ width: CELL_WIDTH, height: 36 }} />
                      ))}
                      {personLoans.map((loan) => {
                        const mp = calcMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears);
                        return (
                          <div
                            key={loan.id}
                            onClick={() => onEditHousingLoan?.(loan)}
                            className={`absolute top-0 rounded-md flex items-center justify-center overflow-hidden text-xs font-medium shadow-sm border-2 border-amber-400 bg-amber-50 text-amber-800 ${onEditHousingLoan ? 'cursor-pointer hover:bg-amber-100 transition-colors' : ''}`}
                            style={{
                              left: loan.purchaseAge * CELL_WIDTH,
                              width: loan.loanTermYears * CELL_WIDTH,
                              height: 32,
                            }}
                            title={`${loan.name}: ${formatMoney(loan.loanAmount)} ${mp.toFixed(1)}万/月 ${loan.purchaseAge}〜${loan.purchaseAge + loan.loanTermYears}歳`}
                          >
                            <div className="truncate px-1">
                              {loan.name} {mp.toFixed(1)}万/月
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recurring Expenses row */}
                {personRecurring.length > 0 && (
                  <div className="flex items-center mb-1">
                    <div className="w-[120px] flex-shrink-0 pr-2 text-right">
                      <span className="text-xs text-gray-500">固定費</span>
                    </div>
                    <div className="flex relative" style={{ height: 28 }}>
                      {AGE_RANGE.map((age) => (
                        <div key={age} className="flex-shrink-0" style={{ width: CELL_WIDTH, height: 28 }} />
                      ))}
                      {personRecurring.map((exp) => {
                        const cat = RECURRING_EXPENSE_CATEGORIES[exp.category];
                        return (
                          <div
                            key={exp.id}
                            onClick={() => onEditRecurringExpense?.(exp)}
                            className={`absolute top-0 rounded flex items-center justify-center overflow-hidden text-xs shadow-sm ${onEditRecurringExpense ? 'cursor-pointer hover:brightness-95 transition-all' : ''}`}
                            style={{
                              left: exp.startAge * CELL_WIDTH,
                              width: (exp.endAge - exp.startAge + 1) * CELL_WIDTH,
                              height: 24,
                              backgroundColor: cat.color + '20',
                              borderLeft: `3px solid ${cat.color}`,
                              color: cat.color,
                            }}
                            title={`${exp.name}: ${exp.annualCost}万/年 (${exp.startAge}〜${exp.endAge}歳)`}
                          >
                            <div className="truncate px-1 font-medium">
                              {exp.name} {exp.annualCost}万/年
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skills row */}
                {personSkills.length > 0 && (
                  <div className="flex items-center mb-1">
                    <div className="w-[120px] flex-shrink-0 pr-2 text-right">
                      <span className="text-xs text-gray-500">資格/スキル</span>
                    </div>
                    <div className="flex relative" style={{ height: 36 }}>
                      {AGE_RANGE.map((age) => (
                        <div key={age} className="flex-shrink-0" style={{ width: CELL_WIDTH, height: 36 }} />
                      ))}
                      {personSkills.map((skill) => (
                        <div
                          key={skill.id}
                          onClick={() => onEditSkill?.(skill)}
                          className={`absolute top-0 flex flex-col items-center ${onEditSkill ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                          style={{ left: skill.targetAge * CELL_WIDTH + CELL_WIDTH / 2 - 40, width: 80 }}
                        >
                          <div className="w-3 h-3 bg-amber-400 rotate-45 border-2 border-white shadow" />
                          <div className="text-xs font-medium mt-0.5 text-amber-700 whitespace-nowrap">{skill.name}</div>
                          {skill.cost > 0 && (
                            <div className="text-xs text-gray-500">{formatMoney(skill.cost)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memos row */}
                {personMemos.length > 0 && (
                  <div className="flex items-center mb-1">
                    <div className="w-[120px] flex-shrink-0 pr-2 text-right">
                      <span className="text-xs text-gray-500">メモ</span>
                    </div>
                    <div className="flex relative" style={{ height: 32 }}>
                      {AGE_RANGE.map((age) => (
                        <div key={age} className="flex-shrink-0" style={{ width: CELL_WIDTH, height: 32 }} />
                      ))}
                      {personMemos.map((memo) => (
                        <div
                          key={memo.id}
                          onClick={() => onEditMemo?.(memo)}
                          className="absolute top-0 group cursor-pointer"
                          style={{ left: memo.age * CELL_WIDTH + CELL_WIDTH / 2 - 8 }}
                        >
                          <div className="w-4 h-4 bg-yellow-300 rounded-sm shadow text-center text-xs leading-4">
                            📝
                          </div>
                          <div className="hidden group-hover:block absolute z-30 top-5 left-0 bg-yellow-50 border border-yellow-300 rounded p-2 text-xs text-gray-700 shadow-lg whitespace-pre-wrap min-w-[160px] max-w-[240px]">
                            {memo.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
