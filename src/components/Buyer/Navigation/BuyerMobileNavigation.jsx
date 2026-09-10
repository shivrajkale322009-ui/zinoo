import { Gift, Heart, Home, Map as MapIcon } from 'lucide-react';

export default function BuyerMobileNavigation({ activeScreen, onNavigate }) {
  return (
    <nav className="buyer-mobile-nav m3-bottom-navigation has-saved-destination" aria-label="Primary navigation">
      <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'home' ? 'active' : ''}`} aria-current={activeScreen === 'home' ? 'page' : undefined} onClick={() => onNavigate('home')}>
        <Home size={24} />
        <span>Home</span>
      </button>
      <button type="button" className={`buyer-mobile-nav-btn buyer-mobile-nav-primary ${activeScreen === 'map' ? 'active' : ''}`} aria-current={activeScreen === 'map' ? 'page' : undefined} onClick={() => onNavigate('map')}>
        <MapIcon size={24} />
        <span>Map</span>
      </button>
      <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'cashback' ? 'active' : ''}`} aria-current={activeScreen === 'cashback' ? 'page' : undefined} onClick={() => onNavigate('cashback')}>
        <Gift size={24} />
        <span>Cashback</span>
      </button>
      <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'saved' ? 'active' : ''}`} aria-current={activeScreen === 'saved' ? 'page' : undefined} onClick={() => onNavigate('saved')}>
        <Heart size={24} />
        <span>Saved</span>
      </button>
    </nav>
  );
}
