'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Timeline from '@/components/Timeline';
import IncomeChart from '@/components/IncomeChart';
import InputPanel from '@/components/InputPanel';
import ExportButton from '@/components/ExportButton';
import RetirementAnalysis from '@/components/RetirementAnalysis';
import WizardFlow, { WizardData } from '@/components/WizardFlow';

export default function Home() {
  const store = useAppStore();
  const [showWizard, setShowWizard] = useState(false);
  const currentYear = new Date().getFullYear();
  const selfPerson = store.persons.find((p) => p.relation === 'self');
  const currentAge = selfPerson ? currentYear - selfPerson.birthYear : 0;

  const handleWizardComplete = useCallback((data: WizardData) => {
    // Add self
    store.addPerson({ name: data.name, birthYear: data.birthYear, relation: 'self' });

    // Add spouse
    if (data.hasSpouse && data.spouseName.trim()) {
      store.addPerson({ name: data.spouseName, birthYear: data.spouseBirthYear, relation: 'spouse' });
    }

    // Add children
    for (const child of data.children) {
      if (child.name.trim()) {
        store.addPerson({ name: child.name, birthYear: child.birthYear, relation: 'child' });
      }
    }

    // Create scenario
    const scenarioId = store.addScenario('現在のプラン');
    const currentAge = currentYear - data.birthYear;
    store.addCareerBlock(scenarioId, {
      personId: '', // will be resolved by self
      startAge: Math.min(currentAge, 22),
      endAge: data.retireAge,
      company: data.currentCompany,
      position: data.currentPosition,
      annualIncome: data.currentIncome,
      color: '#3B82F6',
      workStyle: data.workStyle,
      ...(data.workStyle === 'freelance' ? { businessExpenseRate: 30 } : {}),
      ...(data.workStyle === 'corporate_owner' ? { corporateRevenue: data.currentIncome * 2, officerSalary: data.currentIncome } : {}),
    });

    // Life events from wizard
    if (data.planMarriage) {
      store.addLifeEvent({
        personId: '', age: data.marriageAge, title: '結婚', cost: 300,
        category: 'marriage', majorCategory: 'marriage_partnership', isExpense: true,
      });
    }
    if (data.planHouse) {
      store.addLifeEvent({
        personId: '', age: data.houseAge, title: '住宅購入', cost: Math.round(data.housePrice * 0.1),
        category: 'housing', majorCategory: 'housing', isExpense: true,
      });
      store.addHousingLoan({
        personId: '', name: 'マイホーム', purchaseAge: data.houseAge,
        propertyPrice: data.housePrice, downPayment: Math.round(data.housePrice * 0.1),
        loanAmount: Math.round(data.housePrice * 0.9), interestRate: 0.5, loanTermYears: 35,
      });
    }
    if (data.planChildren && data.children.length === 0) {
      for (let i = 0; i < data.childCount; i++) {
        store.addPerson({ name: `お子さま${i + 1}`, birthYear: data.birthYear + (data.planMarriage ? data.marriageAge + 2 + i * 2 : 32 + i * 2), relation: 'child' });
      }
    }

    // Basic recurring expenses
    store.addRecurringExpense({ personId: '', name: '生活費', startAge: 22, endAge: 100, annualCost: 180, category: 'living', majorCategory: 'expenses_living' });

    setShowWizard(false);
  }, [store, currentYear]);

  const handleSkipWizard = useCallback(() => {
    store.loadSampleData();
    setShowWizard(false);
  }, [store]);

  if (!store.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  // Wizard mode
  if (showWizard) {
    return <WizardFlow onComplete={handleWizardComplete} onSkip={handleSkipWizard} />;
  }

  // Empty state
  if (store.persons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center">
          <div className="text-6xl mb-4">🌈</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ライフプランをつくろう</h1>
          <p className="text-sm text-gray-500 mb-2">
            あなたの人生を「見える化」するツールです。
          </p>
          <p className="text-xs text-gray-400 mb-8">
            お金のこと、仕事のこと、将来のこと——<br />
            ぜんぶまとめてタイムラインで見られます。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setShowWizard(true)}
              className="w-full py-4 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition-all font-bold text-base shadow-lg shadow-sky-200"
            >
              はじめる →
            </button>
            <button
              onClick={store.loadSampleData}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-sm"
            >
              まずはサンプルを見てみる
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🌈</span>
            <div>
              <h1 className="text-base font-bold text-gray-800">ライフプラン</h1>
              {selfPerson && (
                <p className="text-xs text-gray-400">
                  {selfPerson.name}さん（{currentAge}歳）の人生設計
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton />
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex gap-4">
          {/* Left: Input Panel */}
          <div className="w-[360px] flex-shrink-0">
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

            {store.scenarios.length > 0 && store.activeScenarioIds.length > 0 && (
              <div id="charts-export" className="space-y-4">
                <IncomeChart
                  scenarios={store.scenarios}
                  activeScenarioIds={store.activeScenarioIds}
                  lifeEvents={store.lifeEvents}
                  housingLoans={store.housingLoans}
                  recurringExpenses={store.recurringExpenses}
                  investmentAccounts={store.investmentAccounts}
                  currentAge={currentAge}
                />
                <RetirementAnalysis
                  scenarios={store.scenarios}
                  activeScenarioIds={store.activeScenarioIds}
                  investmentAccounts={store.investmentAccounts}
                  macroAssumptions={store.macroAssumptions}
                  currentAge={currentAge}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
