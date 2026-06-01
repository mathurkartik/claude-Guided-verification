# Optimized Prompt Sequence: Claude Guided Verification Panel

Use this step-by-step prompt sequence in [v0.dev](https://v0.dev) to recreate the exact premium prototype currently running in your repository.

---

### Prompt 1 — Build the base app

```text
Build a single-page React app (Next.js + Tailwind CSS) called "Guided Verification Panel" — a UI concept for Anthropic's Claude that helps users target their verification effort on AI-generated answers.

Layout:
Two-column layout, like a chat interface:
- LEFT (60% width): a Claude-style answer rendered as clean prose. Header bar reads "Claude" with a small Anthropic-style icon.
- RIGHT (40% width): the "Verification Panel" — a sidebar that appears AFTER the answer renders.

Top control:
A toggle switch labeled "Verification Panel: ON / OFF".
- OFF = panel hidden, answer looks like normal Claude (the "before" state)
- ON = panel visible (the "after" state)

Visual style:
Clean, Anthropic-like: warm off-white background (#FBF7F0), charcoal text, and one warm coral/terracotta accent (#E76F51) for the keystone highlight and Frame Check borders.
```

---

### Prompt 2 — Add four hardcoded demo scenarios

```text
Add a dropdown at the top to switch between 4 pre-loaded examples. Each has a hardcoded Claude answer and a hardcoded panel result (do NOT call any live API — everything is static/hardcoded for a clean demo):

SCENARIO 1 — "Market entry analysis" (hero example):
Answer: "Expanding into the Japanese market is viable for your SaaS product. Japan's enterprise software spending grew 9% last year, and your mid-market pricing aligns with typical Japanese SMB budgets. Given that your product already supports multi-language interfaces, localization cost will be minimal. Therefore you should prioritize Japan over Germany for Q3 expansion, and budget approximately 4 months for go-to-market."
Panel:
  KEYSTONE CLAIM: "Your mid-market pricing aligns with typical Japanese SMB budgets."
  Tag: "3 downstream conclusions depend on this claim"
  FRAME CHECK: "This answer is built on the assumption that your current pricing maps to Japanese SMB budgets. If that assumption doesn't match your situation, the Japan-over-Germany recommendation and the 4-month timeline may not apply. Does it?"
  SCOPE NOTE (small, muted): "Structural centrality ≠ risk completeness. This panel shows where the answer load-bears, not whether claims are true."

SCENARIO 2 — "Medical/health summary":
Answer: "For managing high cholesterol, the most effective first step is dietary change — reducing saturated fat intake. Studies show a 10-15% LDL reduction from diet alone. Since your reported levels are borderline, you likely won't need statins immediately, and lifestyle changes over 3 months should be sufficient before reconsidering medication."
Panel:
  KEYSTONE CLAIM: "Your reported levels are borderline."
  Tag: "The medication recommendation depends entirely on this"
  FRAME CHECK: "This answer assumes your cholesterol levels are borderline rather than high. If your actual levels are higher, the 'no statins needed' conclusion may not apply. Does it?"

SCENARIO 3 — "GDPR compliance handbook":
Answer: "Your data handling process is GDPR-compliant. Since you store user data within the EU and obtain explicit consent at signup, you meet the key requirements. You can proceed with the current architecture without a DPO."
Panel:
  KEYSTONE CLAIM: "You store user data within the EU."
  Tag: "The compliance conclusion and the no-DPO advice both rest on this"
  FRAME CHECK: "This answer assumes all user data stays within the EU. If any processing happens outside the EU, the compliance conclusion may not apply. Does it?"

SCENARIO 4 — "Coffee shop name brainstorm" (NULL STATE):
Answer: "Here are 10 coffee shop names: Bean Theory, The Daily Grind, Steam & Stone, Roast Republic, Mugshot, Crema, Percolate, Brew Haven, The Tamped Cup, Ground Control."
Panel — empty-state card: "No keystone claims detected. This output is a list of independent suggestions — no claim structurally supports the others, so there's nothing to prioritize for verification. The panel stays quiet when it has nothing useful to add."
```

---

### Prompt 3 — Add keystone highlight interaction

```text
When the panel is ON, the keystone claim should be visually linked to its location in the left answer: clicking the keystone card highlights the matching sentence in the prose with a 2-second fade (the "Transient Navigation Anchor").

The Frame Check card has two buttons: "Yes, that's right" and "No, that's not my situation". Clicking "No" shows a muted follow-up message directly below it: "Then revisit the conclusions that depend on this before using the answer."

Keep the prose UNTOUCHED whether the panel is ON or OFF — the answer is identical; only the panel itself toggles visibility.
```

---

### Prompt 4 — Fix the HTML entity bug

```text
In the Frame Check text, ensure the word currently renders as "doesn't" (a normal apostrophe) instead of "doesn't". Check all scenario texts for any other &apos;, &quot;, &amp; entities and render them as normal text characters.
```

---

### Prompt 5 — Relabel jargon headers to plain language

```text
Make targeted changes to the current app. Do not redesign anything else.

Relabel the two panel cards to plain language (keeping the terminology as a subtitle):

For the keystone card:
- Main header (bold): "VERIFY THIS FIRST"
- Subtitle directly under it (smaller, grey, ~11px): "The keystone claim — what the rest of the answer rests on"
- Keep the claim text and the "N downstream conclusions depend on this claim" tag exactly as they are.

For the Frame Check card:
- Main header (bold): "DOES THIS ASSUMPTION HOLD?"
- Subtitle directly under it (smaller, grey, ~11px): "Frame Check"
- Keep the question text and the two buttons (Yes / No) exactly as they are.
```

---

### Prompt 6 — Add premium modern chat input bar & interactive dropdown dialogue box

```text
Below the answer + panel viewport, add a premium, modern chat input container (Message Box) that spans the width of the active chat window to match Claude's native visual aesthetic, along with an interactive Model Picker dropdown (Dialogue Box).

Message Box (Chat Input Container):
- Create a tall, dark pill-shaped input container (bg-[#1e1e1e], rounded-3xl, border, padding-4) containing:
  - A top text input field with a placeholder: "Write a message…"
  - A bottom controls row containing:
    - Left side: A "+" action button and a premium blue Projects folder button (bg-[#24262a], text-[#4d82d6], border, rounded-xl, padding-2).
    - Right side: A clickable model picker selector showing "Opus 4.7 Max ∨", a microphone icon, and a visual audio waveform icon.
- Centered directly below the input container, display the disclaimer in small italic grey text:
  "Claude is AI and can make mistakes. Please double-check responses."

Dialogue Box (Model Picker Dropdown & Verification Submenus):
- Clicking the "Opus 4.7 Max ∨" button opens an absolute-positioned dropdown menu dialogue box (bg-secondary, border, rounded-lg, shadow-lg, z-50) floating directly above the button (using `bottom-full right-0 mb-3 w-56`).
- The main dropdown contains these menu items:
  1. "Opus 4.6" displaying a checkmark.
  2. "Effort (Max >)": Clicking this slides out a nested side submenu with options: "Low", "Medium", "High", and "Max (Default ✓)".
  3. "Verification ( >)": Clicking this opens a nested side submenu with options to toggle the verification states: "Off" and "On" (each displaying a blue checkmark when active).
- Clicking the "On" or "Off" option in the Verification submenu triggers the state of the right-hand panel (rendering/hiding it along with the keystone highlights in the Claude prose).
```

---

### Prompt 7 — Add helper line for cold viewers

```text
Directly beneath the AI answer (left column), add one line in small italic grey text:
"↗ The panel on the right shows which part to check first — and the assumption it depends on."

Keep the ON/OFF toggle behavior identical: OFF hides the entire right panel AND the helper line (so the "before" state looks like a normal clean Claude answer); ON shows them (the "after" state).
```
