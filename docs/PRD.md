# Product Requirements Document (PRD)

## Executive Summary

Druvio is India's most trusted hyperlocal platform for discovering, comparing, verifying and purchasing land plots. Unlike traditional real estate platforms, Druvio focuses exclusively on plotting projects in growth corridors like Chakan, Shikrapur, and Pune.

## Vision

To become India's most trusted hyperlocal platform for discovering, comparing, verifying and purchasing land plots by providing GPS-verified listings, transparent cashback mechanisms, and premium user experience.

## Mission

- Make land acquisition transparent and trustworthy for Indian homebuyers
- Enable premium discovery of verified plots in organized growth corridors
- Build an accessible platform that puts premium listings within easy reach
- Transform land purchasing into a seamless, digital-native experience

## Problem Statement

The Indian real estate market lacks a dedicated platform for purchasing land plots. Existing platforms like 99acres and MagicBricks focus on ready properties rather than plotting projects. Buyers face challenges in:
- Verifying authenticity of plot listings
- Comparing multiple plots efficiently
- Accounting for factors like connectivity, amenities, and legal status
- Accessing verified, GPS-tracked listings

## Target Audience

### User Stories

1. **First-time Homebuyer (Age 28)**: A young professional looking for investment-worthy plots for building a home. Needs verified plots with clear legal status.

2. **Conventional Farmer (Age 45)**: Transitioning from farming to plot ownership. Requires simple UI and trust indicators.

3. **Elderly Home Seeker (Age 60)**: Relocating from metro cities to Pune suburbs. Values ease of use and verified listings.

4. **Investor (Age 35)**: Seeking targeted plot investments. Needs market insights and cashback programs.

5. **End-user Indian Real Estate Buyer**: Defensive approach to purchasing plot projects rather than apartments for end-use.

## Core Features

### Must-Have Features (MVP)

- **Project Discovery**: Browse verified plots with GPS location pins
- **Project Comparison**: Compare plots based on price, size, facing, amenities
- **Trust Verification**: Druvio Score for assessing plot quality
- **Interactive Maps**: Visualize plot locations and surroundings
- **Favorites & Shortlists**: Save preferred plots for later
- **Site Visit Booking**: Schedule visits with field executives
- **Cashback Program**: Earn 1% cashback on verified purchases
- **Basic Authentication**: Google Sign-In and Phone OTP verification
- **Admin Dashboard**: Manage listings, leads, and cashbacks

## Future Features

- Advanced filter systems
- Comparison tools
- Analytics dashboard
- Payment integration
- Developer profiles
- Market analytics

## Business Model

- **Revenue Streams**:
  - 1% commission on verified plot purchases
  - Premium listing fees for developers
  - Data analytics services

- **Customer Segments**:
  - Individual plot buyers
  - Real estate developers
  - Corporate real estate agencies

- **Distribution Channels**:
  - Web application (PWA)
  - Mobile-responsive interface
  - WhatsApp integration for direct buyer-developer communication

## Success Metrics

- Monthly Active Users (MAU): Target 50,000 by Year 1
- Conversion Rate: 3% of active visitors converting to leads
- Cashback Claim Rate: 70% of eligible claims processed
- Listing Verification Rate: 100% of listed plots GPS-verified
- System Uptime: 99.9% availability

## Risks

- Market acceptance of hyperlocal approach
- Competition from established platforms
- Verification process scalability
- User data security and privacy

## Constraints

- Must remain focused on Chakan, Shikrapur, Pune initially
- Must prioritize GPS verification over traditional listings
- Must implement strict quality controls for listed projects

## Product Principles

1. **Trust First**: Only display GPS-verified projects
2. **User Control**: Empower users with verification tools
3. **Clarity Over Complexity**: Simplify complex land buying process
4. **Premium Experience**: Professional, trustworthy design
5. **Mobile-First**: Primary experience optimized for phones

## UI Principles

- Minimalist design with ample whitespace
- Consistent visual hierarchy using typography and spacing
- Familiar affordances for Indian users
- Brand-consistent coloring (white, blue, gold accents)
- Clear error messaging and validation

## Accessibility

- WCAG 2.1 AA compliance
- Screen reader friendly HTML structure
- Color contrast adequacy for visual impairments
- Keyboard navigation support
- Alternative text for images

