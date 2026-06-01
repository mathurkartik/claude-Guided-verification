'use client'

import { useState } from 'react'
import { AlertCircle, HelpCircle, Plus, Paperclip, Mic, Folder } from 'lucide-react'

const SCENARIOS = [
  {
    id: 'market-entry',
    name: 'Market entry analysis',
    userMessage: 'Should we expand into Japan or Germany for Q3? Our SaaS product is mid-market priced and already supports multi-language.',
    answer: `Expanding into the Japanese market is viable for your SaaS product. Japan's enterprise software spending grew 9% last year, and your mid-market pricing aligns with typical Japanese SMB budgets. Given that your product already supports multi-language interfaces, localization cost will be minimal. Therefore you should prioritize Japan over Germany for Q3 expansion, and budget approximately 4 months for go-to-market.`,
    keystoneClaim: 'Your mid-market pricing aligns with typical Japanese SMB budgets.',
    downstreamCount: 3,
    frameCheck: 'This answer is built on the assumption that your current pricing maps to Japanese SMB budgets. If that assumption doesn\'t match your situation, the Japan-over-Germany recommendation and the 4-month timeline may not apply. Does it?',
    highlightText: 'your mid-market pricing aligns with typical Japanese SMB budgets',
  },
  {
    id: 'medical',
    name: 'Medical/health summary',
    userMessage: 'My cholesterol came back elevated. What should I do before my follow-up appointment?',
    answer: `For managing high cholesterol, the most effective first step is dietary change — reducing saturated fat intake. Studies show a 10-15% LDL reduction from diet alone. Since your reported levels are borderline, you likely won't need statins immediately, and lifestyle changes over 3 months should be sufficient before reconsidering medication.`,
    keystoneClaim: 'Your reported levels are borderline.',
    downstreamCount: 1,
    frameCheck: 'This answer assumes your cholesterol levels are borderline rather than high. If your actual levels are higher, the "no statins needed" conclusion may not apply. Does it?',
    highlightText: 'your reported levels are borderline',
  },
  {
    id: 'gdpr',
    name: 'GDPR compliance handbook',
    userMessage: 'Is our data handling process GDPR-compliant? We store data in the EU and get consent at signup.',
    answer: `Your data handling process is GDPR-compliant. Since you store user data within the EU and obtain explicit consent at signup, you meet the key requirements. You can proceed with the current architecture without a DPO.`,
    keystoneClaim: 'You store user data within the EU.',
    downstreamCount: 2,
    frameCheck: 'This answer assumes all user data stays within the EU. If any processing happens outside the EU, the compliance conclusion may not apply. Does it?',
    highlightText: 'you store user data within the EU',
    hasWarning: true,
  },
  {
    id: 'coffee-names',
    name: 'Coffee shop name brainstorm',
    userMessage: 'Give me 10 creative coffee shop name ideas.',
    answer: `Here are 10 coffee shop names: Bean Theory, The Daily Grind, Steam & Stone, Roast Republic, Mugshot, Crema, Percolate, Brew Haven, The Tamped Cup, Ground Control.`,
    isNullState: true,
  },
]

