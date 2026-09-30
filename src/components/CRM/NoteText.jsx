import React from 'react';

const DATE_REGEX = /^(?:[1-9]|[12]\d|3[01])-(?:[1-9]|1[0-2])$/;
const DATE_SPLIT = /(\b(?:[1-9]|[12]\d|3[01])-(?:[1-9]|1[0-2])\b)/g;

export default function NoteText({ children }) {
  const value = String(children || '');
  if (!value) return null;

  return value.split(DATE_SPLIT).filter(Boolean).map((part, index) => {
    if (DATE_REGEX.test(part)) {
      return (
        <span key={`date-${part}-${index}`} className="crm-note-date-pill">
          {part}
        </span>
      );
    }
    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
}