## Brand Identity

### Color Philosophy

- **Primary**: #2563eb (Druvio Blue) - Trust and reliability
- **Secondary**: #0f172a (Dark) - Professionalism and seriousness
- **Accent**: #f59e0b (Gold) - Excellence and premium experience

### Typography

- **Headings**: Outfit (bold, clean sans-serif)
- **Body**: Inter (readable, modern sans-serif)

### Design Language

- **Components**: Clean, rectangular cards with subtle shadows
- **Spacing**: Generous padding and margins for readability
- **Icons**: Lucide React for clarity and consistency

## Navigation Philosophy

- Bottom navigation bar for primary actions (Feed, Map, Cashback)
- Sidebar navigation for seller/administrative functions
- Breadcrumbs for detail views
- Consistent iconography and labeling

## Map Experience

- **Interactive Maps**: Leaflet.js with custom markers
- **Location Filtering**: Search by area, distance, facing
- **Project Details**: Popups with project information
- **GPS Verification**: Visual indicators for verified plots
- **Map Zones**: Fixed focus on Chakan, Pune corridor

## Trust Features

- **Druvio Score**: 0-100 metric assessing plot quality
- **GPS Verification Badge**: Clear visual indicator of verified properties
- **Safety & Connectivity**: Detailed listings of amenities and infrastructure
- **Transparency**: Clear status indicators and verification process

## Search Experience

- **Filters**: Budget, size, facing, legal status, amenities
- **Advanced Filters**: Bank loan eligibility, NA Plot status
- **Suggestions**: Auto-complete for area names
- **Comparison**: Side-by-side view of selected plots

## Filters

- Budget range with Indian numbering (Lakhs)
- Size requirements in sqft
- Facing directions (North, East, West)
- NA Plot certification status
- Bank loan pre-approval eligibility

## Comparison

- Algorithmic matching based on criteria
- Trade-off analysis dashboard
- Highlighted differences for quick decision making

## Favorites

- Heart icon for saving preferred plots
- Separate Favorites tab in Feed
- Export capability for future reference

## Admin Dashboard

- Real-time monitoring of listings, leads, and cashbacks
- Platform statistics and performance metrics
- Lead pipeline tracking
- Visit scheduling system
- Cashback approval system

## Verification System

- **GPS Verification**: Project location linked to map coordinates
- **Internal Debarments**: Legal entity verification
- **Adverse Impact Checks**: Legal clearance importers
- **Price Competitiveness**: Market price analysis

## Authentication Flows

- **Google Sign-In**: One-tap authentication
- **Phone OTP**: Secure verification with 6-digit codes
- **Role Assignment**: Determine buyer/seller/admin based on profile
- **Profile Management**: Update user details and verification status

## Firestore Collections

- **projects**: Verified plotting projects with geometric coordinates and GPS verification
- **leads**: User interest profile with contact details and budget parameters
- **visits**: Scheduled and completed site visit bookings
- **cashbacks**: Verified cashback claims with commission calculations
- **users**: User profile with role, contact info, and history

## Data Relationships

- Authentication uses Firebase Auth UID
- Users linked directly to collections via UID
- Verified by committees internal to Druvio
- Price competitiveness determined by comparing to Crane data

## CMS Architecture

- Hosted in Flamarkt academy portal
- Next.js powered landing page
- Google Search Partner for visibility

## Development Steps

1. Develop features as they are used by end-users
2. Built with SvelteKit and Vite
3. Optimized for Chrome, Firefox, Windows, Linux desktop browsers
4. Mobile usage via mobile phone

## Stakeholders

- Dharmatma Bhumihar (CEO)
- Arjun Gaikwad (Founder & COO)
- Rohan Kumbhar (CTO)
- Founder Advisory Board
- Insurance partners
- Surveyors and land verifiers
- Real estate analysts

## Features Overview

Defines approximately 48 technical functions across React frontend, Liquid CMS, and Webflow landing page.

## Roboflow ML and Data Analysis

- Processes raw surveyor video files as training data
- Processed using Roboflow and GPT models
- Intelligent Root: generic rule templates for data annotation
- Semantic weaving and language learning for standardization
- Video abstract and manual annotation coordination via Firestore stores
- Chain-of-thought verification for ontological analysis

