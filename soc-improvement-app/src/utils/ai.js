/**
 * Validates a Grok API key by making a lightweight request to the models endpoint
 * @param {string} apiKey - The API key to validate
 * @param {string} apiBase - The API base URL (default: https://api.x.ai/v1/)
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateApiKey = async (apiKey, apiBase = 'https://api.x.ai/v1/') => {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key is required' };
  }

  // Basic format check - Grok API keys typically start with 'xai-'
  if (!apiKey.startsWith('xai-') && !apiKey.startsWith('sk-')) {
    // Allow other formats but warn
  }

  const normalizedBase = (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '') || 'https://api.x.ai/v1';

  try {
    // Use the models endpoint as a lightweight validation check
    const response = await fetch(`${normalizedBase}/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: false, error: `API request failed: ${response.status}` };
    }

    // If we get a successful response, the key is valid
    return { valid: true };
  } catch (error) {
    // Network errors or other issues
    return { valid: false, error: error.message || 'Failed to validate API key' };
  }
};

const buildPrompt = ({ frameworkName, answers, scores, metadata }) => {
  const budget = metadata.budgetAmount
    ? `${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`
    : 'n/a';

  return `You are an experienced SOC consultant and capability maturity model (CMM) expert. Analyze the provided assessment data and generate a comprehensive action plan.

**Context:**
- Framework: ${frameworkName}
- Organization: ${metadata.name || 'Unknown'} (${metadata.size || 'size n/a'}) in sector ${metadata.sector || 'n/a'}
- Budget: ${budget}
- SOC Age: ${metadata.socAge || 'n/a'}
- Objectives: ${(metadata.objectives || []).join(', ') || 'Not specified'}
- Assessment Scores: ${JSON.stringify(scores)}
- Detailed Answers: ${JSON.stringify(answers)}

**Required Structure:**

1. **BLUF (Bottom Line Up Front)** - Start with a concise 2-3 paragraph executive summary that provides:
   - Overall CMM maturity assessment (current state)
   - Key strengths and critical gaps
   - Primary maturity level estimate (e.g., Level 1-5 or Initial/Managed/Defined/etc.)
   - Most significant risks or opportunities

2. **Low-Hanging Fruit** - Provide 3-5 quick-win recommendations that are:
   - Relatively inexpensive or resource-unintensive
   - Can be implemented quickly (within weeks to a few months)
   - Have cross-benefits across multiple domains/aspects
   - Provide immediate value or risk reduction
   - For each item, briefly explain the action, why it's low-hanging fruit, and expected cross-benefits

3. **Comprehensive Action Plan** - Provide 5-8 detailed, prioritized action steps that:
   - Address the most critical maturity gaps
   - Are tailored to the organization's size, sector, budget, and SOC age
   - Consider the stated objectives (but maintain flexibility)
   - Include rationale, expected impact, and resource considerations
   - Are sequenced logically (foundational items first, building to more advanced capabilities)

**Guidance:**
- Be practical and realistic given the organization's constraints
- Focus on security leadership, SOC management, and team management where relevant
- Ensure recommendations are attainable based on resources, budget, and sector context
- Consider the objectives but don't overly fixate on them - maintain flexibility
- Use clear, professional language suitable for SOC leaders and executives

Format your response using clear section headers (## BLUF, ## Low-Hanging Fruit, ## Action Plan) and markdown formatting for readability.`;
};

export const generateActionPlan = async ({
  apiKey,
  apiBase = 'https://api.x.ai/v1/',
  model = 'grok-4-latest',
  frameworkName,
  answers,
  scores,
  metadata,
}) => {
  if (!apiKey) {
    return {
      raw: 'Provide an API key to request an AI action plan.',
      steps: [
        'Provide an API key to request an AI action plan.',
      ],
    };
  }

  const normalizedBase = (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '')
    || 'https://api.x.ai/v1';
  const prompt = buildPrompt({ frameworkName, answers, scores, metadata });

  try {
    const response = await fetch(`${normalizedBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a seasoned SOC transformation advisor and capability maturity model expert with deep expertise in security operations centers, SOC management, and leading SOC teams. You provide practical, actionable advice tailored to each organization\'s unique context, constraints, and objectives.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      let message = 'AI provider rejected the request';
      try {
        const errorPayload = await response.json();
        message = errorPayload?.error?.message || message;
      } catch (error) {
        // ignore parse errors and fall back to default message
      }

      if (response.status === 401 || response.status === 403) {
        message = 'The API key or endpoint was rejected. Verify your key, model, and API base for your provider and try again.';
      }

      throw new Error(message);
    }

    const payload = await response.json();
    const content = (payload.choices?.[0]?.message?.content || '').trim();
    return { raw: content, steps: content.split('\n').filter(Boolean) };
  } catch (error) {
    return {
      raw: 'Failed to generate action plan automatically. Please try again later.',
      steps: ['Failed to generate action plan automatically. Please try again later.'],
      error: error.message,
    };
  }
};

export const buildPromptPreview = (state) => buildPrompt(state);

/**
 * Generate aspect-specific recommendations when an aspect is completed
 * @param {Object} params
 * @param {string} params.apiKey - API key
 * @param {string} params.apiBase - API base URL
 * @param {string} params.model - Model name
 * @param {string} params.aspectKey - Aspect key (domain::aspect)
 * @param {Object} params.aspect - Aspect object
 * @param {Object} params.answers - All answers for the aspect
 * @param {Object} params.metadata - Assessment metadata
 * @returns {Promise<{text: string, highlights: Array<{term: string, type: string}>}>}
 */
