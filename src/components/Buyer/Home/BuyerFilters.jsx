import { useRef, useState } from 'react';
import { BadgeCheck, BadgeIndianRupee, CalendarDays, MapPin, X } from 'lucide-react';
import { formatINR } from '../buyerPresentation';

export default function BuyerFilters({
  hideShortcuts = false,
  filtersOpen,
  activeFilterCount,
  filteredProjectCount,
  mapFilters,
  landZoneOptions,
  naStatusOptions,
  onToggleFilters,
  onCloseFilters,
  onBudgetChange,
  onLandZoneToggle,
  onNaStatusToggle,
  onInstallmentToggle,
  onResetFilters
}) {
  const dragStartY = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);

  const finishDrag = (event) => {
    const distance = dragStartY.current === null ? 0 : Math.max(0, event.clientY - dragStartY.current);
    dragStartY.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (distance >= 72) onCloseFilters();
    setDragOffset(0);
  };

  return (
    <>
      {!hideShortcuts && <div className="buyer-panel-search-row">
        <div className="buyer-filter-chips buyer-home-filter-capsules" aria-label="Property filters">
          <button type="button" className="buyer-filter-shortcut map-mobile-filter-capsule" onClick={onToggleFilters}>
            <BadgeIndianRupee /><span><strong>Budget</strong><small>₹4L – ₹50L</small></span>
          </button>
          <button type="button" className="buyer-filter-shortcut map-mobile-filter-capsule" onClick={onToggleFilters}>
            <MapPin /><span><strong>Zone</strong><small>Explore area</small></span>
          </button>
          <button type="button" className={`buyer-filter-shortcut map-mobile-filter-capsule ${mapFilters.naStatuses?.length ? 'active' : ''}`} onClick={onToggleFilters} aria-haspopup="dialog">
            <BadgeCheck /><span><strong>NA Status</strong><small>Approval status</small></span>
          </button>
          <button type="button" className={`buyer-filter-shortcut map-mobile-filter-capsule ${mapFilters.installmentMax ? 'active' : ''}`} onClick={onInstallmentToggle} aria-pressed={Boolean(mapFilters.installmentMax)}>
            <CalendarDays /><span><strong>Installment</strong><small>Easy EMI</small></span>
          </button>
        </div>
      </div>}

      {filtersOpen && (
        <div className="buyer-filter-layer">
          <button type="button" className="buyer-filter-backdrop" onClick={onCloseFilters} aria-label="Close filters" />
          <div className={`buyer-filter-card ${dragOffset ? 'is-dragging' : ''}`} style={{ '--filter-drag-offset': `${dragOffset}px` }} role="dialog" aria-modal="true" aria-labelledby="buyer-filter-title">
            <button
              type="button"
              className="buyer-filter-drag-handle"
              aria-label="Drag down to close filters"
              onPointerDown={(event) => {
                dragStartY.current = event.clientY;
                event.currentTarget.setPointerCapture?.(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (dragStartY.current !== null) setDragOffset(Math.min(180, Math.max(0, event.clientY - dragStartY.current)));
              }}
              onPointerUp={finishDrag}
              onPointerCancel={(event) => {
                dragStartY.current = null;
                event.currentTarget.releasePointerCapture?.(event.pointerId);
                setDragOffset(0);
              }}
            ><i /></button>
            <div className="buyer-filter-header">
              <h3 id="buyer-filter-title">Filters</h3>
              <button type="button" onClick={onCloseFilters} aria-label="Close filters"><X size={18} /></button>
            </div>
            <div className="buyer-filter-scroll">
              <label className="buyer-filter-range">
                <span>Maximum budget</span><strong>{formatINR(mapFilters.budgetMax)}</strong>
                <input type="range" min="800000" max="5000000" step="100000" value={mapFilters.budgetMax} onChange={onBudgetChange} />
              </label>
              <fieldset className="buyer-filter-group">
                <legend>Land Zone</legend>
                <div className="buyer-filter-option-grid">
                  {landZoneOptions.map((option) => <label key={option.value} className={option.upcoming ? 'is-upcoming' : ''}><input type="checkbox" checked={mapFilters.landZones.includes(option.value)} onChange={() => onLandZoneToggle(option.value)} disabled={option.upcoming} /><span>{option.label}{option.upcoming && <small>Upcoming</small>}</span></label>)}
                </div>
              </fieldset>
              <fieldset className="buyer-filter-group">
                <legend>NA Status</legend>
                <div className="buyer-filter-option-grid">
                  {naStatusOptions.map((option) => <label key={option.value}><input type="checkbox" checked={mapFilters.naStatuses.includes(option.value)} onChange={() => onNaStatusToggle(option.value)} /><span>{option.label}</span></label>)}
                </div>
              </fieldset>
            </div>
            <div className="buyer-filter-actions">
              <button type="button" className="btn-secondary" onClick={onResetFilters}>Reset</button>
              <button type="button" className="btn-primary" onClick={onCloseFilters}>Show {filteredProjectCount} projects</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
