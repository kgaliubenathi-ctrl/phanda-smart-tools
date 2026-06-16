import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Mail, CalendarDays, Search, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhandaSmart — Work Smart. Phanda Faster." },
      {
        name: "description",
        content:
          "Four free AI tools built for South African job seekers: CV builder, email writer, weekly planner, and company research.",
      },
      { property: "og:title", content: "PhandaSmart — Work Smart. Phanda Faster." },
      {
        property: "og:description",
        content: "AI tools built for South African job seekers. Free. No sign-up.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    title: "CV-Grootman",
    desc: "Build an ATS-ready CV in minutes",
    icon: FileText,
    to: "/cv-grootman",
    color: "from-indigo-500 to-violet-500",
  },
  {
    title: "Sharp-Shoot Emailer",
    desc: "Write professional job emails instantly",
    icon: Mail,
    to: "/sharp-shoot",
    color: "from-sky-500 to-indigo-500",
  },
  {
    title: "Phanda Planner",
    desc: "Plan your job search week by week",
    icon: CalendarDays,
    to: "/phanda-planner",
    color: "from-fuchsia-500 to-indigo-500",
  },
  {
    title: "Research Chommie",
    desc: "Know the company before the interview",
    icon: Search,
    to: "/research-chommie",
    color: "from-emerald-500 to-teal-500",
  },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-sm md:p-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered · Made for SA
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
            Work Smart.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Phanda Faster.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            AI tools built for South African job seekers. Build a CV, send sharp emails, plan your
            week, and walk into any interview prepared.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/cv-grootman"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/research-chommie"
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Explore tools
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border bg-card p-4 text-center shadow-sm md:p-6">
        {[
          ["4", "AI Tools"],
          ["100%", "Free"],
          ["0", "Sign-ups Required"],
        ].map(([n, l]) => (
          <div key={l}>
            <p className="text-xl font-extrabold text-primary md:text-3xl">{n}</p>
            <p className="text-xs text-muted-foreground md:text-sm">{l}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="mt-10">
        <h2 className="mb-5 text-xl font-bold md:text-2xl">Your toolkit</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-sm`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Open tool
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
