import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Copy, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StepProgress } from "@/components/StepProgress";
import { StepShell } from "@/components/StepShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormPersist } from "@/lib/use-form-persist";
import { toast } from "sonner";

export const Route = createFileRoute("/research-chommie")({
  head: () => ({
    meta: [
      { title: "Research Chommie — Company Research · PhandaSmart" },
      { name: "description", content: "Generate an AI research brief on any company before your interview." },
      { property: "og:title", content: "Research Chommie — Company Research" },
      { property: "og:description", content: "Know the company before the interview." },
    ],
  }),
  component: ResearchPage,
});

type ResearchData = {
  company: string; industry: string; role: string; country: string;
  overview: string; knownFor: string; culture: string; questions: string; tips: string; insights: string;
  generated: boolean;
};

const initial: ResearchData = {
  company: "", industry: "Technology", role: "", country: "South Africa",
  overview: "", knownFor: "", culture: "", questions: "", tips: "", insights: "", generated: false,
};

const INDUSTRIES = ["Technology", "Finance & Banking", "Retail", "Mining", "Telecommunications", "Healthcare", "Education", "Manufacturing", "Marketing & Media", "Government", "Other"];
const labels = ["Company Details", "Research Report"];

function ResearchPage() {
  const [data, setData] = useFormPersist<ResearchData>("phandasmart:research", initial);
  const [step, setStep] = useState(1);
  const update = (patch: Partial<ResearchData>) => setData((d) => ({ ...d, ...patch }));

  const draft = useMemo(() => buildReport(data), [data.company, data.industry, data.role, data.country]);

  const goToReport = () => {
    if (!data.generated) {
      update({ ...draft, generated: true });
    }
    setStep(2);
  };

  const fullReport = () => {
    const d = data;
    return [
      `Company: ${d.company}  |  Role: ${d.role}  |  Industry: ${d.industry}  |  Country: ${d.country}`,
      "",
      "🏢 COMPANY OVERVIEW", d.overview, "",
      "🎯 WHAT THEY'RE KNOWN FOR", d.knownFor, "",
      "💼 WORK CULTURE & VALUES", d.culture, "",
      "❓ LIKELY INTERVIEW QUESTIONS", d.questions, "",
      "💡 TIPS TO IMPRESS", d.tips, "",
      "📊 INSIGHTS & RECOMMENDATIONS", d.insights,
    ].join("\n");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader eyebrow="Tool 04" title="Research Chommie" description="Walk into your interview ready. Get an instant company brief." icon={<Search className="h-6 w-6" />} />
      <Card className="p-6 md:p-8">
        <StepProgress current={step} labels={labels} />
        <div className="mt-8">
          {step === 1 && (
            <StepShell stepKey="1">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company Name"><Input value={data.company} onChange={(e) => update({ company: e.target.value })} placeholder="Discovery" /></Field>
                <Field label="Industry">
                  <Select value={data.industry} onValueChange={(v) => update({ industry: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Role you are applying for"><Input value={data.role} onChange={(e) => update({ role: e.target.value })} placeholder="Data Analyst" /></Field>
                <Field label="Country"><Input value={data.country} onChange={(e) => update({ country: e.target.value })} /></Field>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={goToReport} disabled={!data.company.trim()}>Generate Research Brief <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </StepShell>
          )}
          {step === 2 && (
            <StepShell stepKey="2">
              <div className="space-y-5">
                <ReportField icon="🏢" label="Company Overview" value={data.overview} onChange={(v) => update({ overview: v })} rows={4} />
                <ReportField icon="🎯" label="What They're Known For" value={data.knownFor} onChange={(v) => update({ knownFor: v })} rows={3} />
                <ReportField icon="💼" label="Work Culture & Values" value={data.culture} onChange={(v) => update({ culture: v })} rows={3} />
                <ReportField icon="❓" label="Likely Interview Questions" value={data.questions} onChange={(v) => update({ questions: v })} rows={6} />
                <ReportField icon="💡" label="Tips to Impress" value={data.tips} onChange={(v) => update({ tips: v })} rows={4} />
                <ReportField icon="📊" label="Insights & Recommendations" value={data.insights} onChange={(v) => update({ insights: v })} rows={4} />

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { navigator.clipboard.writeText(fullReport()); toast.success("Report copied"); }}>
                    <Copy className="mr-1 h-4 w-4" /> Copy Report
                  </Button>
                  <Button variant="outline" onClick={() => { setData(initial); setStep(1); toast.success("Started new research"); }}>
                    <RotateCcw className="mr-1 h-4 w-4" /> Start New Research
                  </Button>
                </div>
              </div>
            </StepShell>
          )}
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
          <p className="text-xs text-muted-foreground">Step {step} of 2</p>
          <div className="w-[72px]" />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><Label className="text-xs font-semibold text-muted-foreground">{label}</Label>{children}</div>);
}

function ReportField({ icon, label, value, onChange, rows }: { icon: string; label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <Label className="mb-2 flex items-center gap-2 text-sm font-bold">
        <span className="text-lg">{icon}</span> {label}
      </Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="bg-background" />
    </div>
  );
}

function buildReport(d: ResearchData): Partial<ResearchData> {
  const c = d.company || "this company";
  const ind = d.industry.toLowerCase();
  const role = d.role || "the role you are applying for";
  return {
    overview: `${c} is a recognised player in the ${ind} sector, operating primarily in ${d.country}. The organisation has built its presence through a focus on delivering value to its customers and adapting to changing market conditions. Recent years have seen ${c} invest in digital capabilities, talent development, and broader regional growth.`,
    knownFor: `${c} is widely associated with strong brand recognition in ${ind}, a customer-focused approach, and a track record of innovation within its category. They are also known for community involvement and a visible presence across South African markets.`,
    culture: `Expect a professional, results-driven environment that values teamwork, integrity, and continuous learning. Like most leading SA employers, ${c} likely emphasises transformation, diversity, and ethical conduct. Hybrid or flexible work is increasingly common at this level.`,
    questions: `• Why do you want to work at ${c} specifically?\n• Walk us through a project where you delivered measurable results for ${role}.\n• How do you handle competing priorities under tight deadlines?\n• Describe a time you worked with a difficult stakeholder and what you learned.\n• Where do you see yourself in three years, and how does ${c} fit that picture?`,
    tips: `• Reference one or two recent ${c} announcements, products, or campaigns — show you have done your homework.\n• Connect your experience to ${c}'s priorities in ${ind}.\n• Prepare 2 thoughtful questions for the panel about team, growth, or strategy.\n• Be ready to discuss B-BBEE awareness and your contribution to a diverse workplace.\n• Dress professionally, arrive 10 minutes early, and bring a printed CV.`,
    insights: `Insight: The ${ind} sector in ${d.country} is being reshaped by digital transformation, tightening margins, and rising customer expectations — ${c} is actively investing in technology, talent, and customer experience to defend and grow its position.\nRecommendation: Position yourself as a ${role} who blends strong fundamentals with adaptability. In the interview, lead with one concrete example of measurable impact, then tie it directly to a current ${c} priority (a recent product, partnership, or strategic theme) so they can immediately picture you adding value from week one.`,
  };
}
