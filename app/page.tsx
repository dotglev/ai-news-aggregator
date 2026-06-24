import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default async function Home() {
  // Fetch all mentions with their related data
  const { data: mentions, error: mentionsError } = await supabase
    .from('mentions')
    .select(`
      id,
      sentiment,
      summary,
      relevance_score,
      created_at,
      topics!inner ( name, type ),
      articles!inner ( title, url, source, published_at )
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  // If there's an error or no data, show a helpful message
  if (mentionsError || !mentions || mentions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 border-b pb-6">
            <h1 className="text-3xl font-bold text-slate-900">Market Intelligence Briefing</h1>
            <p className="text-slate-600 mt-2">AI-powered competitive & market analysis • Updated live</p>
          </header>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h2>
            <p className="text-yellow-700 mb-4">
              {mentionsError ? `Database Error: ${mentionsError.message}` : 'The database is empty. Run the ingest API to fetch news.'}
            </p>
            <pre className="bg-white p-3 rounded text-xs overflow-auto">
              {mentionsError ? JSON.stringify(mentionsError, null, 2) : 'Run: curl http://localhost:3000/api/ingest'}
            </pre>
          </div>
        </div>
      </main>
    )
  }

  // Group mentions by topic
  const groupedByTopic = mentions.reduce((acc, mention) => {
    const topicName = mention.topics?.name || 'Unknown'
    if (!acc[topicName]) {
      acc[topicName] = {
        type: mention.topics?.type || 'general',
        items: []
      }
    }
    acc[topicName].items.push(mention)
    return acc
  }, {} as Record<string, { type: string; items: typeof mentions }>)

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold text-slate-900">Market Intelligence Briefing</h1>
          <p className="text-slate-600 mt-2">AI-powered competitive & market analysis • Updated live</p>
        </header>

        <div className="space-y-8">
          {Object.entries(groupedByTopic).map(([topicName, { type, items }]) => (
            <section key={topicName}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {type.toUpperCase()}
                </Badge>
                <h2 className="text-xl font-semibold text-slate-800">{topicName}</h2>
                <span className="text-sm text-slate-500">({items.length} signals)</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((mention) => (
                  <Card key={mention.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge 
                          variant={
                            mention.sentiment === 'positive' ? 'default' : 
                            mention.sentiment === 'negative' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {mention.sentiment}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(mention.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-medium leading-snug">
                        {mention.articles?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-slate-50 rounded p-3 text-xs space-y-1 mb-3 whitespace-pre-line">
                        {mention.summary}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 truncate max-w-[150px]">
                          Source: {mention.articles?.source}
                        </span>
                        <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
                          <a href={mention.articles?.url} target="_blank" rel="noopener noreferrer">
                            Read Full →
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}