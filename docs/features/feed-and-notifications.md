# Feed Banners and Notifications

- **Purpose:** Publish Admin-curated buyer-home banners and deliver workflow notices.
- **User story:** Admin manages banner order/visibility; signed-in users see active banners and their notifications.
- **UI:** `FeedBannerManager`, `FeedBannerCarousel`, `NotificationCenter`.
- **Business logic:** Banner order is 1–5; exact feed fields; trusted code creates notifications; recipients only mark read.
- **Database usage:** `feed`, `notifications`; `feed-banners` Storage.
- **Backend logic:** `manageFeedBannerAsset`; workflow callables create notifications.
- **Dependencies:** callable Functions, Firestore indexes, Storage download URLs.
- **Edge cases:** duplicate order, missing image, inactive/all-empty feed, failed asset cleanup, `admins` pseudo-recipient.
- **Future improvements:** TODO: resolve Admin fan-out and define banner order uniqueness.
- **Definition of Done:** Only Admin mutates feed; assets meet type/size/path rules; carousel shows active ordered records; notification reads are recipient-scoped.
