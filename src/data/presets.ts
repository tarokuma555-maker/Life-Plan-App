import { LifeEventCategory, RecurringExpenseCategory, MajorCategory } from '@/types';

export interface PresetItem {
  id: string;
  majorCategory: MajorCategory;
  type: 'life_event' | 'recurring_expense';
  eventCategory?: LifeEventCategory;
  expenseCategory?: RecurringExpenseCategory;
  name: string;
  defaultAge?: number;
  defaultStartAge?: number;
  defaultEndAge?: number;
  defaultCost: number;
  isExpense: boolean;
  description: string;
}

// ===== 1. 収入・キャリア =====
const incomeCareer: PresetItem[] = [
  { id: '1-1', majorCategory: 'income_career', type: 'recurring_expense', expenseCategory: 'other', name: '副業収入', defaultStartAge: 30, defaultEndAge: 60, defaultCost: -100, isExpense: false, description: '副業・サービス収益の見通し' },
  { id: '1-6', majorCategory: 'income_career', type: 'life_event', eventCategory: 'retirement', name: '退職金（一時金）', defaultAge: 60, defaultCost: 1500, isExpense: false, description: '退職金の見込み額' },
  { id: '1-7a', majorCategory: 'income_career', type: 'recurring_expense', expenseCategory: 'pension_savings', name: '企業年金（DB）受取', defaultStartAge: 65, defaultEndAge: 85, defaultCost: -100, isExpense: false, description: '確定給付年金の受取' },
  { id: '1-8', majorCategory: 'income_career', type: 'life_event', eventCategory: 'career', name: 'ストックオプション行使', defaultAge: 40, defaultCost: 500, isExpense: false, description: '持株会・SO収入' },
  { id: '1-9', majorCategory: 'income_career', type: 'recurring_expense', expenseCategory: 'living', name: '単身赴任費用', defaultStartAge: 40, defaultEndAge: 45, defaultCost: 120, isExpense: true, description: '二重生活のコスト' },
  { id: '1-10', majorCategory: 'income_career', type: 'life_event', eventCategory: 'career', name: '早期退職金割増', defaultAge: 55, defaultCost: 500, isExpense: false, description: '早期退職制度の利用' },
  { id: '1-11', majorCategory: 'income_career', type: 'life_event', eventCategory: 'retirement', name: '再雇用開始（収入減）', defaultAge: 60, defaultCost: 0, isExpense: false, description: '定年後の再雇用' },
  { id: '1-12', majorCategory: 'income_career', type: 'life_event', eventCategory: 'career', name: '失業保険受給', defaultAge: 35, defaultCost: 150, isExpense: false, description: '雇用保険の受給' },
];

// ===== 2. 支出・生活費 =====
const expensesLiving: PresetItem[] = [
  { id: '2-1', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'rent', name: '家賃', defaultStartAge: 22, defaultEndAge: 34, defaultCost: 120, isExpense: true, description: '住居費の推移' },
  { id: '2-2', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'living', name: '生活費（食費・光熱費）', defaultStartAge: 22, defaultEndAge: 100, defaultCost: 180, isExpense: true, description: 'インフレ率2%想定' },
  { id: '2-3', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'subscription', name: '通信費（スマホ・回線）', defaultStartAge: 18, defaultEndAge: 100, defaultCost: 12, isExpense: true, description: '月1万円想定' },
  { id: '2-4', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'living', name: '趣味・娯楽・交際費', defaultStartAge: 22, defaultEndAge: 80, defaultCost: 36, isExpense: true, description: '月3万円想定' },
  { id: '2-5', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'subscription', name: 'サブスク（動画・音楽・新聞等）', defaultStartAge: 20, defaultEndAge: 80, defaultCost: 6, isExpense: true, description: '月5千円想定' },
  { id: '2-6', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'subscription', name: 'クレジットカード年会費', defaultStartAge: 25, defaultEndAge: 80, defaultCost: 3, isExpense: true, description: 'ゴールドカード等' },
  { id: '2-8', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'living', name: 'マンション管理費・修繕積立', defaultStartAge: 35, defaultEndAge: 100, defaultCost: 36, isExpense: true, description: '月3万円想定' },
  { id: '2-9', majorCategory: 'expenses_living', type: 'recurring_expense', expenseCategory: 'subscription', name: 'NHK受信料', defaultStartAge: 22, defaultEndAge: 100, defaultCost: 2.5, isExpense: true, description: '年間約2.5万円' },
];

