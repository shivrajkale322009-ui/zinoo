# Druvio Development Backlog

## Prioritized Tasks

### Phase 1: Foundation (Completed)
- [x] Project initialization with Vite + React
- [x] Firebase configuration and initialization
- [x] CSS variable-based design system
- [x] Responsive layout framework
- [x] Service Worker for PWA capabilities
- [x] Basic routing structure
- [x] Index.html with PWA meta tags
- [x] Manifest.json for PWA installation

### Phase 2: Authentication (Completed)
- [x] Google Sign-In integration
- [x] Phone OTP authentication (6-digit codes)
- [x] reCAPTCHA verification
- [x] User profile creation in Firestore
- [x] Role-based routing (buyer/seller/admin)
- [x] Session persistence
- [x] Error handling for auth failures

### Phase 3: Property Listings (Completed)
- [x] Project data model with all required fields
- [x] Project creation form for sellers
- [x] Project editing capabilities
- [x] Project listing display with cards
- [x] Project detail view with comprehensive information
- [x] Hero images and layout plans
- [x] Druvio Score calculation and display
- [x] Status management (Active/Sold Out)
- [x] Real-time data synchronization

### Phase 4: Maps (Completed)
- [x] Leaflet.js integration with react-leaflet
- [x] Custom map markers with verification status
- [x] Map center on Chakan, Pune
- [x] Project pins with click-to-detail
- [x] Popup information on markers
- [x] Light theme map tiles (CARTO Voyager)
- [x] Custom zoom controls
- [x] Responsive map container

### Phase 5: Search & Filters (Completed)
- [x] Text search (project name, village, area, developer)
- [x] Budget range slider
- [x] Distance from Chakan slider
- [x] Facing direction dropdown
- [x] Minimum Druvio Score filter
- [x] NA Plot certification toggle
- [x] Bank loan pre-approval toggle
- [x] Filter drawer with slide-up animation
- [x] Reset filters functionality
- [x] Real-time filter application

### Phase 6: Favorites & Shortlists
- [ ] Favorite/heart icon on project cards
- [ ] Dedicated Favorites tab/view
- [ ] Side-by-side comparison tool
- [ ] Export shortlist functionality
- [ ] Persistent favorites in Firestore
- [ ] Cross-device sync

### Phase 7: Admin Panel (Partially Completed)
- [x] Cashback queue management
- [x] Listing moderation dashboard
- [x] Lead pipeline/funnel tracking
- [ ] Platform revenue metrics
- [x] Cashback approval/rejection workflow
- [x] Project verification status display
- [x] Lead stage management
- [x] Visit scheduling overview

### Phase 8: Payments & Cashback
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Token payment for plot booking
- [ ] Full payment processing
- [ ] Automated cashback calculation (1%)
- [ ] Cashback claim submission with document upload
- [ ] Admin verification workflow
- [ ] Payout processing to buyer accounts
- [ ] Transaction history and receipts
- [ ] Refund handling for cancelled deals

### Phase 9: Production Launch
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] Error monitoring (Sentry)
- [ ] Analytics implementation (GA4, Firebase Analytics)
- [ ] SEO optimization
- [ ] App store preparation (PWA)
- [ ] Domain configuration and SSL
- [ ] Backup and disaster recovery
- [ ] Documentation and runbooks
- [ ] Launch checklist completion

### Future Enhancements
#### Advanced Features (Post-Launch)
- [ ] AI-powered property recommendations
- [ ] Virtual site tours
- [ ] Mortgage calculator
- [ ] Legal document generation
- [ ] Multi-language support

#### Scale & Expand (Months 6-12)
- [ ] New city corridors (Bangalore, Hyderabad, Mumbai)
- [ ] Developer marketplace
- [ ] Investment analytics
- [ ] Referral program
- [ ] Mobile app (React Native)

#### Platform Maturity (Year 2+)
- [ ] White-label solutions
- [ ] API for partners
- [ ] Advanced ML models
- [ ] International expansion
- [ ] Enterprise features

## Priority Key
**P0**: Must-have for launch - blocks core functionality  
**P1**: Should-have for launch - improves user experience  
**P2**: Nice-to-have - enhances value but not critical  

## Current Sprint Focus
- Complete Phase 6 (Favorites & Shortlists)
- Finalize Phase 8 (Payments & Cashback)
- Prepare for Phase 9 (Production Launch)