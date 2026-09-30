import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function BuyerDetailSection({ title, icon: Icon, className = '', style, children }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <section className={`reference-section buyer-detail-section ${className}`} style={style}>
      <h3 className="buyer-detail-heading">
        <button type="button" className="buyer-detail-toggle" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((value) => !value)}>
          <span className="buyer-detail-title-group">
            {Icon && <Icon size={18} strokeWidth={1.8} className="buyer-detail-category-icon" aria-hidden="true" />}
            <span className="buyer-detail-title-text">{title}</span>
          </span>
          <span className="buyer-detail-chevron-circle">
            <ChevronDown size={15} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
      </h3>
      <div id={contentId} className={`buyer-detail-collapse${expanded ? ' is-expanded' : ''}`} aria-hidden={!expanded} inert={expanded ? undefined : ''}>
        <div className="buyer-detail-collapse-inner">{children}</div>
      </div>
    </section>
  );
}
