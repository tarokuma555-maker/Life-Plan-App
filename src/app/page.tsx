'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import Timeline from '@/components/Timeline';
import IncomeChart from '@/components/IncomeChart';
import InputPanel from '@/components/InputPanel';
import ExportButton from '@/components/ExportButton';
import RetirementAnalysis from '@/components/RetirementAnalysis';

export default function Home() {
  const store = useAppStore();
  const currentYear = new Date().getFullYear();
  const selfPerson = store.persons.find((p) => p.relation === 'self');
  const currentAge = selfPerson ? currentYear - selfPerson.birthYear : 0;

  if (!store.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Career Life Plan</h1>
            <p className="text-xs text-gray-500">キャリアアドバイザー向け ライフプラン年表（34カテゴリ対応）</p>
          </div>
          <ExportButton />
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex gap-4">
          {/* Left: Input Panel */}
          <div className="w-[380px] flex-shrink-0">
            <InputPanel
              persons={store.persons}
              scenarios={store.scenarios}
              lifeEvents={store.lifeEvents}
              skills={store.skills}
              memos={store.memos}
              housingLoans={store.housingLoans}
              recurringExpenses={store.recurringExpenses}
              investmentAccounts={store.investmentAccounts}
              macroAssumptions={store.macroAssumptions}
              activeScenarioIds={store.activeScenarioIds}
              manualCheckmarks={store.manualCheckmarks}
              onAddPerson={store.addPerson}
              onRemovePerson={store.removePerson}
              onAddScenario={store.addScenario}
              onRemoveScenario={store.removeScenario}
              onToggleScenario={store.toggleScenarioActive}
              onAddCareerBlock={store.addCareerBlock}
              onRemoveCareerBlock={store.removeCareerBlock}
              onAddLifeEvent={store.addLifeEvent}
              onRemoveLifeEvent={store.removeLifeEvent}
              onAddSkill={store.addSkill}
              onRemoveSkill={store.removeSkill}
              onAddMemo={store.addMemo}
              onRemoveMemo={store.removeMemo}
              onAddHousingLoan={store.addHousingLoan}
              onRemoveHousingLoan={store.removeHousingLoan}
              onAddRecurringExpense={store.addRecurringExpense}
              onRemoveRecurringExpense={store.removeRecurringExpense}
              onAddInvestmentAccount={store.addInvestmentAccount}
              onRemoveInvestmentAccount={store.removeInvestmentAccount}
              onSetMacroAssumptions={store.setMacroAssumptions}
              onToggleCheckmark={store.toggleCheckmark}
              onLoadSample={store.loadSampleData}
              onResetAll={store.resetAll}
            />
          </div>

          {/* Right: Timeline + Charts */}
          <div className="flex-1 min-w-0 space-y-4">
            {store.persons.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="text-lg font-bold text-gray-700 mb-2">ライフプランを作成しましょう</h2>
                <p className="text-sm text-gray-500 mb-6">左パネルから家族情報を追加するか、サンプルデータを読み込んでください。</p>
                <button onClick={store.loadSampleData} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  サンプルデータを読み込む
                </button>
              </div>
            ) : (
              <>
                {/* Timeline */}
                <Timeline
                  persons={store.persons}
                  scenarios={store.scenarios}
                  activeScenarioIds={store.activeScenarioIds}
                  lifeEvents={store.lifeEvents}
                  skills={store.skills}
                  memos={store.memos}
                  housingLoans={store.housingLoans}
                  recurringExpenses={store.recurringExpenses}
                  currentYear={currentYear}
                />

                {/* Charts */}
                {store.scenarios.length > 0 && store.activeScenarioIds.length > 0 && (
                  <div id="charts-export">
                    <IncomeChart
                      scenarios={store.scenarios}
                      activeScenarioIds={store.activeScenarioIds}
                      lifeEvents={store.lifeEvents}
                      housingLoans={store.housingLoans}
                      recurringExpenses={store.recurringExpenses}
                      investmentAccounts={store.investmentAccounts}
                      currentAge={currentAge}
                    />

                    {/* Retirement Analysis */}
                    <div className="mt-6">
                      <RetirementAnalysis
                        scenarios={store.scenarios}
                        activeScenarioIds={store.activeScenarioIds}
                        investmentAccounts={store.investmentAccounts}
                        macroAssumptions={store.macroAssumptions}
                        currentAge={currentAge}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
