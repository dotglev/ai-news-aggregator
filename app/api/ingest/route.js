import { NextResponse } from 'next/server'
import { fetchNewsByTopic } from '@/lib/newsapi'
import { analyzeArticle } from '@/lib/groq'
import { supabase } from '@/lib/supabase'

const TOPICS = [
  { name: 'Bitcoin', type: 'crypto' },
  { name: 'Ethereum', type: 'crypto' },
  { name: 'Coinbase', type: 'competitor' },
  { name: 'SEC crypto', type: 'market' },
  { name: 'S&P 500', type: 'stocks' },
  { name: 'Federal Reserve', type: 'market' },
]

export async function GET() {
  try {
    let totalSaved = 0

    for (const topic of TOPICS) {
      // 1. Insert topic first, get ID back
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .upsert({ name: topic.name, type: topic.type }, { onConflict: 'name' })
        .select('id')
        .single()

      console.log('Topic saved:', topic.name, topicData, topicError)

      if (!topicData) continue

      // 2. Fetch news
      const articles = await fetchNewsByTopic(topic.name)

      for (const article of articles) {
        if (!article.url || !article.title) continue

        // 3. Save article
        const { data: savedArticle } = await supabase
          .from('articles')
          .upsert({
            title: article.title,
            url: article.url,
            source: article.source?.name,
            published_at: article.publishedAt,
            content: article.description || article.content || ''
          }, { onConflict: 'url' })
          .select('id')
          .single()

        if (!savedArticle) continue

        // 4. Analyze with Groq AI
        try {
          const analysis = await analyzeArticle(
            article.title,
            article.description || '',
            topic.name
          )

          // 5. Save mention with topic_id
          await supabase.from('mentions').upsert({
            article_id: savedArticle.id,
            topic_id: topicData.id,
            sentiment: analysis.sentiment,
            summary: analysis.summary,
            relevance_score: analysis.relevance_score
          })

          totalSaved++
        } catch (e) {
          console.error('AI error:', e.message)
        }
      }
    }

    return NextResponse.json({ success: true, message: `Processed ${totalSaved} articles` })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
