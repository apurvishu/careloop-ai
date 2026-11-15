import { getInitialDatabaseState } from "../src/lib/db/mock-store";
import * as fs from "fs";
import * as path from "path";

async function runSeed() {
  console.log("🌱 [CareLoop AI] Initializing Hackathon Seed Script...");

  const state = getInitialDatabaseState();
  const patientCount = Object.keys(state.patients).length;
  const userCount = Object.keys(state.users).length;
  const medCount = Object.keys(state.medications).length;
  const doseCount = Object.keys(state.scheduledDoses).length;
  const aptCount = Object.keys(state.appointments).length;

  console.log(`✅ Loaded ${userCount} users (1 Patient, 1 Primary Caregiver, 2 Family Members)`);
  console.log(`✅ Loaded ${patientCount} patient profile: Eleanor Vance (Age 78)`);
  console.log(`✅ Loaded ${medCount} active medication schedules (Lisinopril, Metformin ER, Atorvastatin)`);
  console.log(`✅ Generated ${doseCount} scheduled & historical doses across 7-day timeline`);
  console.log(`✅ Loaded ${aptCount} medical appointments (Cardiology upcoming, Endocrinology past)`);
  console.log(`✅ Emergency Care Card profile prepared with 3 click-to-call contacts & allergy data`);

  const outputPath = path.resolve(__dirname, "../src/lib/db/seed-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(state, null, 2), "utf-8");
  console.log(`📁 Seed snapshot written to ${outputPath}`);
  console.log("🎉 [CareLoop AI] Database seeding completed successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
