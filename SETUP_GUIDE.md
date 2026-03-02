# Setup Guide

This guide walks you through the full setup process for the Payload Instagram Plugin: converting your Instagram account, creating a Meta Developer App, and configuring the plugin.

---

## Part 1: Convert to Instagram Business/Creator Account

The Instagram API only works with **Business** or **Creator** accounts. Personal accounts are not supported.

1. Open the **Instagram app** on your phone.
2. Go to your **Profile** and tap the hamburger menu (top right).
3. Tap **Settings and privacy**.
4. Scroll to **For Professionals** (or **Account type and tools**).
5. Tap **Switch to Professional Account**.
6. Choose either **Business** or **Creator** depending on your use case.
7. Follow the on-screen steps to complete the switch.

**Good to know:**
- Your account will become **public** after switching.
- All your existing content and followers are preserved.
- The switch is **free** and **reversible** — you can switch back to a personal account at any time.

---

## Part 2: Set Up a Meta Developer App

### 1. Register as a Meta Developer

1. Go to [developers.facebook.com](https://developers.facebook.com).
2. Log in with your Facebook account.
3. If you haven't already, complete the developer registration process.

### 2. Create a New App

1. From the developer dashboard, click **Create App**.
2. Select **Other** as the use case, then click **Next**.
3. Select **Business** as the app type, then click **Next**.
4. Enter an app name and contact email, then click **Create App**.

### 3. Add the Instagram Product

1. In your app dashboard, click **Add Product** in the left sidebar.
2. Find **Instagram** and click **Set Up**.
3. Select **API setup with Instagram Login**.

### 4. Note Your App Credentials

1. In the left sidebar, go to **Instagram > Basic Display** (or **Instagram > Settings**).
2. Note the **Instagram App ID** and **Instagram App Secret**.

> **Important:** Use the Instagram App ID and Secret shown under the Instagram product settings, **not** the Facebook App ID/Secret shown at the top of the dashboard.

### 5. Configure Redirect URI

1. Under the Instagram product settings, find **Valid OAuth Redirect URIs**.
2. Add the following URI:
   ```
   https://yourBaseUrl/api/instagram/authorize
   ```
   Replace `yourBaseUrl` with your actual domain (e.g., `https://example.com` or `https://localhost:3000`).

3. Optionally, also configure:
   - **Deauthorize Callback URL:** `https://yourBaseUrl/api/instagram/unauthorize`
   - **Data Deletion Request URL:** `https://yourBaseUrl/api/instagram/delete`

> **HTTPS is required.** Instagram will not accept HTTP redirect URIs. For local development, run your server with `--experimental-https`.

### 6. Add Instagram Testers (Development Mode)

While your app is in **development mode**, only added testers can authorize with it.

1. In the left sidebar, go to **App Roles > Roles**.
2. Under **Instagram Testers**, click **Add Instagram Testers**.
3. Enter the Instagram username of the account you want to connect.
4. Open Instagram, go to **Settings > Website Permissions** (or **Settings > Apps and Websites**), and **accept the tester invitation**.

### 7. App Review (Production)

For development and personal use, you can skip this step. If you need other users (beyond testers) to authorize their Instagram accounts with your app, you will need to submit your app for **App Review** through the Meta Developer dashboard.

---

## Part 3: Configure the Plugin

### 1. Install the Plugin

```bash
npm install instagram-payload-plugin
```

### 2. Add to Payload Config

In your `payload.config.ts`:

```ts
import { instagramPlugin } from 'instagram-payload-plugin'

export default buildConfig({
  plugins: [
    instagramPlugin({ enabled: true })
  ],
})
```

### 3. Start Your Server with HTTPS

For local development, you need HTTPS for the Instagram OAuth flow:

```bash
next dev --experimental-https
```

### 4. Authorize with Instagram

1. Open your Payload admin panel in the browser.
2. In the left sidebar, click **Instagram Posts**.
3. Enter the **Instagram App ID** and **Instagram App Secret** from [Part 2, Step 4](#4-note-your-app-credentials).
4. Click **Authorize** — you will be redirected to Instagram to grant access.
5. After authorizing, you will be redirected back to your admin panel.

### 5. Token Management

Once authorized, the plugin handles token management automatically:

- The access token is stored in the database.
- It **auto-refreshes every 10 days** (tokens are valid for 60 days).
- You do not need to re-authorize unless the token expires or is revoked.

---

## Troubleshooting

- **"Redirect URI mismatch" error:** Make sure the redirect URI in your Meta Developer App exactly matches `https://yourBaseUrl/api/instagram/authorize`, including the protocol (`https://`) and any port number.
- **"This app is in development mode" error:** Add your Instagram account as a tester (see [Part 2, Step 6](#6-add-instagram-testers-development-mode)) and accept the invitation on Instagram.
- **OAuth fails on localhost:** Ensure you are running your dev server with `--experimental-https`. Instagram rejects plain HTTP redirect URIs.
- **No posts showing up:** Make sure your Instagram account has posts and that you authorized with the correct account.
