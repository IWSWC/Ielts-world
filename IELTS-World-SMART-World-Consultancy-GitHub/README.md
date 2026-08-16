# IELTS World & SMART World Consultancy

A production-ready education and study-abroad consultancy platform with a
public marketing website, course pages, student accounts, document storage,
teacher profiles, enquiries and an administrative dashboard.

## Main features

- English and Bangla website experience
- Professional course catalogue and individual course pages
- Teacher and student profiles with profile photos
- Student registration, email verification and password recovery
- Email/password and mobile OTP authentication
- Secure student document upload and admin review
- Appointment, counselling and enquiry management
- Admin-managed courses, offers, people, media, content and visual settings
- Responsive layouts for desktop, tablet and mobile
- Privacy-aware Firebase Analytics consent

## Technology

- TypeScript, React 19 and server components
- Vinext, Vite and Cloudflare Workers
- Cloudflare D1 for relational data
- Cloudflare R2 for uploaded documents and media
- Drizzle ORM for the SQLite schema and migrations
- Firebase Authentication for website email/password and phone OTP sign-in
- Resend for transactional email
- Twilio Verify for server-side phone verification workflows

## Requirements

- Node.js 22.13 or newer
- npm
- A Firebase project with Email/Password and Phone providers enabled
- Cloudflare/Sites bindings for D1 (`DB`) and R2 (`DOCUMENTS`)
- Resend and Twilio credentials when their production workflows are enabled

## Local setup

```bash
git clone <your-github-repository-url>
cd <repository-folder>
npm install
```

Copy `.env.example` to `.env.local`, replace the placeholder values and then
start the development server:

```bash
npm run dev
```

Do not commit `.env.local` or any real API secret. Environment files are
ignored by Git; only the safe `.env.example` template is tracked.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | Email address allowed to access the administrator area |
| `AUTH_SECRET` | Random secret of at least 32 characters for signed sessions |
| `RESEND_API_KEY` | Resend credential for verification and recovery email |
| `AUTH_FROM_EMAIL` | Verified sender displayed on transactional email |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Private Twilio credential |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify service identifier |

Firebase's browser configuration is intentionally client-visible. Firebase
Authentication security is enforced through enabled providers, authorized
domains, App Check/rate controls and server-side session verification—not by
hiding the Firebase web API key.

## Useful commands

```bash
npm run dev          # local development
npm run lint         # code-quality and accessibility checks
npm run build        # production build
npm test             # production build and automated route tests
npm run db:generate  # generate a migration after a schema change
```

## Project structure

```text
app/                 pages, components and backend API routes
db/                  database helpers and Drizzle schema
drizzle/             versioned D1/SQLite migrations
public/              logo, images and browser authentication scripts
worker/              Cloudflare Worker entry point
tests/               automated rendered-route tests
.openai/hosting.json Sites resource bindings
```

## Before publishing a fork

1. Add your production domain to Firebase Authentication's authorized domains.
2. Restrict the Firebase web API key to the required APIs and domains.
3. Configure production secrets in the hosting provider, not in source code.
4. Review D1 migrations before applying them to a production database.
5. Confirm email sender verification, SMS regions, quotas and rate limits.
6. Run `npm run lint`, `npm run build` and `npm test`.

## Security

Never report vulnerabilities in a public issue. Contact the repository owner
privately and do not include student documents, credentials or personal data in
screenshots, logs or test fixtures.

## License

No open-source license has been granted yet. All rights are reserved by the
project owner unless a `LICENSE` file is added later.