// ===== 3. 住宅計画 =====
const housing: PresetItem[] = [
  { id: '3-1', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: '住宅購入（頭金）', defaultAge: 35, defaultCost: 500, isExpense: true, description: '頭金・諸費用' },
  { id: '3-5', majorCategory: 'housing', type: 'recurring_expense', expenseCategory: 'living', name: '固定資産税', defaultStartAge: 36, defaultEndAge: 100, defaultCost: 15, isExpense: true, description: '年間15万円想定' },
  { id: '3-9', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: 'リフォーム・リノベ', defaultAge: 55, defaultCost: 500, isExpense: true, description: '築20年の大規模修繕' },
  { id: '3-10', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: '太陽光発電導入', defaultAge: 40, defaultCost: 200, isExpense: true, description: '蓄電池含む' },
  { id: '3-11', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: '地方移住', defaultAge: 55, defaultCost: 300, isExpense: true, description: '引越し・住居取得費用' },
  { id: '3-12', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: '引っ越し費用', defaultAge: 30, defaultCost: 50, isExpense: true, description: '住み替え1回あたり' },
  { id: '3-13', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: '家具・家電買替え', defaultAge: 45, defaultCost: 100, isExpense: true, description: '10年サイクル' },
  { id: '3-14', majorCategory: 'housing', type: 'life_event', eventCategory: 'housing', name: 'バリアフリー化', defaultAge: 65, defaultCost: 200, isExpense: true, description: '手すり・段差解消等' },
  { id: '3-17', majorCategory: 'housing', type: 'recurring_expense', expenseCategory: 'living', name: 'ペット飼育費', defaultStartAge: 35, defaultEndAge: 50, defaultCost: 30, isExpense: true, description: '年間30万円想定' },
];

// ===== 4. 結婚・パートナーシップ =====
const marriage: PresetItem[] = [
  { id: '4-1', majorCategory: 'marriage_partnership', type: 'life_event', eventCategory: 'marriage', name: '結婚式・披露宴', defaultAge: 30, defaultCost: 300, isExpense: true, description: '平均300万円' },
  { id: '4-2', majorCategory: 'marriage_partnership', type: 'life_event', eventCategory: 'marriage', name: '新婚旅行', defaultAge: 30, defaultCost: 50, isExpense: true, description: '海外の場合50万円〜' },
  { id: '4-3', majorCategory: 'marriage_partnership', type: 'life_event', eventCategory: 'marriage', name: '結納・顔合わせ', defaultAge: 30, defaultCost: 20, isExpense: true, description: '食事会・手土産等' },
  { id: '4-4', majorCategory: 'marriage_partnership', type: 'life_event', eventCategory: 'marriage', name: '婚約指輪・結婚指輪', defaultAge: 30, defaultCost: 80, isExpense: true, description: '2本で80万円想定' },
  { id: '4-9', majorCategory: 'marriage_partnership', type: 'life_event', eventCategory: 'legal', name: '離婚費用（弁護士・調停）', defaultAge: 40, defaultCost: 200, isExpense: true, description: '弁護士費用・慰謝料等' },
  { id: '4-10', majorCategory: 'marriage_partnership', type: 'recurring_expense', expenseCategory: 'living', name: '養育費（支払い）', defaultStartAge: 40, defaultEndAge: 58, defaultCost: 60, isExpense: true, description: '月5万円×12ヶ月' },
];

// ===== 5. 妊娠・出産 =====
const pregnancyBirth: PresetItem[] = [
  { id: '5-1', majorCategory: 'pregnancy_birth', type: 'life_event', eventCategory: 'pregnancy_birth', name: '妊婦健診自己負担', defaultAge: 30, defaultCost: 10, isExpense: true, description: '助成金差額' },
  { id: '5-2', majorCategory: 'pregnancy_birth', type: 'life_event', eventCategory: 'pregnancy_birth', name: '出産費用（差額）', defaultAge: 30, defaultCost: 20, isExpense: true, description: '一時金50万円との差額' },
  { id: '5-3', majorCategory: 'pregnancy_birth', type: 'life_event', eventCategory: 'pregnancy_birth', name: '無痛分娩追加費用', defaultAge: 30, defaultCost: 15, isExpense: true, description: '10〜20万円追加' },
  { id: '5-5', majorCategory: 'pregnancy_birth', type: 'life_event', eventCategory: 'pregnancy_birth', name: '不妊治療費', defaultAge: 32, defaultCost: 100, isExpense: true, description: '保険適用後の自己負担累計' },
  { id: '5-8', majorCategory: 'pregnancy_birth', type: 'life_event', eventCategory: 'pregnancy_birth', name: 'マタニティ・ベビー用品', defaultAge: 30, defaultCost: 30, isExpense: true, description: '準備費用' },
];

