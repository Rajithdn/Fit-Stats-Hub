import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

export function HealthReportAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!analyzed ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Upload Health Report</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[400px]">
              Drag and drop your PDF or image here, or click to browse. We'll analyze your metrics and provide personalized recommendations.
            </p>
            <Button onClick={handleUpload} disabled={analyzing} data-testid="button-upload-report">
              {analyzing ? "Analyzing..." : "Select File"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Analysis Complete</h2>
            <Button variant="outline" onClick={() => setAnalyzed(false)} data-testid="button-upload-another">
              Upload Another
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Extracted Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Blood Sugar (Fasting)", value: "95 mg/dL", status: "good" },
                    { label: "Total Cholesterol", value: "210 mg/dL", status: "warning" },
                    { label: "LDL (Bad)", value: "135 mg/dL", status: "warning" },
                    { label: "HDL (Good)", value: "55 mg/dL", status: "good" },
                    { label: "Triglycerides", value: "140 mg/dL", status: "good" },
                    { label: "Vitamin D", value: "22 ng/mL", status: "danger" },
                  ].map((m, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/40 bg-card">
                      <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                      <div className="font-semibold flex items-center gap-2">
                        {m.value}
                        {m.status === "good" && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {m.status === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {m.status === "danger" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>Your overall profile is stable. Key areas of concern are slightly elevated LDL cholesterol and low Vitamin D levels.</p>
                <div>
                  <strong className="text-foreground">Nutrition Suggestions:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Increase omega-3 fatty acids (salmon, chia seeds)</li>
                    <li>Reduce saturated fats to manage LDL</li>
                    <li>Consider a Vitamin D3 supplement</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-foreground">Workout Suggestions:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Add 30 mins of LISS cardio 3x/week for cardiovascular health</li>
                    <li>Incorporate resistance training to improve metabolic rate</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
