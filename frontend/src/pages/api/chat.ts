import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, message, context } = req.body || {};
  const query = content || message;

  if (!query) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // 1. Try forwarding to Python FastAPI Backend if accessible
  try {
    const authHeader = req.headers.authorization;
    const backendRes = await fetch(`${BACKEND_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify({ content: query })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      return res.status(200).json(data);
    }
  } catch (backendError) {
    console.log('Backend not reachable, serving directly via Vercel serverless AI handler...');
  }

  // 2. Direct Vercel Serverless Gemini API Integration
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'dummy_gemini_api_key_for_dev') {
    try {
      const promptText = context
        ? `Context from study materials:\n${context}\n\nQuestion: ${query}`
        : query;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const responseText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'I analyzed your query based on the available study context.';
        return res.status(200).json({
          message: responseText,
          response: responseText,
          relevant_chunks: []
        });
      }
    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError);
    }
  }

  // 3. Fallback AI Response for Vercel Standalone Mode
  const fallbackResponse = `Efiko AI Assistant (Standalone Mode):\n\nI received your query: "${query}".\n\n${
    context
      ? 'Based on your uploaded study materials, here is the relevant breakdown: ' + context.slice(0, 300) + '...'
      : 'To get contextual RAG answers for specific study topics, upload your PDF or text course materials in the Documents section.'
  }`;

  return res.status(200).json({
    message: fallbackResponse,
    response: fallbackResponse,
    relevant_chunks: []
  });
}