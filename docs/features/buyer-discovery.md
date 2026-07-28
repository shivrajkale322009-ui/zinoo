# Buyer Discovery

- **Purpose:** Let signed-in buyers discover active land/plot projects.
- **User story:** A buyer searches, filters, maps, and inspects factual project information.
- **UI:** Home, feed carousel, search, filters, project cards, Google map, quick panel, project details, gallery/document viewer.
- **Business logic:** Exact `active` status only; search/filter existing data only; verified documents only in buyer details.
- **Database usage:** Read `projects`, `layouts`, active `feed`.
- **Backend logic:** No discovery callable; Firestore/Storage rules enforce visibility.
- **Dependencies:** Google Maps/Places, marker clusterer, display/visibility/filter utilities.
- **Edge cases:** missing map key/coordinates/images/optional fields; zero results; legacy field aliases; reduced viewport.
- **Future improvements:** TODO: deep links and a canonical project schema.
- **Definition of Done:** Non-active inventory is absent; search/filter/map agree; selected project details match stored data; loading/empty/error states work.