// ===== 6. 子育て・教育費 =====
const childcareEducation: PresetItem[] = [
  { id: '6-1', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '保育園（認可）', defaultStartAge: 0, defaultEndAge: 5, defaultCost: 36, isExpense: true, description: '月3万円想定' },
  { id: '6-2a', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '小学校', defaultStartAge: 6, defaultEndAge: 11, defaultCost: 32, isExpense: true, description: '公立想定' },
  { id: '6-2b', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '中学校', defaultStartAge: 12, defaultEndAge: 14, defaultCost: 48, isExpense: true, description: '公立想定' },
  { id: '6-2c', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '高校', defaultStartAge: 15, defaultEndAge: 17, defaultCost: 51, isExpense: true, description: '公立想定' },
  { id: '6-2d', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '大学（国公立）', defaultStartAge: 18, defaultEndAge: 21, defaultCost: 115, isExpense: true, description: '国公立想定' },
  { id: '6-2e', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '大学（私立文系）', defaultStartAge: 18, defaultEndAge: 21, defaultCost: 152, isExpense: true, description: '私立文系想定' },
  { id: '6-2f', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '大学（私立理系）', defaultStartAge: 18, defaultEndAge: 21, defaultCost: 183, isExpense: true, description: '私立理系想定' },
  { id: '6-3', majorCategory: 'childcare_education', type: 'recurring_expense', expenseCategory: 'childcare', name: '習い事・塾', defaultStartAge: 8, defaultEndAge: 17, defaultCost: 48, isExpense: true, description: '月4万円想定' },
  { id: '6-6', majorCategory: 'childcare_education', type: 'life_event', eventCategory: 'education', name: '留学費用（1年間）', defaultAge: 20, defaultCost: 400, isExpense: true, description: '海外留学1年間' },
  { id: '6-7', majorCategory: 'childcare_education', type: 'life_event', eventCategory: 'family', name: '子どもの結婚援助', defaultAge: 55, defaultCost: 200, isExpense: true, description: '結婚資金援助' },
  { id: '6-8', majorCategory: 'childcare_education', type: 'life_event', eventCategory: 'family', name: '子どもの住宅購入援助', defaultAge: 58, defaultCost: 500, isExpense: true, description: '住宅取得資金贈与' },
  { id: '6-13', majorCategory: 'childcare_education', type: 'life_event', eventCategory: 'education', name: '奨学金（連帯保証）', defaultAge: 18, defaultCost: 0, isExpense: false, description: '返済リスクの確認' },
];

// ===== 7. 社会保険・年金 =====
const socialInsurance: PresetItem[] = [
  { id: '7-1', majorCategory: 'social_insurance', type: 'recurring_expense', expenseCategory: 'pension_savings', name: '付加年金', defaultStartAge: 30, defaultEndAge: 60, defaultCost: 0.5, isExpense: true, description: '月400円で年金増額' },
  { id: '7-1b', majorCategory: 'social_insurance', type: 'recurring_expense', expenseCategory: 'pension_savings', name: '国民年金基金', defaultStartAge: 35, defaultEndAge: 60, defaultCost: 48, isExpense: true, description: 'フリーランスの上乗せ' },
];

// ===== 8. 税金・節税 =====
const tax: PresetItem[] = [
  { id: '8-2', majorCategory: 'tax', type: 'recurring_expense', expenseCategory: 'pension_savings', name: '小規模企業共済', defaultStartAge: 35, defaultEndAge: 65, defaultCost: 84, isExpense: true, description: '月7万円（全額所得控除）' },
  { id: '8-12', majorCategory: 'tax', type: 'recurring_expense', expenseCategory: 'other', name: 'ふるさと納税実質負担', defaultStartAge: 30, defaultEndAge: 65, defaultCost: 0.2, isExpense: true, description: '自己負担2000円' },
  { id: '8-13', majorCategory: 'tax', type: 'recurring_expense', expenseCategory: 'other', name: '奨学金返済', defaultStartAge: 22, defaultEndAge: 42, defaultCost: 20, isExpense: true, description: '月1.5万円×20年' },
];

