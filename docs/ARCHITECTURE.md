# Druvio Architecture Document

## 1. High-Level Overview

Druvio is a React-based Progressive Web App (PWA) built with Vite that connects to Firebase for real-time data synchronization. The architecture follows a clean component-based approach with Firebase as the backend, providing authentication, Firestore database, and storage capabilities.

The platform focuses on hyperlocal real estate listings for land plots in the Chakan, Shikrapur, and greater Pune growth corridors, emphasizing GPS verification, trust scoring, and cashback incentives.

## 2. Folder Structure

The project maintains a well-organized directory structure that separates concerns while keeping related functionality together:

### 2.1 Core Directories

```
src/
├── components/          # Reusable UI components
│   ├── Auth/            # Authentication components
│   ├── AdminPanel/      # Admin dashboard components
│   ├── BuyerApp/        # Primary buyer-facing components
│   ├── SellerDashboard/ # Seller management components
│   ├── Map/             # Map-related components
│   └── common/          # Shared UI primitives
│
├── firebase/              # Firebase configuration and services
│   └── firebaseConfig.js
│
├── firebase/              # Firebase-specific configurations
├── pages/                 # Page-level components
│   └── App.jsx          # Root application component
│
├── data/                  # Data models and utilities
│   └── schema.js        # Type definitions and validation
│
├── utils/                 # Helper functions and constants
│   ├── formatting.js    # Currency and date formatting
│   ├── validation.js    # Form validation logic
│   └── metrics.js       # Scoring algorithms
│
├── styles/                # Global styling and design system
│   └── index.css        # CSS variables and utilities
│
├── App.jsx                # Root component rendering AppShell
└── main.jsx               # Entry point for React rendering
```

### 2.2 Key Component Hierarchy

#### 2.2.1 App Shell
`src/App.jsx` serves as the central hub that:
- Manages authenticated user session
- Handles role-based component rendering (buyer, seller, admin)
- Coordinates data fetching from Firestore
- Orchestrates layout across different user roles

#### 2.2.2 Authentication Components
- `src/components/Auth/LoginScreen.jsx` provides multi-step authentication
  - Google Sign-In flow with immediate profile creation
  - Phone OTP verification with reCAPTCHA
  - Profile data initialization in Firestore
  - Role detection and storage

#### 2.2.3 Buyer Interface
`src/components/BuyerApp.jsx` implements the core buyer experience:
- Tab-based navigation (Feed, Map, Cashback)
- Filtering system with multiple criteria
- Database integration for real-time updates
- Project detail view with verification score
- Site visit booking system
- Cashback claim process

#### 2.2.4 Seller Management
`src/components/SellerDashboard.jsx` provides seller tools:
- Project inventory management
- Lead pipeline tracking
- Visit scheduling system
- Listing creation and editing tools
- Performance metrics dashboard

#### 2.2.5 Admin Operations
`src/components/AdminPanel.jsx` serves administrators:
- Cashback claim verification
- Listing moderation system
- Lead pipeline oversight
- Platform statistics dashboard
- User management capabilities

#### 2.2.6 Map Integration
`src/components/Map/BuyerMap.jsx` provides interactive mapping:
- Leaflet.js integration with custom styling
- Project location markers with verification indicators
- Click-to-detail navigation
- Scoring visualization overlays
- Proximity-based filtering

## 3. React Architecture

### 3.1 State Management Strategy
The application uses a hybrid approach with:
- **React Context** for global state (authentication, role)
- **useEffect hooks** for side effects and data synchronization
- **useMemo/useState** for derived data and local state management
- **Firestore real-time listeners** for live data updates

### 3.2 Component Composition Pattern
The UI follows a container-child pattern:
- **Container components** handle data fetching and business logic
- **Child components** focus on presentation and UI interactions
- **Reusable primitives** provide consistent styling and behavior

### 3.3 Form Handling
- Forms use controlled components with validation
- Input fields leverage shared styling from global CSS
- Error states provide accessible feedback
- Date and number inputs use appropriate type attributes

## 4. Firebase Architecture

### 4.1 Services Configuration
`src/firebaseConfig.js` initializes and exports Firebase services:
- **Authentication**: Firebase Auth with Google and Phone providers
- **Firestore**: Real-time database for structured collections
- **Storage**: File storage for uploaded documents
- **Analytics**: Performance tracking utilities

### 4.2 Collections Schema

#### 4.1 Projects Collection
Stores verified plotting projects with comprehensive metadata:
- Geolocation coordinates for GPS verification
- Price and size parameters
- Developer information
- Amenities list
- Nearby infrastructure data
- Verification status
- Druvio Score calculation results

#### 4.2 Leads Collection
Tracks user interest profiles:
- Contact information
- Budget parameters
- Property interests
- Engagement history
- Lead stage (e.g., Book Visit, Purchased)

#### 4.3 Visits Collection
Manages site visit bookings:
- Buyer details (name, phone)
- Project association
- Scheduled date/time
- Status tracking (Scheduled, Visited, Completed)

#### 4.4 Cashbacks Collection
Handles cashback program mechanics:
- Purchase agreements and document references
- Commission calculations (1% revenue share)
- Claim status (Pending, Approved, Rejected)
- Disbursement tracking

#### 4.5 Users Collection
Stores user profile information:
- Role designation (buyer/seller/admin)
- Contact details
- Verification status
- Preference settings

## 4.2 Security Rules

### 4.1 Authentication Flow
- Uses Firebase Auth client SDK for sign-in
- Implements reCAPTCHA for OTP verification
- Stores minimal user data in client state
- Relies on Firestore security rules for data access

