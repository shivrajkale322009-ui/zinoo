import React, { useId, useRef, useState } from 'react';

export default function CashbackProjectSelect({ projects, value, onChange }) {
  const id = useId();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = projects.find((project) => project.id === value);
  const matches = projects.filter((project) => project.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const active = matches[activeIndex];

  const select = (project) => {
    onChange(project.id);
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.setCustomValidity('');
  };

  return (
    <div className="cashback-project-select" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
        setQuery('');
        setActiveIndex(-1);
      }
    }}>
      <label htmlFor={id}>Select the project</label>
      <input
        ref={inputRef}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-activedescendant={open && active ? `${id}-option-${activeIndex}` : undefined}
        autoComplete="off"
        required
        placeholder="Search projects…"
        value={open ? query : selected?.name || ''}
        onFocus={() => { setOpen(true); setQuery(''); setActiveIndex(-1); }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
          onChange('');
          event.target.setCustomValidity(event.target.value ? 'Choose a project from the search results.' : '');
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) => matches.length ? (index + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length : -1);
          } else if (event.key === 'Enter' && open) {
            event.preventDefault();
            if (active) select(active);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            setQuery('');
            setActiveIndex(-1);
          }
        }}
      />
      {open && <div id={`${id}-options`} className="cashback-project-options" role="listbox" aria-label="Projects">
        {matches.map((project, index) => (
          <div
            key={project.id}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={project.id === value}
            className={index === activeIndex ? 'is-active' : ''}
            ref={(element) => { if (element && index === activeIndex) element.scrollIntoView({ block: 'nearest' }); }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(project)}
          >{project.name}</div>
        ))}
        {matches.length === 0 && <p role="status">{projects.length ? 'No projects found.' : 'No projects available.'}</p>}
      </div>}
    </div>
  );
}
