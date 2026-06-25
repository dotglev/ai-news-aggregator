'use client'
import { useEffect, useState } from 'react'

const TOPICS = ['Bitcoin', 'Ethereum', 'Coinbase', 'SEC crypto', 'S&P 500', 'Federal Reserve']

const sentimentColor = (s: string) => {
  if (s === 'positive') return 'bg-green-100 text-green-800'
  if (s === 'negative') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

const sentimentEmoji = (s: string) => {
  if (s === 'positive') return '🟢'
  if (s === 'negative') return '🔴'
  return '🟡'
}

export default function Home() {
  const [activeTopic, setActiveTopic] = useState('Bitcoin')
  const [mentions, setMentions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMentions() {
      setLoading(true)
      const res = await fetch(`/api/mentions?topic=${encodeURIComponent(activeTopic)}`)
      const data = await res.json()
      setMentions(data)
      setLoading(false)
    }
    fetchMentions()
  }, [activeTopic])

  const positive = mentions.filter(m => m.sentiment === 'positive').length
  const negative = mentions.filter(m => m.sentiment === 'negative').length
  const neutral = mentions.filter(m => m.sentiment === 'neutral').length

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">🧠 Market Intelligence</h1>
        <p className="text-gray-400 text-sm">AI-powered briefings • Updated live</p>
      </div>
      <div className="flex h-[calc(100vh-65px)]">
        <div className="w-56 border-r border-gray-800 p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Topics</p>
          {TOPICS.map(topic => (
            <button key={topic} onClick={() => setActiveTopic(topic)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTopic === topic ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              {topic}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{activeTopic}</h2>
            <p className="text-gray-400 text-sm mt-1">{mentions.length} intelligence reports today</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{positive}</div>
              <div className="text-sm text-green-300">Positive</div>
            </div>
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{negative}</div>
              <div className="text-sm text-red-300">Negative</div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{neutral}</div>
              <div className="text-sm text-yellow-300">Neutral</div>
            </div>
          </div>
          {loading ? (
            <div className="text-gray-400 text-center py-20">Loading intelligence...</div>
          ) : mentions.length === 0 ? (
            <div className="text-gray-400 text-center py-20">No data for this topic yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {mentions.map((mention, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${sentimentColor(mention.sentiment)}`}>
                      {sentimentEmoji(mention.sentiment)} {mention.sentiment?.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Relevance: <span className="text-white font-bold">{mention.relevance_score}/10</span></span>
                      <span className="text-xs text-gray-600">{mention.articles?.source}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-3 leading-snug">{mention.articles?.title}</h3>
                  <div className="bg-gray-800 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-400 font-semibold mb-1">🤖 AI INTELLIGENCE</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{mention.summary}</p>
                  </div>
                  <a href={mention.articles?.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Read full article →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
