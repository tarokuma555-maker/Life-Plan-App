'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeEvent, RecurringExpense, CareerBlock, HousingLoan, InvestmentAccount, Skill, Memo,
  LIFE_EVENT_CATEGORIES, RECURRING_EXPENSE_CATEGORIES, WORK_STYLE_LABELS, INVESTMENT_TYPES,
  LifeEventCategory, RecurringExpenseCategory, WorkStyle,
} from '@/types';

type EditTarget =
  | { type: 'lifeEvent'; data: LifeEvent }
  | { type: 'recurringExpense'; data: RecurringExpense }
  | { type: 'careerBlock'; data: CareerBlock; scenarioId: string }
  | { type: 'housingLoan'; data: HousingLoan }
  | { type: 'investmentAccount'; data: InvestmentAccount }
  | { type: 'skill'; data: Skill }
  | { type: 'memo'; data: Memo };

interface EditModalProps {
  target: EditTarget | null;
  onClose: () => void;
  onSaveLifeEvent: (id: string, updates: Partial<LifeEvent>) => void;
  onSaveRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => void;
  onSaveCareerBlock: (scenarioId: string, blockId: string, updates: Partial<CareerBlock>) => void;
  onSaveHousingLoan: (id: string, updates: Partial<HousingLoan>) => void;
  onSaveInvestmentAccount: (id: string, updates: Partial<InvestmentAccount>) => void;
  onSaveSkill: (id: string, updates: Partial<Skill>) => void;
  onSaveMemo: (id: string, content: string) => void;
  onDeleteLifeEvent: (id: string) => void;
  onDeleteRecurringExpense: (id: string) => void;
  onDeleteCareerBlock: (scenarioId: string, blockId: string) => void;
  onDeleteHousingLoan: (id: string) => void;
  onDeleteInvestmentAccount: (id: string) => void;
  onDeleteSkill: (id: string) => void;
  onDeleteMemo: (id: string) => void;
}

const input = 'w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none';
const labelCls = 'text-xs text-gray-500 mb-1 block';