export const generateAspectRecommendations = async ({
  apiKey,
  apiBase = 'https://api.x.ai/v1/',
  model = 'grok-4-latest',
  aspectKey,
  aspect,
  answers,
  metadata,
}) => {
  if (!apiKey) {
    return {
      text: 'Provide an API key to generate recommendations.',
      highlights: [],
    };
  }

  const normalizedBase = (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '') || 'https://api.x.ai/v1';
  const budget = metadata.budgetAmount
    ? `${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`
    : 'not specified';

  // Get only answers for this aspect
  const aspectAnswers = {};
  aspect.questions.forEach((q) => {
    if (q.isAnswerable && answers[q.code]) {
      aspectAnswers[q.code] = answers[q.code];
    }
  });

  const prompt = `You are a SOC assessment advisor. An aspect "${aspect.aspect}" under domain "${aspect.domain}" has just been completed.

**Context:**
- Organization: ${metadata.name || 'Unknown'} (${metadata.size || 'size n/a'}) in sector ${metadata.sector || 'n/a'}
- Budget: ${budget}
- SOC Age: ${metadata.socAge || 'n/a'}
- Objectives: ${(metadata.objectives || []).join(', ') || 'Not specified'}
- Aspect Answers: ${JSON.stringify(aspectAnswers)}

Generate a SHORT and SNAPPY recommendation (2-3 sentences maximum) that:
1. Summarizes a key insight or recommendation based on the aspect answers
2. Ties to the organization's objectives, budget, and context
3. Is actionable and specific
4. Highlights important terms or concepts (like role names, policies, maturity levels, etc.)

Format your response as plain text only - no markdown, no bullets, just a flowing paragraph. Keep it concise and punchy.`;

  try {
    const response = await fetch(`${normalizedBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a concise SOC assessment advisor. Provide brief, actionable recommendations.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recommendations');
    }

    const payload = await response.json();
    const text = (payload.choices?.[0]?.message?.content || '').trim();

    // Extract potential highlight terms (role names, policy names, maturity levels, etc.)
    const highlights = [];
    const highlightPatterns = [
      /(Level \d+|Initial|Managed|Defined|Quantitatively Managed|Optimizing)/gi,
      /(Admin|Administrator|Engineer|Analyst|Manager|Director|CISO)/gi,
      /(Policy|Procedure|Process|Framework|Standard)/gi,
      /(Access|Security|SOC|SIEM|SOAR|Incident Response)/gi,
    ];

    highlightPatterns.forEach((pattern) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && !highlights.find((h) => h.term.toLowerCase() === match[0].toLowerCase())) {
          highlights.push({
            term: match[0],
            type: match[1] ? 'maturity' : match[2] ? 'role' : match[3] ? 'policy' : 'concept',
          });
        }
      }
    });

    return { text, highlights: highlights.slice(0, 5) }; // Limit to 5 highlights
  } catch (error) {
    return {
      text: 'Unable to generate recommendations at this time.',
      highlights: [],
      error: error.message,
    };
  }
};