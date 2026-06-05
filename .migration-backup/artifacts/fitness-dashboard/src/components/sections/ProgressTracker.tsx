import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Award } from "lucide-react";

const monthlyData = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  calories: 2000 + Math.random() * 500,
}));

export function ProgressTracker() {
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    setWeight("");
    setSleep("");
    // In a real app, this would dispatch to Zustand
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Log Today</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLog} className="space-y-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Sleep (hours)</Label>
                <Input type="number" step="0.5" value={sleep} onChange={e => setSleep(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" data-testid="button-log-progress">Save Entry</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Calorie Intake (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'hsl(var(--accent)/0.1)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "7-Day Streak", desc: "Logged 7 days in a row", icon: "🔥", color: "text-orange-500" },
              { name: "Hydration Hero", desc: "Hit water goal 5 times", icon: "💧", color: "text-blue-500" },
              { name: "Protein King", desc: "Hit protein goal 10 times", icon: "🥩", color: "text-rose-500" },
              { name: "Early Bird", desc: "Workout before 7 AM", icon: "🌅", color: "text-amber-500" },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-xl border border-border/40 bg-accent/5 text-center">
                <div className={`text-3xl mb-2 ${badge.color}`}>{badge.icon}</div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{badge.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