// ===== 9. 保険 =====
const insurance: PresetItem[] = [
  { id: '9-1', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: '生命保険', defaultStartAge: 30, defaultEndAge: 65, defaultCost: 24, isExpense: true, description: '月2万円想定' },
  { id: '9-2', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: '就業不能保険', defaultStartAge: 30, defaultEndAge: 65, defaultCost: 6, isExpense: true, description: '月5千円想定' },
  { id: '9-3', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: '医療保険', defaultStartAge: 30, defaultEndAge: 80, defaultCost: 6, isExpense: true, description: '月5千円想定' },
  { id: '9-4', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: '個人賠償責任保険', defaultStartAge: 25, defaultEndAge: 80, defaultCost: 0.3, isExpense: true, description: '年間3千円' },
  { id: '9-5', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: '火災・地震保険', defaultStartAge: 35, defaultEndAge: 100, defaultCost: 5, isExpense: true, description: '年間5万円想定' },
  { id: '9-7', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: 'PL保険・E&O保険', defaultStartAge: 35, defaultEndAge: 65, defaultCost: 10, isExpense: true, description: 'フリーランス・法人向け' },
  { id: '9-8', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: 'サイバー保険', defaultStartAge: 35, defaultEndAge: 65, defaultCost: 5, isExpense: true, description: '情報漏洩対策' },
  { id: '9-9', majorCategory: 'insurance', type: 'recurring_expense', expenseCategory: 'insurance', name: '弁護士保険', defaultStartAge: 35, defaultEndAge: 80, defaultCost: 3, isExpense: true, description: '月2500円想定' },
];

// ===== 10. 資産運用・貯蓄 =====
const investment: PresetItem[] = [
  { id: '10-1', majorCategory: 'investment', type: 'life_event', eventCategory: 'investment_event', name: '生活防衛資金の確保', defaultAge: 25, defaultCost: 200, isExpense: true, description: '生活費6〜12ヶ月分' },
  { id: '10-6', majorCategory: 'investment', type: 'life_event', eventCategory: 'investment_event', name: '不動産投資（頭金）', defaultAge: 40, defaultCost: 500, isExpense: true, description: '賃貸用不動産の購入' },
  { id: '10-8', majorCategory: 'investment', type: 'life_event', eventCategory: 'investment_event', name: '別荘・セカンドハウス', defaultAge: 55, defaultCost: 2000, isExpense: true, description: '購入費用' },
];

// ===== 11. 借入・債務 =====
const debt: PresetItem[] = [
  { id: '11-3', majorCategory: 'debt', type: 'recurring_expense', expenseCategory: 'other', name: 'カードローン返済', defaultStartAge: 25, defaultEndAge: 30, defaultCost: 60, isExpense: true, description: '月5万円返済' },
  { id: '11-6', majorCategory: 'debt', type: 'recurring_expense', expenseCategory: 'other', name: '奨学金返済', defaultStartAge: 22, defaultEndAge: 42, defaultCost: 18, isExpense: true, description: '月1.5万円×20年' },
];

