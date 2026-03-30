'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState } from '@/types';
import { formatMoney, getLifetimeIncome, calcPensionEstimate } from '@/utils/calculations';

interface AiChatProps {
  planData: AppState;
  onApplyChanges: (changes: PlanChange[]) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  changes?: PlanChange[];
}

export interface PlanChange {
  target: 'lifeEvent' | 'recurringExpense' | 'investmentAccount' | 'careerBlock';
  action: 'add' | 'remove' | 'update';
  data: Record<string, unknown>;
}

const API_KEY_STORAGE = 'life-plan-ai-api-key';

export default function AiChat({ planData, onApplyChanges }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE);
    if (saved) setApiKey(saved);
    else setShowKeyInput(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildPlanContext = useCallback(() => {
    const lines: string[] = [];
    const selfPerson = planData.persons.find((p) => p.relation === 'self');
    const currentYear = new Date().getFullYear();

    if (selfPerson) {
      lines.push(`本人: ${selfPerson.name}（${currentYear - selfPerson.birthYear}歳）`);
    }

    // 家族
    for (const p of planData.persons.filter((p) => p.relation !== 'self')) {
      const rel = p.relation === 'spouse' ? '配偶者' : p.relation === 'child' ? '子ども' : 'その他';
      lines.push(`家族: ${p.name}（${rel}、${currentYear - p.birthYear}歳）`);
    }

    // シナリオ
    for (const sc of planData.scenarios) {
      const active = planData.activeScenarioIds.includes(sc.id) ? '（有効）' : '（無効）';
      lines.push(`\nシナリオ「${sc.name}」${active}:`);
      const lifetime = getLifetimeIncome(sc.careerBlocks);
      const pension = calcPensionEstimate(sc.careerBlocks);
      for (const cb of sc.careerBlocks) {
        lines.push(`  ${cb.startAge}〜${cb.endAge}歳: ${cb.company}/${cb.position} 年収${cb.annualIncome}万円（${cb.workStyle}）`);
      }
      lines.push(`  生涯収入: ${formatMoney(lifetime)}、年金見込み: ${formatMoney(Math.round(pension.annualPension))}/年`);
    }

    // ライフイベント
    if (planData.lifeEvents.length > 0) {
      lines.push('\nライフイベント:');
      for (const e of planData.lifeEvents.slice(0, 15)) {
        lines.push(`  ${e.age}歳: ${e.title} ${e.isExpense ? '-' : '+'}${e.cost}万円`);
      }
    }

    // 固定費
    if (planData.recurringExpenses.length > 0) {
      lines.push('\n固定費:');
      for (const e of planData.recurringExpenses.slice(0, 10)) {
        lines.push(`  ${e.name}: ${e.annualCost}万円/年（${e.startAge}〜${e.endAge}歳）`);
      }
    }

    // 住宅ローン
    for (const l of planData.housingLoans) {
      lines.push(`\n住宅ローン「${l.name}」: ${l.purchaseAge}歳購入、${formatMoney(l.loanAmount)}、${l.interestRate}%、${l.loanTermYears}年返済`);
    }

    // 投資
    if (planData.investmentAccounts.length > 0) {
      lines.push('\n投資・貯蓄:');
      for (const a of planData.investmentAccounts) {
        lines.push(`  ${a.name}: 月${a.monthlyContribution}万円（${a.startAge}〜${a.endAge}歳、期待リターン${a.expectedReturn}%）`);
      }
    }

    // 前提条件
    const m = planData.macroAssumptions;
    lines.push(`\n前提条件: インフレ率${m.inflationRate}%、投資リターン${m.investmentReturn}%、年金開始${m.pensionStartAge}歳、想定寿命${m.lifeExpectancy}歳`);

    return lines.join('\n');
  }, [planData]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) { setShowKeyInput(true); return; }

    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          planContext: buildPlanContext(),
          apiKey,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `エラー: ${data.error}` }]);
      } else {
        // actionブロックをパース
        let text = data.message;
        let changes: PlanChange[] = [];
        const actionMatch = text.match(/```action\n([\s\S]*?)\n```/);
        if (actionMatch) {
          try {
            const parsed = JSON.parse(actionMatch[1]);
            changes = parsed.changes || [];
            text = text.replace(/```action\n[\s\S]*?\n```/, '').trim();
          } catch {
            // パースできない場合は無視
          }
        }
        setMessages([...newMessages, { role: 'assistant', content: text, changes }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '通信エラーが発生しました。' }]);
    }

    setLoading(false);
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
      setShowKeyInput(false);
    }
  };

  // Floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-sky-500 text-white rounded-full shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all flex items-center justify-center text-2xl"
        title="AIに相談する"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-sky-500 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-sm font-bold">AI アドバイザー</div>
          <div className="text-xs opacity-80">プランについて質問できます</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-xs opacity-70 hover:opacity-100 underline">APIキー</button>
          <button onClick={() => setIsOpen(false)} className="text-xl hover:opacity-70">×</button>
        </div>
      </div>

      {/* API Key input */}
      {showKeyInput && (
        <div className="p-3 bg-amber-50 border-b flex-shrink-0">
          <div className="text-xs text-amber-700 mb-2 font-medium">Claude APIキーを入力</div>
          <div className="flex gap-2">
            <input
              type="password"
              className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
            />
            <button onClick={handleSaveKey} className="px-3 py-2 bg-sky-500 text-white text-xs rounded-lg font-medium">保存</button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8 space-y-4">
            <div className="text-3xl">🤖</div>
            <div className="text-sm">ライフプランについて何でも聞いてください</div>
            <div className="space-y-2">
              {['老後の資金は足りますか？', '住宅購入のタイミングは？', 'NISAの積立額を増やすべき？', '転職したらどうなる？'].map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }} className="block w-full text-left text-xs bg-gray-50 hover:bg-sky-50 rounded-lg px-3 py-2 text-gray-600 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`${m.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === 'user'
                ? 'bg-sky-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>

            {/* 変更提案ボタン */}
            {m.changes && m.changes.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => onApplyChanges(m.changes!)}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-xs rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  ✨ この提案をプランに反映する（{m.changes.length}件）
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex-shrink-0">
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-sky-400 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="質問を入力..."
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              loading || !input.trim()
                ? 'bg-gray-200 text-gray-400'
                : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
