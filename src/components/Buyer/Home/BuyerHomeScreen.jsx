import FeedBannerCarousel from '../../FeedBannerCarousel';

export default function BuyerHomeScreen({ children }) {
  return (
    <main className="buyer-primary-screen buyer-home-screen" aria-label="Buyer home">
      <div className="buyer-primary-screen-inner">
        <FeedBannerCarousel />
        {children}
      </div>
    </main>
  );
}
