import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  HeartPulse,
  Menu,
  MessageCircle,
  MoveRight,
  Phone,
  Play,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  X,
  Zap,
} from "lucide-react";
import logoSrc from "@assets/just_t_logo_copy_1784984277358.png";

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  alpha: number;
  phase: number;
};

function LogoParticles({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -1000, y: -1000, active: false });
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number | undefined>(undefined);
  const reduced = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let cancelled = false;
    let imageReady = false;
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const image = new Image();
    image.src = logoSrc;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (imageReady && rect.width > 0 && rect.height > 0)
        sample(rect.width, rect.height);
    };
    const sample = (width: number, height: number) => {
      if (
        !imageReady ||
        !image.naturalWidth ||
        !image.naturalHeight ||
        width <= 0 ||
        height <= 0
      ) {
        particles.current = [];
        return;
      }
      const off = document.createElement("canvas");
      const maxW = compact
        ? Math.min(240, width * 0.72)
        : Math.min(660, width * 0.76);
      const ratio = image.naturalHeight / image.naturalWidth;
      const drawW = maxW;
      const drawH = Math.max(1, drawW * ratio);
      off.width = Math.max(1, Math.floor(drawW));
      off.height = Math.max(1, Math.floor(drawH));
      const oc = off.getContext("2d");
      if (!oc) return;
      oc.drawImage(image, 0, 0, off.width, off.height);
      const data = oc.getImageData(0, 0, off.width, off.height).data;
      const corner = [data[0], data[1], data[2]];
      const stride = compact ? 3 : 4;
      const next: Particle[] = [];
      for (let y = 0; y < off.height; y += stride) {
        for (let x = 0; x < off.width; x += stride) {
          const i = (y * off.width + x) * 4;
          const alpha = data[i + 3] / 255;
          const distance =
            Math.abs(data[i] - corner[0]) +
            Math.abs(data[i + 1] - corner[1]) +
            Math.abs(data[i + 2] - corner[2]);
          if (alpha > 0.35 && distance > 35) {
            next.push({
              x: Math.random() * width,
              y: Math.random() * height,
              tx: (width - drawW) / 2 + x,
              ty: (height - drawH) / 2 + y,
              size: compact ? 1.15 : 1.5,
              alpha: 0.48 + Math.random() * 0.52,
              phase: Math.random() * Math.PI * 2,
            });
          }
        }
      }
      particles.current = next;
    };
    const draw = (time: number) => {
      if (cancelled) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const motion = reduced.current ? 0 : 1;
      for (const p of particles.current) {
        const dx = pointer.current.x - p.x;
        const dy = pointer.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (pointer.current.active && dist < 110) {
          const force = (110 - dist) / 110;
          p.x -= (dx / Math.max(dist, 1)) * force * 1.9;
          p.y -= (dy / Math.max(dist, 1)) * force * 1.9;
        } else {
          p.x += (p.tx - p.x) * 0.055;
          p.y += (p.ty - p.y) * 0.055;
        }
        const shimmer = motion ? Math.sin(time * 0.0012 + p.phase) * 0.18 : 0;
        ctx.fillStyle = `rgba(237, 181, 112, ${Math.max(0.18, p.alpha + shimmer)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced.current) raf.current = requestAnimationFrame(draw);
    };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };
    const leave = () => {
      pointer.current.active = false;
      pointer.current.x = -1000;
      pointer.current.y = -1000;
    };
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : undefined;
    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    image.onload = () => {
      if (cancelled) return;
      imageReady = true;
      resize();
      draw(0);
    };
    image.onerror = () => {
      imageReady = false;
      particles.current = [];
      if (!cancelled) draw(0);
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerleave", leave);
    resize();
    if (image.complete && image.naturalWidth > 0) {
      imageReady = true;
      sample(canvas.clientWidth, canvas.clientHeight);
      draw(0);
    }
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", leave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [compact]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, className: `reveal ${visible ? "is-visible" : ""}` };
}

function Reveal({
  children,
  delay = "",
  className = "",
}: {
  children: React.ReactNode;
  delay?: string;
  className?: string;
}) {
  const reveal = useReveal();
  return (
    <div
      ref={reveal.ref}
      className={`${reveal.className} ${delay} ${className}`}
    >
      {children}
    </div>
  );
}

function Logo({ size = "small" }: { size?: "small" | "large" }) {
  return (
    <img
      src={logoSrc}
      alt="Aprish"
      className={
        size === "large"
          ? "h-14 w-14 rounded-2xl object-cover"
          : "h-8 w-8 rounded-lg object-cover"
      }
    />
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "success">("idle");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("success");
  };
  if (state === "success")
    return (
      <div
        data-testid="status-waitlist-success"
        className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-teal-700/20 bg-teal-900 px-5 py-4 text-sm text-[#eef1df]"
      >
        <CheckCircle2 className="h-5 w-5 text-[#e9a26e]" />
        <span>You're on the early access list. We'll be in touch soon.</span>
      </div>
    );
  return (
    <form onSubmit={submit} className="w-full max-w-lg">
      <div className="flex flex-col gap-2 rounded-2xl border border-[#173d3d]/15 bg-[#fffdf6] p-2 shadow-[0_16px_50px_rgba(30,61,59,.1)] sm:flex-row">
        <input
          data-testid="input-waitlist-email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setState("idle");
          }}
          type="email"
          placeholder="Your clinic email"
          className="input-glow min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[#52706d]"
          aria-label="Clinic email"
        />
        <button
          data-testid="button-waitlist-submit"
          className="button-lift inline-flex items-center justify-center gap-2 rounded-xl bg-[#eeaa76] px-5 py-3 text-sm font-semibold text-[#173d3d]"
        >
          Request early access <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {state === "error" && (
        <p
          data-testid="status-waitlist-error"
          className="mt-2 text-xs text-[#b84d3e]"
        >
          Please enter a valid clinic email.
        </p>
      )}
    </form>
  );
}

const features = [
  {
    icon: CalendarDays,
    label: "Bookings",
    title: "Book slots 24/7—even while you sleep.",
    body: "Patients book the right doctor, time slot, and clinic location directly in WhatsApp. Zero phone calls. Zero double-booking. Every patient who messages at 10 PM books with you—not the clinic down the road.",
    tint: "bg-[#f4dfc8]",
  },
  {
    icon: CreditCard,
    label: "Payments",
    title: "100% Advance UPI = Zero No-Shows.",
    body: "Instant UPI payment links fire automatically at booking. Consultation fees are locked in before the patient ever walks through your door—eliminating the no-show epidemic draining your revenue.",
    tint: "bg-[#dbe9dc]",
  },
  {
    icon: Clock3,
    label: "Queue updates",
    title: "Stop waiting-room arguments before they start.",
    body: "Live digital token numbers and automated delay alerts go straight to patients' WhatsApp. If an emergency delays you by 20 minutes, the system informs the entire waiting line—automatically.",
    tint: "bg-[#dedbe8]",
  },
  {
    icon: HeartPulse,
    label: "Continuity",
    title: "Automated follow-ups that bring patients back.",
    body: "Daily medication reminders improve recovery. Automated nudges book the paid follow-up consultation before the patient even thinks about going to a competitor.",
    tint: "bg-[#f1d7d0]",
  },
];

const demos = [
  {
    name: "Book a visit",
    icon: CalendarDays,
    initial: [
      { from: "aria", text: "Hi, I'm Aria. What can I help you with today?" },
    ],
    options: [
      {
        label: "I need to see a dermatologist",
        reply:
          "Of course. Dr. Mehta has two openings today — 4:15 PM or 5:00 PM.",
      },
      {
        label: "Show me today's slots",
        reply: "I found three openings today: 4:15 PM, 5:00 PM, and 6:30 PM.",
      },
      {
        label: "I need a pediatrician",
        reply: "Dr. Rao can see you today at 3:30 PM or tomorrow at 10:15 AM.",
      },
    ],
  },
  {
    name: "Track a queue",
    icon: Clock3,
    initial: [
      {
        from: "aria",
        text: "I'm keeping an eye on the queue for you. What would you like to know?",
      },
    ],
    options: [
      {
        label: "How much longer?",
        reply: "You're next after Token #03. Estimated wait: 12 minutes.",
      },
      {
        label: "Can I change my appointment?",
        reply:
          "Of course. let me know your perferable timings, I'll manage it out.",
      },
      {
        label: "I'm running late",
        reply:
          "No problem. I've noted it for the front desk and will hold your place for some time",
      },
    ],
  },
  {
    name: "Aftercare",
    icon: HeartPulse,
    initial: [
      {
        from: "aria",
        text: "Good morning, Riya. How can I support your care today?",
      },
    ],
    options: [
      {
        label: "Remind me about my evening dose",
        reply:
          "Absolutely. I'll send you a gentle reminder at 8:00 PM this evening.",
      },
      {
        label: "Hi!",
        reply:
          "Hey Prithvi!, your course is about to get over, want me to book your follow-up appointment",
      },
      {
        label: "Whats timing of my appointment",
        reply:
          "Hey! Dr. Mehta has follow-up openings next Tuesday at 11:00 AM and 2:30 PM.",
      },
    ],
  },
];

function PhoneDemo() {
  const [active, setActive] = useState(0);
  const demo = demos[active];
  const [messages, setMessages] = useState(demo.initial);
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setMessages(demos[active].initial);
    setTyping(false);
  }, [active]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  const sendPrompt = (option: (typeof demo.options)[number]) => {
    if (typing) return;
    setMessages((current) => [
      ...current,
      { from: "user", text: option.label },
    ]);
    setTyping(true);
    replyTimer.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        { from: "aria", text: option.reply },
      ]);
      setTyping(false);
    }, 850);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
      <div>
        <p className="eyebrow text-[#d98c58]">
          Live at 9:41 PM — while your clinic is dark
        </p>
        <h2 className="display-title mt-5 max-w-lg text-5xl leading-[.94] text-[#f4eedc] md:text-6xl">
          Book appointments at 9:41 PM—while your <em>clinic is closed.</em>
        </h2>
        <p className="mt-6 max-w-md text-base leading-7 text-[#c0d0c8]">
          Your competitor's receptionist clocks out at 6 PM. Aria never does.
          Every after-hours WhatsApp message is a patient booked — fees
          collected, slot locked — before morning.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {demos.map((item, index) => (
            <button
              data-testid={`button-demo-${index}`}
              key={item.name}
              onClick={() => setActive(index)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-all ${active === index ? "border-[#eeaa76] bg-[#eeaa76] text-[#173d3d]" : "border-[#eff2dc]/20 text-[#b5c8be] hover:border-[#eff2dc]/50"}`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-[360px]">
        <div className="phone-shadow floating rounded-[2.35rem] border-[6px] border-[#102d2d] bg-[#ecf1df] p-2">
          <div className="overflow-hidden rounded-[1.85rem] bg-[#e5ecdc]">
            <div className="flex items-center justify-between bg-[#173d3d] px-5 pb-2 pt-3 text-[9px] text-[#d9e7d9]">
              <span>9:41</span>
              <span className="font-mono-ui tracking-widest">▂▅▆ 84%</span>
            </div>
            <div className="flex items-center gap-3 border-b border-[#173d3d]/10 bg-[#f5f5e9] px-4 py-3">
              <div className="relative">
                <Logo />
                <span className="pulse-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#eaa373] ring-2 ring-[#f5f5e9]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#173d3d]">
                  Aria · Aprish
                </p>
                <p className="text-[10px] text-[#66817a]">
                  always here to help
                </p>
              </div>
            </div>
            <div className="chat-scroll flex min-h-[410px] flex-col gap-3 overflow-y-auto p-4">
              <div className="mb-2 text-center text-[9px] uppercase tracking-[.14em] text-[#77918a]">
                Today
              </div>
              {messages.map(({ from, text }, index) => (
                <div
                  key={`${active}-${index}-${text}`}
                  className={`max-w-[87%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${from === "user" ? "self-end rounded-br-sm bg-[#d89361] text-[#173d3d]" : "rounded-bl-sm border border-[#173d3d]/10 bg-[#f7f6ea] text-[#355653]"}`}
                >
                  <span>{text}</span>
                  {from === "aria" &&
                    index === messages.length - 1 &&
                    !typing && (
                      <span className="mt-2 flex items-center gap-1 text-[9px] text-[#7b958d]">
                        <Check className="h-3 w-3" /> Delivered
                      </span>
                    )}
                </div>
              ))}
              {typing && (
                <div
                  data-testid="assistant-typing"
                  className="typing-bubble self-start rounded-2xl rounded-bl-sm border border-[#173d3d]/10 bg-[#f7f6ea] px-4 py-3"
                  aria-label="Aria is typing"
                >
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
            <div className="border-t border-[#173d3d]/10 bg-[#e5ecdc] px-3 pb-3 pt-2">
              <p className="mb-2 px-1 text-[9px] uppercase tracking-[.14em] text-[#77918a]">
                Try a message
              </p>
              <div className="flex flex-wrap gap-1.5">
                {demo.options.map((option, index) => (
                  <button
                    data-testid={`button-prompt-${active}-${index}`}
                    key={option.label}
                    type="button"
                    disabled={typing}
                    onClick={() => sendPrompt(option)}
                    className="prompt-chip rounded-full border border-[#173d3d]/15 bg-[#f7f6ea] px-3 py-2 text-left text-[10px] leading-4 text-[#355653] transition-all hover:-translate-y-0.5 hover:border-[#d89361] hover:bg-[#fffdf6] disabled:cursor-wait disabled:opacity-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-full border border-[#173d3d]/10 bg-[#f7f6ea] px-3 py-2 text-[10px] text-[#91a39a]">
                <span className="flex-1">Choose a message above</span>
                <MoveRight className="h-3 w-3 text-[#d89361]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const experienceSteps = [
  {
    number: "01",
    eyebrow: "First contact",
    title: "1 Desk QR Code = Zero Waiting Room Crowds.",
    body: "Patients scan an acrylic standee at your reception desk or message your WhatsApp number directly. No paper registers. No app downloads. No new accounts. Just instant, automated check-in from a phone they already carry.",
    icon: QrCode,
    tint: "bg-[#dce8da]",
  },
  {
    number: "02",
    eyebrow: "Bookings & payments",
    title: "Automated 24/7 Bookings + Instant UPI Fee Collection.",
    body: "Aria books the right doctor and time slot, locks in availability in real time, and collects 100% advance consultation fees via UPI—eliminating double-bookings and stopping patient no-shows completely.",
    icon: CreditCard,
    tint: "bg-[#f4dfc8]",
  },
  {
    number: "03",
    eyebrow: "Smart queue management",
    title: "Stop chaos before it starts.",
    body: "Patients get a live digital Token Number. If an emergency delays you by 30 minutes, Aria automatically shifts the entire schedule and alerts your waiting line on WhatsApp—keeping your waiting room calm and your receptionist sane.",
    icon: Bell,
    tint: "bg-[#dedbe8]",
  },
  {
    number: "04",
    eyebrow: "Records that remember",
    title: "Instant Digital Prescriptions & Patient History.",
    body: "All prescriptions, payment receipts, and past visit records are saved securely in WhatsApp. No lost paper slips. No digging through physical files when an old patient returns months later.",
    icon: ShieldCheck,
    tint: "bg-[#dbe9dc]",
  },
  {
    number: "05",
    eyebrow: "Aftercare",
    title: "Automated Follow-ups That Drive Repeat Consultations.",
    body: "Aria sends automated daily medication reminders to improve patient recovery—and automatically nudges them to book their paid follow-up consultation when their course completes. Revenue on autopilot.",
    icon: HeartPulse,
    tint: "bg-[#f1d7d0]",
  },
  {
    number: "06",
    eyebrow: "Patient feedback",
    title: "Turn Happy Patients into 5-Star Google Reviews.",
    body: "Aria checks in after the visit. Happy patients are automatically routed to your Google Review page to rank your clinic #1 in your city. Unhappy feedback is caught privately on WhatsApp—before it ever hits the internet.",
    icon: MessageCircle,
    tint: "bg-[#e9e1d1]",
  },
];

function ExperienceSteps() {
  const [activeStep, setActiveStep] = useState(0);
  const step = experienceSteps[activeStep];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % experienceSteps.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mt-20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="eyebrow text-[#52706d]">The Aprish flow</p>
        <p className="font-mono-ui text-[10px] tracking-[.16em] text-[#77918a]">
          {step.number} / 06
        </p>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="flex min-w-max gap-2">
          {experienceSteps.map((item, index) => (
            <button
              key={item.number}
              type="button"
              aria-label={`Show step ${item.number}: ${item.eyebrow}`}
              aria-pressed={activeStep === index}
              onClick={() => setActiveStep(index)}
              className={`group relative flex min-w-[128px] items-center gap-2 rounded-full border px-3 py-2 text-left transition-all ${
                activeStep === index
                  ? "border-[#173d3d] bg-[#173d3d] text-[#f7f4e9]"
                  : "border-[#173d3d]/15 bg-[#fffdf6]/60 text-[#52706d] hover:border-[#173d3d]/40"
              }`}
            >
              <span className="font-mono-ui text-[10px]">{item.number}</span>
              <span className="text-[10px] font-semibold">{item.eyebrow}</span>
              {activeStep === index && (
                <span className="absolute inset-x-3 -bottom-1 h-0.5 overflow-hidden rounded-full bg-[#eaa373]">
                  <span className="step-progress block h-full bg-[#f7c59d]" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <article
        key={step.number}
        className={`step-card mt-4 grid gap-8 rounded-[2rem] p-8 md:grid-cols-[.8fr_1.2fr] md:p-12 ${step.tint}`}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="eyebrow text-[#52706d]">
              {step.number} / {step.eyebrow}
            </span>
            <h3 className="display-title mt-5 max-w-md text-4xl leading-[.96] text-[#173d3d] md:text-5xl">
              {step.title}
            </h3>
          </div>
          <step.icon className="h-8 w-8 shrink-0 text-[#c87850]" />
        </div>
        <div className="flex flex-col justify-between gap-8">
          <p className="max-w-xl text-base leading-7 text-[#52706d]">
            {step.body}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() =>
                setActiveStep(
                  (activeStep - 1 + experienceSteps.length) %
                    experienceSteps.length,
                )
              }
              className="step-arrow rounded-full border border-[#173d3d]/20 px-4 py-2 text-xs font-semibold text-[#173d3d]"
            >
              Back
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() =>
                setActiveStep((activeStep + 1) % experienceSteps.length)
              }
              className="step-arrow rounded-full bg-[#173d3d] px-4 py-2 text-xs font-semibold text-[#f7f4e9]"
            >
              Next step <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["story", "Why Aprish"],
    ["experience", "The experience"],
    ["demo", "See it live"],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-[#173d3d]/10 bg-[#f7f4e9]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
        <a
          data-testid="link-home"
          href="#top"
          className="flex items-center gap-2.5"
        >
          <Logo />
          <span className="text-lg font-semibold tracking-[-.04em] text-[#173d3d]">
            aprish
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([id, label]) => (
            <a
              data-testid={`link-${id}`}
              key={id}
              href={`#${id}`}
              className="nav-link text-sm"
            >
              {label}
            </a>
          ))}
          <a
            data-testid="link-nav-waitlist"
            href="#waitlist"
            className="button-lift inline-flex items-center gap-2 rounded-full bg-[#173d3d] px-4 py-2.5 text-xs font-semibold text-[#f5f1e4]"
          >
            Join the beta <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </nav>
        <button
          data-testid="button-mobile-menu"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-[#173d3d] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <div
        className={`overflow-hidden border-t border-[#173d3d]/10 bg-[#f7f4e9] px-5 transition-all duration-300 md:hidden ${open ? "mobile-open py-4" : "mobile-closed py-0"}`}
      >
        {links.map(([id, label]) => (
          <a
            data-testid={`link-mobile-${id}`}
            onClick={() => setOpen(false)}
            key={id}
            href={`#${id}`}
            className="block py-3 text-sm text-[#355653]"
          >
            {label}
          </a>
        ))}
        <a
          data-testid="link-mobile-waitlist"
          onClick={() => setOpen(false)}
          href="#waitlist"
          className="mt-2 block rounded-xl bg-[#173d3d] px-4 py-3 text-center text-sm font-semibold text-[#f5f1e4]"
        >
          Join the beta
        </a>
      </div>
    </header>
  );
}

function App() {
  return (
    <main id="top" className="site-shell bg-[#f7f4e9] text-[#173d3d]">
      <Nav />
      <section className="relative min-h-[780px] overflow-hidden bg-[#f7f4e9] pt-[72px]">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="hero-orb absolute -right-[12%] top-[8%] h-[650px] w-[650px] rounded-full" />
        <div className="absolute left-[4%] top-[32%] hidden h-px w-[20%] line-fade md:block" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-24 lg:grid-cols-[1.02fr_.98fr]">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow flex items-center gap-2 text-[#b8754d]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#eaa373]" /> ZERO
                APP DOWNLOADS • INSTANT UPI PAYMENTS • 24/7 WHATSAPP BOOKING
              </p>
            </Reveal>
            <Reveal delay="reveal-delay-1">
              <h1 className="display-title mt-6 text-[3.6rem] leading-[.88] text-[#173d3d] sm:text-[5.2rem] md:text-[6.4rem]">
                The automated
                <br />
                <em className="text-[#c87850]">front desk</em>
                <br />
                for high-volume care.
              </h1>
            </Reveal>
            <Reveal delay="reveal-delay-2">
              <p className="mt-8 max-w-xl text-lg leading-8 text-[#52706d] md:text-xl">
                Handles OPD appointments, live token queues, and instant UPI fee
                collections inside WhatsApp — so you never lose a patient to a
                busy phone line again.
              </p>
            </Reveal>
            <Reveal delay="reveal-delay-3">
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a
                  data-testid="link-hero-waitlist"
                  href="#waitlist"
                  className="button-lift inline-flex items-center gap-3 rounded-full bg-[#173d3d] px-6 py-4 text-sm font-semibold text-[#f7f4e9]"
                >
                  Automate your clinic WhatsApp{" "}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  data-testid="link-hero-story"
                  href="#story"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#35625d]"
                >
                  See how it works <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
            <Reveal delay="reveal-delay-3">
              <div className="mt-12 flex items-center gap-3 text-xs text-[#6a8680]">
                <div className="flex -space-x-2">
                  {["MK", "RS", "AN"].map((initials) => (
                    <span
                      key={initials}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f4e9] bg-[#d7e2d2] text-[9px] font-semibold text-[#315650]"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <span>Built for the way Indian clinics actually work</span>
              </div>
            </Reveal>
          </div>
          <div className="relative min-h-[410px] md:min-h-[550px]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(171_44%_37%/.08),transparent_65%)]" />
            <div className="absolute inset-0">
              <LogoParticles className="h-full w-full" />
            </div>
            <div className="absolute bottom-[14%] left-[7%] rounded-2xl border border-[#173d3d]/10 bg-[#fffdf6]/85 p-4 shadow-xl backdrop-blur-md">
              <p className="font-mono-ui text-[9px] uppercase tracking-widest text-[#7b918c]">
                Aria — always on
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#173d3d]">
                <span className="pulse-dot h-2 w-2 rounded-full bg-[#eaa373]" />{" "}
                24 / 7 • No missed patients
              </div>
            </div>
            <div className="absolute right-[6%] top-[12%] hidden w-52 rounded-2xl border border-[#173d3d]/10 bg-[#fffdf6]/80 p-4 shadow-xl backdrop-blur-md sm:block">
              <div className="mb-3 flex items-center gap-2">
                <Logo size="small" />
                <span className="text-xs font-semibold">Aprish</span>
              </div>
              <p className="text-xs leading-5 text-[#64807a]">
                Token #14 Confirmed!
                <br />
                Consultation Fee{" "}
                <strong className="text-[#173d3d]">₹500</strong> received via
                UPI.
                <br />
                <span className="text-[#91a39a]">Dr. Mehta — 10:30 AM</span>
              </p>
            </div>
          </div>
        </div>
        <a
          data-testid="link-scroll-story"
          href="#story"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[.22em] text-[#76918b]"
        >
          <span>Scroll to explore</span>
          <ChevronDown className="h-4 w-4" />
        </a>
      </section>

      <section
        id="story"
        className="border-t border-[#173d3d]/10 bg-[#173d3d] text-[#eff1df]"
      >
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[.78fr_1.22fr]">
          <Reveal>
            <p className="eyebrow text-[#eaa373]">The real cost of chaos</p>
            <h2 className="display-title mt-5 text-5xl leading-[.95] md:text-6xl">
              Stop losing patients to{" "}
              <em className="text-[#eaa373]">front-desk chaos.</em>
            </h2>
            <p className="mt-7 max-w-sm text-base leading-7 text-[#bed0c4]">
              Every unanswered call after hours is a patient who booked with
              your competitor instead. Every no-show is ₹500 in lost revenue you
              will never recover. The front desk is costing you more than it
              runs.
            </p>
            <a
              data-testid="link-story-experience"
              href="#experience"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#f5bc8d]"
            >
              See how Aprish fixes this <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Reveal
                key={feature.label}
                delay={`reveal-delay-${(index % 3) + 1}`}
                className="h-full"
              >
                <article
                  className={`h-full rounded-3xl p-6 text-[#173d3d] ${feature.tint}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-[#52706d]">
                      {feature.label}
                    </span>
                    <feature.icon className="h-5 w-5 text-[#c87850]" />
                  </div>
                  <h3 className="mt-14 text-2xl font-semibold leading-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#52706d]">
                    {feature.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="bg-[#f7f4e9]">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-[#b8754d]">
              Complete front-desk automation
            </p>
            <h2 className="display-title mt-5 text-5xl leading-[.94] md:text-7xl">
              Every visit.
              <br />
              <em>Automated.</em>
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#52706d]">
              From the first WhatsApp message to the post-visit Google review —
              Aprish handles the entire patient journey inside a platform 500M+
              Indians already use every day.
            </p>
          </Reveal>
          <ExperienceSteps />
        </div>
      </section>

      <section id="demo" className="bg-[#173d3d]">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <PhoneDemo />
        </div>
      </section>

      <section className="bg-[#e9eee0]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[1.1fr_.9fr]">
          <Reveal>
            <p className="eyebrow text-[#b8754d]">Real ROI. Real numbers.</p>
            <h2 className="display-title mt-5 max-w-2xl text-5xl leading-[.94] md:text-7xl">
              Your staff handles <em>patients.</em> Aprish handles everything
              else.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#52706d]">
              Aprish eliminates the repetitive front-desk work that burns out
              good staff and costs real money — so your team's energy goes where
              it actually matters: quality patient care.
            </p>
          </Reveal>
          <Reveal delay="reveal-delay-2">
            <div className="relative ml-auto max-w-sm rounded-[2rem] bg-[#fffdf6] p-7 shadow-[0_24px_70px_rgba(30,61,59,.12)]">
              <div className="flex items-center gap-3 border-b border-[#173d3d]/10 pb-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e4eee0]">
                  <Users className="h-5 w-5 text-[#35625d]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Tuesday, 10:18 AM</p>
                  <p className="text-xs text-[#75918a]">
                    Front desk, less frantic
                  </p>
                </div>
              </div>
              <div className="space-y-5 pt-6">
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#eaa373]" />
                  <p className="text-sm leading-6 text-[#52706d]">
                    18 routine questions answered automatically while the team
                    focused entirely on patients.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6d9b82]" />
                  <p className="text-sm leading-6 text-[#52706d]">
                    6 live queue updates sent to waiting patients — zero staff
                    effort, zero waiting-room complaints.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#9d8fae]" />
                  <p className="text-sm leading-6 text-[#52706d]">
                    4 happy patients automatically directed to leave a 5-star
                    review on Google.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 rounded-xl bg-[#173d3d] px-4 py-3 text-xs text-[#e7eddb]">
                <Sparkles className="h-4 w-4 text-[#eaa373]" /> Your team's
                energy on patients — not paperwork.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="waitlist" className="relative overflow-hidden bg-[#eaa373]">
        <div className="absolute -right-28 -top-36 h-96 w-96 rounded-full border-[50px] border-[#f3bd8b]/50" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <Reveal>
              <p className="eyebrow text-[#7b4a35]">
                LIMITED BETA • FIRST 20 CLINICS ONLY
              </p>
              <h2 className="display-title mt-5 max-w-3xl text-6xl leading-[.88] text-[#173d3d] md:text-8xl">
                Modernize your front desk <em>Now</em>
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#315650]">
                The clinics that join the Aprish beta will permanently end
                front-desk chaos, eliminate no-shows, and start collecting UPI
                fees on autopilot — before their competitors figure out it's
                possible.
              </p>
            </Reveal>
            <Reveal delay="reveal-delay-2">
              <div>
                <WaitlistForm />
                <p className="mt-4 flex items-center gap-2 text-xs text-[#7b4a35]">
                  <ShieldCheck className="h-4 w-4" /> No spam. Early-access
                  update only. Claim your clinic's spot →
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="bg-[#173d3d] text-[#dce8da]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <a
            data-testid="link-footer-home"
            href="#top"
            className="flex items-center gap-2.5"
          >
            <Logo />
            <span className="text-lg font-semibold">aprish</span>
          </a>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#abc3b6]">
            <a data-testid="link-footer-story" href="#story">
              Why Aprish
            </a>
            <a data-testid="link-footer-demo" href="#demo">
              See it live
            </a>
            <a data-testid="link-footer-waitlist" href="#waitlist">
              Early access
            </a>
          </div>
          <p className="text-xs text-[#78958d]">
            © 2026 Aprish. Built for better care.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default App;
