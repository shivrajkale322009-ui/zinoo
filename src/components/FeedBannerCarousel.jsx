import React, { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function FeedBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const viewportRef = useRef(null);

  useEffect(() => onSnapshot(
    query(collection(db, 'feed'), where('isActive', '==', true), orderBy('displayOrder', 'asc')),
    (snapshot) => {
      console.info('[Druvio Feed] Buyer banner query succeeded.', {
        uid: auth.currentUser?.uid || null,
        databaseId: db._databaseId?.database || 'default',
        bannerCount: snapshot.size,
        fromCache: snapshot.metadata.fromCache
      });
      setBanners(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.imageUrl));
      setActiveIndex(0);
      setLoading(false);
    },
    (error) => {
      console.error('[Druvio Feed] Buyer banner query failed.', {
        uid: auth.currentUser?.uid || null,
        databaseId: db._databaseId?.database || 'default',
        operation: 'query(feed where isActive == true orderBy displayOrder asc)',
        code: error?.code || null,
        message: error?.message || String(error),
        error
      });
      setBanners([]);
      setLoading(false);
    }
  ), []);

  useEffect(() => {
    if (banners.length < 2 || dragStart !== null) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length, dragStart]);

  const finishSwipe = () => {
    if (dragStart === null || banners.length < 2) return;
    const threshold = Math.min(70, (viewportRef.current?.clientWidth || 300) * 0.18);
    if (dragOffset < -threshold) setActiveIndex((current) => (current + 1) % banners.length);
    if (dragOffset > threshold) setActiveIndex((current) => (current - 1 + banners.length) % banners.length);
    setDragStart(null);
    setDragOffset(0);
  };

  const skipBrokenImage = (id) => {
    setBanners((current) => current.filter((banner) => banner.id !== id));
    setActiveIndex(0);
  };

  if (!loading && banners.length === 0) return null;

  return (
    <section className={`feed-banner-carousel ${loading ? 'is-loading' : ''}`} aria-label="Featured banners">
      {loading ? <div className="feed-banner-shimmer" aria-label="Loading banners" /> : (
        <div
          ref={viewportRef}
          className="feed-banner-viewport"
          onPointerDown={(event) => {
            if (banners.length < 2) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragStart(event.clientX);
          }}
          onPointerMove={(event) => {
            if (dragStart !== null) setDragOffset(event.clientX - dragStart);
          }}
          onPointerUp={finishSwipe}
          onPointerCancel={finishSwipe}
        >
          <div
            className="feed-banner-track"
            style={{ transform: `translateX(calc(${-activeIndex * 100}% + ${dragOffset}px))` }}
          >
            {banners.map((banner, index) => (
              <div className="feed-banner-slide" key={banner.id} aria-hidden={index !== activeIndex}>
                <img
                  src={banner.imageUrl}
                  alt=""
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable="false"
                  onError={() => skipBrokenImage(banner.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
