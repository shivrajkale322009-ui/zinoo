import { Gift, Home, Map as MapIcon } from 'lucide-react';

export default function BuyerMobileNavigation({ activeScreen, onNavigate }) {
  return (
    <nav className="buyer-mobile-nav m3-bottom-navigation" aria-label="Buyer navigation">
      <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
        <Home size={24} />
        <span>Home</span>
      </button>
      <button type="button" className={`buyer-mobile-nav-btn buyer-mobile-nav-primary ${activeScreen === 'map' ? 'active' : ''}`} onClick={() => onNavigate('map')}>
        <MapIcon size={26} />
        <span>Map</span>
      </button>
      <button type="button" className={`buyer-mobile-nav-btn ${activeScreen === 'cashback' ? 'active' : ''}`} onClick={() => onNavigate('cashback')}>
        <Gift size={24} />
        <span>Cashback</span>
      </button>
    </nav>
  );
}