// ===== 12. 健康・医療 =====
const healthMedical: PresetItem[] = [
  { id: '12-1', majorCategory: 'health_medical', type: 'recurring_expense', expenseCategory: 'health', name: '人間ドック', defaultStartAge: 35, defaultEndAge: 80, defaultCost: 5, isExpense: true, description: '年1回5万円' },
  { id: '12-2', majorCategory: 'health_medical', type: 'recurring_expense', expenseCategory: 'health', name: '歯科定期メンテナンス', defaultStartAge: 25, defaultEndAge: 80, defaultCost: 5, isExpense: true, description: '年4回+治療費' },
  { id: '12-4', majorCategory: 'health_medical', type: 'life_event', eventCategory: 'health_medical', name: '視力矯正（ICL等）', defaultAge: 30, defaultCost: 70, isExpense: true, description: 'ICL両眼70万円' },
  { id: '12-8', majorCategory: 'health_medical', type: 'life_event', eventCategory: 'health_medical', name: '長期入院', defaultAge: 50, defaultCost: 100, isExpense: true, description: '3ヶ月入院想定' },
  { id: '12-9', majorCategory: 'health_medical', type: 'recurring_expense', expenseCategory: 'health', name: 'コンタクト・メガネ', defaultStartAge: 20, defaultEndAge: 70, defaultCost: 5, isExpense: true, description: '年5万円' },
  { id: '12-10', majorCategory: 'health_medical', type: 'life_event', eventCategory: 'health_medical', name: '歯列矯正', defaultAge: 28, defaultCost: 100, isExpense: true, description: '矯正費用100万円' },
  { id: '12-11', majorCategory: 'health_medical', type: 'recurring_expense', expenseCategory: 'health', name: 'ジム・フィットネス', defaultStartAge: 25, defaultEndAge: 70, defaultCost: 12, isExpense: true, description: '月1万円' },
  { id: '12-12', majorCategory: 'health_medical', type: 'recurring_expense', expenseCategory: 'health', name: 'サプリメント', defaultStartAge: 30, defaultEndAge: 80, defaultCost: 6, isExpense: true, description: '月5千円' },
];

// ===== 13. 働き方・時間設計 =====
const workstyle: PresetItem[] = [
  { id: '13-4', majorCategory: 'workstyle', type: 'life_event', eventCategory: 'career', name: 'サバティカル（長期休暇）', defaultAge: 40, defaultCost: 100, isExpense: true, description: '3ヶ月の無収入期間' },
];

// ===== 14. スキル・学び直し =====
const skills: PresetItem[] = [
  { id: '14-1', majorCategory: 'skills', type: 'life_event', eventCategory: 'education', name: 'IT資格取得（PMP等）', defaultAge: 33, defaultCost: 30, isExpense: true, description: '受験料+教材費' },
  { id: '14-3', majorCategory: 'skills', type: 'recurring_expense', expenseCategory: 'other', name: '英語学習（オンライン英会話）', defaultStartAge: 30, defaultEndAge: 40, defaultCost: 12, isExpense: true, description: '月1万円' },
  { id: '14-5', majorCategory: 'skills', type: 'life_event', eventCategory: 'education', name: 'MBA進学', defaultAge: 35, defaultCost: 300, isExpense: true, description: '2年間の学費' },
  { id: '14-6', majorCategory: 'skills', type: 'recurring_expense', expenseCategory: 'other', name: '書籍・セミナー・カンファレンス', defaultStartAge: 25, defaultEndAge: 65, defaultCost: 12, isExpense: true, description: '年12万円' },
  { id: '14-7', majorCategory: 'skills', type: 'recurring_expense', expenseCategory: 'other', name: 'コーチング・メンター', defaultStartAge: 30, defaultEndAge: 45, defaultCost: 24, isExpense: true, description: '月2万円' },
];

// ===== 15. 人間関係 =====
const networkRelations: PresetItem[] = [
  { id: '15-1', majorCategory: 'network', type: 'recurring_expense', expenseCategory: 'network', name: 'ビジネスコミュニティ会費', defaultStartAge: 30, defaultEndAge: 60, defaultCost: 12, isExpense: true, description: '年12万円' },
  { id: '15-2', majorCategory: 'network', type: 'recurring_expense', expenseCategory: 'network', name: '専門家顧問料（税理士等）', defaultStartAge: 35, defaultEndAge: 70, defaultCost: 36, isExpense: true, description: '月3万円' },
  { id: '15-6', majorCategory: 'network', type: 'recurring_expense', expenseCategory: 'network', name: '友人との交際費', defaultStartAge: 22, defaultEndAge: 80, defaultCost: 24, isExpense: true, description: '月2万円' },
];

