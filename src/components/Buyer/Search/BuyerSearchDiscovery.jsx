import {
  BadgeIndianRupee,
  Banknote,
  Bolt,
  CheckCircle2,
  ChevronRight,
  Diamond,
  Gift,
  History,
  House,
  Leaf,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  TrendingUp,
  X
} from 'lucide-react';

const popularSearches = [
  { title: 'Near Chakan MIDC', subtitle: 'Within 10 km', icon: MapPin },
  { title: 'Below ₹15 Lakh', subtitle: 'Budget', icon: BadgeIndianRupee },
  { title: '1000–1500 Sq.ft', subtitle: 'Plot Size', icon: Square },
  { title: 'Investment Plots', subtitle: 'High Appreciation', icon: TrendingUp },
  { title: 'Verified Projects', subtitle: 'Legal Clear', icon: CheckCircle2 },
  { title: 'Loan Available', subtitle: 'Bank Approved', icon: Banknote },
  { title: 'Ready to Buy', subtitle: 'Immediate Possession', icon: Bolt },
  { title: 'Highest Cashback', subtitle: '1% Cashback', icon: Gift }
];

const suggestedSearches = [
  { title: 'Top Rated Projects', description: 'Loved by verified buyers', icon: Star },
  { title: 'Fastest Selling', description: 'Popular plots this week', icon: Rocket },
  { title: 'New Launches', description: 'Fresh opportunities nearby', icon: Sparkles },
  { title: 'Premium Projects', description: 'Exceptional plotted living', icon: House },
  { title: 'Best Value', description: 'More land for your budget', icon: Diamond },
  { title: 'Gated Communities', description: 'Secure planned communities', icon: Leaf }
];

export default function BuyerSearchDiscovery({
  recentSearches,
  onSearch,
  onRemoveRecent,
  onClearRecent
}) {
  return (
    <section className="buyer-search-discovery" aria-label="Search discovery">
      <div className="buyer-search-discovery-scroll">
        <div className="buyer-search-section-heading">
          <h2>Popular Searches</h2>
        </div>
        <div className="buyer-popular-search-grid">
          {popularSearches.map(({ title, subtitle, icon: Icon }) => (
            <button key={title} type="button" className="buyer-discovery-card" onClick={() => onSearch(title)}>
              <span className="buyer-discovery-icon"><Icon size={18} /></span>
              <span><strong>{title}</strong><small>{subtitle}</small></span>
              <ChevronRight className="buyer-discovery-chevron" size={17} aria-hidden="true" />
            </button>
          ))}
        </div>

        {recentSearches.length > 0 && (
          <div className="buyer-recent-searches">
            <div className="buyer-search-section-heading">
              <h2>Recent Searches</h2>
              <button type="button" onClick={onClearRecent}>Clear All</button>
            </div>
            <div className="buyer-recent-search-list">
              {recentSearches.map((query) => (
                <span className="buyer-recent-chip" key={query}>
                  <button type="button" onClick={() => onSearch(query)}>
                    <History size={14} />{query}
                  </button>
                  <button type="button" className="buyer-recent-remove" onClick={() => onRemoveRecent(query)} aria-label={`Remove ${query}`}>
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="buyer-search-section-heading">
          <h2>Suggested by Zinoo</h2>
        </div>
        <div className="buyer-suggested-search-list">
          {suggestedSearches.map(({ title, description, icon: Icon }) => (
            <button key={title} type="button" className="buyer-suggested-card" onClick={() => onSearch(title)}>
              <span className="buyer-discovery-icon"><Icon size={17} /></span>
              <strong>{title}</strong>
              <small>{description}</small>
            </button>
          ))}
        </div>

        <div className="buyer-quick-searches">
          <button type="button" onClick={() => onSearch('Verified Projects')}>
            <span className="buyer-quick-illustration"><ShieldCheck size={25} /></span>
            <span><strong>Verified Plots Only</strong><small>100% Legal Clear</small></span>
          </button>
          <button type="button" className="cashback" onClick={() => onSearch('Highest Cashback')}>
            <span className="buyer-quick-illustration"><Gift size={25} /></span>
            <span><strong>1% Cashback</strong><small>On Every Booking</small></span>
          </button>
        </div>
      </div>
    </section>
  );
}
