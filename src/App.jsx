import { useState, useEffect, useCallback } from "react";

const personas = [
  { id: "gary",     name: "Gary Chen",      title: "YC Partner",       avatar: "🧑‍💼", color: "#FF6B35" },
  { id: "victoria", name: "Victoria Stone", title: "Cynical VC",        avatar: "👩‍💼", color: "#FF2D55" },
  { id: "dave",     name: "Dave",           title: "Target Customer",   avatar: "🙋‍♂️", color: "#FFD60A" },
];

const loadingLines = [
  "Assembling the panel...",
  "Gary is sharpening his red pen...",
  "Victoria is sighing deeply...",
  "Dave is just confused...",
  "Preparing your humiliation...",
  "This might sting a little...",
];

// ─────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────
function useTypewriter(text, speed = 16, active = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active || !text) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, active]);
  return displayed;
}

function useCounter(target, active, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active]);
  return val;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// Calls our secure Vercel serverless function — API key never touches the browser
async function callClaude(prompt) {
  const res = await fetch("/api/roast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

function getScoreColor(s) { return s < 30 ? "#FF2D55" : s < 60 ? "#FF9500" : "#34C759"; }
function getScoreLabel(s) {
  if (s < 20) return "💀 DEAD ON ARRIVAL";
  if (s < 40) return "😬 ROUGH START";
  if (s < 60) return "🤔 HAS POTENTIAL";
  if (s < 80) return "🔥 GETTING WARM";
  return "🚀 ACTUALLY INTERESTING";
}

// ─────────────────────────────────────────
// FIX 1: Cursor moved OUTSIDE PersonaCard
// ─────────────────────────────────────────
function Cursor() {
  return (
    <span style={{
      display: "inline-block", width: 2, height: "1em",
      background: "#FF6B35", marginLeft: 2,
      verticalAlign: "text-bottom",
      animation: "cursorBlink 0.7s ease-in-out infinite",
    }} />
  );
}

// ─────────────────────────────────────────
// EMBER PARTICLES
// ─────────────────────────────────────────
function EmberField() {
  const [embers, setEmbers] = useState([]);
  useEffect(() => {
    const make = () => ({
      id: Math.random(),
      left: Math.random() * 100 + "%",
      size: Math.random() * 5 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.15,
    });
    setEmbers(Array.from({ length: 18 }, make));
    const iv = setInterval(() => setEmbers((p) => [...p.slice(-22), make()]), 400);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {embers.map((e) => (
        <div key={e.id} style={{
          position: "absolute", bottom: -10, left: e.left,
          width: e.size, height: e.size, borderRadius: "50%",
          background: "radial-gradient(circle, #FF6B35, #FF2D55)",
          opacity: e.opacity,
          animation: `emberRise ${e.duration}s ${e.delay}s linear infinite`,
          filter: "blur(0.5px)",
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// PERSONA CARD
// ─────────────────────────────────────────
function PersonaCard({ persona, result, visible }) {
  const roastText = useTypewriter(result?.roast, 14, visible);
  const quoteDone = roastText.length >= (result?.roast?.length || 999);
  const quoteText = useTypewriter(result?.quote, 22, quoteDone);

  return (
    <div style={{
      border: "1px solid #181818", background: "#0c0c0c", borderRadius: 2, padding: 22,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
      transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${persona.color}18` }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
          background: persona.color + "18", border: `1px solid ${persona.color}44`,
          animation: visible ? "avatarPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
        }}>{persona.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{persona.name}</div>
          <div style={{ fontSize: 10, fontFamily: "'Courier Prime',monospace", marginTop: 2, color: persona.color + "aa", letterSpacing: 1 }}>{persona.title}</div>
        </div>
        <div style={{
          fontSize: 8, letterSpacing: 2, fontWeight: 700, padding: "4px 8px", borderRadius: 2,
          background: persona.color + "18", color: persona.color, border: `1px solid ${persona.color}33`,
          textTransform: "uppercase", animation: "badgeBlink 2s ease-in-out infinite",
        }}>LIVE</div>
      </div>

      {/* Roast text */}
      <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, lineHeight: 1.8, color: "#888", marginBottom: 14, minHeight: 60 }}>
        {roastText}
        {visible && roastText.length < (result?.roast?.length || 0) && <Cursor />}
      </div>

      {/* Quote */}
      {quoteText && (
        <div style={{
          fontFamily: "'Courier Prime',monospace", fontStyle: "italic",
          fontSize: 13, padding: "12px 16px", background: "#0a0a0a",
          borderLeft: `2px solid ${persona.color}55`, color: "#ccc",
          borderRadius: "0 2px 2px 0", animation: "quoteSlide 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}>
          "{quoteText}"
          {quoteText.length < (result?.quote?.length || 0) && <Cursor />}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// EXPANDABLE SECTION
// ─────────────────────────────────────────
function Section({ emoji, title, accentColor, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #181818", borderLeft: `3px solid ${accentColor}`, borderRadius: "0 2px 2px 0", marginBottom: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", background: "#0c0c0c", border: "none", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: "#ede8df", fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 3 }}
      >
        <span>{emoji} {title}</span>
        <span style={{ color: accentColor, fontSize: 20, transition: "transform 0.3s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      <div style={{ maxHeight: open ? 1400 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ padding: "0 22px 22px", background: "#0a0a0a" }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────
export default function RoastMyIdea() {
  const [idea, setIdea]                   = useState("");
  const [phase, setPhase]                 = useState("input"); // input | loading | results
  const [loadingLine, setLoadingLine]     = useState(0);
  const [results, setResults]             = useState(null);
  const [visiblePersonas, setVisiblePersonas] = useState([]);
  const [scoreActive, setScoreActive]     = useState(false);
  const [shaking, setShaking]             = useState(false);
  const [copied, setCopied]               = useState(false);
  const [mounted, setMounted]             = useState(false);
  const [errorMsg, setErrorMsg]           = useState(""); // FIX 5

  // Fix my pitch
  const [fixedPitch, setFixedPitch]       = useState("");
  const [fixLoading, setFixLoading]       = useState(false);
  const [fixError, setFixError]           = useState("");   // FIX 6

  // Investor email
  const [email, setEmail]                 = useState("");
  const [emailLoading, setEmailLoading]   = useState(false);
  const [emailCopied, setEmailCopied]     = useState(false);
  const [emailError, setEmailError]       = useState("");   // FIX 6

  // PDF
  const [pdfLoading, setPdfLoading]       = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const scoreDisplay = useCounter(results?.score || 0, scoreActive);

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  // ── GET ROASTED ──────────────────────────
  const getRoasted = async () => {
    if (!idea.trim() || idea.length < 10) return;
    setPhase("loading");
    setResults(null);
    setVisiblePersonas([]);
    setScoreActive(false);
    setFixedPitch("");
    setEmail("");
    setErrorMsg("");
    setLoadingLine(0); // FIX 7: reset loading line index
    shake();

    let lineIdx = 0;
    const interval = setInterval(() => {
      lineIdx = (lineIdx + 1) % loadingLines.length;
      setLoadingLine(lineIdx);
    }, 1100);

    try {
      const text = await callClaude(
        `You are running a brutal but funny startup idea roast panel. Roast this idea: "${idea}"

Return ONLY valid JSON, no markdown, no backticks:
{
  "gary":     { "roast": "2-3 sentences from Gary Chen, blunt YC partner, data-driven, obsessed with market size.", "quote": "One savage one-liner under 12 words" },
  "victoria": { "roast": "2-3 sentences from Victoria Stone, cynical VC, sarcastic, references a failed startup that tried this.", "quote": "One savage one-liner under 12 words" },
  "dave":     { "roast": "2-3 sentences from Dave, confused target customer, simple language, would never pay.", "quote": "One funny one-liner under 12 words" },
  "score":   <integer 0-100>,
  "verdict": "One brutal sentence under 20 words",
  "fix":     "2-3 sentences on what would genuinely make this work."
}`
      );

      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      // Validate expected shape
      if (!parsed.gary || !parsed.victoria || !parsed.dave || parsed.score == null) {
        throw new Error("Unexpected response shape from API");
      }

      clearInterval(interval);
      setResults(parsed);
      setPhase("results");
      shake();

      setTimeout(() => setVisiblePersonas(["gary"]), 300);
      setTimeout(() => setVisiblePersonas(["gary", "victoria"]), 1000);
      setTimeout(() => setVisiblePersonas(["gary", "victoria", "dave"]), 1700);
      setTimeout(() => { setScoreActive(true); shake(); }, 2500);

    } catch (e) {
      clearInterval(interval);
      setPhase("input");
      setErrorMsg(e.message || "Something went wrong. Try again!"); // FIX 5
      console.error(e);
    }
  };

  // ── FIX MY PITCH ────────────────────────
  const fixPitch = async () => {
    if (!results || fixLoading) return;
    setFixLoading(true);
    setFixedPitch("");
    setFixError(""); // FIX 6
    try {
      const raw = await callClaude(
        `You are a YC partner helping a founder write a perfect one-liner pitch.

Original idea: "${idea}"
What's broken: "${results.fix}"

Rewrite this as a crisp YC-style pitch. Follow the exact formula:
"We are [COMPANY], [what you do in plain english] for [target customer], so they can [key benefit]."

Then on a new line: a second version as a tweet (under 280 chars, punchy, no fluff).

Then on a new line: one sentence on why this is 10x better than the status quo.

Format as plain text, no markdown, no headers, just the three pieces separated by newlines.`
      );
      setFixedPitch(raw.trim());
    } catch (e) {
      setFixError("Failed to rewrite pitch. Try again."); // FIX 6
      console.error(e);
    }
    setFixLoading(false);
  };

  // ── INVESTOR EMAIL ───────────────────────
  const generateEmail = async () => {
    if (!results || emailLoading) return;
    setEmailLoading(true);
    setEmail("");
    setEmailError(""); // FIX 6
    const pitch = fixedPitch || idea;
    try {
      const raw = await callClaude(
        `Write a cold investor email for this startup idea.

Pitch: "${pitch}"
Fundability Score: ${results.score}/100
Key strengths: "${results.fix}"

Write a short, punchy cold email to a VC. Rules:
- Subject line first (label it "Subject:")
- 4-6 sentences max in the body
- Open with the problem, not pleasantries
- Include the one-line pitch
- One specific market signal or stat (you can invent a plausible one)
- Clear ask: 20-minute call
- Sign off as "[Your Name], Founder"
- No fluff, no buzzwords like "revolutionary" or "disruptive"
- Tone: confident but not arrogant

Format: Subject line, blank line, then email body. Plain text only.`
      );
      setEmail(raw.trim());
    } catch (e) {
      setEmailError("Failed to generate email. Try again."); // FIX 6
      console.error(e);
    }
    setEmailLoading(false);
  };

  // ── PDF EXPORT ───────────────────────────
  const exportPDF = async () => {
    if (!results || pdfLoading) return;
    setPdfLoading(true);
    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Failed to load jsPDF"));
          document.head.appendChild(s);
        });
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const margin = 48;
      const col = W - margin * 2;
      let y = margin;

      // FIX 2: addPage now redraws dark background on new pages
      const addPage = () => {
        doc.addPage();
        doc.setFillColor(6, 6, 6);
        doc.rect(0, 0, W, H, "F");
        y = margin;
      };
      const checkY = (needed = 40) => { if (y + needed > H - margin) addPage(); };

      // Page 1 background
      doc.setFillColor(6, 6, 6);
      doc.rect(0, 0, W, H, "F");

      // Header stripe
      doc.setFillColor(255, 69, 0);
      doc.rect(0, 0, W, 6, "F");

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(38);
      doc.setTextColor(255, 107, 53);
      doc.text("ROAST MY IDEA", margin, y + 44);
      y += 60;

      // Subtitle & date
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL ROAST REPORT", margin, y);
      y += 10;
      doc.setTextColor(60, 60, 60);
      doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), margin, y + 14);
      y += 36;

      // Divider
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(0.5);
      doc.line(margin, y, W - margin, y);
      y += 20;

      // ── Idea ──
      doc.setFontSize(9); doc.setTextColor(255, 69, 0); doc.setFont("helvetica", "bold");
      doc.text("THE IDEA", margin, y); y += 14;
      const ideaLines = doc.splitTextToSize(idea, col - 20);
      const ideaH = ideaLines.length * 16 + 20;
      checkY(ideaH);
      doc.setFillColor(14, 14, 14);
      doc.rect(margin, y, col, ideaH, "F");
      doc.setFontSize(12); doc.setTextColor(220, 215, 205); doc.setFont("helvetica", "normal");
      doc.text(ideaLines, margin + 10, y + 16);
      y += ideaH + 20;

      // ── Score ──
      checkY(110);
      doc.setFontSize(9); doc.setTextColor(255, 69, 0); doc.setFont("helvetica", "bold");
      doc.text("FUNDABILITY SCORE", margin, y); y += 14;
      const sc = results.score;
      const scColor = sc < 30 ? [255, 45, 85] : sc < 60 ? [255, 149, 0] : [52, 199, 89];
      doc.setFontSize(52); doc.setFont("helvetica", "bold");
      doc.setTextColor(...scColor);
      doc.text(`${sc}/100`, margin, y + 48);
      doc.setFontSize(12); doc.setTextColor(...scColor);
      doc.text(getScoreLabel(sc).replace(/[^\w\s]/g, "").trim(), margin, y + 66);
      doc.setFillColor(25, 25, 25); doc.rect(margin, y + 76, col, 5, "F");
      doc.setFillColor(...scColor); doc.rect(margin, y + 76, col * sc / 100, 5, "F");
      y += 100;

      // ── Verdict ──  FIX 3 & 4: dynamic height based on actual line count
      checkY(60);
      doc.setFontSize(9); doc.setTextColor(255, 69, 0); doc.setFont("helvetica", "bold");
      doc.text("PANEL VERDICT", margin, y); y += 14;
      doc.setFontSize(11); doc.setFont("helvetica", "italic");
      const vLines = doc.splitTextToSize(`"${results.verdict}"`, col - 20);
      const verdictH = vLines.length * 16 + 20; // FIX 3: dynamic not hardcoded 36
      checkY(verdictH);
      doc.setFillColor(14, 14, 14);
      doc.rect(margin, y, col, verdictH, "F");
      doc.setTextColor(220, 215, 205);
      doc.text(vLines, margin + 10, y + 14);
      y += verdictH + 12; // FIX 4: uses real height

      // ── Personas ──
      for (const p of personas) {
        const r = results[p.id];
        if (!r) continue;
        const pColor = p.color === "#FF6B35" ? [255, 107, 53] : p.color === "#FF2D55" ? [255, 45, 85] : [255, 214, 10];
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...pColor);
        const roastLines = doc.splitTextToSize(r.roast, col - 20);
        const quoteLines = doc.splitTextToSize(`"${r.quote}"`, col - 20);
        const cardH = (roastLines.length + quoteLines.length) * 14 + 36;
        checkY(cardH + 20);
        doc.text(`${p.name.toUpperCase()} — ${p.title.toUpperCase()}`, margin, y); y += 12;
        doc.setFillColor(14, 14, 14);
        doc.rect(margin, y, col, cardH, "F");
        doc.setFontSize(10); doc.setTextColor(140, 140, 140); doc.setFont("helvetica", "normal");
        doc.text(roastLines, margin + 10, y + 14);
        doc.setTextColor(...pColor); doc.setFont("helvetica", "italic");
        doc.text(quoteLines, margin + 10, y + 14 + roastLines.length * 14 + 8);
        y += cardH + 14;
      }

      // ── Fix ──
      checkY(80);
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(52, 199, 89);
      doc.text("HOW TO FIX IT", margin, y); y += 14;
      const fixLines = doc.splitTextToSize(results.fix, col - 20);
      const fixH = fixLines.length * 14 + 24;
      checkY(fixH);
      doc.setFillColor(10, 20, 12);
      doc.rect(margin, y, col, fixH, "F");
      doc.setDrawColor(52, 199, 89); doc.setLineWidth(2);
      doc.line(margin, y, margin, y + fixH);
      doc.setFontSize(10); doc.setTextColor(100, 170, 100); doc.setFont("helvetica", "normal");
      doc.text(fixLines, margin + 12, y + 14);
      y += fixH + 16;

      // ── Fixed pitch (if available) ──
      if (fixedPitch) {
        checkY(80);
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 107, 53);
        doc.text("FIXED PITCH (YC STYLE)", margin, y); y += 14;
        const fpLines = doc.splitTextToSize(fixedPitch, col - 20);
        const fpH = fpLines.length * 14 + 24;
        checkY(fpH);
        doc.setFillColor(14, 10, 6);
        doc.rect(margin, y, col, fpH, "F");
        doc.setFontSize(10); doc.setTextColor(180, 140, 100); doc.setFont("helvetica", "normal");
        doc.text(fpLines, margin + 12, y + 14);
        y += fpH + 16;
      }

      // ── Footer on every page ──
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        // Redraw footer bg strip
        doc.setFillColor(6, 6, 6);
        doc.rect(0, H - 30, W, 30, "F");
        doc.setDrawColor(30, 30, 30); doc.setLineWidth(0.5);
        doc.line(margin, H - 30, W - margin, H - 30);
        doc.setFontSize(8); doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "normal");
        doc.text("roast-my-idea-chi.vercel.app — confidential roast report", margin, H - 12);
        doc.text(`${i} / ${pages}`, W - margin, H - 12, { align: "right" });
      }

      doc.save(`roast-report-${Date.now()}.pdf`);
    } catch (e) {
      alert("PDF generation failed: " + e.message);
      console.error(e);
    }
    setPdfLoading(false);
  };

  // ─────────────────────────────────────────
  // SHARED INLINE STYLES
  // ─────────────────────────────────────────
  const actionBtn = (color, disabled) => ({
    width: "100%", padding: 16, border: `1px solid ${disabled ? "#333" : color}`,
    borderRadius: 2, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 3,
    cursor: disabled ? "not-allowed" : "pointer", transition: "all .2s",
    background: "transparent", color: disabled ? "#444" : color,
  });

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes emberRise { 0%{transform:translateY(0) scale(1)} 50%{transform:translateY(-45vh) translateX(20px) scale(0.6)} 100%{transform:translateY(-95vh) translateX(-15px) scale(0.1);opacity:0} }
        @keyframes gridDrift { from{background-position:0 0} to{background-position:44px 44px} }
        @keyframes orbPulse { 0%,100%{opacity:1;transform:translateX(-50%) scale(1)} 50%{opacity:0.6;transform:translateX(-50%) scale(1.12)} }
        @keyframes titleFlicker { 0%,94%,100%{filter:drop-shadow(0 0 80px rgba(255,69,0,.35))} 95%{filter:drop-shadow(0 0 30px rgba(255,69,0,.1))} 97%{filter:drop-shadow(0 0 120px rgba(255,69,0,.6))} }
        @keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,69,0,0)} 50%{box-shadow:0 0 20px 3px rgba(255,69,0,.25)} }
        @keyframes screenShake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-7px) rotate(-.3deg)} 20%{transform:translateX(7px) rotate(.3deg)} 30%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 55%{transform:translateX(-3px)} 70%{transform:translateX(3px)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
        @keyframes msgFade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0) scale(1);opacity:.4} 50%{transform:translateY(-12px) scale(1.3);opacity:1} }
        @keyframes fireRage { from{transform:scale(1) rotate(-5deg) translateY(0);filter:drop-shadow(0 0 24px rgba(255,100,0,.7))} to{transform:scale(1.2) rotate(5deg) translateY(-5px);filter:drop-shadow(0 0 44px rgba(255,100,0,1))} }
        @keyframes ringExpand { 0%{transform:scale(.5);opacity:.8} 100%{transform:scale(2.2);opacity:0} }
        @keyframes avatarPop { from{transform:scale(0) rotate(-20deg)} to{transform:scale(1) rotate(0)} }
        @keyframes badgeBlink { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes quoteSlide { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }
        @keyframes scoreGlow { from{filter:drop-shadow(0 0 20px currentColor)} to{filter:drop-shadow(0 0 55px currentColor)} }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        textarea { outline: none; }
        .copy-btn { background:#141414; border:none; color:#666; font-family:'Courier Prime',monospace; font-size:11px; padding:6px 12px; border-radius:2px; cursor:pointer; letter-spacing:1px; transition:all .2s; }
        .copy-btn:hover { color:#ede8df; background:#1e1e1e; }
        pre { white-space:pre-wrap; word-break:break-word; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#060606", color: "#ede8df", fontFamily: "'Syne',sans-serif", position: "relative", overflowX: "hidden", animation: shaking ? "screenShake .45s cubic-bezier(.36,.07,.19,.97)" : "none" }}>

        {/* Grid background */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,69,0,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,.05) 1px,transparent 1px)", backgroundSize: "44px 44px", animation: "gridDrift 20s linear infinite", pointerEvents: "none", zIndex: 0 }} />
        <EmberField />
        <div style={{ position: "fixed", top: -280, left: "50%", width: 700, height: 500, background: "radial-gradient(ellipse,rgba(255,69,0,.18) 0%,transparent 65%)", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 0, animation: "orbPulse 4s ease-in-out infinite" }} />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ── HERO ── */}
          <div style={{ textAlign: "center", padding: "56px 20px 32px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(30px)", transition: "opacity .8s ease, transform .8s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,69,0,.1)", border: "1px solid rgba(255,69,0,.28)", color: "#FF6B35", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", padding: "8px 18px", borderRadius: 2, marginBottom: 32, animation: "badgePulse 3s ease-in-out infinite" }}>
              🔥 AI Roast Panel — Free
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(72px,15vw,160px)", lineHeight: .86, letterSpacing: 3, background: "linear-gradient(170deg,#fff 0%,#ffb347 35%,#FF4500 65%,#FF2D55 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "titleFlicker 8s ease-in-out infinite" }}>
              ROAST<br />MY IDEA
            </div>
            <p style={{ fontFamily: "'Courier Prime',monospace", fontSize: 14, color: "#555", marginTop: 22, lineHeight: 1.7, fontStyle: "italic" }}>
              3 brutally honest AI investors will <span style={{ color: "#FF6B35" }}>destroy your startup dream.</span><br />For free. You're welcome.
            </p>
          </div>

          {/* ── INPUT ── */}
          {phase === "input" && (
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 64px", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "opacity .7s ease .3s, transform .7s ease .3s" }}>
              <span style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#3a3a3a", marginBottom: 12, display: "block" }}>Your startup idea</span>
              <div style={{ border: "1px solid #1e1e1e", borderRadius: 2, background: "#0c0c0c" }}>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. An app that connects freelance chefs with hungry people at midnight..."
                  maxLength={500}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) getRoasted(); }}
                  style={{ width: "100%", background: "transparent", border: "none", color: "#ede8df", fontFamily: "'Courier Prime',monospace", fontSize: 16, lineHeight: 1.7, padding: 22, resize: "none", height: 148 }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 18px", borderTop: "1px solid #141414", fontSize: 11, color: "#2e2e2e", fontFamily: "'Courier Prime',monospace" }}>{idea.length} / 500</div>
              </div>

              {/* FIX 5: error message */}
              {errorMsg && (
                <div style={{ marginTop: 12, padding: "12px 16px", background: "#1a0808", border: "1px solid #FF2D5555", borderRadius: 2, fontFamily: "'Courier Prime',monospace", fontSize: 13, color: "#FF6B6B" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                onClick={getRoasted}
                disabled={!idea.trim() || idea.length < 10}
                style={{ width: "100%", marginTop: 14, padding: 20, background: (!idea.trim() || idea.length < 10) ? "#1a1a1a" : "#FF4500", color: "white", border: "none", borderRadius: 2, fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 5, cursor: (!idea.trim() || idea.length < 10) ? "not-allowed" : "pointer", opacity: (!idea.trim() || idea.length < 10) ? .3 : 1, transition: "all .2s" }}
                onMouseEnter={(e) => { if (idea.trim() && idea.length >= 10) { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 16px 48px rgba(255,69,0,.5)"; } }}
                onMouseLeave={(e) => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
              >
                🔥 GET ROASTED
              </button>
            </div>
          )}

          {/* ── LOADING ── */}
          {phase === "loading" && (
            <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeSlideUp .4s ease" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 32 }}>
                <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid rgba(255,69,0,.2)", animation: "ringExpand 1.4s ease-out infinite" }} />
                <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: "2px solid rgba(255,69,0,.15)", animation: "ringExpand 1.4s ease-out .7s infinite" }} />
                <span style={{ fontSize: 72, display: "block", animation: "fireRage .35s ease-in-out infinite alternate" }}>🔥</span>
              </div>
              <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: "#333", marginBottom: 16 }}>Assembling the panel</div>
              <p key={loadingLine} style={{ fontFamily: "'Courier Prime',monospace", color: "#4a4a4a", fontSize: 15, fontStyle: "italic", animation: "msgFade .35s ease" }}>{loadingLines[loadingLine]}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
                {[0, 1, 2].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: ["#FF6B35", "#FF4500", "#FF2D55"][i], animation: `dotBounce 1.2s ${i * .2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {phase === "results" && results && (
            <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 20px 80px", animation: "fadeSlideUp .6s cubic-bezier(0.16,1,0.3,1)" }}>

              {/* Verdict */}
              <div style={{ border: "1px solid #1c1c1c", borderTop: "2px solid #FF4500", background: "linear-gradient(135deg,#0d0d0d 0%,#110a08 100%)", borderRadius: 2, padding: 30, marginBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(255,69,0,.06) 0%,transparent 60%)", pointerEvents: "none" }} />
                <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: "#FF4500", marginBottom: 14 }}>⚡ Panel Verdict</div>
                <div style={{ fontFamily: "'Courier Prime',monospace", fontStyle: "italic", fontSize: "clamp(15px,2.5vw,20px)", color: "#ede8df", lineHeight: 1.5 }}>"{results.verdict}"</div>
              </div>

              {/* Persona cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12, marginBottom: 20 }}>
                {personas.map((p) => <PersonaCard key={p.id} persona={p} result={results[p.id]} visible={visiblePersonas.includes(p.id)} />)}
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#141414" }} />
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF4500", animation: "dotPulse 2s ease-in-out infinite" }} />
                <div style={{ flex: 1, height: 1, background: "#141414" }} />
              </div>

              {/* Score */}
              <div style={{ border: "1px solid #181818", background: "#0c0c0c", borderRadius: 2, padding: "40px 28px 32px", marginBottom: 16, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: getScoreColor(results.score), transform: scoreActive ? `scaleX(${results.score / 100})` : "scaleX(0)", transformOrigin: "left", transition: "transform 1.6s cubic-bezier(0.16,1,0.3,1)" }} />
                <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color: "#333", marginBottom: 16 }}>Fundability Score</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(90px,18vw,130px)", lineHeight: 1, color: getScoreColor(results.score), animation: scoreActive ? "scoreGlow 2s ease-in-out infinite alternate" : "none" }}>{scoreDisplay}</div>
                <div style={{ fontSize: 13, letterSpacing: 2, marginTop: 8, fontWeight: 700, textTransform: "uppercase", color: getScoreColor(results.score) }}>{getScoreLabel(results.score)}</div>
                <div style={{ width: "100%", height: 4, background: "#141414", borderRadius: 2, marginTop: 28, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: scoreActive ? `${results.score}%` : "0%", background: `linear-gradient(90deg,${getScoreColor(results.score)}66,${getScoreColor(results.score)})`, transition: "width 1.8s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 12px ${getScoreColor(results.score)}` }} />
                </div>
              </div>

              {/* Fix card */}
              <div style={{ border: "1px solid #141414", borderLeft: "3px solid #34C759", background: "#0c0c0c", borderRadius: "0 2px 2px 0", padding: 26, marginBottom: 16 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 3, color: "#34C759", marginBottom: 12 }}>💡 OK But Here's How To Fix It</div>
                <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 14, lineHeight: 1.8, color: "#777" }}>{results.fix}</div>
              </div>

              {/* ── FIX MY PITCH ── */}
              <Section emoji="🎯" title="FIX MY PITCH — YC ONE-LINER" accentColor="#FF9500">
                <div style={{ paddingTop: 16 }}>
                  <p style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, color: "#555", marginBottom: 16, fontStyle: "italic" }}>
                    Rewrites your idea as a crisp YC-style pitch, a tweet version, and a "why now" statement.
                  </p>
                  {fixError && <div style={{ marginBottom: 12, padding: "10px 14px", background: "#1a0808", border: "1px solid #FF2D5555", borderRadius: 2, fontFamily: "'Courier Prime',monospace", fontSize: 12, color: "#FF6B6B" }}>⚠️ {fixError}</div>}
                  {!fixedPitch ? (
                    <button style={actionBtn("#FF9500", fixLoading)} onClick={fixPitch} disabled={fixLoading}>
                      {fixLoading
                        ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #FF9500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />REWRITING PITCH...</span>
                        : "✍️ REWRITE MY PITCH"}
                    </button>
                  ) : (
                    <div>
                      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 2, padding: 20, marginBottom: 12 }}>
                        <pre style={{ fontFamily: "'Courier Prime',monospace", fontSize: 14, lineHeight: 1.85, color: "#c8c0b0" }}>{fixedPitch}</pre>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(fixedPitch)}>📋 COPY PITCH</button>
                        <button className="copy-btn" onClick={() => { setFixedPitch(""); setFixError(""); }}>↩ REDO</button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── INVESTOR EMAIL ── */}
              <Section emoji="📧" title="INVESTOR EMAIL GENERATOR" accentColor="#A78BFA">
                <div style={{ paddingTop: 16 }}>
                  <p style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, color: "#555", marginBottom: 16, fontStyle: "italic" }}>
                    Generates a cold email to a VC based on your {fixedPitch ? "fixed pitch" : "original idea"} and roast results.
                  </p>
                  {emailError && <div style={{ marginBottom: 12, padding: "10px 14px", background: "#1a0808", border: "1px solid #FF2D5555", borderRadius: 2, fontFamily: "'Courier Prime',monospace", fontSize: 12, color: "#FF6B6B" }}>⚠️ {emailError}</div>}
                  {!email ? (
                    <button style={actionBtn("#A78BFA", emailLoading)} onClick={generateEmail} disabled={emailLoading}>
                      {emailLoading
                        ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #A78BFA", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />WRITING EMAIL...</span>
                        : "📨 WRITE INVESTOR EMAIL"}
                    </button>
                  ) : (
                    <div>
                      <div style={{ background: "#0e0c14", border: "1px solid #1e1a2e", borderRadius: 2, padding: 20, marginBottom: 12 }}>
                        {email.startsWith("Subject:") ? (
                          <>
                            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1e1a2e" }}>
                              <span style={{ fontSize: 9, letterSpacing: 3, color: "#A78BFA", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Subject Line</span>
                              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "#c8c0e0" }}>{email.split("\n")[0].replace("Subject:", "").trim()}</div>
                            </div>
                            <pre style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, lineHeight: 1.9, color: "#aaa" }}>{email.split("\n").slice(2).join("\n").trim()}</pre>
                          </>
                        ) : (
                          <pre style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, lineHeight: 1.9, color: "#aaa" }}>{email}</pre>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="copy-btn" style={{ color: emailCopied ? "#34C759" : "#666" }} onClick={() => { navigator.clipboard.writeText(email); setEmailCopied(true); setTimeout(() => setEmailCopied(false), 2000); }}>
                          {emailCopied ? "✅ COPIED" : "📋 COPY EMAIL"}
                        </button>
                        <button className="copy-btn" onClick={() => { setEmail(""); setEmailError(""); }}>↩ REDO</button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* ── PDF EXPORT ── */}
              <Section emoji="📄" title="EXPORT ROAST REPORT AS PDF" accentColor="#34C759">
                <div style={{ paddingTop: 16 }}>
                  <p style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, color: "#555", marginBottom: 16, fontStyle: "italic" }}>
                    Full branded PDF — idea, roasts, score, fix{fixedPitch ? ", and your fixed pitch" : ""}. Show your cofounder.
                  </p>
                  <button style={actionBtn("#34C759", pdfLoading)} onClick={exportPDF} disabled={pdfLoading}>
                    {pdfLoading
                      ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #34C759", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />GENERATING PDF...</span>
                      : "⬇️ DOWNLOAD PDF REPORT"}
                  </button>
                  {fixedPitch && <p style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, color: "#444", marginTop: 10, fontStyle: "italic" }}>✓ Fixed pitch will be included</p>}
                </div>
              </Section>

              {/* Bottom actions */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  style={{ width: "100%", padding: 16, background: "transparent", color: copied ? "#34C759" : "#ede8df", border: `1px solid ${copied ? "#34C759" : "#222"}`, borderRadius: 2, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 4, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#FF4500"; e.currentTarget.style.color = "#FF6B35"; } }}
                  onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#ede8df"; } }}
                  onClick={() => {
                    const t = `Just got my startup idea roasted by AI 🔥\n\nFundability Score: ${results.score}/100\n\n"${results.verdict}"\n\nGet roasted at RoastMyIdea.ai`;
                    navigator.clipboard.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
                  }}>
                  {copied ? "✅ COPIED" : "🐦 SHARE YOUR ROAST"}
                </button>
                <button
                  style={{ width: "100%", padding: 13, background: "transparent", color: "#333", border: "1px solid #111", borderRadius: 2, fontFamily: "'Syne',sans-serif", fontSize: 13, cursor: "pointer", transition: "all .2s", letterSpacing: 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ede8df"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#111"; }}
                  onClick={() => { setPhase("input"); setResults(null); setIdea(""); setVisiblePersonas([]); setScoreActive(false); setFixedPitch(""); setEmail(""); setErrorMsg(""); }}>
                  Try another idea →
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}
