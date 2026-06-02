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

Return ONLY valid JSON in this exact format, with no other text:
{
  "keystoneClaim": "The exact keystone claim sentence from the answer",
  "downstreamCount": <number of conclusions that depend on this claim>,
  "frameCheck": "A question that asks the user whether the key assumption behind this claim actually matches their situation. Start with 'This answer is built on the assumption that...' and end with 'Does it?'",
  "highlightText": "The exact substring from the answer to highlight (lowercase, should be a key phrase from the keystone claim, 5-15 words)",
  "isNullState": false
}

If the question is trivially low-stakes (e.g. brainstorming, creative lists, casual questions with no real consequences), return:
{
  "keystoneClaim": "",
  "downstreamCount": 0,
  "frameCheck": "",
  "highlightText": "",
  "isNullState": true
}

Rules:
- keystoneClaim must be an EXACT sentence or clause from the answer
- highlightText must be an EXACT substring from the answer (case-insensitive match will be used)
- highlightText should be the most critical phrase, not the full sentence
- frameCheck should help the user decide if the answer applies to their specific situation
- downstreamCount should reflect how many other conclusions logically depend on the keystone claim`,
        },
        {
          role: 'user',
          content: `Analyze this answer:\n\n"${answer}"`,
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
