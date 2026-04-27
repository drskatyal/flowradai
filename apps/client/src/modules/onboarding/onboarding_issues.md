# Onboarding Flow Review

## Issue: Race Condition between User Creation and Onboarding Submission

### Description
New users are facing issues where their speciality is not saved, or they encounter an error during onboarding. The primary cause is a race condition between the Clerk webhook (`user.created`) and the client-side onboarding submission.

**Flow of Events:**
1.  User signs up via Clerk.
2.  Client redirects user to Onboarding page immediately.
3.  Clerk triggers `user.created` webhook to the backend to create the user in the MongoDB database.
4.  User fills out the Onboarding form and clicks "Submit".
5.  Client sends `PUT /api/users/clerk/:clerkId` to update the user with the selected speciality.

**Problem:**
If the user is fast (or the webhook is slow), step 5 happens *before* step 3 completes.
*   The backend endpoint `updateUserByClerkId` searches for the user by `clerkId`.
*   Since the user hasn't been created yet by the webhook, it returns `404 Not Found`.
*   The client receives the error and shows "Failed to onboard User".
*   The user believes the system is broken. If they manage to bypass this (e.g., refreshing or retrying later), the initial attempt failed to save the speciality.

### Solution

To fix this, we need to ensure the user exists before attempting update, or handle the 404 gracefully.

**Recommended Fix (Client-side):**
Implement a retry mechanism in the `useBoarding` hook or the `handleSubmit` function in `use-boarding.ts`. If the server returns 404 (User Not Found), wait for a short delay (e.g., 1-2 seconds) and retry the request. This gives the webhook time to process.

**Recommended Fix (Server-side):**
In `user-controller.ts` > `updateUserByClerkId`, if the user is not found, you could potentially wait and retry internally, or return a specific error code indicating "User Creation Pending" to instruct the client to retry.

## Issue: Missing Speciality in Navbar Logic

If a user somehow ends up with `status: "active"` (e.g. via `skipOnboarding` or manual intervention) but WITHOUT a `specialityId`:
*   The `Navbar` detects `!user.specialityId` and opens the `UpdateSpecilaity` dialog.
*   This is good behavior as it forces the user to complete their profile.
*   However, ensure that the `UpdateSpecilaity` component handles failures robustly. Currently, it reloads the page on success.

## Action Plan (Status: COMPLETED)

1.  **Modify `apps/client/src/modules/onboarding/hooks/use-boarding.ts`**:
    *   **COMPLETED**: Added a retry loop (5 attempts, 1s delay) to `handleSubmit`. This effectively handles the race condition where the backend hasn't yet processed the user creation webhook when the client submits the onboarding form.

2.  **Verify Webhook Reliability**:
    *   **VERIFIED**: The Clerk webhook handler in `apps/server/src/web/user/user-controller.ts` correctly handles idempotency (updates if exists, creates if new), so no changes were needed there.

## Resolution
The primary issue of "speciality not saving" was identified as a race condition. The client-side retry mechanism has been implemented, which will robustly handle cases where the user creation is slightly delayed. This ensures the user is successfully onboarded with their selected speciality without error.

