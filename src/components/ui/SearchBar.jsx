import { isValidElement } from 'react';
import { Search } from 'lucide-react';

/**
 * Zinoo's single canonical search field.
 * Keep layout and visual styling centralized here; screens provide behavior only.
 */
export default function SearchBar({
  placeholder = 'Search projects, layouts or locations...',
  value = '',
  onChange,
  onTap,
  readOnly = false,
  autoFocus = false,
  leadingIcon,
  trailingWidget,
  onKeyDown,
  ariaLabel,
  className = '',
  inputRef
}) {
  const LeadingIcon = leadingIcon || Search;

  return (
    <label
      className={`zinoo-search-bar ${readOnly ? 'is-read-only' : ''} ${className}`.trim()}
      onClick={onTap}
    >
      <span className="zinoo-search-leading" aria-hidden="true">
        {isValidElement(leadingIcon) ? leadingIcon : <LeadingIcon size={20} />}
      </span>
      <input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
      />
      {trailingWidget && <span className="zinoo-search-trailing">{trailingWidget}</span>}
    </label>
  );
}
