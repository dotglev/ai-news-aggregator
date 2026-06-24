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
      // 1. Fetch news
      const articles = await fetchNewsByTopic(topic.name)

      // 2. Save topic if not exists
      const { data: topicData } = await supabase
        .from('topics')
        .upsert({ name: topic.name, type: topic.type }, { onConflict: 'name' })
        .select()
        .single()

      for (const article of articles) {
        // 3. Save article
        const { data: savedArticle } = await supabase
          .from('articles')
          .upsert({
            title: article.title,
            url: article.url,
            source: article.source?.name,
            published_at: article.publishedAt,
            content: article.description || article.content
          }, { onConflict: 'url' })
          .select()
          .single()

        if (!savedArticle) continue

        // 4. Analyze with Groq AI
        const analysis = await analyzeArticle(
          article.title,
          article.description || '',
          topic.name
        )

        // 5. Save mention
        await supabase.from('mentions').upsert({
          article_id: savedArticle.id,
          topic_id: topicData?.id,
          sentiment: analysis.sentiment,
          summary: analysis.summary,
          relevance_score: analysis.relevance_score
        })

        totalSaved++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${totalSaved} articles` 
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
