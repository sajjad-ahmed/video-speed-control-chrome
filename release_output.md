# Release Output: Video Speed Controller Pro (v0.1.0)

Here is all the text and information you need to publish your extension to the Chrome Web Store. Everything is provided in copyable format.

---

## 1. Store Description
*Copy and paste this into the Description field on the Listing tab.*

```text
Take full control over HTML5 video playback speed on any website. Video Speed Controller Pro allows you to speed up or slow down videos from 0.25x to 4.00x, saving you time or helping you catch every detail. Set a global default speed that applies everywhere, or configure custom speeds for specific websites — no page refresh needed.

KEY FEATURES
• Granular Speed Control: Adjust playback speed from 0.25x to 4.00x in 0.25x increments.
• Global Default Speed: Set a baseline speed that automatically applies to all videos across the web.
• Site-Specific Overrides: Configure custom playback speeds for up to 15 specific domains (e.g., set YouTube to 1.50x and Udemy to 2.00x).
• Exact Domain Matching: Subdomains are treated separately (e.g., youtube.com and music.youtube.com can have different speeds).
• Instant Updates: Changes apply immediately. No need to refresh the page.
• Modern Dark UI: A clean, distraction-free interface that looks great.
• Persistent Enforcement: Automatically reapplies your chosen speed even if a site's custom video player tries to reset it.

HOW IT WORKS
1. Click the extension icon to open the control panel.
2. Select your desired "Global Playback Speed" to apply everywhere.
3. To customize a specific site, click "Add Site" or "Use Current Site" under the Site-Specific section.
4. Choose the speed for that domain. Site-specific rules always override the global speed.
5. Watch videos at your preferred pace!

SUPPORTED SITES
Works seamlessly on almost any site with HTML5 video, including:
• YouTube
• Netflix
• Udemy
• HBOMAX
• Facebook
• Twitter / X
• Vimeo
• Reddit
• And thousands more!

PRIVACY First
Your data belongs to you. This extension does not collect, transmit, or share any user data. All your speed preferences are stored locally in your browser using Chrome's secure storage sync.

SUPPORT
Developed by Sajjad Ahmed Niloy.
Website: https://sajjadahmed.com
```

---

## 2. Privacy Practices Justifications
*Copy and paste these into their respective fields on the Privacy practices tab.*

### Single purpose description
```text
Controls HTML5 video playback speed on any website, allowing users to set a global default speed or configure per-site speed overrides.
```

### Justification for `activeTab`
```text
activeTab is used to detect the current tab's URL when the user clicks "Use Current Site" in the popup. This allows the extension to auto-fill the domain field for site-specific speed rules. No page content is read or modified through this permission.
```

### Justification for host permission (`<all_urls>` via content_scripts)
```text
The content script runs on all URLs to detect HTML5 <video> elements on any webpage and apply the user's configured playback speed (global or site-specific). It only interacts with video elements and does not read, collect, or transmit any page content or user data.
```

### Justification for `storage`
```text
The storage permission is used to save the user's playback speed preferences (global speed and site-specific speed overrides) via chrome.storage.sync. This allows settings to persist across browser sessions and sync across the user's devices. No personal or sensitive data is stored.
```

### Justification for `tabs`
```text
The tabs permission is used to query the active tab's URL so the extension can determine the current website's domain. This is needed to match site-specific speed rules and to populate the domain field when the user clicks "Use Current Site." No browsing history or tab content is accessed.
```

### Justification for `webNavigation`
```text
The webNavigation permission is used to detect client-side (SPA) navigations via onHistoryStateUpdated. Sites like YouTube and Netflix change URLs without full page reloads, so this permission allows the extension to re-apply the user's configured playback speed when navigating between videos. No browsing history or navigation data is collected, stored, or transmitted.
```

### Justification for remote code
```text
This extension does not use any remote code. All JavaScript is bundled locally within the extension package. No scripts are fetched or executed from external servers.
```

### Data usage compliance certification
```text
This extension does not collect, transmit, or share any user data. All settings are stored locally using chrome.storage.sync and never leave the user's browser/Google account sync. No analytics, tracking, or third-party services are used.
```

---

## 3. Upload Checklist

1. **ZIP File:** Go to the Chrome Web Store Developer Dashboard and upload `download/video-speed-controller-pro-v0.1.0.zip`.
2. **Listing Details:** Paste the Store Description (Section 1).
3. **Icons & Screenshots:** Upload your `128x128` icon, the `1280x800` banner screenshot, and the small/marquee promo tiles from the `icons/` folder.
4. **Privacy Tab:** Paste all the justifications (Section 2) into their respective boxes.
5. **Certify:** Check the box confirming your data usage complies with policies.
6. **Submit:** Save draft and click **Submit for Review**.