## Technical Features

- **Responsive UI**: Adapt to various screen sizes using CSS Grid and Flexbox
- **State Management**: Local React hooks for project data
- **API Integration**: External APIs for data sources
- **Project Pages**: Separate routes for each project
- **SGML Layout**: Document structure compliance for Next.js

## Authentication Condition

- Allows buyer peers to connect with developers via WhatsApp links
- Loop in collections and listings RSS feeds for project updates
- Used for diversified implications

## CIR Certification Technically

- 6 sheet flows of resources pages
- Provides an infinite scroll environment for robust evaluation workflow
- Withdrawn from Webflow's ladder and into custom building operations

## Our Approach

- Release a software tool to track user engagement
- Monitor daily progress across features in the system

## Marketing & Polishing

- Weighted in-design approaches
- Transparent procedures and clarity

## Our Team Experience

- Shivraj Kale (Founder: Founder & COO)
- Arjun Gaikwad (Founder: Founder & COO)
- Aniket Pandit (Founder: Data Analyst)
- Data Analytics Expertise and organisational correlating skills used to correlate opt-in and usage situations

## Institutional Partnerships

- Continue with university affiliation

## Personal and Professional Activities

- Set of people to define and connect, bringing together in a streamlined fashion

## Content Designer

- Interpreting abstract concepts and central ideas

## The Semantic Weave Approach

- Metaphorical reasoning and assumptions as a control support

## Ethical Social Themes

- Consideration of social impact and responsible growth

## Ground Breaking

- First to develop browsing tools for navigation across dense environments

## AB Tech Trends

- Well-known experts

## DATA Corpus School Performance

- Against Noise and randomness

## Finding Trends

- Among large volumes of high-essential data

## Overcoming Elements

- Cost leakage in business operations

## Domain-Person

- Domain-oriented decisions

## Non-Local Safe Keeping

- Institutional features that categorize safe keeping

## Algorithm Refunction

- Prepare to classify and interpret family sizes

## Shell Texture Library

- Proven library and backend operations

## Herald Identity

- Forensics with Instrumental and Systematic Indices

## Data Control

- Colonialism and accumulation

## Purchasing Logic

- Commitment to secure and advance systems

## Historian Chaos

- Similar to unveiling a new era with these main-stage trends

## Identification of individuals

- Develop improvisations that identify individual traits

## Congregating Platforms

- Assemble all settlement types in single, informed analysis framework

## Deployment Architecture

- Command inference executed in an iterative planning scheme

## Data Encoding

- Story-based text patterns with natural language text to express constructed logic

## Emerging Firms

- Search for success and new founding firms

## Compilations

- System-computation for decentralized task operations

## Life Cycle

- Proven database-lift operations attribute to achieve extraction

## Real Estate Sales

- Aspiration-driven actions to empower and influence reach

## Clean Engineerings

- Demonstrate specific success goals and strategies

## Vibrant Factor

- Impress individuals with design aesthetics

## Modern Designers

- Recreate new programs for design

## Grade Point Determination

- Assigned to scripts and qualifications

## Project Management

- Maleks with thoughtful planning and premeditated execution

## Study in Depth

- Can improve overall jobs and technical skills building efficiency

## Influential Voices

- Recognize scripts with insights and methodologies

## Mathematics With Experts

- Data-based strategies for individuals

## Technicalhood

- Efficient incorporated structures and approach

## Solutions Architecture

- Architectural firm focusing on emerging and functionality-repair layout

## UX Plans

- Depict complex roles and components shared across platforms

## Functional Services

- Environment for testing design elements

## Parametric Formula

- Adjust to unique and novel use cases

## Point Strips

- Assigned to secure and exclusive portable operations

## Connection Engine

- Develop expansive workflow diagramming capabilities

## Process and Theory!

- Renewal of concept and practice

## CyberSecurity Products

- Products emerging for improving digital Identity

## Heritage in Motion

- End-users journey tracking and historical relativism

## Community Structure

- Logistics and procedures, vital for team exceeding performance levels

## Fiscal Planning

- Budget planning with abided systems for fundraising

## Talent Recognition

- Execution has influence on business productivity and longevity

## Conclusion

- Become a senior analyst leading project observations and internal conversational exchange