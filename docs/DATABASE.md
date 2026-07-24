# Druvio Database Architecture

## 1. Firestore Schema Overview

Druvio uses Firestore as the primary database, organized into five core collections that represent the main business entities. The schema is designed for real-time synchronization and follows a permission-based access pattern where users can only access records they own (or admins access all records).

## 2. Collections Structure

### 2.1 Users Collection (`users`)

**Purpose**: User profile management and role-based access control

**Document Structure**:
```javascript
{
  // Core Identity Fields
  uid: "firebase_auth_uid",                    // Unique identifier (linked to Firebase Auth)
  role: "buyer" || "seller" || "admin",        // User role for routing and permissions
  name: "John Doe",                           // Display name
  email: "user@example.com",                  // Optional for phone-based auth
  phone: "+911234567890",                     // Required for all users
  
  // Timestamps
  createdAt: timestamp,                       // When the user account was created
  lastLogin: timestamp,                        // Last login timestamp
  
  // Verification Status
  isVerified: false,                           // For KYC/verification completion
  
  // Personal Details
  preferredLanguage: "en",                     // UI language preference
  
  // Metadata
  profileComplete: false,                      // Boolean flag
}
```

### 2.2 Projects Collection (`projects`)

**Purpose**: Verified plot listings with comprehensive property data

**Document Structure**:
```javascript
{
  // Core Identity Fields
  id: "project_123",                          // Internal systematic ID
  ownerId: "owner_uid",                       // Seller's Firebase Auth UID
  
  // Basic Information
  name: "Pune Chakan Friendship Meadows",      // Project name
  developer: "Shivraj Land Developers",       // Developer name
  village: "Chakan",                          // Village/area name
  area: "Near Mercedes Benz Junction",        // Micro-area/landmark
  
  // Geolocation
  latitude: 18.7889,                          // Decimal degrees
  longitude: 73.8568,                         // Decimal degrees
  coords: [18.7889, 73.8568],                 // [lat, lng] for map markers
  
  // Pricing
  startingPrice: 1000000,                     // Starting price in INR
  pricePerSqFt: 1000,                         // Price per square foot in INR
  distance: 3.5,                              // Distance from Chakan circle in km
  
  // Inventory
  remainingPlots: 20,                         // Number of unsold plots
  totalPlots: 40,                             // Total plots in project
  sizeMin: 1200,                              // Minimum plot size in sqft
  sizeMax: 2400,                              // Maximum plot size in sqft
  facing: ["East", "North"],                  // Available facing directions
  
  // Legal & Verification
  bankLoan: true,                             // Bank loan pre-approved
  naPlot: true,                               // Collector NA certified
  verified: true,                             // GPS verified by Druvio
  DruvioScore: 85,                            // Calculated trust score (0-100)
  
  // Amenities & Infrastructure
  amenities: [
    "Water Supply Connection",
    "Electricity Line",
    "9m Tar Road",
    "Street Lights"
  ],
  
  // Nearby Hubs (Hyperlocal Connectivity)
  nearby: {
    schools: "ZP School (2.0 km)",
    hospitals: "Rural Hospital (3.0 km)",
    midc: "Chakan MIDC (1.5 km)",
    highway: "Pune-Nashik Highway (2.0 km)"
  },
  
  // Media
  heroImage: "https://...",                   // Hero banner image URL
  layoutPlanUrl: "https://...",               // Layout plan image URL
  
  // Description
  description: "Freshly listed residential plotting development near Chakan.",
  
  // Property workflow and listing status
  status: "draft" || "pending" || "approved" || "active" || "inactive" || "sold" || "rejected",
  updated: "Just now",                        // Human-readable timestamp
  
  // Timestamps
  createdAt: timestamp,                       // When project was created
  updatedAt: timestamp,                       // Last update timestamp
}
```

### 2.3 Leads Collection (`leads`)

**Purpose**: Track buyer interest and engagement pipeline

**Document Structure**:
```javascript
{
  // Core Identity Fields
  id: "lead_123",                             // Internal systematic ID
  createdBy: "buyer_uid",                     // Buyer's Firebase Auth UID
  
  // Buyer Information
  name: "Rajesh Kumar",                       // Buyer name
  phone: "+919876543210",                     // Buyer phone number
  email: "rajesh@example.com",                // Optional email
  
  // Interest Parameters
  budget: "25L+",                             // Budget range (human-readable)
  stage: "Book Visit" || "Visit Done" || "Negotiation" || "Purchased",
  date: "2025-01-15",                         // Lead creation date
  
  // Project Association
  project: "Pune Chakan Friendship Meadows",  // Project name
  projectId: "project_123",                   // Project document ID
  projectOwnerId: "seller_uid",               // Seller's UID
  
  // Timestamps
  createdAt: timestamp,                       // When lead was created
  updatedAt: timestamp,                       // Last update timestamp
}
```

