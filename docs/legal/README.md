# Zinoo Legal Documentation

**Documentation Set Version:** 0.1.0-draft  
**Status:** Pre-launch draft; not effective  
**Owner:** Shivraj Kale (Individual)  
**Documentation Steward:** Shivraj Kale  
**Last Updated:** 30 July 2026

## Purpose

This folder is Zinoo's repository source of truth for public-facing legal documents. It is designed for product implementation, store review, internal change control, and review by qualified Indian counsel. It does not replace legal advice.

No document in this draft set is effective until its TODOs are resolved, counsel approves it, and an Effective Date is inserted.

## Document Map

| Document | Purpose | Key relationships |
|---|---|---|
| [Privacy Policy](privacy-policy.md) | Explains personal-data practices | Deletion Policy, Cookie Policy, Terms |
| [Terms and Conditions](terms-and-conditions.md) | Governs use of Zinoo | Disclaimer, IP Policy, Refund Policy |
| [Disclaimer](disclaimer.md) | Explains marketplace and property-information limits | Terms |
| [Data Deletion Policy](data-deletion-policy.md) | Explains deletion requests and exceptions | Privacy Policy |
| [Refund and Cancellation Policy](refund-and-cancellation-policy.md) | Records the current no-payment position | Terms |
| [Cookie Policy](cookie-policy.md) | Covers device storage, analytics, pixels, and a future website | Privacy Policy |
| [Copyright and IP Policy](copyright-and-intellectual-property-policy.md) | Protects Zinoo materials and handles infringement reports | Terms |
| [Versioning Guide](VERSIONING.md) | Defines legal release numbering | Changelog, archive |
| [Changelog](CHANGELOG.md) | Records legal releases | All documents |
| `archive/` | Stores immutable superseded releases | Versioning Guide |

## Relationship and Precedence

The Terms govern platform use. The Privacy Policy governs personal-data handling; the Data Deletion Policy provides the operational deletion route; and the Cookie Policy adds detail about device/browser technologies. The Disclaimer supplements, but does not override, the Terms. The Refund Policy controls Zinoo payment and cancellation disclosures if payments are later introduced. The IP Policy supplements the Terms for ownership and infringement reports.

If documents conflict, the more specific document controls for its subject, subject to applicable law and mandatory consumer rights. A conflict must be logged and corrected promptly.

## Ownership and Review

The Owner approves legal releases. Product and engineering must verify that every statement matches the deployed product, SDK configuration, data flows, and operational practice. Qualified Indian counsel should review the complete set before production, Google Play publication, App Store publication, any website launch, material feature changes, or expansion outside India.

Review at least every six months and before any change involving data categories, purposes, recipients, permissions, minors, payments, sellers, advertisements, or new jurisdictions.

## Update Workflow

1. Open a tracked change describing the product or legal trigger.
2. Update every affected document and its metadata.
3. Complete privacy, security, product, and operational fact checks.
4. Resolve or explicitly retain TODOs; never silently infer a business practice.
5. Obtain Owner and legal approval.
6. Move the superseded release to `archive/<version>/`.
7. Update `CHANGELOG.md`, assign the new version, insert dates, and publish the same text in every user-facing surface.
8. Preserve evidence of approval and publication.

## Folder Conventions

- Public documents use lowercase kebab-case names.
- Drafts use a SemVer prerelease label such as `0.1.0-draft`.
- Archived releases are immutable and stored under `archive/<version>/`.
- Dates use `DD Month YYYY`.
- TODO blocks identify decisions, owners, and launch impact.
- Links should be repository-relative here and replaced with stable public URLs in the app/store listings.

## Open Decisions Before Launch

- [ ] Choose the legal operating identity and complete postal address for Shivraj Kale; determine whether a proprietorship or entity will operate Zinoo.
- [ ] Obtain Indian counsel review and approve an Effective Date and initial production version.
- [ ] Determine whether Zinoo is an e-commerce entity/intermediary and implement all applicable grievance, seller-information, takedown, and consumer-disclosure duties.
- [ ] Appoint and publish the appropriate privacy/grievance contact, role, postal address, and complaint process.
- [ ] Inventory Firebase/Google, Meta, WhatsApp, and other processors; confirm enabled products, purposes, data fields, contract terms, and international transfer locations.
- [ ] Decide whether Meta Pixel/Facebook Analytics is actually present in the mobile app or future website; disable or disclose/configure consent as required.
- [ ] Finalize retention periods by data category, including backups, logs, inquiries, booking requests, reviews, analytics, and deletion records.
- [ ] Design and validate account deletion in the app and on a public web page; define identity verification, authentication-data deletion, processors, backups, and service-level targets.
- [ ] Resolve access by people under 18, including age assurance and verifiable parental consent where required; assess restrictions on tracking, behavioural monitoring, and targeted advertising to children.
- [ ] Define seller eligibility, identity/property verification, listing moderation, complaint escalation, and whether developers/brokers/owners are treated differently.
- [ ] Decide whether users may upload listings, photos, reviews, or other content and implement licences, moderation, notices, appeals, and repeat-infringer handling.
- [ ] Confirm the exact inquiry/contact workflow and the fields disclosed to each seller; show a just-in-time disclosure before sharing.
- [ ] Choose governing courts, dispute escalation, and whether arbitration will be used; do not publish the bracketed dispute language until counsel approves it.
- [ ] Define security controls and incident response based on the implemented architecture; verify every security statement.
- [ ] Establish privacy-rights intake, consent withdrawal, correction, access/information, nomination, and grievance workflows required by applicable law.
- [ ] Decide cashback programme terms, eligibility, expiry, fraud controls, tax treatment, and whether cashback has monetary value.
- [ ] Before payments: select provider, merchant/refund flow, cancellation rights, taxes, timelines, fees, and responsibility for seller-side refunds.
- [ ] Before a website: perform a cookie/SDK audit, implement preference controls where required, and publish a cookie inventory.
- [ ] Secure rights to the Zinoo name, logo, listing images, maps, UI assets, documentation, and third-party content; consider trademark registration.
- [ ] Confirm Google Play Data safety and future App Store privacy disclosures against the final data map.

## Internal Consistency Review

Reviewed on 30 July 2026. The documents consistently describe Zinoo as a pre-launch real-estate marketplace that does not automatically share buyer data, does not currently process payments, and uses optional location. No contradiction was found in the drafted set. The known product/legal tension concerning under-18 users is deliberately flagged above and in the Privacy Policy and Terms.

