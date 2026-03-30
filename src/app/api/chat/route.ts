import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, planContext, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `あなたはキャリアアドバイザー向けライフプランニングアプリのAIアシスタントです。

ユーザーの現在のライフプランデータ:
${planContext}

あなたの役割:
- ユーザーのライフプランについて質問に答える
- 改善提案をする（具体的な数値で）
- 「もし〜したら？」のシミュレーション相談に乗る
- わかりやすい日本語で回答する

プランの変更を提案する場合は、以下のJSON形式で提案を含めてください（必ず通常のテキスト回答の後に追加）:

\`\`\`action
{"type": "suggest", "changes": [
  {"target": "lifeEvent", "action": "add", "data": {"age": 30, "title": "結婚", "cost": 300, "isExpense": true}},
  {"target": "recurringExpense", "action": "add", "data": {"name": "家賃", "startAge": 25, "endAge": 35, "annualCost": 120}},
  {"target": "investmentAccount", "action": "add", "data": {"name": "NISA", "monthlyContribution": 3, "startAge": 25, "endAge": 65, "expectedReturn": 4}}
]}
\`\`\`

変更提案は必ず通常のテキスト回答の中で説明し、なぜその変更が有効かを説明してください。
ユーザーが明確に変更を求めた場合のみactionブロックを含めてください。`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ message: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
