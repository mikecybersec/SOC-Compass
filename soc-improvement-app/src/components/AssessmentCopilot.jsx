import React, { useEffect, useMemo, useRef, useState } from 'react';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import suggestionsData from '../data/copilot_suggestions_soccmm.json';

const normalizeBase = (apiBase) => (apiBase?.trim() || 'https://api.x.ai/v1/').replace(/\/+$/, '');

const buildAssessmentContext = (assessment) => {
  if (!assessment) return 'No assessment available.';

  const framework = frameworks[assessment.frameworkId] || frameworks[defaultFrameworkId];
  const questionLookup = {};

  framework.aspects.forEach((aspect) => {
    aspect.questions.forEach((question) => {
      questionLookup[question.code] = {
        domain: aspect.domain,
        aspect: aspect.aspect,
        text: question.text,
        guidance: question.guidance,
        answerOptions: question.answerOptions,
        questionType: question.questionType,
      };
    });
  });

  return JSON.stringify(
    {
      framework: { id: framework.id, name: framework.name },
      metadata: assessment.metadata,
      answers: assessment.answers,
      notes: assessment.notes,
      actionPlan: assessment.actionPlan,
      questionLookup,
    },
    null,
    2
  );
};

const AssessmentCopilot = () => {
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const model = useAssessmentStore((s) => s.model);
  const assessment = useAssessmentStore((s) => s.currentAssessment);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const listRef = useRef(null);

  const assessmentContext = useMemo(() => buildAssessmentContext(assessment), [assessment]);

  // Get suggestions for current aspect
  const suggestions = useMemo(() => {
    if (!activeAspectKey || !suggestionsData[activeAspectKey]) {
      return [];
    }
    return suggestionsData[activeAspectKey] || [];
  }, [activeAspectKey]);

  // Initialize messages when copilot opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: "Hi, I'm Compass Copilot. Ask me anything about this assessment and I'll answer using the data on the page.",
        },
      ]);
      setShowSuggestions(true);
    }
  }, [open]);

  const systemPrompt = useMemo(
    () =>
      [
        'You are Grok, a concise copilot embedded in a security assessment tool.',
        'Use only the supplied assessment JSON to answer questions about progress, coverage, and next steps.',
        'If a question is unrelated to the assessment data, say you can only discuss the assessment.',
        'Assessment JSON:',
        assessmentContext,
      ].join('\n'),
    [assessmentContext]
  );

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    if (!apiKey) {
      setError('Add an API key in the top navigation to chat with Grok.');
      return;
    }

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${normalizeBase(apiBase)}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'grok-4-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        let message = 'Grok could not complete that request.';
        try {
          const errorPayload = await response.json();
          message = errorPayload?.error?.message || message;
        } catch (parseError) {
          message = response.statusText || message;
        }
        throw new Error(message);
      }

      const payload = await response.json();
      const reply = (payload.choices?.[0]?.message?.content || '').trim() || 'I could not find an answer.';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong while contacting Grok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="copilot-toggle" onClick={() => setOpen((v) => !v)} aria-label="Open Compass Copilot">
        <div className="copilot-toggle-content">
          <Bot className="copilot-toggle-icon" />
          <span className="copilot-toggle-text">Compass Copilot</span>
        </div>
        <div className="copilot-toggle-pulse" />
      </button>

      {open && (
        <div className="copilot-panel">
          <div className="copilot-header">
            <div>
              <p className="copilot-title">Assessment copilot</p>
              <p className="copilot-subtitle">Grok will reference your current assessment JSON.</p>
            </div>
            <button className="copilot-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="copilot-body" ref={listRef}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`copilot-message ${message.role === 'assistant' ? 'copilot-message-assistant' : 'copilot-message-user'}`}
              >
                {message.role === 'assistant' && (
                  <div className="copilot-message-avatar">
                    <Bot className="copilot-avatar-icon" />
                  </div>
                )}
                <div className={`copilot-message-content ${message.role === 'user' ? 'copilot-message-content-user' : ''}`}>
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {showSuggestions && suggestions.length > 0 && (
              <div className="copilot-suggestions">
                <p className="copilot-suggestions-label">Suggested questions:</p>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="copilot-suggestion-button"
                    onClick={() => {
                      setInput(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {loading && <p className="copilot-status">Compass Copilot is thinking…</p>}
          </div>

          <form className="copilot-input" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKey ? 'Ask about this assessment…' : 'Add an API key to chat with Grok'}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              Send
            </button>
          </form>

          {error && <div className="copilot-error">{error}</div>}
        </div>
      )}
    </>
  );
};

export default AssessmentCopilot;
