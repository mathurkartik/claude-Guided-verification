import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const MODEL = 'llama-3.3-70b-versatile'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return NextResponse.json(
        { error: 'Groq API key is not configured. Please set GROQ_API_KEY in your environment variables.' },
        { status: 500 }
      )
    }

    // ── Call 1: Generate the answer ──────────────────────────────────
    const answerResponse = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Give a clear, concise answer in 2-4 sentences. Be specific and informative. Do not use markdown formatting.',
        },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 512,
    })

    const answer = answerResponse.choices[0]?.message?.content?.trim()

    if (!answer) {
      return NextResponse.json(
        { error: 'Failed to generate an answer. Please try again.' },
        { status: 500 }
      )
    }

    // ── Call 2: Structural dependency analysis ───────────────────────
    const analysisResponse = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a structural dependency analyzer. Given an AI-generated answer, identify the single most load-bearing claim (the "keystone claim") that other conclusions in the answer depend on.
IMPORTANT: Before identifying a keystone, assess whether the user provided enough context for the answer to be grounded. If the user gave no budget, no constraints, no specifics, and the model invented most of the context (guessed preferences, assumed use case, filled in numbers the user never gave), then the answer is UNDERSPECIFIED. In this case:

Set keystoneClaim to the most critical assumption the model invented
Set frameCheck to: "This answer fills in details you didn't provide. It assumes [list the 2-3 biggest assumptions the model made]. Before trusting any specific recommendation, consider whether these assumptions match your situation."
Set downstreamCount to the number of recommendations that depend on those invented assumptions
Set highlightText to empty string (do not highlight — the whole answer is assumption-dependent, not just one phrase)
Set isNullState to false

For genuinely low-stakes questions (brainstorming, creative lists, greetings), set isNullState to true.
For well-specified questions where the user DID provide context and the answer builds real conclusions on specific claims, identify the keystone normally.
Return ONLY valid JSON in this exact format:
{ "keystoneClaim": "...", "downstreamCount": number, "frameCheck": "...", "highlightText": "...", "isNullState": boolean }
Rules:

keystoneClaim must be an EXACT sentence or clause from the answer (unless the answer is UNDERSPECIFIED, in which case set it to the most critical assumption the model invented)
highlightText must be an EXACT substring from the answer, or empty string if the answer is underspecified
highlightText should be the most critical phrase, not the full sentence
frameCheck should help the user decide if the answer applies to their specific situation
downstreamCount should reflect how many other conclusions logically depend on the keystone claim`,
        },
        {
          role: 'user',
          content: `User query: "${message}"\n\nAI-generated answer:\n"${answer}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    })

    const analysisText = analysisResponse.choices[0]?.message?.content?.trim()

    if (!analysisText) {
      // If analysis fails, return the answer without verification data
      return NextResponse.json({
        answer,
        keystoneClaim: '',
        downstreamCount: 0,
        frameCheck: '',
        highlightText: '',
        isNullState: true,
      })
    }

    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      // If JSON parsing fails, return answer without verification
      return NextResponse.json({
        answer,
        keystoneClaim: '',
        downstreamCount: 0,
        frameCheck: '',
        highlightText: '',
        isNullState: true,
      })
    }

    // Validate that highlightText actually exists in the answer (case-insensitive)
    const highlightText = analysis.highlightText || ''
    const highlightExists = highlightText.length > 0 &&
      answer.toLowerCase().includes(highlightText.toLowerCase())

    return NextResponse.json({
      answer,
      keystoneClaim: analysis.keystoneClaim || '',
      downstreamCount: analysis.downstreamCount || 0,
      frameCheck: analysis.frameCheck || '',
      highlightText: highlightExists ? highlightText : '',
      isNullState: analysis.isNullState || false,
    })
  } catch (error: unknown) {
    console.error('Chat API error:', error)

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
