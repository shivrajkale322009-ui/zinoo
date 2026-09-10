import { useMemo, useState } from 'react';
import {
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileText,
  Flag,
  Headphones,
  Home,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
  Wrench,
  X
} from 'lucide-react';

const SUPPORT_PHONE = String(import.meta.env.VITE_FLINOK_SUPPORT_PHONE || '').replace(/[^\d+]/g, '');
const WHATSAPP_PHONE = String(import.meta.env.VITE_FLINOK_WHATSAPP_PHONE || SUPPORT_PHONE).replace(/[^\d]/g, '');

const ACTIONS = [
  {
    id: 'ai',
    eyebrow: 'AI Assistant',
    title: 'Chat with AI',
    subtitle: 'Get instant answers 24×7',
    icon: Bot,
    tone: 'blue'
  },
  {
    id: 'whatsapp',
    eyebrow: 'WhatsApp Support',
    title: 'WhatsApp Support',
    subtitle: 'Chat directly with our support team',
    icon: MessageCircle,
    tone: 'green'
  },
  {
    id: 'call',
    eyebrow: 'Call Support',
    title: 'Call Support',
    subtitle: 'Talk to a support executive',
    icon: Phone,
    tone: 'gold'
  }
];

const CATEGORIES = [
  { label: 'Cashback', icon: CircleDollarSign },
  { label: 'Property Information', icon: Home },
  { label: 'Site Visit', icon: CalendarDays },
  { label: 'Seller Issue', icon: UserRound },
  { label: 'Documents', icon: FileText },
  { label: 'Payments', icon: CreditCard },
  { label: 'Technical Issue', icon: Wrench },
  { label: 'Report Listing', icon: Flag },
  { label: 'Other', icon: Headphones }
];

const FAQS = [
  ['How does cashback work?', 'Book an eligible plot through Zinoo and submit the required purchase proof. Your eligible cashback is verified before payout.'],
  ['How do I book a site visit?', 'Open a project, choose Book Site Visit, and select your preferred date and time. Our team will confirm the visit.'],
  ['How is a property verified?', 'Zinoo checks the project information and available legal documents before showing the Verified status.'],
  ['When will I receive cashback?', 'The payout timeline starts after your booking and documents are verified. You can follow its progress in Cashback.'],
  ['How do I contact a seller?', 'Open the property details and use the call or WhatsApp action to contact the seller directly.']
];

const QUICK_REPLIES = {
  Cashback: 'Zinoo cashback is available on eligible bookings. Open Cashback to check eligibility, submit proof, and track verification.',
  'Property Information': 'Open any project to see pricing, plot sizes, location, amenities, documents, and seller contact details.',
  'Site Visit': 'Choose a project and tap Book Site Visit. Select a convenient date and Zinoo will help coordinate the visit.',
  'Seller Issue': 'Tell us which seller or project you need help with. Please avoid sharing payment PINs or passwords.',
  Documents: 'Verified project documents are available inside the property details when the seller has provided them.',
  Payments: 'For payment help, keep your transaction reference ready. Never share your OTP, UPI PIN, or card PIN.',
  'Technical Issue': 'Tell us what happened and which screen you were using. A screenshot can help the support team diagnose it faster.',
  'Report Listing': 'Share the project name and what looks incorrect. Zinoo will review the listing without exposing your identity to the seller.',
  Other: 'Tell us what you need help with and we will guide you to the fastest next step.'
};

function loadRecentRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem('flinokSupportRequests') || '[]');
    return Array.isArray(stored) ? stored.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export default function BuyerSupportScreen() {
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTopic, setChatTopic] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const recentRequests = useMemo(loadRecentRequests, []);

  const openChat = (topic = '') => {
    setChatTopic(topic);
    setMessage('');
    setNotice('');
    setChatOpen(true);
  };

  const openWhatsApp = () => {
    if (!WHATSAPP_PHONE) {
      setNotice('WhatsApp support is being configured. Please use AI Assistant for immediate help.');
      return;
    }
    const text = encodeURIComponent('Hi Zinoo Support, I need help with my property search.');
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const callSupport = () => {
    if (!SUPPORT_PHONE) {
      setNotice('Call support is being configured. Please use AI Assistant for immediate help.');
      return;
    }
    window.location.href = `tel:${SUPPORT_PHONE}`;
  };

  const handleAction = (id) => {
    if (id === 'ai') openChat();
    if (id === 'whatsapp') openWhatsApp();
    if (id === 'call') callSupport();
  };

  const submitQuestion = (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question) return;
    setChatTopic(question);
    setMessage('');
  };

  return (
    <main className="buyer-support-screen" aria-label="Customer Support">
      <div className="buyer-support-container">
        <header className="buyer-support-header">
          <span className="buyer-support-kicker">Buyer care</span>
          <h1>Customer Support</h1>
          <p>How can we help you today?</p>
        </header>

        <section className="buyer-support-primary" aria-label="Contact support">
          {ACTIONS.map(({ id, eyebrow, title, subtitle, icon: Icon, tone }) => (
            <button
              key={id}
              type="button"
              className={`buyer-support-action support-tone-${tone}`}
              onClick={() => handleAction(id)}
            >
              <span className="buyer-support-action-icon"><Icon aria-hidden="true" /></span>
              <span className="buyer-support-action-copy">
                <small>{eyebrow}</small>
                <strong>{title}</strong>
                <span>{subtitle}</span>
              </span>
              <ChevronRight className="buyer-support-chevron" aria-hidden="true" />
            </button>
          ))}
        </section>

        {notice && <div className="buyer-support-notice" role="status">{notice}</div>}

        <section className="buyer-support-section">
          <div className="buyer-support-section-title">
            <h2>What do you need help with?</h2>
          </div>
          <div className="buyer-support-category-grid">
            {CATEGORIES.map(({ label, icon: Icon }) => (
              <button key={label} type="button" className="buyer-support-category" onClick={() => openChat(label)}>
                <span><Icon aria-hidden="true" /></span>
                <strong>{label}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="buyer-support-section">
          <div className="buyer-support-section-title">
            <h2>Recent Requests</h2>
          </div>
          {recentRequests.length ? (
            <div className="buyer-support-requests">
              {recentRequests.map((request) => (
                <button key={request.id} type="button" onClick={() => openChat(request.title)}>
                  <span>
                    <strong>{request.title}</strong>
                    <small>{request.createdDate || 'Recently'}</small>
                  </span>
                  <em className={`support-status support-status-${String(request.status || 'waiting').toLowerCase().replace(/\s+/g, '-')}`}>
                    {request.status || 'Waiting'}
                  </em>
                  <ChevronRight aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <div className="buyer-support-empty">
              <span><ShieldCheck aria-hidden="true" /></span>
              <div>
                <strong>No support requests yet</strong>
                <p>When you contact Zinoo, your conversations will appear here.</p>
              </div>
            </div>
          )}
        </section>

        <section className="buyer-support-section buyer-support-faq">
          <div className="buyer-support-section-title">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="buyer-support-accordion">
            {FAQS.map(([question, answer], index) => {
              const expanded = openFaq === index;
              return (
                <div key={question} className={expanded ? 'expanded' : ''}>
                  <button type="button" onClick={() => setOpenFaq(expanded ? null : index)} aria-expanded={expanded}>
                    <strong>{question}</strong>
                    <ChevronDown aria-hidden="true" />
                  </button>
                  {expanded && <p>{answer}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {chatOpen && (
        <div className="buyer-support-chat-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setChatOpen(false);
        }}>
          <section className="buyer-support-chat" role="dialog" aria-modal="true" aria-labelledby="support-chat-title">
            <header>
              <span><Bot aria-hidden="true" /></span>
              <div>
                <h2 id="support-chat-title">Zinoo AI</h2>
                <p>Buyer help • Available 24×7</p>
              </div>
              <button type="button" onClick={() => setChatOpen(false)} aria-label="Close AI chat"><X /></button>
            </header>
            <div className="buyer-support-chat-body">
              <div className="buyer-support-message">
                <Bot aria-hidden="true" />
                <p>{chatTopic ? (QUICK_REPLIES[chatTopic] || `I can help with “${chatTopic}”. Choose a support topic below or describe what you need.`) : 'Hi! I’m Zinoo AI. What can I help you with today?'}</p>
              </div>
              <div className="buyer-support-chat-prompts">
                {['Cashback', 'Site Visit', 'Documents', 'Payments'].map((topic) => (
                  <button key={topic} type="button" onClick={() => setChatTopic(topic)}>{topic}</button>
                ))}
              </div>
            </div>
            <form onSubmit={submitQuestion}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask a question..."
                aria-label="Ask Zinoo AI"
                autoFocus
              />
              <button type="submit" aria-label="Send message"><Send /></button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
