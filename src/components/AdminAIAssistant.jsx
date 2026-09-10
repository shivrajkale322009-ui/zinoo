import React, { useEffect, useRef, useState } from 'react';
import { Bot, Building, Paperclip, Send, Sparkles, Trash2, User } from 'lucide-react';
import { streamProjectAssistant } from '../services/aiService';

const STARTERS = [
  "What's missing from this listing?",
  'Generate a better description',
  'Suggest pricing improvements',
  'Find legal risks',
  'Write a marketing caption',
  'What documents should I request?'
];

export default function AdminAIAssistant({ projects, contextProjectId, onContextChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const previousProjectId = useRef(contextProjectId);
  const endRef = useRef(null);
  const project = projects.find((item) => item.id === contextProjectId) || null;

  useEffect(() => {
    if (previousProjectId.current !== contextProjectId) {
      setMessages([]);
      setError('');
      previousProjectId.current = contextProjectId;
    }
  }, [contextProjectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async (text) => {
    const question = text.trim();
    if (!question || !project || streaming) return;
    const history = messages.map(({ role, content }) => ({ role, content }));
    setInput('');
    setError('');
    setStreaming(true);
    setMessages((current) => [...current, { role: 'user', content: question }, { role: 'assistant', content: '' }]);
    try {
      const result = await streamProjectAssistant({
        projectId: project.id,
        conversation: history,
        question,
        onChunk: (delta) => setMessages((current) => current.map((message, index) => index === current.length - 1 ? { ...message, content: message.content + delta } : message))
      });
      setMessages((current) => current.map((message, index) => index === current.length - 1 && !message.content ? { ...message, content: result.answer } : message));
    } catch (requestError) {
      setMessages((current) => current.filter((_, index) => index !== current.length - 1));
      setError(requestError?.message || 'The AI Assistant is temporarily unavailable.');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <section className="admin-ai-workspace">
      <header className="admin-ai-toolbar">
        <div className="admin-ai-brand"><span><Sparkles size={20} /></span><div><h2>Zinoo AI Assistant</h2><p>Project-aware listing intelligence</p></div></div>
        <div className="admin-ai-context-controls">
          <label><Building size={15} /><select value={contextProjectId || ''} onChange={(event) => onContextChange(event.target.value || null)}><option value="">Select a property…</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.name || 'Untitled Property'}</option>)}</select></label>
          {project && <button type="button" className="btn-secondary" onClick={() => onContextChange(null)}><Trash2 size={15} /> Clear context</button>}
        </div>
      </header>

      {project ? <div className="admin-ai-context-badge"><Paperclip size={14} /> Currently analyzing: <strong>{project.name || 'Untitled Property'}</strong></div> : <div className="admin-ai-context-empty">Select a property to attach its latest Firestore data.</div>}

      <div className="admin-ai-chat">
        <div className="admin-ai-messages" aria-live="polite">
          {!messages.length && (
            <div className="admin-ai-welcome"><span><Bot size={30} /></span><h3>{project ? `How can I help with ${project.name || 'this property'}?` : 'Attach a property to begin'}</h3><p>The assistant answers only from the currently attached project record.</p>{project && <div className="admin-ai-starters">{STARTERS.map((starter) => <button type="button" key={starter} onClick={() => ask(starter)}>{starter}</button>)}</div>}</div>
          )}
          {messages.map((message, index) => <article key={`${message.role}-${index}`} className={`admin-ai-message ${message.role}`}><span>{message.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}</span><div>{message.content || <i className="admin-ai-thinking">Thinking…</i>}</div></article>)}
          {error && <div className="app-error" role="alert">{error}</div>}
          <div ref={endRef} />
        </div>
        <form className="admin-ai-composer" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); ask(input); } }} disabled={!project || streaming} placeholder={project ? `Ask about ${project.name || 'this property'}…` : 'Select a property to begin'} rows="1" />
          <button type="submit" disabled={!project || streaming || !input.trim()} aria-label="Send message"><Send size={18} /></button>
          <small>AI can make mistakes. Verify legal, pricing, and compliance guidance.</small>
        </form>
      </div>
    </section>
  );
}
