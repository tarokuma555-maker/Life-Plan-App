import { CareerBlock, LifeEvent, Scenario } from '@/types';

export function getIncomeAtAge(
  careerBlocks: CareerBlock[],
  age: number
): number {
  const block = careerBlocks.find(
    (cb) => age >= cb.startAge && age < cb.endAge
  );
  return block ? block.annualIncome : 0;
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

export function getExpenseAtAge(
  lifeEvents: LifeEvent[],
  personBirthYear: number,
  age: number
): number {
  return lifeEvents
    .filter((e) => e.isExpense && e.age === age)
    .reduce((sum, e) => sum + e.cost, 0);
}

export function getCumulativeData(
  scenarios: Scenario[],
  activeScenarioIds: string[],
  lifeEvents: LifeEvent[],
  startAge: number = 22,
  endAge: number = 100
) {
  const data = [];
  const cumulative: Record<string, number> = {};

  for (const scenario of scenarios) {
    if (activeScenarioIds.includes(scenario.id)) {
      cumulative[scenario.name] = 0;
    }
  }

  for (let age = startAge; age <= endAge; age++) {
    const expenses = lifeEvents
      .filter((e) => e.isExpense && e.age === age)
      .reduce((sum, e) => sum + e.cost, 0);

    const entry: Record<string, number | string> = { age };
    for (const scenario of scenarios) {
      if (activeScenarioIds.includes(scenario.id)) {
        const income = getIncomeAtAge(scenario.careerBlocks, age);
        cumulative[scenario.name] += income - expenses;
        entry[scenario.name] = cumulative[scenario.name];
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
  endAge: number = 100
): { start: number; end: number }[] {
  const zones: { start: number; end: number }[] = [];
  let cumulative = 0;
  let zoneStart: number | null = null;

  for (let age = startAge; age <= endAge; age++) {
    const income = getIncomeAtAge(scenario.careerBlocks, age);
    const expenses = lifeEvents
      .filter((e) => e.isExpense && e.age === age)
      .reduce((sum, e) => sum + e.cost, 0);

    cumulative += income - expenses;

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
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}億円`;
  }
  return `${amount}万円`;
}
