# Security Policy

Vaktim security reports should be sent privately so users are not exposed while an issue is being investigated.

## Reporting a Vulnerability

- Do not open a public GitHub issue for security problems.
- Send reports to `destek@vaktim.app` with the subject line `Security Report: <short summary>`.
- Include the affected URL or page, steps to reproduce, impact, screenshots or proof of concept if available, and your contact information for follow-up.
- If the issue involves tokens, personal data, authentication, redirects, or the invitation flow, mention that clearly in the report.

## Scope

This repository covers the public Vaktim web experience, including:

- `vaktim.app` marketing pages
- `verify-email.html`
- invite/referral pages under `/davet`
- the Vercel serverless function in `api/davet.js`
- deployment configuration such as `vercel.json`

Issues outside this repository may still be relevant, but should be clearly labeled so they can be routed correctly.

## Response Expectations

- We aim to acknowledge new reports within 72 hours.
- We will review the report, assess impact, and follow up if more detail is needed.
- Please allow reasonable time for investigation and remediation before disclosing details publicly.

## Supported Versions

Security fixes are applied to the latest code on the default branch and the current production deployment.

## Safe Disclosure

- Please avoid accessing, changing, or deleting data that does not belong to you.
- Please avoid service disruption, spam, automated high-volume scanning, or social engineering.
- If you believe you unintentionally accessed sensitive information, stop testing and include that detail in your report immediately.

## Rewards

This project does not currently operate a paid bug bounty program.
