# Property Media, Documents, and Display

- **Purpose:** Manage property presentation without losing legacy record compatibility.
- **User story:** Seller/Admin uploads media/documents and controls factual buyer-facing sections.
- **UI:** media/documents manager, cropper, display editor tabs, gallery/lightbox, in-app document viewer.
- **Business logic:** Display schema version is integer; verified/enabled/detail-visible documents alone render to Buyer; Storage rules control uploads.
- **Database usage:** project arrays/nested `display`; `project-media` and `project-documents` Storage.
- **Backend logic:** No media callable; client uploads are rule-authorized. Feed media is separate.
- **Dependencies:** display-model and project-document utilities.
- **Edge cases:** legacy URLs/arrays, upload cancellation/failure, file type mismatch between UI and rules, missing cover image.
- **Future improvements:** TODO: canonical nested schema migration and orphan-file cleanup.
- **Definition of Done:** Existing records render; new metadata round-trips; buyer visibility honors verification flags; upload restrictions are respected.