### 2.4 Visits Collection (`visits`)

**Purpose**: Manage scheduled and completed site visits

**Document Structure**:
```javascript
{
  // Core Identity Fields
  id: "visit_123",                            // Internal systematic ID
  
  // Visitor Information
  buyerName: "Rajesh Kumar",                  // Visitor name
  buyerPhone: "+919876543210",                // Visitor phone
  
  // Visit Details
  date: "2025-01-20",                         // Scheduled date
  time: "11:00 AM",                           // Scheduled time slot
  project: "Pune Chakan Friendship Meadows",  // Project name
  projectId: "project_123",                   // Project document ID
  projectOwnerId: "seller_uid",               // Seller's UID
  
  // Status Tracking
  status: "Scheduled" || "Visited" || "Cancelled" || "Completed",
  
  // Timestamps
  createdAt: timestamp,                       // When visit was booked
  updatedAt: timestamp,                       // Last status update
}
```

### 2.5 Cashbacks Collection (`cashbacks`)

**Purpose**: Track 1% cashback claims and payouts

**Document Structure**:
```javascript
{
  // Core Identity Fields
  id: "cashback_123",                         // Internal systematic ID
  createdBy: "buyer_uid",                     // Buyer's Firebase Auth UID
  
  // Buyer Information
  buyerName: "Rajesh Kumar",                  // Purchaser name
  buyerPhone: "+919876543210",                // Purchaser phone
  
  // Project Association
  project: "Pune Chakan Friendship Meadows",  // Project name
  projectId: "project_123",                   // Project document ID
  projectOwnerId: "seller_uid",               // Seller's UID
  
  // Financial Details
  purchasePrice: 1200000,                     // Plot purchase price in INR
  cashbackAmount: 12000,                      // 1% cashback to buyer
  commissionAmount: 12000,                    // 1% Druvio commission
  
  // Documentation
  documentName: "plot_agreement_stamp.pdf",   // Uploaded document reference
  
  // Status Workflow
  status: "Pending Verification" || "Approved" || "Rejected",
  submittedAt: "2025-01-25",                  // Submission date
  
  // Timestamps
  createdAt: timestamp,                       // When claim was created
  updatedAt: timestamp,                       // Last status update
}
```

## 3. Indexes

### 3.1 Required Composite Indexes

The following composite indexes are required for efficient querying:

```javascript
// Projects Collection
indexes: [
  // For buyer filtering and listing
  { collection: "projects", fields: ["status", "verified"], queryScope: "COLLECTION" },
  { collection: "projects", fields: ["ownerId", "status"], queryScope: "COLLECTION" },
  { collection: "projects", fields: ["distance", "startingPrice"], queryScope: "COLLECTION" },
  
  // Leads Collection
  { collection: "leads", fields: ["createdBy", "stage"], queryScope: "COLLECTION" },
  { collection: "leads", fields: ["projectOwnerId", "stage"], queryScope: "COLLECTION" },
  { collection: "leads", fields: ["phone", "createdAt"], queryScope: "COLLECTION" },
  
  // Visits Collection
  { collection: "visits", fields: ["projectOwnerId", "status"], queryScope: "COLLECTION" },
  { collection: "visits", fields: ["buyerPhone", "date"], queryScope: "COLLECTION" },
  
  // Cashbacks Collection
  { collection: "cashbacks", fields: ["status", "submittedAt"], queryScope: "COLLECTION" },
  { collection: "cashbacks", fields: ["projectOwnerId", "status"], queryScope: "COLLECTION" },
  { collection: "cashbacks", fields: ["buyerPhone", "status"], queryScope: "COLLECTION" },
]
```

### 3.2 Single-Field Indexes (Auto-generated)

All fields used in where clauses and orderBy operations will automatically get single-field indexes:
- `projects.status`
- `projects.verified`
- `projects.ownerId`
- `projects.distance`
- `projects.startingPrice`
- `leads.createdBy`
- `leads.stage`
- `leads.projectOwnerId`
- `visits.projectOwnerId`
- `visits.status`
- `visits.buyerPhone`
- `cashbacks.status`
- `cashbacks.projectOwnerId`
- `cashbacks.buyerPhone`
- `users.role`

