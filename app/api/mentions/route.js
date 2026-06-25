import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get('topic') || 'Bitcoin'

  const { data: topicData } = await supabase
    .from('topics')
    .select('id')
    .eq('name', topic)
    .single()

  if (!topicData) return NextResponse.json([])

  const { data } = await supabase
    .from('mentions')
    .select('*, articles(title, url, source, published_at)')
    .eq('topic_id', topicData.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data || [])
}
