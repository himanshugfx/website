
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a direct listModels on genAI in this specific SDK version easily without fetching.
    // But we can try to initialize some common ones.
    console.log('Testing with key:', apiKey.substring(0, 5) + '...');
    
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05'];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        console.log(`Model ${modelName}: SUCCESS`);
      } catch (err) {
        console.log(`Model ${modelName}: FAILED - ${err.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
