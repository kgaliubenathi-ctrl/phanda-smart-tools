import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { FileText, Plus, Copy, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StepProgress } from "@/components/StepProgress";
import { StepShell } from "@/components/StepShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useFormPersist } from "@/lib/use-form-persist";
import { toast } from "sonner";

export const Route = createFileRoute("/cv-grootman")({
  head: () => ({
    meta: [
      { title: "CV-Grootman — ATS CV Builder · PhandaSmart" },
      { name: "description", content: "Build an ATS-ready South African CV in minutes." },
      { property: "og:title", content: "CV-Grootman — ATS CV Builder" },
      { property: "og:description", content: "Build an ATS-ready South African CV in minutes." },
    ],
  }),
  component: CVPage,
});

type Role = { title: string; company: string; start: string; end: string; responsibilities: string };
type Edu = { degree: string; institution: string; year: string };
type CVData = {
  fullName: string; email: string; phone: string; city: string; linkedin: string;
  roles: Role[]; education: Edu[]; skills: string; certifications: string;
  manualOverride: string;
};

const initial: CVData = {
  fullName: "", email: "", phone: "", city: "", linkedin: "",
  roles: [{ title: "", company: "", start: "", end: "", responsibilities: "" }],
  education: [{ degree: "", institution: "", year: "" }],
  skills: "", certifications: "", manualOverride: "",
};

const labels = ["Personal Info", "Experience", "Education & Skills", "Preview & Export"];

