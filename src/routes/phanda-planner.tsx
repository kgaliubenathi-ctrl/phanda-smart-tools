import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { CalendarDays, Plus, Copy, RotateCcw, ChevronLeft, ChevronRight, CalendarIcon, Trash2, Download, Bell, X } from "lucide-react";
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
  const [reminderDismissed, setReminderDismissed] = useState(false);

  // Monday of current week
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const dayDate = (di: number) => addDays(weekStart, di);

  useEffect(() => {
    if (step === 2 && data.days.length === 0) {
      setData((d) => ({ ...d, days: buildPlan(d.goal, d.status) }));
    } else if (step === 2 && data.days.some((day) => day.tasks.some((t) => !t.priority))) {
      setData((d) => ({ ...d, days: d.days.map((day) => ({ ...day, tasks: day.tasks.map((t) => ({ ...t, priority: t.priority ?? autoPriority(t.text) })) })) }));
    }
  }, [step]); // eslint-disable-line

  const updateTask = (di: number, ti: number, patch: Partial<Task>) =>
    setData((d) => ({ ...d, days: d.days.map((day, i) => i === di ? { ...day, tasks: day.tasks.map((t, j) => j === ti ? { ...t, ...patch } : t) } : day) }));
  const addTask = (di: number) =>
    setData((d) => ({ ...d, days: d.days.map((day, i) => i === di ? { ...day, tasks: [...day.tasks, { text: "", done: false, priority: "Low" as Priority }] } : day) }));
  const removeTask = (di: number, ti: number) =>
    setData((d) => ({ ...d, days: d.days.map((day, i) => i === di ? { ...day, tasks: day.tasks.filter((_, j) => j !== ti) } : day) }));

  const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

  // Today's tasks for reminder banner
  const today = new Date();
  const todayTasks = step === 2
    ? data.days.flatMap((day, di) => isSameDay(dayDate(di), today) ? day.tasks.filter(t => t.text.trim() && !t.done).map(t => ({ ...t, date: dayDate(di) })) : [])
    : [];

  const downloadPlan = () => {
    const text = planToText(data, dayDate);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phandasmart-plan-${format(weekStart, "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Plan downloaded");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader eyebrow="Tool 03" title="Phanda Planner" description="Turn your goal into a focused 7-day plan." icon={<CalendarDays className="h-6 w-6" />} />

      {step === 2 && todayTasks.length > 0 && !reminderDismissed && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">Today's tasks ({format(today, "EEEE, d MMM")})</p>
            <ul className="mt-1 space-y-0.5 text-muted-foreground">
              {todayTasks.map((t, i) => (
                <li key={i}>• [{t.priority}] {t.text} <span className="text-xs">— due {format(t.date, "d MMM")}</span></li>
              ))}
            </ul>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 shrink-0 p-0" onClick={() => setReminderDismissed(true)}><X className="h-4 w-4" /></Button>
        </div>
      )}

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
                {data.days.map((day, di) => {
                  const date = dayDate(di);
                  const isToday = isSameDay(date, today);
                  return (
                    <div key={day.name} className={cn("rounded-xl border bg-card p-4 shadow-sm", isToday && "ring-2 ring-primary/40")}>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">{day.name}</p>
                          <p className="text-[11px] text-muted-foreground">{format(date, "d MMM")}{isToday && " · Today"}</p>
                        </div>
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
                            <div className="flex flex-wrap items-center gap-2 pl-6">
                              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_STYLES[t.priority])}>{t.priority}</span>
                              <Select value={t.priority} onValueChange={(v) => updateTask(di, ti, { priority: v as Priority })}>
                                <SelectTrigger className="h-6 w-[90px] text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
                              </Select>
                              <span className="text-[10px] text-muted-foreground">Due {format(date, "d MMM")}</span>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={() => addTask(di)}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add task
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => { navigator.clipboard.writeText(planToText(data, dayDate)); toast.success("Plan copied"); }}>
                  <Copy className="mr-1 h-4 w-4" /> Copy Full Plan
                </Button>
                <Button onClick={downloadPlan}>
                  <Download className="mr-1 h-4 w-4" /> Download Plan
                </Button>
                <Button variant="outline" onClick={() => { setData((d) => ({ ...d, days: buildPlan(d.goal, d.status) })); toast.success("Plan reset"); }}>
                  <RotateCcw className="mr-1 h-4 w-4" /> Reset Plan
                </Button>
              </div>
            </StepShell>
          )}
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
          <p className="text-xs text-muted-foreground">Step {step} of {labels.length}</p>
          {step === 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
          ) : (
            <span className="w-[88px]" />
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">{label}</Label>{children}</div>);
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

function planToText(d: PlannerData, dayDate: (di: number) => Date): string {
  return [
    `PhandaSmart Weekly Plan — ${d.goal}`,
    d.targetDate ? `Target: ${format(new Date(d.targetDate), "PPP")}` : "",
    `Status: ${d.status}`,
    "",
    ...d.days.flatMap((day, di) => {
      const date = format(dayDate(di), "EEE d MMM yyyy");
      return [
        `${day.name} — ${date}`,
        ...day.tasks.map((t) => `  ${t.done ? "[x]" : "[ ]"} [${t.priority}] ${t.text} (due ${date})`),
        "",
      ];
    }),
  ].filter(Boolean).join("\n");
}