// ===== 16. 親・親族関連 =====
const parents: PresetItem[] = [
  { id: '16-1', majorCategory: 'parents', type: 'recurring_expense', expenseCategory: 'living', name: '親の介護費', defaultStartAge: 55, defaultEndAge: 65, defaultCost: 100, isExpense: true, description: '月8万円想定' },
  { id: '16-5', majorCategory: 'parents', type: 'life_event', eventCategory: 'family', name: '実家リフォーム', defaultAge: 50, defaultCost: 300, isExpense: true, description: 'バリアフリー化等' },
  { id: '16-6', majorCategory: 'parents', type: 'life_event', eventCategory: 'ceremony', name: '墓・仏壇購入', defaultAge: 55, defaultCost: 200, isExpense: true, description: '祭祀承継費用' },
  { id: '16-7', majorCategory: 'parents', type: 'recurring_expense', expenseCategory: 'living', name: '親への仕送り', defaultStartAge: 40, defaultEndAge: 55, defaultCost: 60, isExpense: true, description: '月5万円' },
];

// ===== 17. 冠婚葬祭 =====
const ceremonies: PresetItem[] = [
  { id: '17-1', majorCategory: 'ceremonies', type: 'recurring_expense', expenseCategory: 'network', name: 'ご祝儀・香典', defaultStartAge: 25, defaultEndAge: 70, defaultCost: 10, isExpense: true, description: '年齢とともに増加' },
  { id: '17-3', majorCategory: 'ceremonies', type: 'recurring_expense', expenseCategory: 'living', name: 'お年玉', defaultStartAge: 30, defaultEndAge: 55, defaultCost: 5, isExpense: true, description: '子どもの成長に応じて' },
  { id: '17-4', majorCategory: 'ceremonies', type: 'life_event', eventCategory: 'ceremony', name: '七五三', defaultAge: 5, defaultCost: 10, isExpense: true, description: '衣装・食事・写真' },
  { id: '17-5', majorCategory: 'ceremonies', type: 'life_event', eventCategory: 'ceremony', name: '成人式', defaultAge: 20, defaultCost: 30, isExpense: true, description: '振袖/スーツ+撮影' },
  { id: '17-7', majorCategory: 'ceremonies', type: 'life_event', eventCategory: 'ceremony', name: '法事・年忌法要', defaultAge: 50, defaultCost: 30, isExpense: true, description: '主催費用' },
];

// ===== 18. 法的・制度的 =====
const legalPrep: PresetItem[] = [
  { id: '18-1', majorCategory: 'legal', type: 'life_event', eventCategory: 'legal', name: '遺言書作成（公正証書）', defaultAge: 50, defaultCost: 20, isExpense: true, description: '公証人費用+弁護士費用' },
  { id: '18-2', majorCategory: 'legal', type: 'life_event', eventCategory: 'legal', name: '任意後見契約', defaultAge: 60, defaultCost: 15, isExpense: true, description: '公証人+弁護士' },
  { id: '18-6', majorCategory: 'legal', type: 'life_event', eventCategory: 'legal', name: '商標登録', defaultAge: 35, defaultCost: 15, isExpense: true, description: '出願+登録料' },
];

// ===== 19. 相続・贈与 =====
const inheritanceItems: PresetItem[] = [
  { id: '19-1', majorCategory: 'inheritance', type: 'life_event', eventCategory: 'inheritance', name: '相続税支払い', defaultAge: 60, defaultCost: 500, isExpense: true, description: '基礎控除超過分' },
  { id: '19-2', majorCategory: 'inheritance', type: 'recurring_expense', expenseCategory: 'other', name: '暦年贈与（年110万非課税）', defaultStartAge: 50, defaultEndAge: 70, defaultCost: 110, isExpense: true, description: '子への贈与' },
  { id: '19-4', majorCategory: 'inheritance', type: 'life_event', eventCategory: 'inheritance', name: '親からの相続', defaultAge: 60, defaultCost: 1000, isExpense: false, description: '相続財産の受取' },
  { id: '19-6', majorCategory: 'inheritance', type: 'life_event', eventCategory: 'inheritance', name: '家族信託設定', defaultAge: 55, defaultCost: 50, isExpense: true, description: '認知症対策' },
];

