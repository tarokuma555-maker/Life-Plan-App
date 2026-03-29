import { CareerBlock, HousingLoan, InvestmentAccount, LifeEvent, RecurringExpense, Scenario, WorkStyle } from '@/types';

// ===== 年収関連 =====

export function getIncomeAtAge(
  careerBlocks: CareerBlock[],
  age: number
): number {
  const block = careerBlocks.find(
    (cb) => age >= cb.startAge && age < cb.endAge
  );
  return block ? block.annualIncome : 0;
}

export function getCareerBlockAtAge(
  careerBlocks: CareerBlock[],
  age: number
): CareerBlock | undefined {
  return careerBlocks.find(
    (cb) => age >= cb.startAge && age < cb.endAge
  );
}

export function getLifetimeIncome(
  careerBlocks: CareerBlock[],
  startAge: number = 22,
  endAge: number = 65
): number {
  let total = 0;
  for (let age = startAge; age < endAge; age++) {
    total += getIncomeAtAge(careerBlocks, age);
  }
  return total;
}

export function getIncomeData(
  scenarios: Scenario[],
  activeScenarioIds: string[],
  startAge: number = 0,
  endAge: number = 100
) {
  const data = [];
  for (let age = startAge; age <= endAge; age++) {
    const entry: Record<string, number | string> = { age };
    for (const scenario of scenarios) {
      if (activeScenarioIds.includes(scenario.id)) {
        entry[scenario.name] = getIncomeAtAge(scenario.careerBlocks, age);
      }
    }
    data.push(entry);
  }
  return data;
}

// ===== 住宅ローン関連 =====

