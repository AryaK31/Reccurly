<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Reccurly, an Expo/React Native subscription tracking app. The integration covers the full authentication lifecycle (sign-up, sign-in, sign-out), subscription engagement tracking, and user identification. Key additions include:

- **`app.config.js`** — created to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` via `expo-constants` extras, replacing static `app.json` for build-time config injection.
- **`src/config/posthog.ts`** — new PostHog client singleton configured via `Constants.expoConfig?.extra`, with batching, retry, and feature flag settings.
- **`app/_layout.tsx`** — already had `PostHogProvider` + screen tracking wired up (no changes needed).
- **`app/(auth)/Sign_in.tsx`** — already had `user_signed_in`, `user_sign_in_failed`, and `posthog.identify()` (no changes needed).
- **`app/(auth)/Sign_up.tsx`** — already had `user_signed_up`, `user_sign_up_failed`, and `posthog.identify()` (no changes needed).
- **`app/(tabs)/settings.tsx`** — already had `user_signed_out` and `posthog.reset()` (no changes needed).
- **`app/(tabs)/index.tsx`** — added `subscription_card_tapped` event with `subscription_id` and `action` (expand/collapse) properties.
- **`app/(auth)/subscriptions/[id].tsx`** — added `subscription_detail_viewed` event with `subscription_id` on mount.

| Event | Description | File |
|-------|-------------|------|
| `user_signed_in` | User successfully signs in with email and password | `app/(auth)/Sign_in.tsx` |
| `user_sign_in_failed` | User's sign-in attempt failed with an error | `app/(auth)/Sign_in.tsx` |
| `user_signed_up` | New user completes email verification and signs up | `app/(auth)/Sign_up.tsx` |
| `user_sign_up_failed` | User's sign-up attempt failed with an error | `app/(auth)/Sign_up.tsx` |
| `user_signed_out` | User signs out from the app | `app/(tabs)/settings.tsx` |
| `subscription_card_tapped` | User taps a subscription card to expand or collapse it | `app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | User navigates to the subscription detail screen | `app/(auth)/subscriptions/[id].tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/369171/dashboard/1431068)
- **Insight**: [Sign-ups vs Sign-ins (Daily)](https://us.posthog.com/project/369171/insights/h0UAELyC)
- **Insight**: [Sign-up to Subscription Engagement Funnel](https://us.posthog.com/project/369171/insights/r0F5iUSF)
- **Insight**: [Sign-in Failure Rate](https://us.posthog.com/project/369171/insights/AO6ucn1E)
- **Insight**: [User Churn (Sign-outs)](https://us.posthog.com/project/369171/insights/kFlfYqF7)
- **Insight**: [Subscription Card Engagement](https://us.posthog.com/project/369171/insights/99rTV32C)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
