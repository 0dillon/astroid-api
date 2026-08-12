import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiConfig } from '../../config/ai.config';

export interface AiInsight {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface AiBriefing {
  greeting: string;
  summary: string;
  generatedAt: string;
  insights: AiInsight[];
  suggestedActions: { label: string; prompt: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

/**
 * AI service: wraps the configured LLM provider (Nvidia NIM / OpenAI-compatible)
 * to generate financial briefings, seed conversations, and respond to chat.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly cfg: AiConfig;

  constructor(private readonly config: ConfigService) {
    this.cfg = this.config.getOrThrow<AiConfig>('ai');
  }

  /** GET /ai/briefing — generates a daily executive briefing. */
  async getBriefing(organizationId: string): Promise<AiBriefing> {
    const now = new Date().toISOString();

    try {
      const reply = await this.complete(
        `You are a concise CFO-level AI assistant for a financial operating system.
Generate a daily executive briefing for organization ID "${organizationId}".
Return ONLY a JSON object with exactly these fields:
{
  "greeting": "<short greeting, mention the time of day>",
  "summary": "<2 sentence summary of the day>",
  "insights": [
    { "id": "i1", "title": "<title>", "detail": "<detail>", "severity": "info|success|warning|danger" },
    { "id": "i2", "title": "<title>", "detail": "<detail>", "severity": "info|success|warning|danger" }
  ],
  "suggestedActions": [
    { "label": "<short label>", "prompt": "<follow-up question the user can ask>" },
    { "label": "<short label>", "prompt": "<follow-up question>" }
  ]
}`,
      );

      const parsed = JSON.parse(reply);
      return {
        greeting: parsed.greeting ?? 'Good day.',
        summary: parsed.summary ?? 'All systems nominal.',
        generatedAt: now,
        insights: parsed.insights ?? [],
        suggestedActions: parsed.suggestedActions ?? [],
      };
    } catch (err) {
      this.logger.warn('AI briefing generation failed — returning fallback', err);
      return {
        greeting: 'Good day.',
        summary: 'The AI briefing service encountered an issue. All core systems remain operational.',
        generatedAt: now,
        insights: [
          { id: 'fallback-1', title: 'AI service degraded', detail: 'Briefings are temporarily unavailable.', severity: 'warning' },
        ],
        suggestedActions: [
          { label: 'Check analytics', prompt: 'Show me the analytics overview.' },
          { label: 'Review budgets', prompt: 'What is the current budget utilization?' },
        ],
      };
    }
  }

  /** GET /ai/assistant/seed — returns a seeded conversation transcript. */
  getSeed(): ChatMessage[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'seed-1',
        role: 'assistant',
        content:
          'Hello! I\'m your Astroid AI Copilot. I can help you analyze spend, review policies, manage agent budgets, and interpret transaction patterns. What would you like to explore today?',
        createdAt: now,
      },
    ];
  }

  /** POST /ai/chat — responds to a free-form user message. */
  async chat(message: string): Promise<string> {
    try {
      return await this.complete(
        `You are a concise, expert financial AI assistant for the Astroid Financial Operating System.
You help operators manage AI agent spending, governance policies, and Stellar blockchain transactions.
Answer the following user message in 1-3 sentences. Be direct and actionable.

User: ${message}`,
      );
    } catch (err) {
      this.logger.warn('AI chat failed', err);
      return 'I encountered an issue connecting to the AI service. Please try again in a moment.';
    }
  }

  // ── private ─────────────────────────────────────────────────────────────

  private async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cfg.providerKey}`,
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AI provider error ${response.status}: ${text}`);
    }

    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = body?.choices?.[0]?.message?.content ?? '';
    return content.trim();
  }
}
