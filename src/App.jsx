import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  FolderKanban,
  Images,
  Boxes,
  CheckSquare,
  Zap,
  Settings,
  Clock,
  Flame,
  Target,
  Music2,
  LayoutDashboard,
  Trash2,
  Save,
  X,
  Upload,
  LogOut,
  Lock,
  CreditCard,
  Cloud,
  Mail,
  Check,
} from "lucide-react";
function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, disabled, ...props }) {
  return (
    <button
      className={`${className} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// GEIST SaaS App
// Required environment variables:
// VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
// VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
// VITE_STRIPE_CHECKOUT_URL=https://buy.stripe.com/YOUR_CHECKOUT_LINK
// VITE_SUPPORT_EMAIL=support@advertisingbyausten.com

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const STRIPE_CHECKOUT_URL = import.meta.env.VITE_STRIPE_CHECKOUT_URL || "https://gumroad.com/l/YOUR-PRODUCT-LINK";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@advertisingbyausten.com";
const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = supabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const starterProjects = [
  {
    title: "Album Artwork Concept",
    client: "Independent Artist",
    status: "In Progress",
    priority: "High",
    deadline: "2026-06-03",
    progress: 72,
    mood: "Dark / cinematic / intense",
    notes: "Build a bold cover direction with dramatic contrast and clean typography.",
  },
  {
    title: "Brand Launch Kit",
    client: "Local Startup",
    status: "Concept",
    priority: "Medium",
    deadline: "2026-06-11",
    progress: 34,
    mood: "Minimal / clean / premium",
    notes: "Create logo usage, color system, launch graphics, and social templates.",
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

async function seedStarterData(userId) {
  if (!supabase) return;
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count === 0) {
    await supabase.from("projects").insert(starterProjects.map((p) => ({ ...p, user_id: userId })));
    await supabase.from("tasks").insert([
      { user_id: userId, text: "Add your first real client project", done: false },
      { user_id: userId, text: "Upload your brand assets", done: false },
      { user_id: userId, text: "Build one focused task list", done: false },
    ]);
    await supabase.from("inspiration").insert([
      { user_id: userId, title: "Cinematic red light flare", type: "Visual", link: "", notes: "Use as hero mood." },
      { user_id: userId, title: "Heavy soundtrack energy", type: "Audio", link: "", notes: "Focus vibe." },
    ]);
  }
}

async function hasPaidAccess(userId) {
  if (!supabase) return false;
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return false;
  if (["active", "trialing", "lifetime"].includes(data.status)) return true;
  return false;
}

function SetupScreen() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 text-white">
      <Background />
      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center">
        <Card className="w-full border-white/10 bg-zinc-950/80 text-white shadow-2xl shadow-black/50">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-red-400">GEIST SaaS setup needed</div>
            <h1 className="text-4xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">Connect the cloud.</h1>
            <p className="mt-5 max-w-2xl text-zinc-400 leading-7">
              This app is now written as a real SaaS frontend, but it needs your Supabase and payment settings before login, cloud sync, uploads, and paid access can work.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Create a Supabase project",
                "Add the SQL tables listed below",
                "Create a private Storage bucket named assets",
                "Add your Supabase URL and anon key to environment variables",
                "Create a Stripe or Gumroad checkout link",
                "Add the checkout URL to VITE_STRIPE_CHECKOUT_URL",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300">
                  <Check className="mb-3 text-red-400" size={18} /> {item}
                </div>
              ))}
            </div>
            <pre className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-black/60 p-5 text-xs leading-6 text-zinc-400">{`-- Supabase SQL schema
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  client text,
  status text default 'Concept',
  priority text default 'Medium',
  deadline date,
  progress int default 0,
  mood text,
  notes text,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  done boolean default false,
  created_at timestamptz default now()
);

create table inspiration (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text,
  link text,
  notes text,
  created_at timestamptz default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text,
  location text,
  file_path text,
  file_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table inspiration enable row level security;
alter table assets enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can read own subscription" on subscriptions for select using (auth.uid() = user_id);

create policy "Users CRUD own projects" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users CRUD own tasks" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users CRUD own inspiration" on inspiration for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users CRUD own assets" on assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Background() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(239,68,68,.26),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(255,255,255,.08),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:42px_42px]" />
    </>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
  setBusy(true);
  setMessage("");

  try {
    let result;

    if (mode === "sign-in") {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password
      });
    }

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(
        mode === "sign-in"
          ? "Welcome back."
          : "Account created. Check your email if confirmation is enabled."
      );
    }
  } catch (error) {
    setMessage(error.message || "Something went wrong. Try again.");
  } finally {
    setBusy(false);
  }
};

  return (
    <div className="min-h-screen bg-[#050505] p-6 text-white">
      <Background />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="mb-5 text-3xl font-black tracking-[0.55em]">GEIST</div>
          <div className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-red-400">Creative command center</div>
          <h1 className="text-5xl font-black uppercase leading-none tracking-[-0.06em] sm:text-7xl">Cloud synced. Clean. Built to finish.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">Log in from anywhere, manage projects, upload assets, organize inspiration, and keep your creative workflow locked in across every device.</p>
        </div>
        <Card className="border-white/10 bg-zinc-950/80 text-white shadow-2xl shadow-black/50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">{mode === "sign-in" ? "Sign in" : "Create account"}</h2>
            <p className="mt-2 text-sm text-zinc-500">Your creative system, synced to the cloud.</p>
            <div className="mt-6 grid gap-4">
              <TextInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
              <TextInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              {message && <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-300">{message}</div>}
              <Button onClick={submit} disabled={busy} className="rounded-2xl bg-red-500 py-6 font-black uppercase tracking-[0.14em] hover:bg-red-600">
                {busy ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
              </Button>
              <button onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")} className="text-sm text-zinc-500 hover:text-white">
                {mode === "sign-in" ? "Need an account? Create one." : "Already have an account? Sign in."}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Paywall({ user }) {
  const checkout = () => {
    const url = new URL(STRIPE_CHECKOUT_URL);
    if (user?.email) url.searchParams.set("prefilled_email", user.email);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 text-white">
      <Background />
      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center">
        <Card className="w-full border-white/10 bg-zinc-950/80 text-white shadow-2xl shadow-black/50">
          <CardContent className="p-8 sm:p-10">
            <Lock className="mb-6 text-red-400" size={38} />
            <div className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-red-400">Paid access required</div>
            <h1 className="text-4xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">Unlock GEIST.</h1>
            <p className="mt-5 max-w-2xl text-zinc-400 leading-7">Your account is created. To access the app, complete checkout. After payment, your subscription table should be updated by a Stripe webhook or manually set to active for lifetime access.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={checkout} className="rounded-2xl bg-red-500 px-6 py-6 font-black uppercase tracking-[0.14em] hover:bg-red-600"><CreditCard className="mr-2" size={18} /> Get Access</Button>
              <Button onClick={() => supabase.auth.signOut()} variant="outline" className="rounded-2xl border-white/10 bg-transparent px-6 py-6 text-zinc-300 hover:bg-white/10 hover:text-white"><LogOut className="mr-2" size={18} /> Sign Out</Button>
              <a href={`mailto:${SUPPORT_EMAIL}?subject=GEIST%20Access%20Help`} className="inline-flex items-center rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white"><Mail className="mr-2" size={18} /> Email Support</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-400/60" />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-red-400/60" />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-black">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-[-0.03em] text-white">{title}</h2>
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Sidebar({ active, setActive, user }) {
  const items = [
    ["Dashboard", LayoutDashboard],
    ["Projects", FolderKanban],
    ["Inspiration", Images],
    ["Assets", Boxes],
    ["Tasks", CheckSquare],
    ["Focus", Zap],
    ["Settings", Settings],
  ];

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-black/40 p-6">
      <button onClick={() => setActive("Dashboard")} className="mb-10 text-left text-2xl font-black tracking-[0.55em] text-white">GEIST</button>
      <nav className="space-y-2">
        {items.map(([label, Icon]) => (
          <button key={label} onClick={() => setActive(label)} className={cx("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold uppercase tracking-[0.16em] transition", active === label ? "bg-red-500/15 text-red-400 shadow-[0_0_32px_rgba(239,68,68,.15)]" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200")}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white"><Cloud size={16} className="text-red-400" /> Cloud Sync Active</div>
        <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500 hover:text-white"><LogOut size={14} /> Sign out</button>
      </div>
    </aside>
  );
}

function MobileNav({ active, setActive }) {
  const items = ["Dashboard", "Projects", "Inspiration", "Assets", "Tasks", "Focus", "Settings"];
  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-black/80 p-3 backdrop-blur-xl lg:hidden">
      <div className="mb-3 text-lg font-black tracking-[0.45em] text-white">GEIST</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => <button key={item} onClick={() => setActive(item)} className={cx("shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em]", active === item ? "border-red-400 bg-red-500/15 text-red-300" : "border-white/10 text-zinc-500")}>{item}</button>)}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="border-white/10 bg-white/[0.035] text-white shadow-2xl shadow-black/30">
      <CardContent className="p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/40"><Icon size={20} className="text-red-400" /></div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      </CardContent>
    </Card>
  );
}

function ProjectForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial || { title: "", client: "", status: "Concept", priority: "Medium", deadline: "", progress: 0, mood: "", notes: "" });
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-4">
      <TextInput label="Project Title" value={form.title} onChange={(v) => set("title", v)} placeholder="Brand launch kit" />
      <TextInput label="Client / Owner" value={form.client} onChange={(v) => set("client", v)} placeholder="Client name" />
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput label="Status" value={form.status} onChange={(v) => set("status", v)} options={["Concept", "In Progress", "Review", "Complete"]} />
        <SelectInput label="Priority" value={form.priority} onChange={(v) => set("priority", v)} options={["Low", "Medium", "High"]} />
        <TextInput label="Deadline" type="date" value={form.deadline || ""} onChange={(v) => set("deadline", v)} />
      </div>
      <TextInput label="Mood / Direction" value={form.mood} onChange={(v) => set("mood", v)} placeholder="Minimal / cinematic / bold" />
      <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Progress: {form.progress || 0}%</span><input type="range" min="0" max="100" value={form.progress || 0} onChange={(e) => set("progress", Number(e.target.value))} className="w-full accent-red-500" /></label>
      <TextArea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} placeholder="Key ideas, deliverables, reminders..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onClose} variant="outline" className="rounded-2xl border-white/10 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white">Cancel</Button>
        <Button onClick={() => onSave(form)} className="rounded-2xl bg-red-500 font-black uppercase tracking-[0.14em] hover:bg-red-600"><Save className="mr-2" size={16} /> Save Project</Button>
      </div>
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  const deadlineLabel = project.deadline ? new Date(project.deadline + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="overflow-hidden border-white/10 bg-zinc-950/70 text-white shadow-2xl shadow-black/40">
        <CardContent className="p-0">
          <div className="h-2 bg-gradient-to-r from-red-500 via-red-400 to-transparent" />
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <button onClick={() => onEdit(project)} className="text-left"><h3 className="text-xl font-black tracking-tight hover:text-red-300">{project.title || "Untitled Project"}</h3><p className="mt-1 text-sm text-zinc-500">{project.client || "No client"}</p></button>
              <button onClick={() => onDelete(project.id)} className="rounded-full border border-white/10 p-2 text-zinc-600 hover:border-red-400/40 hover:text-red-300"><Trash2 size={16} /></button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-red-300">{project.status}</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{project.priority}</span></div>
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="text-xs uppercase tracking-[0.18em] text-zinc-600">Deadline</div><div className="mt-1 font-bold text-zinc-200">{deadlineLabel}</div></div><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="text-xs uppercase tracking-[0.18em] text-zinc-600">Progress</div><div className="mt-1 font-bold text-zinc-200">{project.progress || 0}%</div></div></div>
            {project.mood && <p className="mt-4 text-sm leading-6 text-zinc-500">Mood: {project.mood}</p>}
            {project.notes && <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{project.notes}</p>}
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{ width: `${project.progress || 0}%` }} /></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardView({ data, setActive }) {
  const openTasks = data.tasks.filter((t) => !t.done).length;
  const avg = data.projects.length ? Math.round(data.projects.reduce((s, p) => s + Number(p.progress || 0), 0) / data.projects.length) : 0;
  return (
    <>
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-red-400">Cloud creative command center</div><h1 className="text-4xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl lg:text-7xl">Everything in its place.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500">Your projects, inspiration, assets, and tasks are synced across devices.</p></div><Button onClick={() => setActive("Projects")} className="rounded-2xl bg-red-500 px-6 py-6 text-sm font-black uppercase tracking-[0.16em] text-white hover:bg-red-600"><Plus className="mr-2" size={18} /> New Project</Button></header>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={FolderKanban} label="Projects" value={String(data.projects.length).padStart(2, "0")} /><Stat icon={Images} label="Inspiration" value={String(data.inspiration.length).padStart(2, "0")} /><Stat icon={CheckSquare} label="Open Tasks" value={String(openTasks).padStart(2, "0")} /><Stat icon={Flame} label="Avg Progress" value={`${avg}%`} /></div>
      <div className="grid gap-8 xl:grid-cols-[1fr_.85fr]"><section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:p-7"><h2 className="mb-5 text-2xl font-black uppercase tracking-tight">Priority Work</h2><div className="grid gap-5 xl:grid-cols-2">{data.projects.filter((p) => p.priority === "High").slice(0, 4).map((project) => <div key={project.id} className="rounded-3xl border border-white/10 bg-black/35 p-5"><div className="text-lg font-black text-white">{project.title}</div><div className="mt-1 text-sm text-zinc-500">{project.client}</div><div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{ width: `${project.progress || 0}%` }} /></div></div>)}</div></section><section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:p-7"><div className="mb-5 flex items-center gap-3"><Target className="text-red-400" /><div><h2 className="text-2xl font-black uppercase tracking-tight">Today’s Focus</h2><p className="mt-1 text-sm text-zinc-500">One clean list. No clutter.</p></div></div><div className="space-y-3">{data.tasks.slice(0, 5).map((task) => <div key={task.id} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300"><span className={task.done ? "text-zinc-600 line-through" : ""}>{task.text}</span></div>)}</div></section></div>
    </>
  );
}

function ProjectsView({ data, setData, userId }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const filtered = useMemo(() => data.projects.filter((p) => `${p.title} ${p.client} ${p.status} ${p.mood} ${p.notes}`.toLowerCase().includes(query.toLowerCase())), [data.projects, query]);

  const saveProject = async (project) => {
    const payload = { ...project, user_id: userId };
    const { data: saved, error } = project.id
      ? await supabase.from("projects").update(payload).eq("id", project.id).select().single()
      : await supabase.from("projects").insert(payload).select().single();
    if (error) return alert(error.message);
    setData((prev) => ({ ...prev, projects: project.id ? prev.projects.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev.projects] }));
    setEditing(null);
  };
  const deleteProject = async (id) => { await supabase.from("projects").delete().eq("id", id); setData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) })); };

  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 lg:p-7"><div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">Projects</h1><p className="mt-2 text-sm text-zinc-500">Create, edit, search, and cloud sync your work.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-zinc-500 sm:w-80"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" /></div><Button onClick={() => setEditing({})} className="rounded-2xl bg-red-500 px-6 py-6 font-black uppercase tracking-[0.14em] hover:bg-red-600"><Plus className="mr-2" size={18} /> Add</Button></div></div><div className="grid gap-5 xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} onEdit={setEditing} onDelete={deleteProject} />)}</div>{editing && <Modal title={editing.id ? "Edit Project" : "New Project"} onClose={() => setEditing(null)}><ProjectForm initial={editing.id ? editing : null} onSave={saveProject} onClose={() => setEditing(null)} /></Modal>}</section>;
}

function CloudListManager({ title, description, table, items, setData, userId, fields, renderItem }) {
  const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f.key, ""])));
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async () => {
    if (!Object.values(form).some(Boolean)) return;
    const { data: saved, error } = await supabase.from(table).insert({ ...form, user_id: userId }).select().single();
    if (error) return alert(error.message);
    setData((prev) => ({ ...prev, [table]: [saved, ...prev[table]] }));
    setForm(Object.fromEntries(fields.map((f) => [f.key, ""])));
  };
  const remove = async (id) => { await supabase.from(table).delete().eq("id", id); setData((prev) => ({ ...prev, [table]: prev[table].filter((i) => i.id !== id) })); };

  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:p-7"><div className="mb-6"><h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">{title}</h1><p className="mt-2 text-sm text-zinc-500">{description}</p></div><div className="mb-8 rounded-3xl border border-white/10 bg-black/30 p-5"><div className="grid gap-4 lg:grid-cols-3">{fields.map((field) => <TextInput key={field.key} label={field.label} value={form[field.key]} onChange={(v) => set(field.key, v)} placeholder={field.placeholder} />)}</div><Button onClick={submit} className="mt-4 rounded-2xl bg-red-500 font-black uppercase tracking-[0.14em] hover:bg-red-600"><Plus className="mr-2" size={16} /> Add</Button></div><div className="grid gap-4 lg:grid-cols-3">{items.map((item) => <div key={item.id} className="rounded-3xl border border-white/10 bg-black/35 p-5"><div className="flex items-start justify-between gap-4">{renderItem(item)}<button onClick={() => remove(item.id)} className="rounded-full border border-white/10 p-2 text-zinc-600 hover:border-red-400/40 hover:text-red-300"><Trash2 size={16} /></button></div></div>)}</div></section>;
}

