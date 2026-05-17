export interface Meter {
  id: string;
  user_id: string;
  meter_number: string;
  nickname: string;
  disco: string;
  meter_type: "single-phase" | "three-phase";
  alert_threshold: number;
  created_at: string;
}

export interface RechargeLog {
  id: string;
  meter_id: string;
  user_id: string;
  date: string;
  amount_naira: number;
  units_kwh: number;
  notes?: string;
  created_at: string;
}

export interface MeterWithStats extends Meter {
  total_units_loaded: number;
  estimated_units_remaining: number;
  daily_consumption: number;
  days_remaining: number;
  percent_remaining: number;
  last_recharge_date: string | null;
  recharge_logs: RechargeLog[];
}

export const DISCOS = [
  { value: "ikeja", label: "Ikeja Electric (IKEDC)" },
  { value: "eko", label: "Eko Electric (EKEDP)" },
  { value: "aedc", label: "Abuja Electric (AEDC)" },
  { value: "ibedc", label: "Ibadan Electric (IBEDC)" },
  { value: "phed", label: "Port Harcourt Electric (PHED)" },
  { value: "eedc", label: "Enugu Electric (EEDC)" },
  { value: "kedc", label: "Kano Electric (KEDC)" },
  { value: "other", label: "Other DisCo" },
];

export const RECHARGE_LINKS: Record<string, string> = {
  ikeja: "https://ikejaelectric.com/",
  eko: "https://www.ekedp.com/",
  aedc: "https://www.abujaelectricity.com/",
  ibedc: "https://www.ibedc.com/",
  phed: "https://www.phed.com.ng/",
  eedc: "https://eednigeria.com/",
  kedc: "https://kanoelectricity.com/",
  other: "https://buypower.ng/",
};