/** 元利均等返済の月額を計算（万円） */
export function calcMonthlyPayment(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number {
  if (loanAmount <= 0 || loanTermYears <= 0) return 0;
  if (interestRate <= 0) return loanAmount / (loanTermYears * 12);

  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  const payment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  return Math.round(payment * 100) / 100;
}

/** 年間返済額（万円） */
export function calcAnnualPayment(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number {
  return calcMonthlyPayment(loanAmount, interestRate, loanTermYears) * 12;
}

/** 返済総額（万円） */
export function calcTotalPayment(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number {
  return calcMonthlyPayment(loanAmount, interestRate, loanTermYears) * 12 * loanTermYears;
}

/** 住宅ローン審査：返済比率を計算（%） */
export function calcDebtToIncomeRatio(
  annualIncome: number,
  annualPayment: number
): number {
  if (annualIncome <= 0) return 100;
  return (annualPayment / annualIncome) * 100;
}

/** 住宅ローン審査結果 */
export interface LoanAssessment {
  maxLoanAmount: number; // 最大借入可能額（万円）
  debtToIncomeRatio: number; // 返済比率（%）
  isApproved: boolean; // 審査通過見込み
  monthlyPayment: number; // 月額返済額（万円）
  totalPayment: number; // 返済総額（万円）
  completionAge: number; // 完済年齢
  warnings: string[];
}

export function assessHousingLoan(
  loan: HousingLoan,
  annualIncome: number
): LoanAssessment {
  const monthlyPayment = calcMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears);
  const annualPayment = monthlyPayment * 12;
  const totalPayment = calcTotalPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears);
  const debtToIncomeRatio = calcDebtToIncomeRatio(annualIncome, annualPayment);
  const completionAge = loan.purchaseAge + loan.loanTermYears;

  const warnings: string[] = [];

  if (debtToIncomeRatio > 35) {
    warnings.push(`返済比率${debtToIncomeRatio.toFixed(1)}%は基準（35%）を超過`);
  } else if (debtToIncomeRatio > 25) {
    warnings.push(`返済比率${debtToIncomeRatio.toFixed(1)}%はやや高め（推奨25%以下）`);
  }

  if (completionAge > 80) {
    warnings.push(`完済年齢${completionAge}歳は上限（80歳）を超過`);
  } else if (completionAge > 75) {
    warnings.push(`完済年齢${completionAge}歳は高め（推奨75歳以下）`);
  }

  if (annualIncome < 200) {
    warnings.push('年収200万円未満は審査が厳しい');
  }

  // 最大借入可能額を計算（返済比率35%、金利+1%のストレステスト）
  const stressRate = loan.interestRate + 1;
  const stressMonthlyRate = stressRate / 100 / 12;
  const numPayments = loan.loanTermYears * 12;
  const maxAnnualPayment = annualIncome * 0.35;
  const maxMonthlyPayment = maxAnnualPayment / 12;
  let maxLoanAmount = 0;
  if (stressMonthlyRate > 0) {
    maxLoanAmount =
      (maxMonthlyPayment * (Math.pow(1 + stressMonthlyRate, numPayments) - 1)) /
      (stressMonthlyRate * Math.pow(1 + stressMonthlyRate, numPayments));
  } else {
    maxLoanAmount = maxMonthlyPayment * numPayments;
  }
  maxLoanAmount = Math.floor(maxLoanAmount / 10) * 10; // 10万円単位に切り捨て

  const isApproved = debtToIncomeRatio <= 35 && completionAge <= 80 && annualIncome >= 200;

  return {
    maxLoanAmount,
    debtToIncomeRatio,
    isApproved,
    monthlyPayment,
    totalPayment,
    completionAge,
    warnings,
  };
}

/** 特定年齢での住宅ローン年間返済額を計算 */
export function getLoanPaymentAtAge(
  loans: HousingLoan[],
  age: number
): number {
  let total = 0;
  for (const loan of loans) {
    if (age >= loan.purchaseAge && age < loan.purchaseAge + loan.loanTermYears) {
      total += calcAnnualPayment(loan.loanAmount, loan.interestRate, loan.loanTermYears);
    }
  }
  return total;
}

// ===== 固定費関連 =====

/** 特定年齢での固定費合計（万円/年） */
export function getRecurringExpenseAtAge(
  expenses: RecurringExpense[],
  age: number
): number {
  return expenses
    .filter((e) => age >= e.startAge && age <= e.endAge)
    .reduce((sum, e) => sum + e.annualCost, 0);
}

// ===== 家賃の目安計算 =====

/** 年収から適正家賃を計算（万円/月） */
export function calcAffordableRent(annualIncome: number): {
  conservative: number; // 手取りの25%
  standard: number; // 手取りの30%
  aggressive: number; // 手取りの33%
} {
  // 手取りの概算（額面の75〜80%）
  const takeHome = annualIncome * 0.77;
  const monthly = takeHome / 12;
  return {
    conservative: Math.round(monthly * 0.25 * 10) / 10,
    standard: Math.round(monthly * 0.30 * 10) / 10,
    aggressive: Math.round(monthly * 0.33 * 10) / 10,
  };
}

// ===== 働き方別の手取り計算 =====

/** 会社員の手取り概算（万円/年） */
export function calcEmployeeTakeHome(annualIncome: number): {
  takeHome: number;
  incomeTax: number;
  residentTax: number;
  socialInsurance: number;
  pension: number;
} {
  // 社会保険料（健康保険+介護保険+雇用保険）≒ 年収の約14.5%
  const socialInsurance = annualIncome * 0.145;
  // 厚生年金 ≒ 年収の約9.15%
  const pension = annualIncome * 0.0915;
  // 課税所得
  const taxableIncome = Math.max(0, annualIncome - socialInsurance - pension - 48 - 38);
  // 所得税（簡易計算）
  const incomeTax = calcIncomeTax(taxableIncome);
  // 住民税 ≒ 課税所得の10%
  const residentTax = taxableIncome * 0.1;
  const takeHome = annualIncome - socialInsurance - pension - incomeTax - residentTax;

  return { takeHome: Math.round(takeHome), incomeTax: Math.round(incomeTax), residentTax: Math.round(residentTax), socialInsurance: Math.round(socialInsurance), pension: Math.round(pension) };
}

/** フリーランスの手取り概算（万円/年） */
export function calcFreelanceTakeHome(annualIncome: number, expenseRate: number): {
  takeHome: number;
  revenue: number;
  expenses: number;
  incomeTax: number;
  residentTax: number;
  nationalHealthInsurance: number;
  nationalPension: number;
} {
  const revenue = annualIncome;
  const expenses = revenue * (expenseRate / 100);
  const profit = revenue - expenses;
  // 国民健康保険 ≒ 所得の約10%（上限あり、年間約106万円）
  const nationalHealthInsurance = Math.min(profit * 0.10, 106);
  // 国民年金 ≒ 約20万円/年（固定）
  const nationalPension = 20;
  // 青色申告特別控除65万円
  const taxableIncome = Math.max(0, profit - nationalHealthInsurance - nationalPension - 65 - 48);
  const incomeTax = calcIncomeTax(taxableIncome);
  const residentTax = taxableIncome * 0.1;
  const takeHome = profit - nationalHealthInsurance - nationalPension - incomeTax - residentTax;

  return {
    takeHome: Math.round(takeHome),
    revenue: Math.round(revenue),
    expenses: Math.round(expenses),
    incomeTax: Math.round(incomeTax),
    residentTax: Math.round(residentTax),
    nationalHealthInsurance: Math.round(nationalHealthInsurance),
    nationalPension: Math.round(nationalPension),
  };
}

/** 法人経営者の手取り概算（万円/年） */
export function calcCorporateOwnerTakeHome(
  corporateRevenue: number,
  officerSalary: number
): {
  personalTakeHome: number;
  corporateProfit: number;
  corporateTax: number;
  officerSalary: number;
  personalIncomeTax: number;
  personalResidentTax: number;
  personalSocialInsurance: number;
  personalPension: number;
} {
  // 役員報酬分は会社員と同じ税計算
  const personal = calcEmployeeTakeHome(officerSalary);

  // 法人側
  const corporateExpenses = officerSalary + officerSalary * 0.15; // 役員報酬 + 社会保険料会社負担
  const corporateProfit = Math.max(0, corporateRevenue - corporateExpenses);
  // 法人税（実効税率：約23〜34%）
  let corporateTaxRate = 0.23;
  if (corporateProfit > 800) corporateTaxRate = 0.34;
  const corporateTax = Math.round(corporateProfit * corporateTaxRate);

  return {
    personalTakeHome: personal.takeHome,
    corporateProfit: Math.round(corporateProfit),
    corporateTax,
    officerSalary: Math.round(officerSalary),
    personalIncomeTax: personal.incomeTax,
    personalResidentTax: personal.residentTax,
    personalSocialInsurance: personal.socialInsurance,
    personalPension: personal.pension,
  };
}

/** 所得税の簡易計算（万円） */
function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  // 累進課税（万円ベース）
  const brackets = [
    { limit: 195, rate: 0.05, deduction: 0 },
    { limit: 330, rate: 0.10, deduction: 9.75 },
    { limit: 695, rate: 0.20, deduction: 42.75 },
    { limit: 900, rate: 0.23, deduction: 63.6 },
    { limit: 1800, rate: 0.33, deduction: 153.6 },
    { limit: 4000, rate: 0.40, deduction: 279.6 },
    { limit: Infinity, rate: 0.45, deduction: 479.6 },
  ];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.limit) {
      return taxableIncome * bracket.rate - bracket.deduction;
    }
  }
  return 0;
}

