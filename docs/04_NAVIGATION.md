# Navigation

## Navigation model

- There is no route library and no URL-addressable screen contract.
- `App.jsx` chooses a role view in memory.
- Each workspace chooses its internal destination with local state.
- Profile controls expose only permitted role switches.

## Global flow

```text
App loading
  -> Signed out: Login
  -> Signed in: load users/{uid}
      -> Admin default
      -> Seller default
      -> Buyer default
```

## Login

| Item | Definition |
|---|---|
| Purpose | Authenticate and create/load a buyer profile |
| Entry | Unauthenticated app |
| Components | `LoginScreen` |
| Actions | Google sign-in; phone OTP sign-in |
| Destination | Permission-derived default workspace |
| Dependencies | Firebase Auth, `users/{uid}`, reCAPTCHA for phone |

## Buyer workspace

| Screen | Purpose | Entry/components | Actions | Destinations/dependencies |
|---|---|---|---|---|
| Home | Search and browse active projects; show feed banners | Default buyer screen; search header, `FeedBannerCarousel`, cards | Text/voice search, place suggestion, filters, select project | Project panel/details or Map; active projects, feed, Google Places |
| Map | Spatial discovery | Nav; `MapScreen` | Pan/zoom, select marker/cluster, toggle layers, view layout | Quick project panel or details; Google Maps, `layouts` |
| Project quick panel | Context for selected project | Select a project | Call, map/directions, share, save locally, details, book visit | Full details, booking modal, external phone/map |
| Project details | Full property information | Quick panel/card | Gallery, verified document preview, share, call, directions, visit | Back to prior map/home context |
| Visit modal | Schedule site visit | Project action | Submit name, phone, date | Creates `visits`; creates `leads` if phone not found |
| Cashback: New request | Submit eligible purchase | Nav or project context | Select project, enter purchase details, upload proof, submit | Cashback History |
| Cashback: History/detail | Track own claims | Cashback tab | Search/filter/open detail | Claim detail; `cashbacks` |
| Profile/settings | Account and permitted view switching | Global profile control | Edit profile, theme, become seller, sign out, switch role | Seller/Admin if permitted; `users`, `sellerRequests` |

Desktop buyer nav: Home, Map, Cashback sidebar.  
Mobile buyer nav: Home, Map, Cashback bottom navigation.

## Seller workspace

| Screen | Purpose | Entry | Actions | Dependencies/destination |
|---|---|---|---|---|
| Dashboard/Projects | Portfolio metrics and listings | Seller default | Select/edit listing; create listing | Project editor or Create listing |
| Create listing | Create pending seller-owned project | Sidebar/project nav | Edit fields, location, display, media/documents, submit/reset | `projects`, Storage, map picker |
| Edit listing | Edit owned project | Project list | Save fields/display/media/documents | Direct project update subject to rules |
| Leads | View buyer interest pipeline | Sidebar; hidden in managed-admin seller mode | Review lead records | `leads` |
| Site visits | View scheduled visits | Sidebar; hidden in managed-admin seller mode | Review visit records | `visits` |
| Cashback requests | Review assigned claims | Sidebar | Open detail; approve/reject when allowed | `manageCashbackRequest` |
| Profile editor | Update seller profile | Mobile/profile control | Edit profile | `users/{uid}` |

Mobile seller nav exposes Dashboard, Projects, Leads, Profile; other destinations remain available through workspace controls.

## Admin workspace

| Screen | Purpose | Actions/dependencies |
|---|---|---|
| Dashboard | Summaries and pending previews | Jump to seller requests/listings |
| Properties | Master property list/detail/editor | Filter, inspect, edit, approve, reject, activate, deactivate, mark sold, assign seller |
| Buyers | Buyer account list | Read users classified as buyers |
| Sellers | Approved seller list | Select seller; enter managed seller workspace |
| Seller requests | Review access applications | Approve/reject through callable |
| Listings | Moderation-oriented project tables | Review pending and existing listings |
| Cashbacks | Global claim workspace | Seller/admin lifecycle actions according to status |
| Feed | Manage buyer-home banners | Upload, order, activate/deactivate, delete |
| Profile | Admin account summary | Open settings |
| Settings | Appearance/settings UI | Toggle theme and available settings |

Admin navigation is a sidebar on desktop and a drawer on mobile. Managed-seller context is stored in session storage and includes the selected seller plus the entering admin UID.

## Navigation constraints

- Do not add, remove, rename, or reorder destinations unless requested.
- Do not introduce URL routing incidentally.
- Leaving managed-seller mode must clear its session context.
- Selecting seller mode as Admin without a seller opens seller selection, not an ownerless seller workspace.
- Disabled or unbacked navigation must not be presented as implemented.

## TODO

- TODO: Document exact browser-history/back behavior; current navigation is state-based.
- TODO: Decide whether deep links are required.
- TODO: Reconcile mobile seller destination parity with desktop.
