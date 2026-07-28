import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const asDate = (value) => value?.toDate?.() || (value ? new Date(value) : null);

export default function NotificationCenter({ notifications = [], userId, isAdmin = false }) {
  const [open, setOpen] = useState(false);
  const visible = notifications
    .filter(item => item.recipientId === userId || (isAdmin && item.recipientId === 'admins'))
    .sort((a, b) => (asDate(b.createdAt)?.valueOf() || 0) - (asDate(a.createdAt)?.valueOf() || 0))
    .slice(0, 30);
  const unread = visible.filter(item => !item.read).length;
  const read = async (item) => {
    if (!item.read) await updateDoc(doc(db, 'notifications', item.id), { read: true, readAt: serverTimestamp() });
  };
  return <div className="notification-center">
    <button type="button" className="notification-trigger" onClick={() => setOpen(value => !value)} aria-label="Notifications">
      <Bell size={19}/>{unread > 0 && <span>{unread > 9 ? '9+' : unread}</span>}
    </button>
    {open && <div className="notification-popover">
      <header><strong>Notifications</strong><button type="button" onClick={() => setOpen(false)}><X size={17}/></button></header>
      {!visible.length ? <p className="notification-empty">You’re all caught up.</p> : visible.map(item => <button type="button" key={item.id} className={item.read ? 'read' : ''} onClick={() => read(item)}>
        <span className="notification-icon">{item.read ? <Check size={14}/> : <Bell size={14}/>}</span>
        <span><strong>{item.title}</strong><small>{item.message}</small></span>
      </button>)}
    </div>}
  </div>;
}
