import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { ANALYSIS_PROMPT } from '../assessment';
import dotenv from 'dotenv';

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

async function testAssessment() {
  try {
    // 1. Read transcript
    const transcriptPath = path.join(__dirname, '../../../docs/transcript.txt');
    const transcript = fs.readFileSync(transcriptPath, 'utf8');

    // 2. Call OpenAI
    console.log('🚀 Starting CMO Assessment...\n');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: transcript }
      ],
      response_format: { type: "json_object" }
    });

    // 3. Parse response
    const analysis = JSON.parse(completion.choices[0].message.content);

    // 4. Write outputs
    const outputDir = path.join(__dirname, '../data');
    
    // Ensure directories exist
    fs.mkdirSync(`${outputDir}/profiles`, { recursive: true });
    fs.mkdirSync(`${outputDir}/reports`, { recursive: true });
    
    // Write files
    fs.writeFileSync(
      `${outputDir}/profiles/cmo_analysis.json`, 
      JSON.stringify(analysis, null, 2)
    );

    console.log('✅ Assessment complete! Analysis written to data directory');
    console.log('\n📊 Analysis Results:', analysis);

  } catch (error) {
    console.error('❌ Assessment failed:', error);
  }
}

testAssessment(); 