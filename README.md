# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. **Setup Environment Variables**

    Copy `.env.example` to `.env.local` and add your credentials:

    ```bash
    cp .env.example .env.local
    ```

    Then update `.env.local` with your actual keys:

    - **Clerk**: Get your `pk_test_*` key from [Clerk Dashboard](https://dashboard.clerk.com)
    - **PostHog**: Get your project token from [PostHog](https://posthog.com) (optional)
    - **Backend API**: URL of your subscriptions backend

    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
    POSTHOG_PROJECT_TOKEN=phc_your_token_here
    POSTHOG_HOST=https://us.i.posthog.com
    EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5001
    ```

    For a physical phone in Expo Go, use your laptop's LAN IP instead of `127.0.0.1`
    (example: `http://192.168.1.20:5001`).

3. Start the app

    ```bash
    npx expo start
    ```

    For real devices on the same Wi‑Fi, prefer LAN mode:

    ```bash
    npm run start:lan
    ```

    If `--tunnel` fails with ngrok errors (for example `remote gone away`), use:

    ```bash
    npm run start:tunnel
    ```

    If you see `Could not connect to development server`, ensure `EXPO_FORCE_WEBCONTAINER_ENV` is not set in `.env.local` for local development.
    If you see Cloudflare `Error 1101` with `*.boltexpo.dev`, close Expo Go/dev client, stop Metro, then run `npm run start:lan` and open the new QR/link (do not reuse the old `exp://...boltexpo.dev` URL).

In the output, you'll find options to open the app in a

-   [development build](https://docs.expo.dev/develop/development-builds/introduction/)
-   [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
-   [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
-   [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Environment Variables

-   `.env.example` - Template with required variables (committed to repo)
-   `.env.local` - Local development environment (git-ignored)
-   Never commit `.env.local` or `.env` files containing secrets

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

-   [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
-   [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
-   [Clerk Documentation](https://clerk.com/docs): For authentication setup and best practices.

## Join the community

Join our community of developers creating universal apps.

-   [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
-   [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