/** 働き方に応じた手取りを年齢ごとに取得 */
export function getTakeHomeAtAge(
  careerBlocks: CareerBlock[],
  age: number
): number {
  const block = getCareerBlockAtAge(careerBlocks, age);
  if (!block) return 0;

  const workStyle: WorkStyle = block.workStyle || 'employee';

  switch (workStyle) {
    case 'employee':
      return calcEmployeeTakeHome(block.annualIncome).takeHome;
    case 'freelance':
      return calcFreelanceTakeHome(block.annualIncome, block.businessExpenseRate || 30).takeHome;
    case 'corporate_owner':
      return calcCorporateOwnerTakeHome(
        block.corporateRevenue || block.annualIncome,
        block.officerSalary || block.annualIncome * 0.5
      ).personalTakeHome;
    default:
      return block.annualIncome * 0.77;
  }
}

// ===== 支出・収支 =====

export function getExpenseAtAge(
  lifeEvents: LifeEvent[],
  personBirthYear: number,
  age: number
): number {
  return lifeEvents
    .filter((e) => e.isExpense && e.age === age)
    .reduce((sum, e) => sum + e.cost, 0);
}

/** 特定年齢での総支出（イベント + ローン + 固定費）*/
export function getTotalExpenseAtAge(
  lifeEvents: LifeEvent[],
  housingLoans: HousingLoan[],
  recurringExpenses: RecurringExpense[],
  age: number
): number {
  const eventExpenses = lifeEvents
    .filter((e) => e.isExpense && e.age === age)
    .reduce((sum, e) => sum + e.cost, 0);
  const loanPayments = getLoanPaymentAtAge(housingLoans, age);
  const recurring = getRecurringExpenseAtAge(recurringExpenses, age);
  return eventExpenses + loanPayments + recurring;
}

