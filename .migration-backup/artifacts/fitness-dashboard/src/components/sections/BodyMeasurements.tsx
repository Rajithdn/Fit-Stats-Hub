import { useState } from "react";
import { useStore, MeasurementEntry } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ruler, Plus, Trash2, TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const FIELDS: { key: keyof Omit<MeasurementEntry, "id" | "date" | "notes">; label: string; color: string }[] = [
  { key: "chest",      label: "Chest",       color: "#3b82f6" },
  { key: "waist",      label: "Waist",       color: "#f59e0b" },
  { key: "hips",       label: "Hips",        color: "#ec4899" },
  { key: "shoulders",  label: "Shoulders",   color: "#8b5cf6" },
  { key: "neck",       label: "Neck",        color: "#06b6d4" },
  { key: "leftArm",    label: "Left Arm",    color: "#10b981" },
  { key: "rightArm",   label: "Right Arm",   color: "#34d399" },
  { key: "leftThigh",  label: "Left Thigh",  color: "#f97316" },
  { key: "rightThigh", label: "Right Thigh", color: "#fb923c" },
];

type BlankEntry = Omit<MeasurementEntry, "id" | "date">;

const BLANK: BlankEntry = {
  chest: 0, waist: 0, hips: 0, shoulders: 0, neck: 0,
  leftArm: 0, rightArm: 0, leftThigh: 0, rightThigh: 0, notes: "",
};

function today() { return new Date().toISOString().split("T")[0]; }

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (!previous || current === previous) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  const diff = current - previous;
  const pct = Math.abs((diff / previous) * 100).toFixed(1);
  if (diff < 0) return (
    <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-medium">
      <TrendingDown className="w-3.5 h-3.5" /> {pct}%
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-rose-400 text-xs font-medium">
      <TrendingUp className="w-3.5 h-3.5" /> +{pct}%
    </span>
  );
}

export function BodyMeasurements() {
  const { measurements, addMeasurement, removeMeasurement } = useStore();
  const [form, setForm] = useState<BlankEntry>({ ...BLANK });
  const [dateVal, setDateVal] = useState(today());
  const [showForm, setShowForm] = useState(measurements.length === 0);
  const [chartField, setChartField] = useState<typeof FIELDS[0]>(FIELDS[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const setField = (key: keyof BlankEntry, val: string | number) =>
    setForm((p) => ({ ...p, [key]: val }));

  function handleAdd() {
    const entry: MeasurementEntry = {
      ...form,
      id: crypto.randomUUID(),
      date: dateVal,
    };
    addMeasurement(entry);
    setForm({ ...BLANK });
    setDateVal(today());
    setShowForm(false);
  }

  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

  const chartData = sorted.map((m) => ({
    date: shortDate(m.date),
    value: m[chartField.key] as number,
  })).filter((d) => d.value > 0);

  const latest = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ruler className="w-6 h-6 text-primary" /> Body Measurements
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your body measurements over time (all in cm)
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? "outline" : "default"} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          {showForm ? "Cancel" : "Add Measurement"}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Measurement Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Date</label>
              <Input
                type="date"
                value={dateVal}
                max={today()}
                onChange={(e) => setDateVal(e.target.value)}
                className="bg-background/50 w-48"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FIELDS.map(({ key, label, color }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color }}>
                    {label} (cm)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder="0"
                    value={form[key] === 0 ? "" : form[key]}
                    onChange={(e) => setField(key, parseFloat(e.target.value) || 0)}
                    className="bg-background/50"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Notes (optional)</label>
              <Input
                placeholder="e.g. morning measurement, after workout..."
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="bg-background/50"
              />
            </div>

            <Button onClick={handleAdd} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Save Measurement
            </Button>
          </CardContent>
        </Card>
      )}

      {latest && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {FIELDS.slice(0, 5).map(({ key, label, color }) => (
            <Card key={key} className="bg-card/50 border-border/50">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-xl font-bold" style={{ color }}>
                  {latest[key] > 0 ? `${latest[key]}` : "—"}
                  {latest[key] > 0 && <span className="text-xs font-normal text-muted-foreground ml-0.5">cm</span>}
                </p>
                {prev && latest[key] > 0 && prev[key] > 0 && (
                  <div className="mt-1">
                    <Trend current={latest[key] as number} previous={prev[key] as number} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {chartData.length >= 2 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Progress Chart</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {FIELDS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setChartField(f)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                      chartField.key === f.key
                        ? "border-transparent text-background"
                        : "border-border/50 text-muted-foreground hover:border-border"
                    }`}
                    style={chartField.key === f.key ? { background: f.color } : {}}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v} cm`, chartField.label]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartField.color}
                  strokeWidth={2.5}
                  dot={{ fill: chartField.color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">History</h2>

        {measurements.length === 0 && (
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Ruler className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No measurements yet. Add your first entry above!</p>
            </CardContent>
          </Card>
        )}

        {[...measurements]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((entry) => {
            const isOpen = expandedId === entry.id;
            return (
              <Card key={entry.id} className="bg-card/50 border-border/50 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/5 transition-colors"
                  onClick={() => setExpandedId(isOpen ? null : entry.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{formatDate(entry.date)}</span>
                    {entry.date === today() && (
                      <Badge variant="outline" className="text-xs border-primary/50 text-primary">Today</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.chest > 0 && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Chest: <span className="text-foreground font-medium">{entry.chest}cm</span>
                      </span>
                    )}
                    {entry.waist > 0 && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        Waist: <span className="text-foreground font-medium">{entry.waist}cm</span>
                      </span>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border/50 px-4 py-4">
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                      {FIELDS.map(({ key, label, color }) =>
                        entry[key] > 0 ? (
                          <div key={key} className="bg-background/40 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="font-semibold text-sm" style={{ color }}>
                              {entry[key]} cm
                            </p>
                          </div>
                        ) : null
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground italic mb-3">{entry.notes}</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMeasurement(entry.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Entry
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