### 4.2 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin access control
    allow read, write: if request.auth != null && resource.data.ownerId == request.auth.uid;
    
    // Projects collection - read-only for buyers
    match /projects/{projectId} {
      allow get, list: if true;
      allow update, delete: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.resource.data.status in ['Active', 'Scheduled']);
    }
    
    // Leads collection - user-specific access
    match /leads/{leadId} {
      allow read, write: if request.auth != null && 
        resource.data.uid == request.auth.uid;
    }
    
    // Cashbacks collection - admin oversight
    match /cashbacks/{cashbackId} {
      allow read, write: if request.auth != null && 
        (resource.data.buyerId == request.auth.uid || 
         request.auth.token.admin == true);
    }
  }
}
```

### 4.3 Rules Implementation Notes
- Strict validation prevents unauthorized data modifications
- Read access granted for projects and listings to enable browsing
- Write access restricted to owners and admins
- Security rules enforce data integrity and privacy policies

## 5. Map Architecture

### 5.1 Leaflet Integration
The map system uses react-leaflet with custom configurations:
- **Tile Layer**: CARTO Voyager theme for clean, professional map appearance
- **Marker System**: Custom React components create styled markers with verification indicators
- **Popups**: Dynamically generated with project details and CTA buttons
- **Performance**: Optimized rendering with memoization for large datasets

### 5.2 Map Views
- **Default View**: Centered on Chakan, Pune with 10km radius coverage
- **Project Views**: Zoom to specific plot location when selected
- **Search Results**: Display all matching projects on map overlay
- **Interactivity**: Click markers to view details or book visits

### 5.3 GPS Verification System
- Projects marked as "Verified" display GPS pin icon
- Non-verified projects show warning indicators
- Verification status visible in project headers
- Location coordinates stored at collection level for auditing

## 6. Image Storage Strategy

### 6.1 Media Assets
- **Hero Images**: URL-based from content providers
- **Layout Plans**: URL-based or Firebase Storage uploads
- **Document Uploads**: Firebase Storage for cashback agreements
- **Optimization**: Compressed images with responsive loading

### 6.2 Storage Structure
```
firebase.storage().bucket('druvio.appspot.com').
├── project_hero_images/
├── layout_plans/
├── cashback_documents/
└── user_profiles/
```

### 6.3 Access Control
- Secure access via Firebase Storage rules
- Direct URLs served through CDN cache
- Validation before upload (file type, size limits)

## 7. Deployment Pipeline

### 7.1 CI/CD Workflow
- GitHub push triggers Firebase deployment
- Production builds optimized with Vite
- Static assets automatically hashed for cache busting
- Service worker precaches core assets

### 7.2 Environment Configuration
- **Development**: Local Firebase emulator suite
- **Staging**: Separate Firebase project
- **Production**: Production Firebase project
- Configuration values loaded from environment variables

### 7.3 Monitoring & Alerts
- Firebase Analytics for user behavior tracking
- Sentry integration for error monitoring
- Custom metrics for key conversion events
- Status page for service availability

## 8. Performance Optimizations

### 8.1 Build Optimizations
- Vite's native ES module support
- Code splitting by route
- Tree-shaking unused dependencies
- CSS class purging in production builds

### 8.2 Runtime Optimizations
- Lazy loading for route components
- Pagination for large data sets
- Virtualization for long lists
- Debounced input handling

### 8.3 Service Worker Caching Strategy
- **Cache First**: For static assets and service worker files
- **Network First**: For API calls and dynamic content
- **Stale-While-Revalidate**: For non-critical resources
- Versioned caching for safe updates

## 9. Scalability Considerations

### 8.1 Future Expansion Path
- Additional city corridors (Bengaluru, Hyderabad, Mumbai)
- Multi-tenant architecture for developer marketplaces
- White-label solutions for partner platforms
- Advanced analytics dashboards for enterprise users

### 8.2 Data Scaling
- Firestore sharding strategies for high-volume collections
- Index management for query performance
- Denormalization patterns for read-heavy operations
- Cloud Functions for complex business logic

### 8.3 Performance Targets
- Initial page load < 1.5 seconds on 3G
- Time to interactive < 3 seconds
- Smooth 60fps animations for interactive elements
- Error rate < 0.1% with median recovery time < 2 seconds

## 10. Technical Debt Management

### 8.1 Code Quality Practices
- TypeScript migration in progress
- ESLint with project-specific rules
- Prettier for consistent code formatting
- Git hooks for linting on commit

### 8.2 Technical Debt Dashboard
- Current debt items tracked in project management
- Quarterly debt review sessions
- Technical improvement sprints
- Debt prioritization matrix

## 11. Key Design Decisions

1. **Technology Stack**: React + Vite + Firebase for rapid development and real-time capabilities
2. **PWA Approach**: Offline functionality with service worker caching
3. **Hyperlocal Focus**: Geographically restricted to Pune corridor initially for quality control
4. **Verification First**: GPS verification required before listing acceptance
5. **Cashback Model**: 1% commission structure incentivizing verified transactions
6. **Mobile-First UI**: Responsive design optimized for small screens
7. **Linear Data Flow**: Predictable state management for debugging ease
8. **Progressive Enhancement**: Core functionality works on basic browsers, enhanced features for modern clients

## 12. Future Architecture Roadmap

1. **Microservices Migration**: Move complex calculations to cloud functions
2. **API Gateway**: Implement REST API layer for third-party integrations
3. **Cloud Data Warehouse**: For advanced analytics and reporting
4. **Real-time Collaboration**: Enable buyer-developer direct communication
5. **AI-Powered Features**: Smart recommendations and predictive analytics
6. **Multi-tenancy Support**: Serve multiple developers and brokers gleichzeitig

This architecture balances rapid development capabilities with production-grade reliability, security, and scalability foundations suitable for a premium real estate platform.