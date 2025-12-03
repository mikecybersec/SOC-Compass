const buildPrompt = ({ frameworkName, answers, scores, metadata }) => {
  return `You are an SOC consultant. Build a concise, prioritized action plan.\nFramework: ${frameworkName}\nOrganization: ${metadata.name || 'Unknown'} (${metadata.size || 'size n/a'}) with budget ${metadata.budget || 'n/a'}.\nObjectives: ${(metadata.objectives || []).join(', ') || 'Not specified'}.\nScores: ${JSON.stringify(scores)}\nAnswers: ${JSON.stringify(answers)}\nRespond with 5-8 actionable steps, each including rationale and expected impact.`;
};

export const generateActionPlan = async ({ apiKey, model = 'gpt-4o-mini', frameworkName, answers, scores, metadata }) => {
  if (!apiKey) {
    return {
      steps: [
        'Provide an API key to request an AI action plan.',
      ],
    };
  }

  const prompt = buildPrompt({ frameworkName, answers, scores, metadata });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a seasoned SOC transformation advisor.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('AI provider rejected the request');
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content || '';
    return { raw: content, steps: content.split('\n').filter(Boolean) };
  } catch (error) {
    return {
      steps: ['Failed to generate action plan automatically. Please try again later.'],
      error: error.message,
    };
  }
};

export const buildPromptPreview = (state) => buildPrompt(state);