export default function Page() {
  const [selectedScenario, setSelectedScenario] = useState('market-entry')
  const [isVerificationOn, setIsVerificationOn] = useState(true)
  const [showFrameFollowUp, setShowFrameFollowUp] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null) // null, 'effort', 'models', or 'verification'
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [isExtendedOn, setIsExtendedOn] = useState(false)

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0]

  const renderAnswer = () => {
    if (scenario.isNullState || !isVerificationOn) {
      return scenario.answer
    }

    const parts = scenario.answer.split(
      new RegExp(`(${scenario.highlightText})`, 'gi')
    )

    return (
      <>
        {parts.map((part, idx) => (
          <span
            key={idx}
            className={
              part.toLowerCase() === scenario.highlightText.toLowerCase()
                ? 'bg-red-500/40 border-b-2 border-red-400/60 pb-0.5'
                : ''
            }
          >
            {part}
          </span>
        ))}
      </>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* SIDEBAR */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Top padding */}
        <div className="p-4 border-b border-sidebar-border">
          <p className="text-xs text-muted-foreground font-semibold">RECENTS</p>
        </div>

        {/* Scenario list */}
        <div className="flex-1 overflow-y-auto">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedScenario(s.id)
                setShowFrameFollowUp(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-2 ${selectedScenario === s.id
                ? 'bg-sidebar-accent border-l-sidebar-primary text-foreground'
                : 'border-l-transparent text-muted-foreground hover:bg-sidebar-accent/50'
                }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold" style={{ backgroundColor: '#D4845A' }}>
              A
            </span>
            <h1 className="text-lg font-semibold">Claude</h1>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl">
            {/* User Message */}
            <div className="flex justify-end mb-8">
              <div className="bg-secondary rounded-2xl px-4 py-3 max-w-lg">
                <p className="text-sm text-foreground">{scenario.userMessage}</p>
              </div>
            </div>

            {/* AI Message */}
            <div className="flex gap-4 mb-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded text-white text-xs font-bold" style={{ backgroundColor: '#D4845A' }}>
                  A
                </span>
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                {/* Response text */}
                <p className="text-base leading-relaxed text-foreground mb-6">
                  {renderAnswer()}
                </p>

                {/* Helper line */}
                {isVerificationOn && !scenario.isNullState && (
                  <p className="text-xs italic text-muted-foreground mb-6">
                    ↗ The lines below show which part to check first — and the assumption it depends on.
                  </p>
                )}

                {/* Verification Footnotes */}
                {isVerificationOn && !scenario.isNullState && (
                  <>
                    <div className="border-t border-border my-4"></div>

                    {/* Keystone footnote line */}
                    <div className="flex items-start gap-2 mb-4 text-xs text-muted-foreground italic">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-medium">Verify this first:</strong> "{scenario.keystoneClaim}" — {scenario.downstreamCount} downstream conclusions depend on this claim.
                      </span>
                    </div>

                    {/* Frame Check footnote line with buttons */}
                    <div className="mb-6">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground italic mb-3">
                        <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-medium">Does this assumption hold?</strong> {scenario.frameCheck}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-6">
                        <button
                          onClick={() => setShowFrameFollowUp(false)}
                          className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground hover:bg-secondary transition"
                        >
                          Yes, that's right
                        </button>
                        <button
                          onClick={() => setShowFrameFollowUp(true)}
                          className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground hover:bg-secondary transition"
                        >
                          No, that's not my situation
                        </button>
                      </div>
                      {showFrameFollowUp && (
                        <div className="ml-6 mt-2 text-xs text-muted-foreground italic">
                          Then revisit the conclusions that depend on this before using the answer.
                        </div>
                      )}
                    </div>

                    {/* Warning if present */}
                    {scenario.hasWarning && (
                      <div className="mb-4 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-medium">Conflicting data:</strong> Note: the answer assumes consent-at-signup is sufficient, but also references 'legitimate interest' later — these are different legal bases.
                        </span>
                      </div>
                    )}

                    <div className="border-t border-border my-4"></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="border-t border-border px-6 py-6 bg-background/50">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Input container */}
            <div className="w-full bg-[#1e1e1e] border border-border/40 rounded-3xl p-4 flex flex-col gap-6 shadow-lg">
              {/* Top input field */}
              <input
                type="text"
                placeholder="Write a message…"
                disabled
                className="w-full bg-transparent outline-none text-foreground placeholder-muted-foreground/60 disabled:opacity-60 text-base px-1"
              />

              {/* Bottom controls row */}
              <div className="flex justify-between items-center px-1">
                {/* Left side actions */}
                <div className="flex items-center gap-3">
                  <button className="text-muted-foreground hover:text-foreground transition p-1" aria-label="Add">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button className="bg-[#24262a] text-[#4d82d6] hover:bg-[#2c2f35] transition p-2 rounded-xl border border-[#2b303b]" aria-label="Projects">
                    <Folder className="w-4 h-4" />
                  </button>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-4">
                  {/* Model picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowModelPicker(!showModelPicker)}
                      className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1 font-medium"
                    >
                      Opus 4.7 <span className="text-xs text-muted-foreground/60 font-light">Max</span> <span>∨</span>
                    </button>

                    {/* Model picker dropdown */}
                    {showModelPicker && (
                      <div className="absolute bottom-full right-0 mb-3 w-56 bg-secondary border border-border rounded-lg shadow-lg z-50">
                        {/* Opus 4.6 */}
                        <div className="px-4 py-3 text-sm text-foreground border-b border-border flex items-center justify-between hover:bg-secondary/80">
                          Opus 4.6
                          <span className="text-blue-400">✓</span>
                        </div>

                        {/* Effort */}
                        <button
                          onClick={() => setActiveSubmenu(activeSubmenu === 'effort' ? null : 'effort')}
                          className="w-full text-left px-4 py-3 text-sm text-foreground border-b border-border flex items-center justify-between hover:bg-secondary/80 transition"
                        >
                          Effort
                          <span className="text-muted-foreground text-xs">Medium &gt;</span>
                        </button>

                        {/* Effort submenu */}
                        {activeSubmenu === 'effort' && (
                          <div className="absolute bottom-0 right-full mr-2 w-48 bg-secondary border border-border rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-border">
                              <p className="text-xs text-muted-foreground">
                                Higher effort means more thorough responses, but takes longer and uses your limits faster.
                              </p>
                            </div>
                            <div className="py-2">
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Low</div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80 flex items-center justify-between">
                                Medium <span className="text-muted-foreground text-xs bg-border px-1.5 py-0.5 rounded">Default</span> <span className="text-blue-400">✓</span>
                              </div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">High</div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Max</div>
                            </div>
                            <div className="px-3 py-2 border-t border-border text-xs text-foreground flex items-center justify-between">
                              <span>Extended</span>
                              <button
                                onClick={() => setIsExtendedOn(!isExtendedOn)}
                                className="relative w-4 h-4 rounded border border-border bg-input flex items-center justify-center hover:bg-secondary transition"
                              >
                                {isExtendedOn && <span className="text-primary text-xs">✓</span>}
                              </button>
                            </div>
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              Always uses deep reasoning
                            </div>
                          </div>
                        )}

                        {/* More models */}
                        <button
                          onClick={() => setActiveSubmenu(activeSubmenu === 'models' ? null : 'models')}
                          className="w-full text-left px-4 py-3 text-sm text-foreground border-b border-border flex items-center justify-between hover:bg-secondary/80 transition"
                        >
                          More models
                          <span className="text-muted-foreground text-xs">&gt;</span>
                        </button>

                        {/* More models submenu */}
                        {activeSubmenu === 'models' && (
                          <div className="absolute bottom-0 right-full mr-2 w-40 bg-secondary border border-border rounded-lg shadow-lg z-50">
                            <div className="py-2">
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Opus 4.7</div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Sonnet 4.6</div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Haiku 4.5</div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Opus 4.8</div>
                              <div className="px-4 py-2 text-xs text-foreground hover:bg-secondary/80">Opus 3</div>
                            </div>
                          </div>
                        )}

                        {/* Verification */}
                        <button
                          onClick={() => setActiveSubmenu(activeSubmenu === 'verification' ? null : 'verification')}
                          className="w-full text-left px-4 py-3 text-sm text-foreground flex items-center justify-between hover:bg-secondary/80 transition"
                        >
                          Verification
                          <span className="text-muted-foreground text-xs">&gt;</span>
                        </button>

                        {/* Verification submenu */}
                        {activeSubmenu === 'verification' && (
                          <div className="absolute bottom-0 right-full mr-2 w-56 bg-secondary border border-border rounded-lg shadow-lg z-[60]">
                            <div className="p-3 border-b border-border">
                              <p className="text-xs text-muted-foreground">
                                Shows which claims in the response are structurally load-bearing, so you can focus your review on what matters most.
                              </p>
                            </div>
                            <div className="py-2">
                              <button
                                onClick={() => setIsVerificationOn(false)}
                                className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-secondary/80 flex items-center justify-between"
                              >
                                Off
                                {!isVerificationOn && <span className="text-blue-400">✓</span>}
                              </button>
                              <button
                                onClick={() => setIsVerificationOn(true)}
                                className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-secondary/80 flex items-center justify-between"
                              >
                                On
                                {isVerificationOn && <span className="text-blue-400">✓</span>}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Microphone */}
                  <button className="text-muted-foreground hover:text-foreground transition p-1" aria-label="Voice input">
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Audio Waveform icon */}
                  <button className="text-muted-foreground hover:text-foreground transition p-1 flex items-center justify-center" aria-label="Audio waveform">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 10v4" />
                      <path d="M6 6v12" />
                      <path d="M9 3v18" />
                      <path d="M12 7v10" />
                      <path d="M15 5v14" />
                      <path d="M18 8v8" />
                      <path d="M21 11v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground/80 mt-3 text-center">
              Claude is AI and can make mistakes. Please double-check responses.
            </p>
          </div>
        </div>


      </div>
    </div>
  )
}
