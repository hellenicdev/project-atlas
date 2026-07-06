import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import redis from '../config/redis.js';
import { AppError } from '../utils/response.js';
import logger from '../utils/logger.js';

let groq = null;
let genAI = null;

if (env.groqApiKey) {
  groq = new Groq({ apiKey: env.groqApiKey });
}
if (env.geminiApiKey) {
  genAI = new GoogleGenerativeAI(env.geminiApiKey);
}

const getCacheKey = (type, input) => `ai:${type}:${Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 64)}`;

const groqChat = async (messages) => {
  if (!groq) throw new AppError('AI service not configured', 503, 'AI_ERROR');
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
  });
  return completion.choices[0]?.message?.content || '';
};

const geminiChat = async (prompt) => {
  if (!genAI) throw new AppError('AI fallback not configured', 503, 'AI_ERROR');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const chat = async (userId, message) => {
  const cacheKey = getCacheKey('chat', message);

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return { response: cached, cached: true };
  }

  try {
    const response = await groqChat([
      { role: 'system', content: 'You are Atlas AI, a helpful assistant on the Project Atlas platform.' },
      { role: 'user', content: message },
    ]);

    if (redis) await redis.setex(cacheKey, 3600, response);
    return { response, cached: false };
  } catch (error) {
    logger.error('Groq AI failed, falling back to Gemini:', error.message);
    const response = await geminiChat(message);
    if (redis) await redis.setex(cacheKey, 3600, response);
    return { response, cached: false };
  }
};

export const summarize = async (text) => {
  try {
    return await groqChat([
      { role: 'system', content: 'Summarize the following text concisely.' },
      { role: 'user', content: text },
    ]);
  } catch {
    return await geminiChat(`Summarize this: ${text}`);
  }
};

export const translate = async (text, targetLanguage) => {
  try {
    return await groqChat([
      { role: 'system', content: `Translate the following text to ${targetLanguage}. Return only the translation.` },
      { role: 'user', content: text },
    ]);
  } catch {
    return await geminiChat(`Translate this to ${targetLanguage}: ${text}`);
  }
};

export const ocr = async (imageBase64) => {
  try {
    return await groqChat([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all text from this image:' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ]);
  } catch {
    throw new AppError('OCR processing failed', 503, 'AI_ERROR');
  }
};
