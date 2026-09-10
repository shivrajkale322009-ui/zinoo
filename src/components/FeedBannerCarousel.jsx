import React, { useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { BadgeIndianRupee, Handshake, ShieldCheck } from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { readStartupCache, scheduleIdleWork, writeStartupCache } from '../utils/startupCache';

const HOME_HERO = {
  id: 'zinoo-home-hero',
  imageUrl: '/zinoo-home-hero.webp',
  isZinooHero: true
};

export default function FeedBannerCarousel() {
  const [banners, setBanners] = useState(() => [HOME_HERO, ...readStartupCache('feed-banners', [])]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const viewportRef = useRef(null);

  useEffect(() => {
    let unsubscribe;
    const cancelIdle = scheduleIdleWork(() => {
      unsubscribe = onSnapshot(
        query(collection(db, 'feed'), where('isActive', '==', true), orderBy('displayOrder', 'asc')),
        (snapshot) => {
      console.info('[Zinoo Feed] Buyer banner query succeeded.', {
        uid: auth.currentUser?.uid || null,
        databaseId: db._databaseId?.database || 'default',
        bannerCount: snapshot.size,
        fromCache: snapshot.metadata.fromCache
      });
          const remoteBanners = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.imageUrl);
          setBanners([HOME_HERO, ...remoteBanners]);
          writeStartupCache('feed-banners', remoteBanners);
        },
        (error) => {
      console.error('[Zinoo Feed] Buyer banner query failed.', {
        uid: auth.currentUser?.uid || null,
        databaseId: db._databaseId?.database || 'default',
        operation: 'query(feed where isActive == true orderBy displayOrder asc)',
        code: error?.code || null,
        message: error?.message || String(error),
        error
      });
        }
      );
    }, 1400);
    return () => { cancelIdle(); unsubscribe?.(); };
  }, []);

  useEffect(() => {
    if (banners.length < 2 || dragStart !== null) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 4000);
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

  return (
    <section className="feed-banner-carousel" aria-label="Featured banners">
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
                {banner.isZinooHero && (
                  <div className="zinoo-hero-copy">
                    <h1 className="marathi-editorial">तुमच्या स्वप्नातील <strong>प्लॉट.</strong><br />आता सहज.</h1>
                    <div className="zinoo-hero-trust">
                      <span><ShieldCheck /> योग्य जागा.</span>
                      <span><BadgeIndianRupee /> योग्य किंमत.</span>
                      <span><Handshake /> पारदर्शक व्यवहार.</span>
                    </div>
                    <p>शोधा · पहा · निवडा<br />तुमच्या विश्वासाचा प्लॉट.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <div className="feed-banner-dots" aria-label="Choose banner">
              {banners.map((banner, index) => (
                <button
                  type="button"
                  key={banner.id}
                  className={index === activeIndex ? 'active' : ''}
                  aria-label={`Show banner ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
    </section>
  );
}
