import {
  BadgeIndianRupee,
  History,
  MapPin,
  Square,
  TrendingUp,
  X
} from 'lucide-react';

const popularSearches = [
  { title: 'Near Chakan MIDC', subtitle: 'Within 10 km', icon: MapPin },
  { title: 'Below ₹15 Lakh', subtitle: 'Budget', icon: BadgeIndianRupee },
  { title: '1000–1500 Sq.ft', subtitle: 'Plot Size', icon: Square },
  { title: 'Investment Plots', subtitle: 'High Appreciation', icon: TrendingUp }
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
          <h2>Popular Searches</h2>
        </div>
        <div className="buyer-recent-search-list buyer-popular-search-chips">
          {popularSearches.map(({ title, subtitle, icon: Icon }) => (
            <span className="buyer-recent-chip" key={title}>
              <button type="button" title={subtitle} onClick={() => onSearch(title)}>
                <Icon size={14} aria-hidden="true" />{title}
              </button>
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
