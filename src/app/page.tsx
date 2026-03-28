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
    const pid = ''; // personId placeholder (store resolves to first person)
    const myAge = currentYear - data.birthYear;

    // === 家族 ===
    store.addPerson({ name: data.name, birthYear: data.birthYear, relation: 'self' });
    if (data.hasSpouse && data.spouseName.trim()) {
      store.addPerson({ name: data.spouseName, birthYear: data.spouseBirthYear, relation: 'spouse' });
    }
    for (const child of data.children) {
      if (child.name.trim()) store.addPerson({ name: child.name, birthYear: child.birthYear, relation: 'child' });
    }
    // 今後の子ども
    if (data.planMoreChildren && data.children.length === 0) {
      for (let i = 0; i < data.moreChildrenCount; i++) {
        const childBirthYear = data.birthYear + Math.max(myAge + 2, 30) + i * 2;
        store.addPerson({ name: `お子さま${i + 1}`, birthYear: childBirthYear, relation: 'child' });
      }
    }

    // === キャリア — メインシナリオ ===
    const s1 = store.addScenario('メインプラン');
    if (data.planJobChange) {
      // 転職前
      store.addCareerBlock(s1, { personId: pid, startAge: Math.min(myAge, 22), endAge: data.jobChangeAge, company: data.company, position: data.position, annualIncome: data.income, color: '#60A5FA', workStyle: data.workStyle });
      // 転職後
      store.addCareerBlock(s1, { personId: pid, startAge: data.jobChangeAge, endAge: data.retireAge, company: '転職先', position: '新しい仕事', annualIncome: data.jobChangeIncome, color: '#3B82F6', workStyle: data.workStyle });
    } else if (data.planFreelance) {
      // 会社員時代
      store.addCareerBlock(s1, { personId: pid, startAge: Math.min(myAge, 22), endAge: data.freelanceAge, company: data.company, position: data.position, annualIncome: data.income, color: '#60A5FA', workStyle: 'employee' });
      // フリーランス
      store.addCareerBlock(s1, { personId: pid, startAge: data.freelanceAge, endAge: data.retireAge, company: 'フリーランス', position: data.position, annualIncome: data.freelanceIncome, color: '#F59E0B', workStyle: 'freelance', businessExpenseRate: 30 });
    } else {
      store.addCareerBlock(s1, { personId: pid, startAge: Math.min(myAge, 22), endAge: data.retireAge, company: data.company, position: data.position, annualIncome: data.income, color: '#3B82F6', workStyle: data.workStyle,
        ...(data.workStyle === 'freelance' ? { businessExpenseRate: 30 } : {}),
        ...(data.workStyle === 'corporate_owner' ? { corporateRevenue: data.income * 2, officerSalary: data.income } : {}),
      });
    }

    // === 住まい ===
    if (data.currentlyRenting) {
      const rentEnd = data.planBuyHouse ? data.houseBuyAge : 100;
      store.addRecurringExpense({ personId: pid, name: '家賃', startAge: Math.min(myAge, 22), endAge: rentEnd, annualCost: data.monthlyRent * 12, category: 'rent', majorCategory: 'housing' });
    }
    if (data.planBuyHouse) {
      const loanAmt = data.housePrice - data.houseDownPayment;
      store.addLifeEvent({ personId: pid, age: data.houseBuyAge, title: '住宅購入（頭金）', cost: data.houseDownPayment, category: 'housing', majorCategory: 'housing', isExpense: true });
      store.addHousingLoan({ personId: pid, name: 'マイホーム', purchaseAge: data.houseBuyAge, propertyPrice: data.housePrice, downPayment: data.houseDownPayment, loanAmount: loanAmt, interestRate: 0.5, loanTermYears: 35 });
      store.addRecurringExpense({ personId: pid, name: '固定資産税・管理費', startAge: data.houseBuyAge, endAge: 100, annualCost: 30, category: 'living', majorCategory: 'housing' });
    }

    // === 毎月のお金 ===
    store.addRecurringExpense({ personId: pid, name: '生活費', startAge: Math.min(myAge, 22), endAge: 100, annualCost: data.monthlyLiving * 12, category: 'living', majorCategory: 'expenses_living' });
    if (data.hasLifeInsurance) {
      store.addRecurringExpense({ personId: pid, name: '生命保険', startAge: Math.min(myAge, 25), endAge: 65, annualCost: data.lifeInsuranceCost * 12, category: 'insurance', majorCategory: 'insurance' });
    }
    if (data.hasMedicalInsurance) {
      store.addRecurringExpense({ personId: pid, name: '医療保険', startAge: Math.min(myAge, 25), endAge: 80, annualCost: data.medicalInsuranceCost * 12, category: 'insurance', majorCategory: 'insurance' });
    }
    if (data.hasCar) {
      store.addRecurringExpense({ personId: pid, name: '車の維持費', startAge: Math.min(myAge, 20), endAge: 75, annualCost: data.carCost * 12, category: 'vehicle', majorCategory: 'vehicle' });
    }
    if (data.hasDebt) {
      const debtYears = data.debtMonthly > 0 ? Math.ceil(data.debtAmount / (data.debtMonthly * 12)) : 5;
      store.addRecurringExpense({ personId: pid, name: '借金の返済', startAge: myAge, endAge: myAge + debtYears, annualCost: data.debtMonthly * 12, category: 'other', majorCategory: 'debt' });
    }

    // === 子育て・教育費 ===
    const allChildren = [...data.children];
    if (data.planMoreChildren && data.children.length === 0) {
      for (let i = 0; i < data.moreChildrenCount; i++) {
        allChildren.push({ name: `お子さま${i + 1}`, birthYear: data.birthYear + Math.max(myAge + 2, 30) + i * 2 });
      }
    }
    for (const child of allChildren) {
      const eduCost = data.planChildEducation === 'private_science' ? 183 : data.planChildEducation === 'private_arts' ? 152 : 115;
      store.addRecurringExpense({ personId: pid, name: `${child.name || '子ども'}の教育費`, startAge: currentYear - child.birthYear + 6, endAge: currentYear - child.birthYear + 21, annualCost: eduCost / 2, category: 'childcare', majorCategory: 'childcare_education' });
    }

    // === 投資 ===
    if (data.hasNisa) {
      store.addInvestmentAccount({ personId: pid, name: '新NISA', type: 'nisa', monthlyContribution: data.nisaMonthly, startAge: myAge, endAge: 65, expectedReturn: 4.0 });
    }
    if (data.hasIdeco) {
      store.addInvestmentAccount({ personId: pid, name: 'iDeCo', type: 'ideco', monthlyContribution: data.idecoMonthly, startAge: myAge, endAge: 65, expectedReturn: 3.0 });
    }
    if (data.monthlySaving > 0) {
      store.addInvestmentAccount({ personId: pid, name: '貯金', type: 'savings', monthlyContribution: data.monthlySaving, startAge: myAge, endAge: data.retireAge, expectedReturn: 0.1 });
    }

    // === ライフイベント ===
    if (data.planWedding) {
      store.addLifeEvent({ personId: pid, age: data.weddingAge, title: '結婚式', cost: data.weddingCost, category: 'marriage', majorCategory: 'marriage_partnership', isExpense: true });
    }
    if (data.expectRetirementBonus) {
      store.addLifeEvent({ personId: pid, age: data.retireAge, title: '退職金', cost: data.retirementBonus, category: 'retirement', majorCategory: 'retirement', isExpense: false });
    }
    store.addLifeEvent({ personId: pid, age: data.retireAge, title: 'リタイア', cost: 0, category: 'retirement', majorCategory: 'retirement', isExpense: false });
    if (data.planParentCare) {
      store.addRecurringExpense({ personId: pid, name: '親の介護費', startAge: data.parentCareAge, endAge: data.parentCareAge + 10, annualCost: 100, category: 'living', majorCategory: 'parents' });
    }
    if (data.planStudyAbroad && allChildren.length > 0) {
      store.addLifeEvent({ personId: pid, age: data.studyAbroadAge + (currentYear - allChildren[0].birthYear), title: '子どもの留学', cost: 400, category: 'education', majorCategory: 'international', isExpense: true });
    }

    // === パートナーのキャリア ===
    if (data.hasSpouse && data.spouseIncome > 0) {
      store.addCareerBlock(s1, { personId: pid, startAge: currentYear - data.spouseBirthYear, endAge: 65, company: 'パートナーの仕事', position: '', annualIncome: data.spouseIncome, color: '#F472B6', workStyle: 'employee' });
    }

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