export function getCumulativeData(
  scenarios: Scenario[],
  activeScenarioIds: string[],
  lifeEvents: LifeEvent[],
  startAge: number = 22,
  endAge: number = 100,
  housingLoans: HousingLoan[] = [],
  recurringExpenses: RecurringExpense[] = [],
  investmentAccounts: InvestmentAccount[] = []
) {
  const data = [];
  const cumulative: Record<string, number> = {};

  for (const scenario of scenarios) {
    if (activeScenarioIds.includes(scenario.id)) {
      cumulative[scenario.name] = 0;
    }
  }

  for (let age = startAge; age <= endAge; age++) {
    const totalExpense = getTotalExpenseAtAge(lifeEvents, housingLoans, recurringExpenses, age);

    // 投資の年間積立額を支出として計上（手取りから出ていくお金）
    let investmentContributionAtAge = 0;
    for (const acc of investmentAccounts) {
      if (age >= acc.startAge && age < acc.endAge) {
        investmentContributionAtAge += acc.monthlyContribution * 12;
      }
    }

    // 投資残高（積立元本 + 運用益）
    const investmentValue = getInvestmentBalanceAtAge(investmentAccounts, age);

    const entry: Record<string, number | string> = { age };
    for (const scenario of scenarios) {
      if (activeScenarioIds.includes(scenario.id)) {
        const income = getTakeHomeAtAge(scenario.careerBlocks, age);
        // 手取りから支出と投資積立を引く → 残りの現金
        cumulative[scenario.name] += income - totalExpense - investmentContributionAtAge;
        // 現金残高 + 投資残高 = 純資産
        entry[scenario.name] = Math.round(cumulative[scenario.name] + investmentValue);
      }
    }
    data.push(entry);
  }
  return data;
}

export function getDangerZones(
  scenario: Scenario,
  lifeEvents: LifeEvent[],
  startAge: number = 22,
  endAge: number = 100,
  housingLoans: HousingLoan[] = [],
  recurringExpenses: RecurringExpense[] = []
): { start: number; end: number }[] {
  const zones: { start: number; end: number }[] = [];
  let cumulative = 0;
  let zoneStart: number | null = null;

  for (let age = startAge; age <= endAge; age++) {
    const income = getTakeHomeAtAge(scenario.careerBlocks, age);
    const totalExpense = getTotalExpenseAtAge(lifeEvents, housingLoans, recurringExpenses, age);

    cumulative += income - totalExpense;

    if (cumulative < 0 && zoneStart === null) {
      zoneStart = age;
    } else if (cumulative >= 0 && zoneStart !== null) {
      zones.push({ start: zoneStart, end: age - 1 });
      zoneStart = null;
    }
  }

  if (zoneStart !== null) {
    zones.push({ start: zoneStart, end: endAge });
  }

  return zones;
}

export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 10000) {
    return `${(amount / 10000).toFixed(1)}億円`;
  }
  return `${amount}万円`;
}

// ===== 投資・複利計算 =====

/**
 * 複利成長の計算（万円）
 * 毎月の積立額に対して複利で運用した場合の総額を返す
 * @param monthlyContribution 月額積立額（万円）
 * @param expectedReturn 年間期待リターン（%、例: 5 = 5%）
 * @param years 運用年数
 * @returns 運用総額（万円）
 */
export function calcCompoundGrowth(
  monthlyContribution: number,
  expectedReturn: number,
  years: number
): number {
  if (years <= 0 || monthlyContribution <= 0) return 0;
  if (expectedReturn <= 0) return monthlyContribution * 12 * years;

  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = years * 12;
  // 将来価値 = PMT * ((1 + r)^n - 1) / r
  const futureValue =
    monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  return Math.round(futureValue * 100) / 100;
}

/**
 * 年金見込額の推計（万円/年）
 * キャリアブロックから厚生年金と国民年金を推計する
 * - 会社員(employee): 厚生年金 = 平均年収 * 勤続年数 * 0.005481 + 国民年金基礎
 * - フリーランス(freelance): 国民年金のみ = 78万円 * 加入年数/40
 * - 法人経営者(corporate_owner): 会社員と同じ（厚生年金加入）
 * @param careerBlocks キャリアブロック配列
 * @param pensionStartAge 年金受給開始年齢（デフォルト65）
 * @returns { annualPension, basicPension, employeePension }（万円/年）
 */
