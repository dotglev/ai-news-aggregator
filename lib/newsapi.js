import axios from 'axios'

const API_KEY = process.env.NEWS_API_KEY
const BASE_URL = 'https://newsapi.org/v2'

export async function fetchNewsByTopic(topic) {
  const response = await axios.get(`${BASE_URL}/everything`, {
    params: {
      q: topic,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 10,
      apiKey: API_KEY
    }
  })
  return response.data.articles
}
