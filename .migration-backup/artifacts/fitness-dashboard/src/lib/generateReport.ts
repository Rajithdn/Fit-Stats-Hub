import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { UserProfile, FoodEntry, WorkoutLogEntry, StepEntry, MeasurementEntry } from "@/store/useStore";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function fmt(n: number, dec = 1): string {
  return Number.isFinite(n) ? n.toFixed(dec) : "0";
}

function accentBar(doc: jsPDF, x: number, y: number, w: number) {
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(x, y, w, 1.2, "F");
}

export function generateFitnessReport(data: {
  userProfile: UserProfile;
  username: string;
  dailyLog: { foods: FoodEntry[]; water: number; sleep: number };
  workoutLogs: WorkoutLogEntry[];
  stepEntries: StepEntry[];
  measurements: MeasurementEntry[];
  stepGoal: number;
}) {
  const { userProfile, username, dailyLog, workoutLogs, stepEntries, measurements, stepGoal } = data;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  const emerald: [number, number, number] = [16, 185, 129];
  const dark: [number, number, number] = [17, 24, 39];
  const mid: [number, number, number] = [75, 85, 99];
  const light: [number, number, number] = [243, 244, 246];

  let y = 0;

  // ── Cover header ─────────────────────────────────────────────────────────────
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 48, "F");

  // Accent stripe
  doc.setFillColor(...emerald);
  doc.rect(0, 44, W, 4, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text("TermFit", margin, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text("Personal Fitness Report", margin, 28);

  // Name + date on the right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const nameText = userProfile.name || `@${username}`;
  doc.text(nameText, W - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, W - margin, 27, { align: "right" });

  y = 60;

  // ── Section helper ────────────────────────────────────────────────────────────
  function sectionTitle(title: string) {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.text(title, margin, y);
    accentBar(doc, margin, y + 2, 36);
    y += 10;
  }

  function statCard(label: string, value: string, unit: string, x: number, cardW: number) {
    doc.setFillColor(...light);
    doc.roundedRect(x, y, cardW, 22, 3, 3, "F");
    doc.setFillColor(...emerald);
    doc.roundedRect(x, y, 3, 22, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...mid);
    doc.text(label, x + 7, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...dark);
    doc.text(value, x + 7, y + 17);
    if (unit) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...mid);
      doc.text(unit, x + 7 + doc.getTextWidth(value) + 1.5, y + 17);
    }
  }

  // ── 1. Profile Summary ────────────────────────────────────────────────────────
  sectionTitle("Profile Summary");

  const gap = 4;
  const col2W = (contentW - gap) / 2;

  statCard("Current Weight", fmt(userProfile.weight, 1), "kg", margin, col2W);
  statCard("Target Weight", fmt(userProfile.targetWeight, 1), "kg", margin + col2W + gap, col2W);
  y += 26;

  const col4W = (contentW - gap * 3) / 4;
  statCard("Age", String(userProfile.age), "yrs", margin, col4W);
  statCard("Height", fmt(userProfile.height, 0), "cm", margin + (col4W + gap), col4W);
  statCard("BMI", fmt(userProfile.weight / Math.pow(userProfile.height / 100, 2), 1), "", margin + (col4W + gap) * 2, col4W);
  statCard("Calorie Goal", String(userProfile.dailyCalorieGoal), "kcal", margin + (col4W + gap) * 3, col4W);
  y += 26;

  // Info row
  doc.setFillColor(...light);
  doc.roundedRect(margin, y, contentW, 14, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mid);
  const infoItems = [
    `Goal: ${userProfile.goal}`,
    `Activity: ${userProfile.activityLevel}`,
    `Gender: ${userProfile.gender}`,
    `Username: @${username}`,
  ];
  const infoItemW = contentW / infoItems.length;
  infoItems.forEach((item, i) => {
    const [label, val] = item.split(": ");
    doc.setTextColor(...mid);
    doc.text(label + ": ", margin + infoItemW * i + 6, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(val, margin + infoItemW * i + 6 + doc.getTextWidth(label + ": "), y + 6);
    doc.setFont("helvetica", "normal");
    // small subtext
    doc.setFontSize(7);
    doc.setTextColor(...mid);
  });
  y += 20;

  // ── 2. Today's Nutrition ──────────────────────────────────────────────────────
  sectionTitle("Today's Nutrition");

  const totalCals = dailyLog.foods.reduce((s, f) => s + f.calories, 0);
  const totalProtein = dailyLog.foods.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = dailyLog.foods.reduce((s, f) => s + f.carbs, 0);
  const totalFat = dailyLog.foods.reduce((s, f) => s + f.fat, 0);
  const totalFiber = dailyLog.foods.reduce((s, f) => s + f.fiber, 0);

  const nutCards = [
    { label: "Calories", val: String(totalCals), unit: "kcal" },
    { label: "Protein", val: fmt(totalProtein), unit: "g" },
    { label: "Carbs", val: fmt(totalCarbs), unit: "g" },
    { label: "Fat", val: fmt(totalFat), unit: "g" },
    { label: "Fiber", val: fmt(totalFiber), unit: "g" },
    { label: "Water", val: fmt(dailyLog.water, 1), unit: "L" },
  ];
  const nut3W = (contentW - gap * 2) / 3;
  nutCards.forEach((c, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    if (col === 0 && row > 0) y += 26;
    statCard(c.label, c.val, c.unit, margin + col * (nut3W + gap), nut3W);
  });
  y += 26;

  if (dailyLog.foods.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Food Item", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)"]],
      body: dailyLog.foods.map((f) => [f.name, f.calories, fmt(f.protein), fmt(f.carbs), fmt(f.fat)]),
      headStyles: { fillColor: emerald, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: dark },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { cellPadding: 3, lineColor: [229, 231, 235], lineWidth: 0.3 },
      columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...mid);
    doc.text("No food entries logged today.", margin, y);
    y += 10;
  }

  // ── 3. Workout History ────────────────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }
  sectionTitle("Workout History");

  if (workoutLogs.length > 0) {
    const recent = workoutLogs.slice(0, 20);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Date", "Exercise", "Sets", "Reps", "Weight", "Notes"]],
      body: recent.map((w) => [w.date, w.exercise, w.sets, w.reps, `${fmt(w.weight, 1)} ${w.unit}`, w.notes || "—"]),
      headStyles: { fillColor: emerald, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: dark },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { cellPadding: 3, lineColor: [229, 231, 235], lineWidth: 0.3 },
      columnStyles: { 5: { cellWidth: 40 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9); doc.setTextColor(...mid);
    doc.text("No workout logs recorded yet.", margin, y);
    y += 10;
  }

  // ── 4. Step Tracker ───────────────────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }
  sectionTitle("Step Tracker (Last 14 Days)");

  const last14 = stepEntries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  if (last14.length > 0) {
    const totalSteps = last14.reduce((s, e) => s + e.steps, 0);
    const avgSteps = Math.round(totalSteps / last14.length);
    const goalDays = last14.filter((e) => e.steps >= stepGoal).length;

    // Summary mini-cards
    [
      { label: "Avg Daily Steps", val: avgSteps.toLocaleString(), unit: "" },
      { label: "Goal Days Hit", val: `${goalDays}/${last14.length}`, unit: "" },
      { label: "Daily Step Goal", val: stepGoal.toLocaleString(), unit: "steps" },
    ].forEach((c, i) => {
      statCard(c.label, c.val, c.unit, margin + i * (nut3W + gap), nut3W);
    });
    y += 26;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Date", "Steps", "Goal", "Status"]],
      body: last14.map((e) => [
        e.date,
        e.steps.toLocaleString(),
        stepGoal.toLocaleString(),
        e.steps >= stepGoal ? "✓ Goal Met" : `${Math.round((e.steps / stepGoal) * 100)}%`,
      ]),
      headStyles: { fillColor: emerald, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: dark },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { cellPadding: 3, lineColor: [229, 231, 235], lineWidth: 0.3 },
      columnStyles: { 3: { halign: "center" } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9); doc.setTextColor(...mid);
    doc.text("No step data recorded yet.", margin, y);
    y += 10;
  }

  // ── 5. Body Measurements ──────────────────────────────────────────────────────
  if (measurements.length > 0) {
    if (y > 210) { doc.addPage(); y = 20; }
    sectionTitle("Body Measurements");

    const latest = measurements[0];
    const prev = measurements[1];

    const measRows = [
      ["Chest", fmt(latest.chest), prev ? fmt(prev.chest) : "—"],
      ["Waist", fmt(latest.waist), prev ? fmt(prev.waist) : "—"],
      ["Hips", fmt(latest.hips), prev ? fmt(prev.hips) : "—"],
      ["Left Arm", fmt(latest.leftArm), prev ? fmt(prev.leftArm) : "—"],
      ["Right Arm", fmt(latest.rightArm), prev ? fmt(prev.rightArm) : "—"],
      ["Left Thigh", fmt(latest.leftThigh), prev ? fmt(prev.leftThigh) : "—"],
      ["Right Thigh", fmt(latest.rightThigh), prev ? fmt(prev.rightThigh) : "—"],
      ["Shoulders", fmt(latest.shoulders), prev ? fmt(prev.shoulders) : "—"],
      ["Neck", fmt(latest.neck), prev ? fmt(prev.neck) : "—"],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[`Measurement (cm)`, `Latest (${latest.date})`, prev ? `Previous (${prev.date})` : "Previous", "Change"]],
      body: measRows.map(([label, cur, prv]) => {
        const diff = prv !== "—" ? (parseFloat(cur) - parseFloat(prv)).toFixed(1) : "—";
        const sign = diff !== "—" && parseFloat(diff) > 0 ? "+" : "";
        return [label, `${cur} cm`, prv !== "—" ? `${prv} cm` : "—", prv !== "—" ? `${sign}${diff} cm` : "—"];
      }),
      headStyles: { fillColor: emerald, textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: dark },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { cellPadding: 3, lineColor: [229, 231, 235], lineWidth: 0.3 },
      columnStyles: { 3: { halign: "center" } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Footer on every page ──────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...dark);
    doc.rect(0, 285, W, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text("TermFit — Personal Fitness Report", margin, 292);
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 292, { align: "right" });
    doc.text(`Developed by Rajith`, W / 2, 292, { align: "center" });
  }

  const filename = `TermFit_Report_${today()}.pdf`;
  doc.save(filename);
}