export default function EditModal({ target, onClose, ...handlers }: EditModalProps) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-sm font-bold text-gray-800">
            {target.type === 'lifeEvent' && '📅 ライフイベントの編集'}
            {target.type === 'recurringExpense' && '💸 固定費の編集'}
            {target.type === 'careerBlock' && '💼 キャリアブロックの編集'}
            {target.type === 'housingLoan' && '🏠 住宅ローンの編集'}
            {target.type === 'investmentAccount' && '📈 投資口座の編集'}
            {target.type === 'skill' && '🎓 資格の編集'}
            {target.type === 'memo' && '📝 メモの編集'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5">
          {target.type === 'lifeEvent' && <LifeEventEditor data={target.data} onSave={handlers.onSaveLifeEvent} onDelete={handlers.onDeleteLifeEvent} onClose={onClose} />}
          {target.type === 'recurringExpense' && <RecurringExpenseEditor data={target.data} onSave={handlers.onSaveRecurringExpense} onDelete={handlers.onDeleteRecurringExpense} onClose={onClose} />}
          {target.type === 'careerBlock' && <CareerBlockEditor data={target.data} scenarioId={target.scenarioId} onSave={handlers.onSaveCareerBlock} onDelete={handlers.onDeleteCareerBlock} onClose={onClose} />}
          {target.type === 'housingLoan' && <HousingLoanEditor data={target.data} onSave={handlers.onSaveHousingLoan} onDelete={handlers.onDeleteHousingLoan} onClose={onClose} />}
          {target.type === 'investmentAccount' && <InvestmentAccountEditor data={target.data} onSave={handlers.onSaveInvestmentAccount} onDelete={handlers.onDeleteInvestmentAccount} onClose={onClose} />}
          {target.type === 'skill' && <SkillEditor data={target.data} onSave={handlers.onSaveSkill} onDelete={handlers.onDeleteSkill} onClose={onClose} />}
          {target.type === 'memo' && <MemoEditor data={target.data} onSave={handlers.onSaveMemo} onDelete={handlers.onDeleteMemo} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

export type { EditTarget };

// ===== Editors =====

function LifeEventEditor({ data, onSave, onDelete, onClose }: { data: LifeEvent; onSave: (id: string, u: Partial<LifeEvent>) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [title, setTitle] = useState(data.title);
  const [age, setAge] = useState(data.age);
  const [cost, setCost] = useState(data.cost);
  const [isExpense, setIsExpense] = useState(data.isExpense);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>イベント名</label><input className={input} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>年齢</label><input className={input} type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>金額（万円）</label><input className={input} type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
      </div>
      <div><label className={labelCls}>収支区分</label>
        <div className="flex gap-2">
          <button onClick={() => setIsExpense(true)} className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium ${isExpense ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400'}`}>支出</button>
          <button onClick={() => setIsExpense(false)} className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium ${!isExpense ? 'border-green-400 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'}`}>収入</button>
        </div>
      </div>
      <ActionButtons onSave={() => { onSave(data.id, { title, age, cost, isExpense }); onClose(); }} onDelete={() => { onDelete(data.id); onClose(); }} />
    </div>
  );
}

function RecurringExpenseEditor({ data, onSave, onDelete, onClose }: { data: RecurringExpense; onSave: (id: string, u: Partial<RecurringExpense>) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [name, setName] = useState(data.name);
  const [startAge, setStartAge] = useState(data.startAge);
  const [endAge, setEndAge] = useState(data.endAge);
  const [annualCost, setAnnualCost] = useState(data.annualCost);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>費目名</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className={labelCls}>開始年齢</label><input className={input} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>終了年齢</label><input className={input} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>年額（万円）</label><input className={input} type="number" value={annualCost} onChange={(e) => setAnnualCost(Number(e.target.value))} /></div>
      </div>
      <ActionButtons onSave={() => { onSave(data.id, { name, startAge, endAge, annualCost }); onClose(); }} onDelete={() => { onDelete(data.id); onClose(); }} />
    </div>
  );
}

function CareerBlockEditor({ data, scenarioId, onSave, onDelete, onClose }: { data: CareerBlock; scenarioId: string; onSave: (sid: string, bid: string, u: Partial<CareerBlock>) => void; onDelete: (sid: string, bid: string) => void; onClose: () => void }) {
  const [company, setCompany] = useState(data.company);
  const [position, setPosition] = useState(data.position);
  const [startAge, setStartAge] = useState(data.startAge);
  const [endAge, setEndAge] = useState(data.endAge);
  const [annualIncome, setAnnualIncome] = useState(data.annualIncome);
  const [workStyle, setWorkStyle] = useState<WorkStyle>(data.workStyle || 'employee');
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>勤務先</label><input className={input} value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        <div><label className={labelCls}>職種・役職</label><input className={input} value={position} onChange={(e) => setPosition(e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>開始年齢</label><input className={input} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>終了年齢</label><input className={input} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
      </div>
      <div><label className={labelCls}>年収（万円）</label><input className={input} type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} /></div>
      <div><label className={labelCls}>働き方</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(WORK_STYLE_LABELS) as [WorkStyle, typeof WORK_STYLE_LABELS[WorkStyle]][]).map(([k, v]) => (
            <button key={k} onClick={() => setWorkStyle(k)} className={`py-2 rounded-xl border-2 text-xs font-medium ${workStyle === k ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500'}`}>{v.label}</button>
          ))}
        </div>
      </div>
      <ActionButtons onSave={() => { onSave(scenarioId, data.id, { company, position, startAge, endAge, annualIncome, workStyle }); onClose(); }} onDelete={() => { onDelete(scenarioId, data.id); onClose(); }} />
    </div>
  );
}

function HousingLoanEditor({ data, onSave, onDelete, onClose }: { data: HousingLoan; onSave: (id: string, u: Partial<HousingLoan>) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [name, setName] = useState(data.name);
  const [purchaseAge, setPurchaseAge] = useState(data.purchaseAge);
  const [propertyPrice, setPropertyPrice] = useState(data.propertyPrice);
  const [downPayment, setDownPayment] = useState(data.downPayment);
  const [interestRate, setInterestRate] = useState(data.interestRate);
  const [loanTermYears, setLoanTermYears] = useState(data.loanTermYears);
  const loanAmount = propertyPrice - downPayment;
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>物件名</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>購入年齢</label><input className={input} type="number" value={purchaseAge} onChange={(e) => setPurchaseAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>物件価格（万円）</label><input className={input} type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>頭金（万円）</label><input className={input} type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} /></div>
        <div><label className={labelCls}>金利（年%）</label><input className={input} type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} /></div>
      </div>
      <div><label className={labelCls}>返済期間（年）</label><input className={input} type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(Number(e.target.value))} /></div>
      <ActionButtons onSave={() => { onSave(data.id, { name, purchaseAge, propertyPrice, downPayment, loanAmount, interestRate, loanTermYears }); onClose(); }} onDelete={() => { onDelete(data.id); onClose(); }} />
    </div>
  );
}

