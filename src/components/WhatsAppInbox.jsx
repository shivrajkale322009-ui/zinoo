import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { MessageCircle, Send } from 'lucide-react';
import { functions, marketingDb } from '../firebaseConfig';

const time = (value) => value?.toDate?.()?.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) || '';

export default function WhatsAppInbox({ onError, onSuccess, initialCampaignId = '' }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [messages, setMessages] = useState([]);
  const messageListRef = useRef(null);
  const [sentMessages, setSentMessages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [sentLoading, setSentLoading] = useState(true);
  const [sentError, setSentError] = useState('');
  const selectedCampaign = campaigns.find((item) => item.id === campaignId) || campaigns[0];
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [accessReady, setAccessReady] = useState(false);
  const selected = useMemo(() => conversations.find((item) => item.id === selectedId) || conversations[0], [conversations, selectedId]);

  useEffect(() => {
    let active = true;
    httpsCallable(functions, 'ensureWhatsAppMarketingAccess')().then(() => { if (active) setAccessReady(true); }).catch((error) => onError(error?.message || 'Unable to verify WhatsApp Inbox access.'));
    return () => { active = false; };
  }, [onError]);
  useEffect(() => accessReady ? onSnapshot(query(collection(marketingDb, 'whatsapp_conversations'), orderBy('lastMessageAt', 'desc'), limit(100)), (snapshot) => {
    const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    setConversations(next);
    setSelectedId((current) => current || next[0]?.id || '');
  }, () => onError('Unable to load WhatsApp inbox.')) : undefined, [accessReady, onError]);
  useEffect(() => {
    if (!accessReady) return undefined;
    return onSnapshot(query(collection(marketingDb, 'whatsapp_campaigns'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCampaigns(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      setSentError('');
      if (snapshot.empty) { setSentMessages([]); setSentLoading(false); }
    }, () => { setSentError('Unable to load campaigns. Reopen the inbox to retry.'); setSentLoading(false); });
  }, [accessReady]);
  useEffect(() => {
    if (!accessReady || !selectedCampaign?.id) return undefined;
    setSentMessages([]);
    setSentLoading(true);
    setSentError('');
    // Campaign-scoped reads match the existing marketing access rules.
    return onSnapshot(query(collection(marketingDb, 'whatsapp_campaigns', selectedCampaign.id, 'recipients'), orderBy('createdAt', 'desc')), (snapshot) => {
      setSentMessages(snapshot.docs.map((item) => ({ ...item.data(), id: item.ref.path })));
      setSentLoading(false);
      setSentError('');
    }, () => { setSentError('Unable to load recipients. Reopen the inbox to retry.'); setSentLoading(false); });
  }, [accessReady, selectedCampaign?.id]);
  useEffect(() => {
    setMessages([]);
    if (!accessReady || !selected?.id) { setMessages([]); return undefined; }
    httpsCallable(functions, 'markWhatsAppConversationRead')({ conversationId: selected.id }).catch(() => undefined);
    return onSnapshot(query(collection(marketingDb, 'whatsapp_conversations', selected.id, 'messages'), orderBy('createdAt', 'desc'), limit(200)), (snapshot) => setMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).reverse()), () => onError('Unable to load this conversation.'));
  }, [accessReady, selected?.id, onError]);
  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const sendReply = async () => {
    const body = reply.trim();
    if (!selected || !body) return;
    setSending(true);
    try {
      await httpsCallable(functions, 'replyToWhatsAppConversation')({ conversationId: selected.id, body });
      setReply('');
      onSuccess('Reply sent.');
    } catch (error) { onError(error?.message || 'Unable to send the reply.'); } finally { setSending(false); }
  };
  const handleReplyKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendReply();
    }
  };

  const sentCount = sentMessages.filter((item) => ['SENT', 'DELIVERED'].includes(item.status)).length;
  const deliveredCount = sentMessages.filter((item) => item.status === 'DELIVERED').length;
  const failedCount = sentMessages.filter((item) => item.status === 'FAILED').length;

  return <section className="whatsapp-inbox">
    <section className="whatsapp-inbox-sent"><header><div><span className="admin-panel-kicker">Cloud API activity</span><h3>Sent messages</h3><p>See who received each campaign and its delivery status.</p></div></header>{campaigns.length > 0 && <div className="whatsapp-campaign-picker"><label htmlFor="inbox-campaign">Campaign</label><select id="inbox-campaign" value={selectedCampaign?.id || ""} onChange={(event) => setCampaignId(event.target.value)}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name || campaign.templateName || "Campaign"} — {time(campaign.createdAt)}</option>)}</select></div>}{!sentLoading && !sentError && <div className="whatsapp-inbox-totals"><span><b>{sentMessages.length}</b> recipients</span><span><b>{sentCount}</b> sent</span><span><b>{deliveredCount}</b> delivered</span><span><b>{failedCount}</b> failed</span></div>}{selectedCampaign?.errorMessage && <p className="whatsapp-sent-error" role="alert">Campaign stopped: {selectedCampaign.errorMessage}</p>}{sentError ? <p className="whatsapp-inbox-empty" role="alert">{sentError}</p> : sentLoading ? <p className="whatsapp-inbox-empty" role="status">Loading recipients…</p> : sentMessages.length ? <div className="whatsapp-sent-message-list">{sentMessages.map((message) => <article key={message.id}><span><strong>{message.leadName || message.phoneNumber || 'Unnamed recipient'}</strong><small>{message.phoneNumber || 'Phone unavailable'}</small></span><span className={`whatsapp-status ${message.status === 'DELIVERED' ? 'success' : message.status === 'FAILED' ? 'danger' : message.status === 'SENT' ? 'info' : 'warning'}`}>{message.status || 'PENDING'}</span><small>{time(message.deliveredAt || message.sentAt || message.createdAt)}</small>{message.errorMessage && <small className="whatsapp-sent-error">{message.errorMessage}</small>}</article>)}</div> : <div className="admin-empty-state-card"><Send size={28} /><h4>No campaign recipients yet</h4><p>Recipients will appear here with their names, phone numbers and delivery status.</p></div>}</section>
    <aside className="whatsapp-inbox-list"><div className="whatsapp-inbox-list-heading"><MessageCircle size={18} /><strong>Customer conversations</strong></div>{conversations.length ? conversations.map((conversation) => <button type="button" className={selected?.id === conversation.id ? 'active' : ''} onClick={() => setSelectedId(conversation.id)} key={conversation.id}><span><strong>{conversation.displayName || conversation.phoneNumber}</strong><small>{conversation.phoneNumber}</small></span><small>{conversation.lastMessageDirection === 'outbound' ? 'You: ' : ''}{conversation.lastMessage || 'No messages yet'}</small>{conversation.unreadCount > 0 && selected?.id !== conversation.id && <b>{conversation.unreadCount}</b>}</button>) : <p className="whatsapp-inbox-empty">Customer replies will appear here.</p>}</aside>
    <section className="whatsapp-inbox-thread">{selected ? <><header><div><h3>{selected.displayName || selected.phoneNumber}</h3><p>{selected.phoneNumber}</p></div></header><div className="whatsapp-inbox-messages" ref={messageListRef}>{messages.map((message) => <article className={message.direction === 'outbound' ? 'outbound' : 'inbound'} key={message.id}><small>{message.direction === 'outbound' ? 'You' : selected.displayName || selected.phoneNumber}</small><p>{message.body}</p><small>{time(message.createdAt)}</small></article>)}</div><div className="whatsapp-inbox-compose"><textarea value={reply} maxLength={4096} placeholder="Write a reply…" onChange={(event) => setReply(event.target.value)} onKeyDown={handleReplyKeyDown} /><button type="button" className="btn-primary" disabled={sending || !reply.trim()} onClick={sendReply}><Send size={17} /> {sending ? 'Sending…' : 'Send'}</button></div><p className="whatsapp-inbox-note">Free-form replies are available only during Meta’s 24-hour customer-service window. Otherwise send an approved template.</p></> : <div className="admin-empty-state-card"><MessageCircle size={28} /><h4>No customer replies yet</h4><p>Incoming WhatsApp messages will appear after Meta sends them to your webhook.</p></div>}</section>
  </section>;
}