export function calcPensionEstimate(
  careerBlocks: CareerBlock[],
  pensionStartAge: number = 65
): { annualPension: number; basicPension: number; employeePension: number } {
  let totalEmployeeYears = 0;
  let totalEmployeeSalarySum = 0; // 厚生年金対象の年収合計
  let totalNationalPensionYears = 0; // 国民年金加入年数（全員加入）

  for (const block of careerBlocks) {
    const years = Math.max(0, block.endAge - block.startAge);
    if (years <= 0) continue;

    // 全ての働き方で国民年金加入年数にカウント
    totalNationalPensionYears += years;

    const workStyle: WorkStyle = block.workStyle || 'employee';

    if (workStyle === 'employee' || workStyle === 'corporate_owner') {
      // 厚生年金対象
      const salary = workStyle === 'corporate_owner'
        ? (block.officerSalary || block.annualIncome * 0.5)
        : block.annualIncome;
      totalEmployeeYears += years;
      totalEmployeeSalarySum += salary * years;
    }
    // freelance は国民年金のみ（上で totalNationalPensionYears に加算済み）
  }

  // 国民年金加入年数は最大40年
  const cappedNationalPensionYears = Math.min(totalNationalPensionYears, 40);

  // 国民年金基礎額: 満額78万円/年、加入年数に比例
  const basicPension = Math.round((78 * cappedNationalPensionYears / 40) * 100) / 100;

  // 厚生年金: 平均年収 * 加入年数 * 0.005481
  let employeePension = 0;
  if (totalEmployeeYears > 0) {
    const averageSalary = totalEmployeeSalarySum / totalEmployeeYears;
    employeePension = Math.round(averageSalary * totalEmployeeYears * 0.005481 * 100) / 100;
  }

  const annualPension = Math.round((basicPension + employeePension) * 100) / 100;

  return { annualPension, basicPension, employeePension };
}

/**
 * 老後資金ギャップの計算（万円）
 * @param annualPension 年間年金額（万円）
 * @param investmentBalance 投資残高（万円）
 * @param desiredAnnualLiving 希望する年間生活費（万円）
 * @param retireAge 退職年齢
 * @param lifeExpectancy 想定寿命
 * @returns { totalNeeded, totalHave, gap, yearsCovered }
 */
export function calcRetirementGap(
  annualPension: number,
  investmentBalance: number,
  desiredAnnualLiving: number,
  retireAge: number,
  lifeExpectancy: number
): { totalNeeded: number; totalHave: number; gap: number; yearsCovered: number } {
  const retirementYears = Math.max(0, lifeExpectancy - retireAge);
  const totalNeeded = Math.round(desiredAnnualLiving * retirementYears);
  const totalPensionIncome = Math.round(annualPension * retirementYears);
  const totalHave = Math.round(totalPensionIncome + investmentBalance);
  const gap = Math.round(totalNeeded - totalHave);

  // 年金+投資残高で何年カバーできるか
  const annualShortfall = desiredAnnualLiving - annualPension;
  let yearsCovered: number;
  if (annualShortfall <= 0) {
    // 年金だけで生活費をカバーできる
    yearsCovered = retirementYears;
  } else if (investmentBalance <= 0) {
    yearsCovered = 0;
  } else {
    yearsCovered = Math.min(
      Math.round((investmentBalance / annualShortfall) * 10) / 10,
      retirementYears
    );
  }

  return { totalNeeded, totalHave, gap, yearsCovered };
}

/**
 * インフレ適用後の金額を計算（万円）
 * @param amount 現在の金額（万円）
 * @param years 経過年数
 * @param rate インフレ率（%、例: 2 = 2%）
 * @returns インフレ適用後の金額（万円）
 */
export function applyInflation(
  amount: number,
  years: number,
  rate: number
): number {
  if (years <= 0 || rate <= 0) return amount;
  return Math.round(amount * Math.pow(1 + rate / 100, years) * 100) / 100;
}

/**
 * 指定年齢時点での投資残高合計を計算（万円）
 * 各投資口座について、startAge から指定年齢までの複利成長を計算して合算する
 * @param accounts 投資口座の配列
 * @param age 計算対象の年齢
 * @returns 投資残高合計（万円）
 */
export function getInvestmentBalanceAtAge(
  accounts: InvestmentAccount[],
  age: number
): number {
  let total = 0;
  for (const account of accounts) {
    if (age < account.startAge) continue;

    // 積立期間: startAge から min(age, endAge) まで
    const contributionYears = Math.max(0, Math.min(age, account.endAge) - account.startAge);
    if (contributionYears <= 0) {
      // 積立期間が終了している場合、積立終了時点の残高を追加運用年数分だけ成長させる
      const accumulatedAtEnd = calcCompoundGrowth(
        account.monthlyContribution,
        account.expectedReturn,
        account.endAge - account.startAge
      );
      const additionalYears = age - account.endAge;
      if (additionalYears > 0 && account.expectedReturn > 0) {
        // 追加積立なしで複利成長のみ
        total += Math.round(accumulatedAtEnd * Math.pow(1 + account.expectedReturn / 100, additionalYears) * 100) / 100;
      } else {
        total += accumulatedAtEnd;
      }
    } else {
      // まだ積立中
      const accumulated = calcCompoundGrowth(
        account.monthlyContribution,
        account.expectedReturn,
        contributionYears
      );
      total += accumulated;
    }
  }
  return Math.round(total * 100) / 100;
}
