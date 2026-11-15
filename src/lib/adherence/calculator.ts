import { ScheduledDose, AdherenceStats } from "@/types";

/**
 * Calculates adherence statistics from actual dose records.
 * Formula: Adherence Percentage = (Confirmed Taken Doses / Eligible Scheduled Doses) * 100
 * Pending doses in the future are visible but not counted in the denominator until due.
 */
export function calculateAdherenceStats(
  doses: ScheduledDose[],
  period: "daily" | "weekly" | "monthly" = "weekly",
  referenceTime: Date = new Date()
): AdherenceStats {
  const refTimeMs = referenceTime.getTime();

  // Filter doses based on the period
  let daysBack = 7;
  if (period === "daily") daysBack = 1;
  else if (period === "monthly") daysBack = 30;

  const cutoffTime = new Date(referenceTime);
  cutoffTime.setDate(cutoffTime.getDate() - daysBack);
  const cutoffTimeMs = cutoffTime.getTime();

  const filteredDoses = doses.filter((d) => {
    const doseTime = new Date(d.scheduledTime).getTime();
    return doseTime >= cutoffTimeMs && doseTime <= refTimeMs + 24 * 60 * 60 * 1000;
  });

  let totalScheduled = 0;
  let confirmedTaken = 0;
  let missed = 0;
  let skipped = 0;
  let pending = 0;

  // Group by day for trends
  const dayGroups: Record<
    string,
    { scheduled: number; taken: number; missed: number }
  > = {};

  // Group by medicine for individual breakdown
  const medGroups: Record<
    string,
    {
      medicationId: string;
      medicationName: string;
      total: number;
      taken: number;
      missed: number;
    }
  > = {};

  for (const dose of filteredDoses) {
    totalScheduled++;
    const doseDate = dose.scheduledTime.slice(0, 10);

    if (!dayGroups[doseDate]) {
      dayGroups[doseDate] = { scheduled: 0, taken: 0, missed: 0 };
    }
    dayGroups[doseDate].scheduled++;

    if (!medGroups[dose.medicationId]) {
      medGroups[dose.medicationId] = {
        medicationId: dose.medicationId,
        medicationName: dose.medicationName,
        total: 0,
        taken: 0,
        missed: 0,
      };
    }
    medGroups[dose.medicationId].total++;

    if (dose.status === "TAKEN") {
      confirmedTaken++;
      dayGroups[doseDate].taken++;
      medGroups[dose.medicationId].taken++;
    } else if (dose.status === "MISSED") {
      missed++;
      dayGroups[doseDate].missed++;
      medGroups[dose.medicationId].missed++;
    } else if (dose.status === "SKIPPED") {
      skipped++;
    } else if (dose.status === "PENDING" || dose.status === "SNOOZED") {
      pending++;
    }
  }

  // Eligible doses for denominator: Taken + Missed + Skipped (or past pending)
  const eligibleDoses = confirmedTaken + missed + skipped;
  const adherencePercentage =
    eligibleDoses > 0 ? Math.round((confirmedTaken / eligibleDoses) * 100) : 100;

  // Format daily trends
  const sortedDays = Object.keys(dayGroups).sort();
  const dailyTrends = sortedDays.map((date) => {
    const day = dayGroups[date];
    const dayEligible = day.taken + day.missed;
    const dayAdherence =
      dayEligible > 0 ? Math.round((day.taken / dayEligible) * 100) : 100;
    return {
      date,
      scheduled: day.scheduled,
      taken: day.taken,
      missed: day.missed,
      adherence: dayAdherence,
    };
  });

  // Format medication breakdown
  const medicationBreakdown = Object.values(medGroups).map((m) => {
    const medEligible = m.taken + m.missed;
    const medAdherence =
      medEligible > 0 ? Math.round((m.taken / medEligible) * 100) : 100;
    return {
      medicationId: m.medicationId,
      medicationName: m.medicationName,
      total: m.total,
      taken: m.taken,
      missed: m.missed,
      adherencePercentage: medAdherence,
    };
  });

  return {
    period,
    totalScheduled,
    confirmedTaken,
    missed,
    skipped,
    pending,
    adherencePercentage,
    dailyTrends,
    medicationBreakdown,
  };
}
