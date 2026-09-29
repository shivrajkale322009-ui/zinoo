import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function BuyerDetailSection({ title, className = '', style, children }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section className={`reference-section buyer-detail-section ${className}`} style={style}>
      <h3 className="buyer-detail-heading">
        <button type="button" className="buyer-detail-toggle" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((value) => !value)}>
          <span>{title}</span><ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </h3>
      <div id={contentId} className={`buyer-detail-collapse${expanded ? ' is-expanded' : ''}`} aria-hidden={!expanded} inert={expanded ? undefined : ''}>
        <div className="buyer-detail-collapse-inner">{children}</div>
      </div>
    </section>
  );
}