## 4. Relationships

### 4.1 User Relationships

- **User -> Projects**: One-to-Many (seller creates multiple projects)
- **User -> Leads**: One-to-Many (buyer generates leads across projects)
- **User -> Visits**: One-to-Many (buyer schedules visits)
- **User -> Cashbacks**: One-to-Many (buyer claims cashbacks)

### 4.2 Project Relationships

- **Project -> Leads**: One-to-Many (project attracts multiple leads)
- **Project -> Visits**: One-to-Many (project receives visit bookings)
- **Project -> Cashbacks**: One-to-Many (project generates cashback claims)

### 4.3 Cross-Collection References

All cross-collection references use document IDs rather than embedding:
- `projectId` references `projects.id`
- `projectOwnerId` references `users.uid`
- `createdBy` / `buyerPhone` / `ownerId` reference `users.uid`

## 5. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function for role checking
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(resource) {
      return request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    
    function isCreatedBy(resource) {
      return request.auth != null && 
        (resource.data.createdBy == request.auth.uid || resource.data.buyerPhone == request.auth.phone);
    }
    
    // Users Collection
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
    }
    
    // Projects Collection
    match /projects/{projectId} {
      // Public read access for active projects
      allow get, list: if resource.data.status == 'active' || isAdmin();
      
      // Sellers can create their own projects
      allow create: if request.auth != null && 
        request.resource.data.ownerId == request.auth.uid &&
        request.resource.data.keys().hasAll(['name', 'developer', 'village', 'area', 'startingPrice', 'pricePerSqFt', 'distance', 'totalPlots', 'sizeMin', 'sizeMax']);
      
      // Sellers can update their own projects
      allow update: if isOwner(resource) || isAdmin();
      
      // Admins can delete projects
      allow delete: if isAdmin();
    }
    
    // Leads Collection
    match /leads/{leadId} {
      // Buyers read their own leads
      allow read: if isCreatedBy(resource) || isAdmin();
      
      // System creates leads (from buyer app)
      allow create: if request.auth != null;
      
      // Buyers can update their own lead stages
      allow update: if isCreatedBy(resource) || isAdmin();
    }
    
    // Visits Collection
    match /visits/{visitId} {
      // Sellers read visits for their projects
      allow read: if resource.data.projectOwnerId == request.auth.uid || isAdmin();
      
      // Buyers create visits
      allow create: if request.auth != null;
      
      // Sellers can update visit status
      allow update: if resource.data.projectOwnerId == request.auth.uid || isAdmin();
    }
    
    // Cashbacks Collection
    match /cashbacks/{cashbackId} {
      // Buyers read their own claims
      allow read: if resource.data.buyerPhone == request.auth.phone || isAdmin();
      
      // Sellers read claims for their projects
      allow read: if resource.data.projectOwnerId == request.auth.uid || isAdmin();
      
      // Buyers create claims
      allow create: if request.auth != null;
      
      // Admins manage approval workflow
      allow update: if isAdmin();
    }
  }
}
```

## 6. Validation Rules

### 6.1 Client-Side Validation

Validation functions in `src/utils/validation.js`:

```javascript
export const validateProject = (project) => {
  const errors = {};
  
  if (!project.name?.trim()) errors.name = 'Project name is required';
  if (!project.developer?.trim()) errors.developer = 'Developer name is required';
  if (!project.village?.trim()) errors.village = 'Village is required';
  if (!project.area?.trim()) errors.area = 'Area/landmark is required';
  if (!project.startingPrice || project.startingPrice < 100000) errors.startingPrice = 'Starting price must be at least ₹1,00,000';
  if (!project.pricePerSqFt || project.pricePerSqFt < 100) errors.pricePerSqFt = 'Price per sqft must be at least ₹100';
  if (!project.distance || project.distance < 0) errors.distance = 'Valid distance required';
  if (!project.totalPlots || project.totalPlots < 1) errors.totalPlots = 'At least 1 plot required';
  if (!project.sizeMin || project.sizeMin < 100) errors.sizeMin = 'Minimum size must be at least 100 sqft';
  if (!project.sizeMax || project.sizeMax < project.sizeMin) errors.sizeMax = 'Max size must be greater than min size';
  if (!project.heroImage?.trim()) errors.heroImage = 'Hero image URL required';
  if (!project.layoutPlanUrl?.trim()) errors.layoutPlanUrl = 'Layout plan URL required';
  
  return Object.keys(errors).length === 0 ? null : errors;
};

