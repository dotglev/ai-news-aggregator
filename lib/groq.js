import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function analyzeArticle(title, content, topic) {
  const chat = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a senior financial intelligence analyst. 
        Your job is to extract actionable intelligence from news articles.
        NEVER output generic summaries. ALWAYS use this exact format:
        
        **WHAT:** [One sentence on the core event]
        **WHY:** [The underlying driver or cause]
        **IMPACT:** [Specific market/competitor implication]
        **WHEN/WHERE:** [Timeframe and location if relevant]
        
        Keep it under 60 words total. Be direct. No fluff.`
      },
      {
        role: 'user',
        content: `Analyze this article about "${topic}".
        
        Title: ${title}
        Content: ${content || title}
        
        Output ONLY the structured briefing in the format above.`
      }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.1,
    response_format: { type: 'text' } // Changed from json_object since we want formatted text
  })

  return chat.choices[0].message.content
}