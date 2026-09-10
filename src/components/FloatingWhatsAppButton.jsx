const DEFAULT_MESSAGE = 'Hi, I am looking for a property or plot on Zinoo. Please help me.';

const whatsappIcon = (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path fill="currentColor" d="M16.04 4C9.4 4 4 9.32 4 15.88c0 2.1.56 4.16 1.62 5.96L4 28l6.34-1.64a12.1 12.1 0 0 0 5.7 1.44C22.68 27.8 28 22.46 28 15.88S22.68 4 16.04 4Zm0 21.8c-1.76 0-3.48-.48-4.98-1.38l-.36-.22-3.76.98 1-3.64-.24-.38a9.77 9.77 0 0 1-1.52-5.28c0-5.44 4.42-9.86 9.88-9.86a9.86 9.86 0 0 1 9.84 9.86c0 5.46-4.42 9.92-9.86 9.92Zm5.42-7.38c-.3-.16-1.76-.86-2.04-.96-.28-.1-.48-.16-.68.14-.2.3-.76.96-.94 1.16-.18.2-.34.22-.64.08-.3-.16-1.26-.46-2.4-1.48a9.06 9.06 0 0 1-1.66-2.06c-.18-.3-.02-.46.14-.62.14-.14.3-.34.44-.52.16-.18.2-.3.3-.5.1-.2.06-.38-.02-.54-.08-.14-.68-1.62-.94-2.22-.24-.58-.5-.5-.68-.52h-.58c-.2 0-.52.08-.8.38-.28.3-1.04 1.02-1.04 2.5s1.08 2.9 1.22 3.1c.16.2 2.12 3.22 5.12 4.52.72.3 1.28.5 1.72.64.72.22 1.36.2 1.88.12.58-.08 1.76-.72 2.02-1.42.24-.7.24-1.3.18-1.42-.08-.12-.28-.2-.58-.36Z" />
  </svg>
);

export default function FloatingWhatsAppButton({ phone, message = DEFAULT_MESSAGE, onRequireAuth }) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <div className="floating-whatsapp-entry">
      <a
        className="floating-whatsapp-button"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat now on WhatsApp"
        title="Chat Now"
        onClick={onRequireAuth ? (event) => {
          event.preventDefault();
          onRequireAuth();
        } : undefined}
      >
        {whatsappIcon}
      </a>
    </div>
  );
}
