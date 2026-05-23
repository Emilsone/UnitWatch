import { RechargeLog, MeterWithStats, Meter } from "@/types";

const DEFAULT_DAILY_KWH = 10;

const MIN_DAYS_FOR_ESTIMATE = 3;

export function computeMeterStats(meter: Meter, logs: RechargeLog[]): MeterWithStats {
  if (!logs || logs.length === 0) {
    return {
      ...meter,
      total_units_loaded: 0,
      estimated_units_remaining: 0,
      daily_consumption: 0,
      days_remaining: 0,
      percent_remaining: 0,
      last_recharge_date: null,
      recharge_logs: [],
    };
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalUnits = logs.reduce((sum, l) => sum + l.units_kwh, 0);

  const lastLog = sorted[sorted.length - 1];
  const lastRechargeDate = new Date(lastLog.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastRechargeDate.setHours(0, 0, 0, 0);

  const daysSinceLastRecharge = Math.max(
    0,
    Math.floor((today.getTime() - lastRechargeDate.getTime()) / (1000 * 60 * 60 * 24))
  );


  const firstDate = new Date(sorted[0].date);
  firstDate.setHours(0, 0, 0, 0);
  const totalDaysOfHistory = Math.max(
    1,
    Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  );


  const calculatedDaily = totalUnits / totalDaysOfHistory;
  const dailyConsumption = totalDaysOfHistory >= MIN_DAYS_FOR_ESTIMATE
    ? calculatedDaily
    : DEFAULT_DAILY_KWH;


  const unitsConsumedSinceLastRecharge = dailyConsumption * daysSinceLastRecharge;
  const estimatedRemaining = Math.max(0, lastLog.units_kwh - unitsConsumedSinceLastRecharge);


  const daysRemaining = dailyConsumption > 0 ? estimatedRemaining / dailyConsumption : 0;


  const percentRemaining = Math.min(
    100,
    Math.max(0, (estimatedRemaining / lastLog.units_kwh) * 100)
  );

  return {
    ...meter,
    total_units_loaded: Math.round(totalUnits * 10) / 10,
    estimated_units_remaining: Math.round(estimatedRemaining * 10) / 10,
    daily_consumption: Math.round(dailyConsumption * 10) / 10,
    days_remaining: Math.round(daysRemaining),
    percent_remaining: Math.round(percentRemaining),
    last_recharge_date: lastLog.date,
    recharge_logs: sorted.reverse(),
  };
}

export function getUnitColor(percent: number): string {
  if (percent > 50) return "#4CAF50";
  if (percent > 25) return "#FFC107";
  if (percent > 10) return "#FF9800";
  return "#F44336";
}

export function getUnitStatus(percent: number): string {
  if (percent > 50) return "Healthy";
  if (percent > 25) return "Moderate";
  if (percent > 10) return "Low";
  return "Critical";
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}