// ===== 20. 車・移動手段 =====
const vehicleItems: PresetItem[] = [
  { id: '20-1', majorCategory: 'vehicle', type: 'life_event', eventCategory: 'vehicle', name: '免許取得', defaultAge: 18, defaultCost: 30, isExpense: true, description: '教習所費用' },
  { id: '20-2', majorCategory: 'vehicle', type: 'life_event', eventCategory: 'vehicle', name: '車購入（新車）', defaultAge: 30, defaultCost: 300, isExpense: true, description: '10年ごとに買替え' },
  { id: '20-3', majorCategory: 'vehicle', type: 'recurring_expense', expenseCategory: 'vehicle', name: '車維持費（車検・保険・税金・ガソリン）', defaultStartAge: 20, defaultEndAge: 75, defaultCost: 50, isExpense: true, description: '年50万円想定' },
  { id: '20-5', majorCategory: 'vehicle', type: 'life_event', eventCategory: 'vehicle', name: 'EV購入', defaultAge: 45, defaultCost: 400, isExpense: true, description: 'EV車両+充電設備' },
];

// ===== 21. 美容・身だしなみ =====
const beautyItems: PresetItem[] = [
  { id: '21-1', majorCategory: 'beauty', type: 'recurring_expense', expenseCategory: 'beauty', name: '被服費', defaultStartAge: 22, defaultEndAge: 80, defaultCost: 24, isExpense: true, description: '年24万円想定' },
  { id: '21-2', majorCategory: 'beauty', type: 'recurring_expense', expenseCategory: 'beauty', name: '美容院・理容室', defaultStartAge: 18, defaultEndAge: 80, defaultCost: 12, isExpense: true, description: '年12万円想定' },
];

// ===== 22. デジタル・IT =====
const digitalIT: PresetItem[] = [
  { id: '22-1', majorCategory: 'digital_it', type: 'recurring_expense', expenseCategory: 'digital_it', name: 'ドメイン・サーバー維持費', defaultStartAge: 25, defaultEndAge: 70, defaultCost: 5, isExpense: true, description: '年5万円想定' },
  { id: '22-2', majorCategory: 'digital_it', type: 'recurring_expense', expenseCategory: 'digital_it', name: 'SaaS・API月額費用', defaultStartAge: 25, defaultEndAge: 65, defaultCost: 12, isExpense: true, description: '月1万円想定' },
  { id: '22-5', majorCategory: 'digital_it', type: 'recurring_expense', expenseCategory: 'digital_it', name: 'セキュリティ対策費', defaultStartAge: 30, defaultEndAge: 70, defaultCost: 3, isExpense: true, description: 'VPN・セキュリティソフト等' },
];

// ===== 23. 事業リスク管理 =====
const businessRisk: PresetItem[] = [
  { id: '23-1', majorCategory: 'business_risk', type: 'life_event', eventCategory: 'career', name: '取引先倒産による損失', defaultAge: 40, defaultCost: 200, isExpense: true, description: '売掛金回収不能' },
];

// ===== 24. 訴訟・法的トラブル =====
const legalTrouble: PresetItem[] = [
  { id: '24-1', majorCategory: 'legal_trouble', type: 'life_event', eventCategory: 'legal', name: '交通事故（加害）', defaultAge: 40, defaultCost: 100, isExpense: true, description: '自己負担分' },
  { id: '24-2', majorCategory: 'legal_trouble', type: 'life_event', eventCategory: 'legal', name: '近隣トラブル解決費', defaultAge: 45, defaultCost: 50, isExpense: true, description: '弁護士費用等' },
];

// ===== 25. 国際的な要素 =====
const internationalItems: PresetItem[] = [
  { id: '25-1', majorCategory: 'international', type: 'life_event', eventCategory: 'international', name: '海外移住費用', defaultAge: 55, defaultCost: 300, isExpense: true, description: '渡航・住居・手続き' },
  { id: '25-2', majorCategory: 'international', type: 'life_event', eventCategory: 'international', name: 'ビザ・永住権取得', defaultAge: 50, defaultCost: 100, isExpense: true, description: '申請・弁護士費用' },
  { id: '25-7', majorCategory: 'international', type: 'life_event', eventCategory: 'education', name: '子どもの海外留学', defaultAge: 20, defaultCost: 500, isExpense: true, description: '1年間の留学費用' },
];

// ===== 26. リスク・緊急時 =====
const riskEmergency: PresetItem[] = [
  { id: '26-1', majorCategory: 'risk_emergency', type: 'life_event', eventCategory: 'career', name: '収入途絶（案件切れ）', defaultAge: 40, defaultCost: 200, isExpense: true, description: '6ヶ月の収入減' },
  { id: '26-4', majorCategory: 'risk_emergency', type: 'life_event', eventCategory: 'housing', name: '自然災害（自宅被害）', defaultAge: 50, defaultCost: 500, isExpense: true, description: '保険でカバーしきれない分' },
];

