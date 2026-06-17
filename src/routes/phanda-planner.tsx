import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarDays, Plus, Copy, RotateCcw, ChevronLeft, ChevronRight, CalendarIcon, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StepProgress } from "@/components/StepProgress";
import { StepShell } from "@/components/StepShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormPersist } from "@/lib/use-form-persist";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/phanda-planner")({
  head: () => ({
    meta: [
      { title: "Phanda Planner — Weekly Job Search Plan · PhandaSmart" },
      { name: "description", content: "Generate a 7-day AI plan for your South African job search." },
      { property: "og:title", content: "Phanda Planner — Weekly Job Search Plan" },
      { property: "og:description", content: "Plan your job search week by week." },
    ],
  }),
  component: PlannerPage,
});

type Priority = "High" | "Medium" | "Low";
type Task = { text: string; done: boolean; priority: Priority };
type Day = { name: string; tasks: Task[] };
type PlannerData = { goal: string; targetDate?: string; status: string; days: Day[] };

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

function autoPriority(text: string): Priority {
  const t = text.toLowerCase();
  if (/\b(apply|application|follow[- ]?up|interview|submit)\b/.test(t)) return "High";
  if (/\b(research|prepare|update|review|practice)\b/.test(t)) return "Medium";
  return "Low";
}

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-primary/10 text-primary border-primary/20",
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const initial: PlannerData = { goal: "", targetDate: undefined, status: "Unemployed", days: [] };
const labels = ["Your Goal", "Your Weekly Plan"];

function PlannerPage() {
  const [data, setData] = useFormPersist<PlannerData>("phandasmart:planner", initial);
  const [step, setStep] = useState(1);

  // Generate on entering step 2 if empty
  useEffect(() => {
    if (step === 2 && data.days.length === 0) {
      setData((d) => ({ ...d, days: buildPlan(d.goal, d.status) }));
    }
  }, [step]); // eslint-disable-line

  const updateTask = (di: number, ti: number, patch: Partial<Task>) =>
    setData((d) => ({ ...d, days: d.days.map((day, i) => i === di ? { ...day, tasks: day.tasks.map((t, j) => j === ti ? { ...t, ...patch } : t) } : day) }));
  const addTask = (di: number) =>
    setData((d) => ({ ...d, days: d.days.map((day, i) => i === di ? { ...day, tasks: [...day.tasks, { text: "", done: false, priority: "Low" as Priority }] } : day) }));
  const removeTask = (di: number, ti: number) =>
    setData((d) => ({ ...d, days: d.days.map((day, i) => i === di ? { ...day, tasks: day.tasks.filter((_, j) => j !== ti) } : day) }));

  const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader eyebrow="Tool 03" title="Phanda Planner" description="Turn your goal into a focused 7-day plan." icon={<CalendarDays className="h-6 w-6" />} />
      <Card className="p-6 md:p-8">
        <StepProgress current={step} labels={labels} />
        <div className="mt-8">
          {step === 1 && (
            <StepShell stepKey="1">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Job Search Goal"><Input value={data.goal} onChange={(e) => setData((d) => ({ ...d, goal: e.target.value }))} placeholder="Find a junior developer job in Johannesburg" /></Field>
                </div>
                <Field label="Target Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !targetDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={targetDate} onSelect={(d) => setData((s) => ({ ...s, targetDate: d?.toISOString() }))} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field label="Current Status">
                  <Select value={data.status} onValueChange={(v) => setData((d) => ({ ...d, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Unemployed", "Employed & Looking", "Freelancing"].map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </StepShell>
          )}
          {step === 2 && (
            <StepShell stepKey="2">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.days.map((day, di) => (
                  <div key={day.name} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold">{day.name}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {day.tasks.filter((t) => t.done).length}/{day.tasks.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {day.tasks.map((t, ti) => (
                        <div key={ti} className="space-y-1.5 rounded-lg border bg-background/40 p-2">
                          <div className="flex items-start gap-2">
                            <Checkbox checked={t.done} onCheckedChange={(v) => updateTask(di, ti, { done: !!v })} className="mt-1.5" />
                            <Input value={t.text} onChange={(e) => updateTask(di, ti, { text: e.target.value, priority: t.priority })} className={cn("h-8 flex-1 text-sm", t.done && "line-through text-muted-foreground")} />
                            <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={() => removeTask(di, ti)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                          <div className="flex items-center gap-2 pl-6">
                            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_STYLES[t.priority])}>{t.priority}</span>
                            <Select value={t.priority} onValueChange={(v) => updateTask(di, ti, { priority: v as Priority })}>
                              <SelectTrigger className="h-6 w-[90px] text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => addTask(di)}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add task
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => { navigator.clipboard.writeText(planToText(data)); toast.success("Plan copied"); }}>
                  <Copy className="mr-1 h-4 w-4" /> Copy Full Plan
                </Button>
                <Button variant="outline" onClick={() => { setData((d) => ({ ...d, days: buildPlan(d.goal, d.status) })); toast.success("Plan reset"); }}>
                  <RotateCcw className="mr-1 h-4 w-4" /> Reset Plan
                </Button>
              </div>
            </StepShell>
          )}
        </div>
        <Nav step={step} total={2} setStep={setStep} />
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">{label}</Label>{children}</div>);
}

function Nav({ step, total, setStep }: { step: number; total: number; setStep: (n: number) => void }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t pt-6">
      <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
      <p className="text-xs text-muted-foreground">Step {step} of {total}</p>
      <Button disabled={step === total} onClick={() => setStep(step + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
    </div>
  );
}

function buildPlan(goal: string, status: string): Day[] {
  const g = goal.trim() || "your goal";
  const tasksByDay: Record<string, string[]> = {
    Monday: [
      `Refine CV and tailor it for: ${g}`,
      "Update LinkedIn headline and About section",
      "List 5 target companies",
    ],
    Tuesday: [
      "Apply to 5 roles on LinkedIn and Pnet",
      "Send 2 cold outreach messages to recruiters",
    ],
    Wednesday: [
      "Research 2 target companies (Research Chommie)",
      "Practice 3 common interview questions out loud",
      status === "Employed & Looking" ? "Block 1 hour for focused job search after work" : "Skill-build: 1 hour online course",
    ],
    Thursday: [
      "Apply to 5 more roles",
      "Follow up on last week's applications",
    ],
    Friday: [
      "Coffee chat / informational interview (in-person or virtual)",
      "Update job tracker spreadsheet",
    ],
    Saturday: [
      "Build or polish one portfolio piece / case study",
      "Review weekly progress and adjust next week",
    ],
    Sunday: [
      "Rest and recharge",
      "Plan top 3 priorities for the coming week",
    ],
  };
  return DAY_NAMES.map((name) => ({ name, tasks: tasksByDay[name].map((text) => ({ text, done: false, priority: autoPriority(text) })) }));
}

function planToText(d: PlannerData): string {
  return [
    `PhandaSmart Weekly Plan — ${d.goal}`,
    d.targetDate ? `Target: ${format(new Date(d.targetDate), "PPP")}` : "",
    `Status: ${d.status}`,
    "",
    ...d.days.flatMap((day) => [day.name, ...day.tasks.map((t) => `  ${t.done ? "[x]" : "[ ]"} [${t.priority}] ${t.text}`), ""]),
  ].filter(Boolean).join("\n");
}