function InvestmentAccountEditor({ data, onSave, onDelete, onClose }: { data: InvestmentAccount; onSave: (id: string, u: Partial<InvestmentAccount>) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [name, setName] = useState(data.name);
  const [monthlyContribution, setMonthlyContribution] = useState(data.monthlyContribution);
  const [startAge, setStartAge] = useState(data.startAge);
  const [endAge, setEndAge] = useState(data.endAge);
  const [expectedReturn, setExpectedReturn] = useState(data.expectedReturn);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>口座名</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>月額（万円）</label><input className={input} type="number" step="0.1" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} /></div>
        <div><label className={labelCls}>期待リターン（年%）</label><input className={input} type="number" step="0.1" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>開始年齢</label><input className={input} type="number" value={startAge} onChange={(e) => setStartAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>終了年齢</label><input className={input} type="number" value={endAge} onChange={(e) => setEndAge(Number(e.target.value))} /></div>
      </div>
      <ActionButtons onSave={() => { onSave(data.id, { name, monthlyContribution, startAge, endAge, expectedReturn }); onClose(); }} onDelete={() => { onDelete(data.id); onClose(); }} />
    </div>
  );
}

function SkillEditor({ data, onSave, onDelete, onClose }: { data: Skill; onSave: (id: string, u: Partial<Skill>) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [name, setName] = useState(data.name);
  const [targetAge, setTargetAge] = useState(data.targetAge);
  const [cost, setCost] = useState(data.cost);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>資格・スキル名</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>目標年齢</label><input className={input} type="number" value={targetAge} onChange={(e) => setTargetAge(Number(e.target.value))} /></div>
        <div><label className={labelCls}>費用（万円）</label><input className={input} type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></div>
      </div>
      <ActionButtons onSave={() => { onSave(data.id, { name, targetAge, cost }); onClose(); }} onDelete={() => { onDelete(data.id); onClose(); }} />
    </div>
  );
}

function MemoEditor({ data, onSave, onDelete, onClose }: { data: Memo; onSave: (id: string, content: string) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [content, setContent] = useState(data.content);
  return (
    <div className="space-y-4">
      <div><label className={labelCls}>メモの内容</label><textarea className={`${input} h-24 resize-none`} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      <ActionButtons onSave={() => { onSave(data.id, content); onClose(); }} onDelete={() => { onDelete(data.id); onClose(); }} />
    </div>
  );
}

function ActionButtons({ onSave, onDelete }: { onSave: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onDelete} className="px-4 py-2.5 border-2 border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 font-medium">削除</button>
      <button onClick={onSave} className="flex-1 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600">保存する</button>
    </div>
  );
}
