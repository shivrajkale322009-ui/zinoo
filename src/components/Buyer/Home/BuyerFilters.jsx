import { BadgeIndianRupee, CalendarDays, Landmark, MapPin, X } from 'lucide-react';
import { formatINR } from '../buyerPresentation';

export default function BuyerFilters({
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
  onBankLoanChange,
  onInstallmentToggle,
  onResetFilters
}) {
  return (
    <>
      <div className="buyer-panel-search-row">
        <div className="buyer-filter-chips" aria-label="Property filters">
          <button type="button" className="buyer-filter-shortcut" onClick={onToggleFilters}>
            <BadgeIndianRupee /><span><strong>Budget</strong><small>₹4L – ₹30L</small></span>
          </button>
          <button type="button" className="buyer-filter-shortcut" onClick={onToggleFilters}>
            <MapPin /><span><strong>Zone</strong><small>Explore area</small></span>
          </button>
          <button type="button" className={`buyer-filter-shortcut ${mapFilters.bankLoan ? 'active' : ''}`} onClick={() => onBankLoanChange({ target: { checked: !mapFilters.bankLoan } })} aria-pressed={mapFilters.bankLoan}>
            <Landmark /><span><strong>Loan</strong><small>Available</small></span>
          </button>
          <button type="button" className={`buyer-filter-shortcut ${mapFilters.installmentMax ? 'active' : ''}`} onClick={onInstallmentToggle} aria-pressed={Boolean(mapFilters.installmentMax)}>
            <CalendarDays /><span><strong>Installment</strong><small>Easy EMI</small></span>
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="buyer-filter-layer">
          <button type="button" className="buyer-filter-backdrop" onClick={onCloseFilters} aria-label="Close filters" />
          <div className="buyer-filter-card" role="dialog" aria-modal="true" aria-labelledby="buyer-filter-title">
            <div className="buyer-filter-header">
              <div><span>Project discovery</span><h3 id="buyer-filter-title">Filters</h3></div>
              <button type="button" onClick={onCloseFilters} aria-label="Close filters"><X size={18} /></button>
            </div>
            <div className="buyer-filter-scroll">
              <label className="buyer-filter-range">
                <span>Maximum budget</span><strong>{formatINR(mapFilters.budgetMax)}</strong>
                <input type="range" min="800000" max="5000000" step="100000" value={mapFilters.budgetMax} onChange={onBudgetChange} />
              </label>
              <fieldset className="buyer-filter-group">
                <legend>Land Zone</legend>
                <p>Choose one or more statutory land classifications.</p>
                <div className="buyer-filter-option-grid">
                  {landZoneOptions.map((option) => <label key={option.value}><input type="checkbox" checked={mapFilters.landZones.includes(option.value)} onChange={() => onLandZoneToggle(option.value)} /><span>{option.label}</span></label>)}
                </div>
              </fieldset>
              <fieldset className="buyer-filter-group">
                <legend>NA Status</legend>
                <p>NA approval is independent from the land-zone classification.</p>
                <div className="buyer-filter-option-grid">
                  {naStatusOptions.map((option) => <label key={option.value}><input type="checkbox" checked={mapFilters.naStatuses.includes(option.value)} onChange={() => onNaStatusToggle(option.value)} /><span>{option.label}</span></label>)}
                </div>
              </fieldset>
              <label className="buyer-filter-boolean"><input type="checkbox" checked={mapFilters.bankLoan} onChange={onBankLoanChange} /><span><strong>Bank loan available</strong><small>Show projects marked as bank-loan ready.</small></span></label>
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
