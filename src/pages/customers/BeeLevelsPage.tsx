import React, { useState } from "react";
import { mockCustomers } from "@/data/mock";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BEE_LEVEL_COLORS, BEE_LEVEL_THRESHOLDS } from "@/lib/utils";
import { toast } from "sonner";

const LEVELS = ["Larva", "Worker", "Drone", "Queen", "Royal"] as const;

export default function BeeLevelsPage() {
  const [thresholds, setThresholds] = useState<Record<string, number>>(BEE_LEVEL_THRESHOLDS);
  const [saving, setSaving] = useState(false);

  const distribution = LEVELS.map((level) => ({
    level,
    count: mockCustomers.filter((c) => c.beeLevel === level).length,
    threshold: thresholds[level],
  }));
  const total = mockCustomers.length;

  function handleThresholdChange(level: string, val: string) {
    const n = parseInt(val);
    if (isNaN(n) || n < 0) return;
    setThresholds((prev) => ({ ...prev, [level]: n }));
  }

  async function handleSave() {
    for (let i = 1; i < LEVELS.length; i++) {
      if ((thresholds[LEVELS[i]] ?? 0) <= (thresholds[LEVELS[i - 1]] ?? 0)) {
        toast.error(`${LEVELS[i]} threshold must be greater than ${LEVELS[i - 1]} threshold`);
        return;
      }
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success("Bee Level thresholds updated");
  }

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Bee Level Management" description="Configure level thresholds and view distribution" />

      <Card>
        <CardHeader><CardTitle className="text-sm">Level Distribution ({total} customers)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {distribution.map(({ level, count }) => (
            <div key={level} className="flex items-center gap-3">
              <Badge className={`w-20 justify-center text-xs ${BEE_LEVEL_COLORS[level]}`}>🐝 {level}</Badge>
              <div className="flex-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all"
                  style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{count}</span>
              <span className="text-xs text-slate-400 w-8">{total > 0 ? `${Math.round((count / total) * 100)}%` : "0%"}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Level Thresholds (min. orders required)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">Each threshold must be strictly greater than the previous level.</p>
          {LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-3">
              <Badge className={`w-20 justify-center text-xs ${BEE_LEVEL_COLORS[level]}`}>{level}</Badge>
              <Input
                type="number"
                min={0}
                value={thresholds[level] ?? 0}
                onChange={(e) => handleThresholdChange(level, e.target.value)}
                className="w-28"
                disabled={level === "Larva"}
              />
              {level === "Larva" && <span className="text-xs text-slate-400">(base level)</span>}
            </div>
          ))}
          <Button onClick={handleSave} loading={saving} className="mt-2">Save Thresholds</Button>
        </CardContent>
      </Card>
    </div>
  );
}