function AssetsView({ data, setData, userId }) {
  const [uploading, setUploading] = useState(false);
  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const filePath = `${userId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, file);
    if (uploadError) { setUploading(false); return alert(uploadError.message); }
    const { data: publicData } = supabase.storage.from("assets").getPublicUrl(filePath);
    const { data: saved, error } = await supabase.from("assets").insert({ user_id: userId, name: file.name, category: "Upload", location: "Supabase Storage", file_path: filePath, file_url: publicData.publicUrl }).select().single();
    setUploading(false);
    if (error) return alert(error.message);
    setData((prev) => ({ ...prev, assets: [saved, ...prev.assets] }));
  };
  const remove = async (id) => { await supabase.from("assets").delete().eq("id", id); setData((prev) => ({ ...prev, assets: prev.assets.filter((a) => a.id !== id) })); };

  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:p-7"><div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">Assets</h1><p className="mt-2 text-sm text-zinc-500">Upload and sync files across devices.</p></div><label className="inline-flex cursor-pointer items-center rounded-2xl bg-red-500 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white hover:bg-red-600"><Upload className="mr-2" size={18} /> {uploading ? "Uploading..." : "Upload File"}<input type="file" onChange={uploadFile} className="hidden" /></label></div><div className="grid gap-4 lg:grid-cols-3">{data.assets.map((asset) => <div key={asset.id} className="rounded-3xl border border-white/10 bg-black/35 p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black text-white">{asset.name}</h3><p className="mt-1 text-sm text-red-300">{asset.category}</p><p className="mt-3 text-sm text-zinc-500">{asset.location}</p>{asset.file_url && <a href={asset.file_url} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-zinc-300 underline">Open file</a>}</div><button onClick={() => remove(asset.id)} className="rounded-full border border-white/10 p-2 text-zinc-600 hover:border-red-400/40 hover:text-red-300"><Trash2 size={16} /></button></div></div>)}</div></section>;
}

function TasksView({ data, setData, userId }) {
  const [newTask, setNewTask] = useState("");
  const addTask = async () => { if (!newTask.trim()) return; const { data: saved, error } = await supabase.from("tasks").insert({ user_id: userId, text: newTask.trim(), done: false }).select().single(); if (error) return alert(error.message); setData((prev) => ({ ...prev, tasks: [saved, ...prev.tasks] })); setNewTask(""); };
  const toggleTask = async (task) => { const { data: saved } = await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id).select().single(); setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => t.id === task.id ? saved : t) })); };
  const deleteTask = async (id) => { await supabase.from("tasks").delete().eq("id", id); setData((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) })); };
  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:p-7"><h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">Tasks</h1><p className="mt-2 text-sm text-zinc-500">Your synced execution list.</p><div className="my-8 flex flex-col gap-3 sm:flex-row"><input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Add a focused task..." className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-zinc-700 focus:border-red-400/60" /><Button onClick={addTask} className="rounded-2xl bg-red-500 px-6 py-6 font-black uppercase tracking-[0.14em] hover:bg-red-600"><Plus className="mr-2" size={16} /> Add Task</Button></div><div className="space-y-3">{data.tasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-4"><input checked={task.done} onChange={() => toggleTask(task)} type="checkbox" className="h-5 w-5 accent-red-500" /><span className={cx("flex-1 text-sm", task.done ? "text-zinc-600 line-through" : "text-zinc-200")}>{task.text}</span><button onClick={() => deleteTask(task.id)} className="text-zinc-600 hover:text-red-300"><Trash2 size={16} /></button></div>)}</div></section>;
}

function FocusView({ data }) {
  const nextTask = data.tasks.find((t) => !t.done)?.text || "Add one clear task and start.";
  const topProject = [...data.projects].sort((a, b) => (b.priority === "High") - (a.priority === "High") || (b.progress || 0) - (a.progress || 0))[0];
  return <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/15 to-white/[0.03] p-7 lg:p-10"><div className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-red-300">Focus Mode</div><h1 className="text-5xl font-black uppercase leading-none tracking-[-0.06em] sm:text-7xl">One thing. Done well.</h1><div className="mt-8 grid gap-6 lg:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-black/35 p-6"><Clock className="mb-4 text-red-400" /><h2 className="text-xl font-black uppercase">Next Task</h2><p className="mt-3 text-zinc-400">{nextTask}</p></div><div className="rounded-3xl border border-white/10 bg-black/35 p-6"><FolderKanban className="mb-4 text-red-400" /><h2 className="text-xl font-black uppercase">Project</h2><p className="mt-3 text-zinc-400">{topProject?.title || "No project selected"}</p></div><div className="rounded-3xl border border-white/10 bg-black/35 p-6"><Music2 className="mb-4 text-red-400" /><h2 className="text-xl font-black uppercase">Creative Fuel</h2><p className="mt-3 text-zinc-400">Put on a soundtrack, clear the desk, and block everything else out.</p></div></div></section>;
}

function SettingsView({ user }) {
  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 lg:p-7"><h1 className="text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">Settings</h1><p className="mt-2 text-sm text-zinc-500">Account, billing, and support.</p><div className="mt-8 grid gap-5 lg:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-black/35 p-5"><Mail className="mb-4 text-red-400" /><h3 className="font-black text-white">Account</h3><p className="mt-2 text-sm text-zinc-500">{user.email}</p></div><div className="rounded-3xl border border-white/10 bg-black/35 p-5"><CreditCard className="mb-4 text-red-400" /><h3 className="font-black text-white">Billing</h3><a href={STRIPE_CHECKOUT_URL} className="mt-2 block text-sm text-zinc-300 underline">Manage or upgrade access</a></div><div className="rounded-3xl border border-white/10 bg-black/35 p-5"><Mail className="mb-4 text-red-400" /><h3 className="font-black text-white">Support</h3><a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 block text-sm text-zinc-300 underline">{SUPPORT_EMAIL}</a></div></div><Button onClick={() => supabase.auth.signOut()} variant="outline" className="mt-8 rounded-2xl border-white/10 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white"><LogOut className="mr-2" size={18} /> Sign Out</Button></section>;
}

function SaaSApp({ session }) {
  const [active, setActive] = useState("Dashboard");
  const [data, setData] = useState({ projects: [], tasks: [], inspiration: [], assets: [] });
  const [loading, setLoading] = useState(true);

  const userId = session.user.id;

  useEffect(() => {
    async function load() {
      await seedStarterData(userId);
      const [projects, tasks, inspiration, assets] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("inspiration").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("assets").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      setData({ projects: projects.data || [], tasks: tasks.data || [], inspiration: inspiration.data || [], assets: assets.data || [] });
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <div className="min-h-screen bg-[#050505] p-10 text-white"><Background /><div className="relative text-xl font-black uppercase tracking-[0.18em] text-red-400">Loading GEIST...</div></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Background />
      <div className="relative flex min-h-screen">
        <Sidebar active={active} setActive={setActive} user={session.user} />
        <div className="flex-1"><MobileNav active={active} setActive={setActive} /><main className="p-5 sm:p-8 lg:p-10">
          {active === "Dashboard" && <DashboardView data={data} setActive={setActive} />}
          {active === "Projects" && <ProjectsView data={data} setData={setData} userId={userId} />}
          {active === "Inspiration" && <CloudListManager title="Inspiration" description="Save ideas, links, moods, references, and creative fuel." table="inspiration" items={data.inspiration} setData={setData} userId={userId} fields={[{ key: "title", label: "Title", placeholder: "Cinematic lighting" }, { key: "type", label: "Type", placeholder: "Visual / Audio / Typography" }, { key: "link", label: "Link", placeholder: "Optional URL" }]} renderItem={(item) => <div><h3 className="font-black text-white">{item.title}</h3><p className="mt-1 text-sm text-red-300">{item.type}</p>{item.link && <a href={item.link} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-zinc-500 underline">Open link</a>}</div>} />}
          {active === "Assets" && <AssetsView data={data} setData={setData} userId={userId} />}
          {active === "Tasks" && <TasksView data={data} setData={setData} userId={userId} />}
          {active === "Focus" && <FocusView data={data} />}
          {active === "Settings" && <SettingsView user={session.user} />}
        </main></div>
      </div>
    </div>
  );
}

export default function App() {
  const { session, loading } = useSession();
  const [accessLoading, setAccessLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      if (!session?.user?.id || !supabase) {
        setAccessLoading(false);
        return;
      }
      const access = await hasPaidAccess(session.user.id);
      setPaid(access);
      setAccessLoading(false);
    }
    checkAccess();
  }, [session]);

  if (!supabaseConfigured) return <SetupScreen />;
  if (loading || accessLoading) return <div className="min-h-screen bg-[#050505] p-10 text-white"><Background /><div className="relative text-xl font-black uppercase tracking-[0.18em] text-red-400">Starting GEIST...</div></div>;
  if (!session) return <AuthScreen />;
  if (!paid) return <Paywall user={session.user} />;
  return <SaaSApp session={session} />;
}