function CVPage() {
  const [data, setData] = useFormPersist<CVData>("phandasmart:cv", initial);
  const [step, setStep] = useState(1);

  const update = (patch: Partial<CVData>) => setData((d) => ({ ...d, ...patch }));
  const updateRole = (i: number, patch: Partial<Role>) =>
    setData((d) => ({ ...d, roles: d.roles.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));
  const updateEdu = (i: number, patch: Partial<Edu>) =>
    setData((d) => ({ ...d, education: d.education.map((e, idx) => (idx === i ? { ...e, ...patch } : e)) }));

  const generated = useMemo(() => buildCVText(data), [data]);
  const cvText = data.manualOverride || generated;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        eyebrow="Tool 01"
        title="CV-Grootman"
        description="Build a clean, ATS-friendly CV in 4 quick steps."
        icon={<FileText className="h-6 w-6" />}
      />

      <Card className="p-6 md:p-8">
        <StepProgress current={step} labels={labels} />

        <div className="mt-8">
          {step === 1 && (
            <StepShell stepKey="1">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full Name"><Input value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder="Thandi Mokoena" /></Field>
                <Field label="Email"><Input type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="thandi@email.co.za" /></Field>
                <Field label="Phone"><Input value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+27 82 123 4567" /></Field>
                <Field label="City"><Input value={data.city} onChange={(e) => update({ city: e.target.value })} placeholder="Johannesburg" /></Field>
                <div className="md:col-span-2">
                  <Field label="LinkedIn URL"><Input value={data.linkedin} onChange={(e) => update({ linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" /></Field>
                </div>
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell stepKey="2">
              <div className="space-y-6">
                {data.roles.map((r, i) => (
                  <div key={i} className="rounded-xl border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Role {i + 1}</p>
                      {data.roles.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setData((d) => ({ ...d, roles: d.roles.filter((_, x) => x !== i) }))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Job Title"><Input value={r.title} onChange={(e) => updateRole(i, { title: e.target.value })} placeholder="Junior Developer" /></Field>
                      <Field label="Company"><Input value={r.company} onChange={(e) => updateRole(i, { company: e.target.value })} placeholder="Acme (Pty) Ltd" /></Field>
                      <Field label="Start Date"><Input value={r.start} onChange={(e) => updateRole(i, { start: e.target.value })} placeholder="Jan 2023" /></Field>
                      <Field label="End Date"><Input value={r.end} onChange={(e) => updateRole(i, { end: e.target.value })} placeholder="Present" /></Field>
                      <div className="md:col-span-2">
                        <Field label="Responsibilities"><Textarea rows={4} value={r.responsibilities} onChange={(e) => updateRole(i, { responsibilities: e.target.value })} placeholder="Built features… Collaborated with… Improved…" /></Field>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setData((d) => ({ ...d, roles: [...d.roles, { title: "", company: "", start: "", end: "", responsibilities: "" }] }))}>
                  <Plus className="mr-1 h-4 w-4" /> Add Another Role
                </Button>
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell stepKey="3">
              <div className="space-y-6">
                {data.education.map((e, i) => (
                  <div key={i} className="rounded-xl border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Education {i + 1}</p>
                      {data.education.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => setData((d) => ({ ...d, education: d.education.filter((_, x) => x !== i) }))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Field label="Degree / Qualification"><Input value={e.degree} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} placeholder="BSc Computer Science" /></Field>
                      <Field label="Institution"><Input value={e.institution} onChange={(ev) => updateEdu(i, { institution: ev.target.value })} placeholder="UCT" /></Field>
                      <Field label="Year"><Input value={e.year} onChange={(ev) => updateEdu(i, { year: ev.target.value })} placeholder="2022" /></Field>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setData((d) => ({ ...d, education: [...d.education, { degree: "", institution: "", year: "" }] }))}>
                  <Plus className="mr-1 h-4 w-4" /> Add Education
                </Button>

                <Field label="Skills (comma-separated)">
                  <Input value={data.skills} onChange={(e) => update({ skills: e.target.value })} placeholder="JavaScript, React, SQL, Communication" />
                  {data.skills && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {data.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                        <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
                      ))}
                    </div>
                  )}
                </Field>
                <Field label="Certifications">
                  <Textarea rows={3} value={data.certifications} onChange={(e) => update({ certifications: e.target.value })} placeholder="AWS Cloud Practitioner (2024)" />
                </Field>
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell stepKey="4">
              <div className="space-y-6">
                <div className="print-area rounded-xl border bg-white p-6 text-slate-900 shadow-sm md:p-10">
                  <h2 className="text-2xl font-bold">{data.fullName || "Your Name"}</h2>
                  <p className="text-sm text-slate-600">
                    {[data.city, data.phone, data.email, data.linkedin].filter(Boolean).join(" · ")}
                  </p>
                  <Section title="Experience">
                    {data.roles.filter((r) => r.title || r.company).map((r, i) => (
                      <div key={i} className="mb-3">
                        <p className="font-semibold">{r.title} <span className="font-normal text-slate-600">— {r.company}</span></p>
                        <p className="text-xs text-slate-500">{r.start} – {r.end}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{r.responsibilities}</p>
                      </div>
                    ))}
                  </Section>
                  <Section title="Education">
                    {data.education.filter((e) => e.degree).map((e, i) => (
                      <p key={i} className="text-sm"><span className="font-semibold">{e.degree}</span> — {e.institution} ({e.year})</p>
                    ))}
                  </Section>
                  {data.skills && <Section title="Skills"><p className="text-sm">{data.skills}</p></Section>}
                  {data.certifications && <Section title="Certifications"><p className="whitespace-pre-wrap text-sm">{data.certifications}</p></Section>}
                </div>

                <div className="no-print flex flex-wrap gap-2">
                  <Button onClick={() => { navigator.clipboard.writeText(cvText); toast.success("CV text copied"); }}>
                    <Copy className="mr-1 h-4 w-4" /> Copy CV Text
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Download className="mr-1 h-4 w-4" /> Download as PDF
                  </Button>
                </div>

                <div className="no-print">
                  <Field label="Manual edits (override the generated text)">
                    <Textarea rows={10} value={data.manualOverride || generated} onChange={(e) => update({ manualOverride: e.target.value })} />
                  </Field>
                </div>
              </div>
            </StepShell>
          )}
        </div>

        <Nav step={step} total={4} setStep={setStep} />
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t pt-3">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{title}</h3>
      {children}
    </div>
  );
}

function Nav({ step, total, setStep }: { step: number; total: number; setStep: (n: number) => void }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t pt-6">
      <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
        <ChevronLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      <p className="text-xs text-muted-foreground">Step {step} of {total}</p>
      <Button disabled={step === total} onClick={() => setStep(step + 1)}>
        Next <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function buildCVText(d: CVData): string {
  const lines: string[] = [];
  lines.push((d.fullName || "Your Name").toUpperCase());
  lines.push([d.city, d.phone, d.email, d.linkedin].filter(Boolean).join(" · "));
  lines.push("");
  lines.push("EXPERIENCE");
  d.roles.filter((r) => r.title || r.company).forEach((r) => {
    lines.push(`${r.title} — ${r.company}  (${r.start} – ${r.end})`);
    if (r.responsibilities) lines.push(r.responsibilities);
    lines.push("");
  });
  lines.push("EDUCATION");
  d.education.filter((e) => e.degree).forEach((e) => lines.push(`${e.degree} — ${e.institution} (${e.year})`));
  if (d.skills) { lines.push(""); lines.push("SKILLS"); lines.push(d.skills); }
  if (d.certifications) { lines.push(""); lines.push("CERTIFICATIONS"); lines.push(d.certifications); }
  return lines.join("\n");
}
