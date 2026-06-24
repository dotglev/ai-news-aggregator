import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function analyzeArticle(title, content, topic) {
  const chat = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a JSON-only response bot. You never explain anything. You only output valid JSON, nothing else.'
      },
      {
        role: 'user',
        content: `Analyze this news article about "${topic}".
        
Title: ${title}
Content: ${content}

Output ONLY this JSON, no other text:
{
  "summary": "2 sentence summary",
  "sentiment": "positive",
  "relevance_score": 8
}`
      }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.1,
    response_format: { type: 'json_object' }
  })

  const result = chat.choices[0].message.content
  return JSON.parse(result)
}