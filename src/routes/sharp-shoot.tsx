import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Mail, Copy, RefreshCw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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

export const Route = createFileRoute("/sharp-shoot")({
  head: () => ({
    meta: [
      { title: "Sharp-Shoot Emailer — Job Email Generator · PhandaSmart" },
      { name: "description", content: "Generate professional South African job application emails in seconds." },
      { property: "og:title", content: "Sharp-Shoot Emailer" },
      { property: "og:description", content: "Generate professional SA job emails instantly." },
    ],
  }),
  component: EmailPage,
});

type EmailData = {
  jobTitle: string; company: string; manager: string; source: string;
  yourName: string; skills: string; years: string; why: string;
  subjectOverride: string; bodyOverride: string; variant: number;
};

const initial: EmailData = {
  jobTitle: "", company: "", manager: "", source: "LinkedIn",
  yourName: "", skills: "", years: "", why: "",
  subjectOverride: "", bodyOverride: "", variant: 0,
};

const labels = ["Job Details", "Your Info", "Generated Email"];

function EmailPage() {
  const [data, setData] = useFormPersist<EmailData>("phandasmart:email", initial);
  const [step, setStep] = useState(1);
  const update = (patch: Partial<EmailData>) => setData((d) => ({ ...d, ...patch }));

  const generated = useMemo(() => buildEmail(data), [data]);
  const subject = data.subjectOverride || generated.subject;
  const body = data.bodyOverride || generated.body;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader eyebrow="Tool 02" title="Sharp-Shoot Emailer" description="Draft professional job emails in proper South African English." icon={<Mail className="h-6 w-6" />} />
      <Card className="p-6 md:p-8">
        <StepProgress current={step} labels={labels} />
        <div className="mt-8">
          {step === 1 && (
            <StepShell stepKey="1">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Job Title applying for"><Input value={data.jobTitle} onChange={(e) => update({ jobTitle: e.target.value })} placeholder="Junior Marketing Coordinator" /></Field>
                <Field label="Company Name"><Input value={data.company} onChange={(e) => update({ company: e.target.value })} placeholder="Pick n Pay" /></Field>
                <Field label="Hiring Manager (optional)"><Input value={data.manager} onChange={(e) => update({ manager: e.target.value })} placeholder="Ms Naidoo" /></Field>
                <Field label="Job Source">
                  <Select value={data.source} onValueChange={(v) => update({ source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["LinkedIn", "Indeed", "Pnet", "Walk-in", "Referral", "Other"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </StepShell>
          )}
          {step === 2 && (
            <StepShell stepKey="2">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Your Name"><Input value={data.yourName} onChange={(e) => update({ yourName: e.target.value })} placeholder="Sipho Dlamini" /></Field>
                <Field label="Years of Experience"><Input value={data.years} onChange={(e) => update({ years: e.target.value })} placeholder="3" /></Field>
                <div className="md:col-span-2"><Field label="Key Skills"><Textarea rows={3} value={data.skills} onChange={(e) => update({ skills: e.target.value })} placeholder="Social media campaigns, copywriting, basic Photoshop, customer engagement" /></Field></div>
                <div className="md:col-span-2"><Field label="Why this role? (one sentence)"><Textarea rows={2} value={data.why} onChange={(e) => update({ why: e.target.value })} placeholder="I admire your brand's commitment to local communities." /></Field></div>
              </div>
            </StepShell>
          )}
          {step === 3 && (
            <StepShell stepKey="3">
              <div className="space-y-4">
                <Field label="Subject Line"><Input value={subject} onChange={(e) => update({ subjectOverride: e.target.value })} /></Field>
                <Field label="Email Body"><Textarea rows={16} value={body} onChange={(e) => update({ bodyOverride: e.target.value })} className="font-mono text-sm" /></Field>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => { navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`); toast.success("Email copied"); }}>
                    <Copy className="mr-1 h-4 w-4" /> Copy Email
                  </Button>
                  <Button variant="outline" onClick={() => update({ subjectOverride: "", bodyOverride: "", variant: data.variant + 1 })}>
                    <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
                  </Button>
                  <Button variant="ghost" onClick={() => { setData(initial); setStep(1); toast.success("Cleared"); }}>
                    <Trash2 className="mr-1 h-4 w-4" /> Clear & Start Over
                  </Button>
                </div>
              </div>
            </StepShell>
          )}
        </div>
        <Nav step={step} total={3} setStep={setStep} />
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

function buildEmail(d: EmailData): { subject: string; body: string } {
  const role = d.jobTitle || "the advertised role";
  const company = d.company || "your company";
  const greet = d.manager ? `Dear ${d.manager},` : "Dear Hiring Manager,";
  const name = d.yourName || "[Your Name]";
  const years = d.years ? `${d.years} year${d.years === "1" ? "" : "s"}` : "several years";
  const skills = d.skills || "the relevant skills required for this position";
  const why = d.why || `I am drawn to ${company}'s reputation and the opportunity this role offers.`;
  const src = d.source ? `via ${d.source}` : "";

  const intros = [
    `I hope this email finds you well. I am writing to apply for the ${role} position at ${company}, which I came across ${src}.`,
    `I trust you are well. Please accept this email as my application for the ${role} role at ${company} that I saw advertised ${src}.`,
  ];
  const intro = intros[d.variant % intros.length];

  const subject = `Application for ${role} — ${name}`;
  const body = `${greet}\n\n${intro}\n\nWith ${years} of experience, I bring strong capabilities in ${skills}. ${why}\n\nI have attached my CV for your consideration and would welcome the opportunity to discuss how I can contribute to the ${company} team. I am available for an interview at your convenience and can be reached on the contact details below.\n\nThank you for taking the time to consider my application.\n\nKind regards,\n${name}`;
  return { subject, body };
}
