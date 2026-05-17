import { RechargeLog, MeterWithStats, Meter } from "@/types";

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
  const firstDate = new Date(sorted[0].date);
  const today = new Date();
  const daysSinceFirst = Math.max(
    1,
    Math.ceil((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const dailyConsumption = totalUnits / daysSinceFirst;

  // Remaining = total loaded minus consumed since first recharge
  const unitsConsumed = dailyConsumption * daysSinceFirst;
  const estimatedRemaining = Math.max(0, totalUnits - unitsConsumed);

  // Days left based on remaining
  const daysRemaining =
    dailyConsumption > 0 ? estimatedRemaining / dailyConsumption : 0;

  // Percent: remaining vs last recharge batch size as reference
  const lastLog = sorted[sorted.length - 1];
  const referenceUnits = lastLog.units_kwh;
  const percentRemaining = Math.min(
    100,
    Math.max(0, (estimatedRemaining / referenceUnits) * 100)
  );

  return {
    ...meter,
    total_units_loaded: totalUnits,
    estimated_units_remaining: Math.round(estimatedRemaining * 10) / 10,
    daily_consumption: Math.round(dailyConsumption * 10) / 10,
    days_remaining: Math.round(daysRemaining),
    percent_remaining: Math.round(percentRemaining),
    last_recharge_date: sorted[sorted.length - 1].date,
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