// ===== 27. 老後・リタイアメント =====
const retirementItems: PresetItem[] = [
  { id: '27-1', majorCategory: 'retirement', type: 'life_event', eventCategory: 'retirement', name: 'リタイア', defaultAge: 65, defaultCost: 0, isExpense: false, description: '目標リタイア年齢' },
  { id: '27-3', majorCategory: 'retirement', type: 'life_event', eventCategory: 'housing', name: '老後の住み替え', defaultAge: 70, defaultCost: 500, isExpense: true, description: 'ダウンサイジング' },
  { id: '27-4', majorCategory: 'retirement', type: 'life_event', eventCategory: 'retirement', name: '介護費用', defaultAge: 80, defaultCost: 600, isExpense: true, description: '平均500〜800万円' },
  { id: '27-5', majorCategory: 'retirement', type: 'recurring_expense', expenseCategory: 'living', name: 'サ高住・施設費用', defaultStartAge: 80, defaultEndAge: 90, defaultCost: 180, isExpense: true, description: '月15万円想定' },
  { id: '27-6', majorCategory: 'retirement', type: 'life_event', eventCategory: 'retirement', name: '有料老人ホーム入居金', defaultAge: 80, defaultCost: 500, isExpense: true, description: '一時金500万円想定' },
  { id: '27-7', majorCategory: 'retirement', type: 'life_event', eventCategory: 'retirement', name: 'リバースモーゲージ', defaultAge: 70, defaultCost: 2000, isExpense: false, description: '自宅を担保に生活資金' },
];

// ===== 28. 趣味・自己実現 =====
const hobbyItems: PresetItem[] = [
  { id: '28-1', majorCategory: 'hobby', type: 'life_event', eventCategory: 'hobby', name: '楽器・スポーツ用品', defaultAge: 35, defaultCost: 30, isExpense: true, description: '初期費用' },
  { id: '28-3', majorCategory: 'hobby', type: 'life_event', eventCategory: 'hobby', name: '創作活動（出版・個展）', defaultAge: 50, defaultCost: 100, isExpense: true, description: '制作・発表費用' },
  { id: '28-5', majorCategory: 'hobby', type: 'recurring_expense', expenseCategory: 'other', name: '寄付・社会貢献', defaultStartAge: 30, defaultEndAge: 80, defaultCost: 12, isExpense: true, description: '月1万円' },
  { id: '28-7', majorCategory: 'hobby', type: 'recurring_expense', expenseCategory: 'hobby', name: '旅行・体験', defaultStartAge: 22, defaultEndAge: 80, defaultCost: 30, isExpense: true, description: '年30万円想定' },
];

// ===== 34. エンディング =====
const endingItems: PresetItem[] = [
  { id: '34-1', majorCategory: 'ending', type: 'life_event', eventCategory: 'ending', name: '葬儀費用', defaultAge: 90, defaultCost: 200, isExpense: true, description: '家族葬〜一般葬' },
  { id: '34-2', majorCategory: 'ending', type: 'life_event', eventCategory: 'ending', name: '死後事務委任契約', defaultAge: 70, defaultCost: 50, isExpense: true, description: '手続き代行費' },
];

// ===== All Presets Combined =====
export const ALL_PRESETS: PresetItem[] = [
  ...incomeCareer,
  ...expensesLiving,
  ...housing,
  ...marriage,
  ...pregnancyBirth,
  ...childcareEducation,
  ...socialInsurance,
  ...tax,
  ...insurance,
  ...investment,
  ...debt,
  ...healthMedical,
  ...workstyle,
  ...skills,
  ...networkRelations,
  ...parents,
  ...ceremonies,
  ...legalPrep,
  ...inheritanceItems,
  ...vehicleItems,
  ...beautyItems,
  ...digitalIT,
  ...businessRisk,
  ...legalTrouble,
  ...internationalItems,
  ...riskEmergency,
  ...retirementItems,
  ...hobbyItems,
  ...endingItems,
];

export function getPresetsByMajorCategory(mc: MajorCategory): PresetItem[] {
  return ALL_PRESETS.filter((p) => p.majorCategory === mc);
}
