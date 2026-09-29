import { useState } from 'react';
import {
  BadgeIndianRupee,
  CalendarDays,
  ChevronDown,
  Landmark,
  MapPin,
  UserRound
} from 'lucide-react';
import NotificationCenter from '../../NotificationCenter';
import ProfileDropdown from '../../ProfileDropdown';
import BuyerSearchHeader from '../Search/BuyerSearchHeader';

/**
 * Shared Zinoo buyer header used by every primary destination.
 * Search, notification, and profile behavior remain owned by their existing components.
 */
export default function DesktopHeader({
  homeSearchQuery,
  voiceSearchActive,
  searchableProjects,
  placeSuggestions,
  placeSearchError,
  onQueryChange,
  onSearchKeyDown,
  onActivateMap,
  onClearSearch,
  onStartVoiceSearch,
  onProjectSelect,
  onPlaceSelect,
  showFilters = false,
  filtersOpen = false,
  activeFilterCount = 0,
  onToggleFilters,
  mapFilters,
  onMapFiltersChange,
  notifications,
  user,
  isAdmin,
  onThemeToggle,
  isDarkMode,
  permissions,
  currentView,
  onViewChange,
  onCustomerSupport,
  onBackToAdmin,
  selectedSeller,
  onAccountDeleted,
  onRequireAuth
}) {
  const [desktopPanel, setDesktopPanel] = useState(null);
  const budgetMin = Number(mapFilters?.budgetMin ?? 400000);
  const budgetMax = Number(mapFilters?.budgetMax ?? 5000000);
  const installmentMax = Number(mapFilters?.installmentMax ?? 0);
  const selectedZones = Array.isArray(mapFilters?.zones) ? mapFilters.zones : [];
  const zoneOptions = ['Chakan', 'Talegaon', 'Moshi', 'Alandi'];
  const updateFilters = (changes) => onMapFiltersChange?.({ ...mapFilters, ...changes });
  const money = (amount) => `₹${Math.round(amount / 100000)}L`;
  const choosePanel = (panel) => setDesktopPanel((current) => current === panel ? null : panel);

  return (
    <header className="buyer-workspace-header desktop-header buyer-unified-search-header">
      <BuyerSearchHeader
        homeSearchQuery={homeSearchQuery}
        voiceSearchActive={voiceSearchActive}
        searchableProjects={searchableProjects}
        placeSuggestions={placeSuggestions}
        placeSearchError={placeSearchError}
        onQueryChange={onQueryChange}
        onSearchKeyDown={onSearchKeyDown}
        onActivateMap={onActivateMap}
        onClearSearch={onClearSearch}
        onStartVoiceSearch={onStartVoiceSearch}
        onProjectSelect={onProjectSelect}
        onPlaceSelect={onPlaceSelect}
        showSearchOverlays
      />
      {showFilters && <nav className="buyer-desktop-filter-toolbar" aria-label="Property filters">
        <div className="buyer-desktop-filter-control">
          <button type="button" className={`buyer-desktop-filter-chip budget ${desktopPanel === 'budget' ? 'active' : ''}`} onClick={() => choosePanel('budget')} aria-haspopup="dialog" aria-expanded={desktopPanel === 'budget'}><BadgeIndianRupee size={16} /><span>Budget</span><ChevronDown size={14} className="buyer-desktop-filter-chevron" /></button>
          {desktopPanel === 'budget' && <section className="buyer-desktop-budget-panel" aria-label="Budget range"><header><span>1-guntha budget</span><strong>{money(budgetMin)} – {money(budgetMax)}</strong></header><div className="buyer-desktop-dual-range" style={{ '--range-start': `${((budgetMin - 400000) / 4600000) * 100}%`, '--range-end': `${((budgetMax - 400000) / 4600000) * 100}%` }}><input type="range" min="400000" max="5000000" step="100000" value={budgetMin} onChange={(event) => updateFilters({ budgetMin: Math.min(Number(event.target.value), budgetMax - 100000) })} aria-label="Minimum budget" /><input type="range" min="400000" max="5000000" step="100000" value={budgetMax} onChange={(event) => updateFilters({ budgetMax: Math.max(Number(event.target.value), budgetMin + 100000) })} aria-label="Maximum budget" /></div><footer><span>{money(budgetMin)}</span><span>{money(budgetMax)}</span></footer></section>}
        </div>
        <div className="buyer-desktop-filter-control">
          <button type="button" className={`buyer-desktop-filter-chip zone ${desktopPanel === 'zone' || selectedZones.length ? 'active' : ''}`} onClick={() => choosePanel('zone')} aria-haspopup="listbox" aria-expanded={desktopPanel === 'zone'}><MapPin size={16} /><span>Zone</span><ChevronDown size={14} className="buyer-desktop-filter-chevron" /></button>
          {desktopPanel === 'zone' && <div className="buyer-desktop-zone-panel" role="listbox" aria-label="Explore by zone">{zoneOptions.map((zone) => <button key={zone} type="button" role="option" aria-selected={selectedZones.includes(zone)} className={selectedZones.includes(zone) ? 'active' : ''} onClick={() => updateFilters({ zones: selectedZones.includes(zone) ? selectedZones.filter((value) => value !== zone) : [...selectedZones, zone] })}>{zone}</button>)}</div>}
        </div>
        <button type="button" className={`buyer-desktop-filter-chip loan ${mapFilters?.bankLoan ? 'active' : ''}`} onClick={() => updateFilters({ bankLoan: !mapFilters?.bankLoan })} aria-pressed={Boolean(mapFilters?.bankLoan)}><Landmark size={16} /><span>Loan</span></button>
        <div className="buyer-desktop-filter-control">
          <button type="button" className={`buyer-desktop-filter-chip installment ${desktopPanel === 'installment' || installmentMax ? 'active' : ''}`} onClick={() => choosePanel('installment')} aria-haspopup="listbox" aria-expanded={desktopPanel === 'installment'}><CalendarDays size={16} /><span>Installment</span><ChevronDown size={14} className="buyer-desktop-filter-chevron" /></button>
          {desktopPanel === 'installment' && <div className="buyer-desktop-installment-panel" role="listbox" aria-label="Monthly installment affordability">{[[0, 'Any monthly EMI'], [10000, 'Up to ₹10k / mo'], [20000, 'Up to ₹20k / mo'], [30000, 'Up to ₹30k / mo']].map(([value, label]) => <button key={value} type="button" role="option" aria-selected={installmentMax === value} className={installmentMax === value ? 'active' : ''} onClick={() => { updateFilters({ installmentMax: value }); setDesktopPanel(null); }}>{label}</button>)}</div>}
        </div>
      </nav>}
      <div className="buyer-header-account-actions">
        <NotificationCenter notifications={notifications} userId={user?.uid} isAdmin={isAdmin} />
        {user ? <ProfileDropdown
          user={user}
          onThemeToggle={onThemeToggle}
          isDarkMode={isDarkMode}
          permissions={permissions}
          currentView={currentView}
          onViewChange={onViewChange}
          onCustomerSupport={onCustomerSupport}
          onBackToAdmin={onBackToAdmin}
          selectedSeller={selectedSeller}
          onAccountDeleted={onAccountDeleted}
          hideChevron
        /> : <button type="button" className="profile-trigger" aria-label="Sign in to Zinoo" onClick={() => onRequireAuth?.({ type: 'open-account' })}>
          <UserRound size={20} />
        </button>}
      </div>
    </header>
  );
}
