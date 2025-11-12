import OpenAI from 'openai';
import { config } from '../config/index.js';
import { db } from '../db/client.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

interface Character {
  id: string;
  name: string;
  type: string;
  alignment: string;
  description: string;
  can_say?: string[];
  must_cite?: string[];
  cannot_say?: string[];
  style?: any;
  enable_deception_flags?: boolean;
  enable_counter_voice?: boolean;
}

interface GenerateResponseOptions {
  character: Character;
  userMessage: string;
  threadId: string;
  language: string;
}

export async function* generateResponse(options: GenerateResponseOptions) {
  const { character, userMessage, threadId, language } = options;

  // Get conversation history
  const historyResult = await db.query(
    `SELECT role, text, character_id FROM messages
     WHERE thread_id = $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [threadId]
  );

  const history = historyResult.rows.reverse();

  // Build system prompt
  const systemPrompt = buildSystemPrompt(character, language);

  // Build messages for OpenAI
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  // Stream response from OpenAI
  const stream = await openai.chat.completions.create({
    model: config.openaiModel,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2000,
  });

  let fullText = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullText += content;
      yield { type: 'content', content };

      // Extract citations on the fly
      const citations = extractCitations(fullText);
      for (const citation of citations) {
        if (!fullText.includes(`[${citation}]`)) {
          continue;
        }
        yield { type: 'citation', citation };
      }
    }
  }

  // Check for policy violations
  const policyViolations = checkPolicyViolations(character, fullText);
  if (policyViolations.length > 0) {
    for (const violation of policyViolations) {
      yield { type: 'flag', flag: violation };
    }
  }
}

function buildSystemPrompt(character: Character, language: string): string {
  let prompt = `You are ${character.name}. ${character.description}\n\n`;

  prompt += `IMPORTANT GUIDELINES:\n`;
  prompt += `1. Speak authentically as ${character.name} would, maintaining their biblical voice and perspective.\n`;
  prompt += `2. All doctrinal, historical, or ethical claims MUST include verse citations in the format [Book Chapter:Verse] (e.g., [John 3:16]).\n`;
  prompt += `3. When discussing events or teachings, reference specific Scripture passages.\n`;
  prompt += `4. If asked about matters outside your biblical knowledge, acknowledge this limitation.\n`;

  if (character.alignment === 'antagonist') {
    prompt += `5. You may reflect deceptive or antagonistic qualities as portrayed in Scripture. However, all deceptive statements will be automatically flagged for educational context.\n`;
  }

  if (character.type === 'divine' && character.name === 'God') {
    prompt += `5. As God, you speak only through canonical quotations or attributed theological summaries. Every statement must be directly supported by Scripture citations.\n`;
  }

  if (character.can_say && character.can_say.length > 0) {
    prompt += `\nYou may reference and speak about these books: ${character.can_say.join(', ')}\n`;
  }

  if (character.cannot_say && character.cannot_say.length > 0) {
    prompt += `\nYou MUST NOT provide: ${character.cannot_say.join(', ')}\n`;
  }

  if (character.style) {
    const style = character.style;
    if (style.tone) {
      prompt += `\nTone: ${style.tone}\n`;
    }
  }

  if (language !== 'en') {
    prompt += `\nRespond in ${language}, but preserve original Scripture quotations with translations provided.\n`;
  }

  prompt += `\nEDUCATIONAL PURPOSE: Your responses are for educational and devotional purposes. You do not provide personal prophecies, medical advice, or legal guidance.\n`;

  return prompt;
}

function extractCitations(text: string): string[] {
  const citationPattern = /\[([^\]]+)\]/g;
  const citations: string[] = [];
  let match;

  while ((match = citationPattern.exec(text)) !== null) {
    const citation = match[1];
    // Simple validation: should contain book name and chapter:verse
    if (citation.includes(':') && /[0-9]/.test(citation)) {
      citations.push(citation);
    }
  }

  return [...new Set(citations)]; // Remove duplicates
}

function checkPolicyViolations(character: Character, text: string): string[] {
  const violations: string[] = [];

  if (character.cannot_say) {
    for (const forbidden of character.cannot_say) {
      const patterns: Record<string, RegExp> = {
        personal_prophecy: /\b(will happen|will be|prophecy for you|future.*you)\b/i,
        modern_politics: /\b(vote|election|democrat|republican|political party)\b/i,
        incitement: /\b(you should harm|attack|violence against)\b/i,
      };

      if (patterns[forbidden] && patterns[forbidden].test(text)) {
        violations.push(forbidden);
      }
    }
  }

  return violations;
}

export async function validateCitations(
  text: string,
  citations: string[]
): Promise<{ valid: boolean; deceptionRisk?: boolean }> {
  // In a real implementation:
  // 1. Check that citations exist in the database
  // 2. Verify that claims match citation content
  // 3. Flag potential misrepresentations

  // Placeholder implementation
  const allCitationsExist = citations.length > 0;

  return {
    valid: allCitationsExist,
    deceptionRisk: false, // Would be determined by citation analysis
  };
}
