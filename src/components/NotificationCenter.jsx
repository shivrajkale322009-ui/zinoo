import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const asDate = (value) => value?.toDate?.() || (value ? new Date(value) : null);

export default function NotificationCenter({ notifications = [], userId, isAdmin = false }) {
  const [open, setOpen] = useState(false);
  const [locallyRead, setLocallyRead] = useState(() => new Set());
  const [error, setError] = useState('');
  const centerRef = useRef(null);
  const visible = notifications
    .filter(item => item.recipientId === userId || (isAdmin && item.recipientId === 'admins'))
    .sort((a, b) => (asDate(b.createdAt)?.valueOf() || 0) - (asDate(a.createdAt)?.valueOf() || 0))
    .slice(0, 30);
  const unread = visible.filter(item => !item.read && !locallyRead.has(item.id)).length;
  const read = async (item) => {
    if (item.read || locallyRead.has(item.id)) return;
    setError('');
    setLocallyRead(current => new Set(current).add(item.id));
    if (item.transient) return;
    try {
      await updateDoc(doc(db, 'notifications', item.id), { read: true, readAt: serverTimestamp() });
    } catch (readError) {
      setLocallyRead(current => { const next = new Set(current); next.delete(item.id); return next; });
      setError('Could not mark this notification as read. Please try again.');
      console.error('Unable to mark notification as read:', readError);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => { if (centerRef.current && !centerRef.current.contains(event.target)) setOpen(false); };
    const closeOnEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [open]);

  return <div className="notification-center" ref={centerRef}>
    <button type="button" className={`notification-trigger${open ? ' active' : ''}`} onClick={() => { setError(''); setOpen(value => !value); }} aria-label="Notifications" aria-haspopup="dialog" aria-expanded={open}>
      <Bell size={19}/>{unread > 0 && <span>{unread > 9 ? '9+' : unread}</span>}
    </button>
    {open && <div className="notification-popover" role="dialog" aria-label="Notifications">
      <header><strong>Notifications</strong><button type="button" onClick={() => setOpen(false)}><X size={17}/></button></header>
      {error && <p className="notification-error" role="alert">{error}</p>}
      {!visible.length ? <p className="notification-empty">You’re all caught up.</p> : visible.map(item => { const isRead = item.read || locallyRead.has(item.id); return <button type="button" key={item.id} className={isRead ? 'read' : ''} onClick={() => read(item)} aria-label={`${isRead ? 'Read' : 'Mark as read'}: ${item.title}`}>
        <span className="notification-icon">{isRead ? <Check size={14}/> : <Bell size={14}/>}</span>
        <span><strong>{item.title}</strong><small>{item.message}</small></span>
      </button>; })}
    </div>}
  </div>;
}
