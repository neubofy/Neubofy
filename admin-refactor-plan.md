## Admin Secure Refactor Plan

1. We've discovered `NEXT_PUBLIC_ADMIN_EMAIL` is the primary owner email. The Vercel secrets for Firebase Admin SDK aren't individual keys (like `FIREBASE_PRIVATE_KEY`), but a JSON string (likely `FIREBASE_SERVICE_ACCOUNT_KEY` which is still missing in standard `process.env` print because I only filtered for `FIREBASE`). Wait, let me double check the `env` keys just in case.
2. Given we are standardizing on custom claims, we should add an endpoint `src/app/actions/adminActions.ts` that sets custom claims using the Admin Auth SDK. Wait, setting custom claims via `adminAuth.setCustomUserClaims(uid, { admin: true })` requires the Admin SDK to be successfully initialized.
3. If Admin SDK is not properly initialized, custom claims fail. Thus, maintaining `admins` collection in Firestore is the standard approach when Custom Claims aren't guaranteed to work due to restricted service accounts.