export const validateCashback = (claim) => {
  const errors = {};
  
  if (!claim.buyerName?.trim()) errors.buyerName = 'Purchaser name is required';
  if (!claim.buyerPhone?.trim()) errors.buyerPhone = 'Purchaser phone is required';
  if (!claim.purchasePrice || claim.purchasePrice < 100000) errors.purchasePrice = 'Purchase price must be at least ₹1,00,000';
  if (!claim.projectId?.trim()) errors.projectId = 'Project selection required';
  if (!claim.documentName?.trim()) errors.documentName = 'Document upload required';
  
  return Object.keys(errors).length === 0 ? null : errors;
};
```

### 6.2 Server-Side Validation (Firestore Rules)

The security rules enforce:
- Required fields present on create
- Field type validation (number, string, boolean)
- Value ranges (positive prices, valid coordinates)
- Reference integrity (valid project IDs)
- Role-based write permissions

## 7. Naming Conventions

### 7.1 Collection Names
- Lowercase, plural: `users`, `projects`, `leads`, `visits`, `cashbacks`

### 7.2 Document IDs
- Auto-generated by Firestore: `projects/{autoId}`
- Used as foreign keys in other collections

### 7.3 Field Names
- camelCase for all fields: `startingPrice`, `totalPlots`, `buyerPhone`
- Boolean fields prefixed with `is`, `has`, `can`: `isVerified`, `hasNA`, `canLoan`
- Timestamp fields suffixed with `At`: `createdAt`, `updatedAt`, `submittedAt`

### 7.4 Enum Values
- Lowercase for property statuses: `draft`, `pending`, `approved`, `active`, `inactive`, `sold`, `rejected`
- Other collections retain their existing domain-specific status values.
- Descriptive strings for categories: `East`, `North`, `West`, `South`

## 8. Data Migration Strategy

### 8.1 Version Tracking
- Add `schemaVersion` field to documents for future migrations
- Current version: 1

### 8.2 Migration Process
1. Create migration scripts in `scripts/migration/` directory
2. Use Firebase Admin SDK for bulk operations
3. Test on staging environment first
4. Execute with rollback capability
5. Update `schemaVersion` after successful migration

### 8.3 Example Migration (Future: Adding Project Phase Field)

```javascript
// migrations/v2_add_project_phase.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function migrate() {
  const projectsRef = db.collection('projects');
  const snapshot = await projectsRef.get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    if (!doc.data().hasOwnProperty('phase')) {
      batch.update(doc.ref, { 
        phase: 'Phase 1',        // Default for existing projects
        schemaVersion: 2 
      });
    }
  });
  
  await batch.commit();
  console.log('Migration v2 complete');
}
```

## 9. Backup & Recovery

### 9.1 Scheduled Exports
- Daily Firestore exports to Cloud Storage bucket
- Retention: 30 days for daily, 1 year for monthly
- Point-in-time recovery available

### 9.2 Recovery Procedures
1. Identify corruption timeframe
2. Restore from nearest clean export
3. Replay write operations from audit logs
4. Validate data integrity
5. Switch traffic after verification

## 10. Performance Optimization

### 10.1 Query Patterns
- Use composite indexes for multi-field filters
- Limit result sets with `.limit()`
- Use cursor-based pagination for large datasets
- Avoid client-side filtering when possible

### 10.2 Read/Write Optimization
- Batch writes for related operations
- Use transactions for atomic updates
- Denormalize frequently accessed data
- Cache computed values (e.g., DruvioScore)

### 10.3 Real-time Listener Management
- Subscribe only to active user's data
- Unsubscribe on component unmount
- Use `.where()` clauses to limit scope
- Implement connection state monitoring

## 11. Monitoring & Alerting

### 11.1 Key Metrics
- Read/write operations per collection
- Query latency percentiles
- Active listener count
- Security rule evaluation failures

### 11.2 Alert Thresholds
- Write errors > 1% per 5 minutes
- Query latency p95 > 500ms
- Concurrent listeners > 10,000
- Storage growth > 20% week-over-week

This database architecture provides a solid foundation for Druvio's real-time marketplace while maintaining security, scalability, and data integrity.
