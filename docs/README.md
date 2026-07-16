# Druvio Project Documentation

Welcome to Druvio, India's most trusted hyperlocal platform for discovering, comparing, verifying and purchasing land plots.

## Overview

Druvio is a premium, modern, and mobile-first web application designed to help buyers find and purchase verified plotting projects in the Chakan, Shikrapur, and nearby Pune growth corridors.

The application provides a seamless experience for:
- **Buyers**: Explore verified projects, book site visits, and claim cashback
- **Sellers**: Manage property listings, track leads, and monitor inventory
- **Admins**: Moderate listings, verify cashback claims, and oversee platform operations

This documentation provides comprehensive guidance for developers working on the Druvio platform.

## Project Structure

The documentation is organized into the following sections:

1. **PRD.md** - Product Requirements Document
2. **ROADMAP.md** - Development roadmap and milestones
3. **ARCHITECTURE.md** - Technical architecture and implementation details
4. **DATABASE.md** - Firestore schema and data model
5. **UI_UX.md** - User interface and experience design
6. **CLAUDE.md** - Development guidelines for AI assistants
7. **TASKS.md** - Prioritized development backlog
8. **CHANGELOG.md** - Version history and release notes

Each document builds upon the previous ones to provide a complete understanding of the project.

## Getting Started

For new developers joining the Druvio team, we recommend reading the documentation in this order:

1. **PRD.md** - Understand the business requirements and user expectations
2. **ARCHITECTURE.md** - Learn the technical architecture and codebase structure
3. **UI_UX.md** - Understand the design language and user interface patterns
4. **CLAUDE.md** - Review development guidelines and best practices

The codebase follows a component-based React architecture with Firebase integration for real-time data synchronization.

## Key Technologies

- **Framework**: React with Vite
- **Styling**: CSS with CSS variables and responsive design
- **Database**: Firebase Firestore with real-time synchronization
- **Authentication**: Firebase Auth (Google + Phone OTP)
- **Map**: Leaflet.js with react-leaflet integration
- **Service Worker**: PWA support for offline functionality
- **Icons**: Lucide React for component icons

## Running the Application

To run Druvio locally for development:

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Development Philosophy

Druvio is built with the following principles in mind:

1. **Premium Experience**: Clean, modern UI with attention to detail
2. **Trust & Verification**: Every plot is GPS-verified and scored for reliability
3. **Mobile-First**: Optimized for mobile devices with progressive enhancement
4. **Real-Time Data**: Live synchronization of listings, leads, and bookings
5. **Performance**: Optimized for fast loading and smooth interactions
6. **Accessibility**: Structured HTML and ARIA support for screen readers

## Support

For technical questions or issues, please refer to the development guidelines in **CLAUDE.md** and coordinate with the technical team.