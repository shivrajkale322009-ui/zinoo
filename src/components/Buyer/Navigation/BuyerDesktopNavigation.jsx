export default function BuyerDesktopNavigation({ items, activeItem, onNavigate }) {
  return (
    <aside className="buyer-map-nav" aria-label="Buyer navigation">
      {items.map((item) => {
        const Icon = item.icon;
        const active = !item.disabled && activeItem === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`buyer-map-nav-btn ${active ? 'active' : ''}`}
            disabled={item.disabled}
            title={item.disabled ? `${item.label} coming soon` : item.label}
            onClick={() => !item.disabled && onNavigate(item.id)}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
