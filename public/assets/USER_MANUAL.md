# PichiPie TV — User Operations & Quick-Start Manual
**v1.0 · Dedicated Android TV & Mobile IPTV Player**

> [!NOTE]
> PichiPie TV is a premium, 100% ad-free, and privacy-oriented streaming application. It does not contain pre-loaded channels or track your watching habits. All configurations, favorites, and histories are stored fully offline on your device.

---

## Table of Contents
1. [Installation Guide](#1-installation-guide)
   - [Android TV / Google TV / Firestick](#android-tv--google-tv--firestick)
   - [Android Mobile Devices](#android-mobile-devices)
2. [Onboarding & Privacy Setup](#2-onboarding--privacy-setup)
3. [D-Pad & Remote Navigation Map](#3-d-pad--remote-navigation-map)
4. [Mobile Swipe Gestures Map](#4-mobile-swipe-gestures-map)
5. [Understanding the Layout Layers](#5-understanding-the-layout-layers)
6. [IPTV M3U Playlist & EPG Formatting](#6-iptv-m3u-playlist--epg-formatting)
7. [Troubleshooting & Frequently Asked Questions](#7-troubleshooting--frequently-asked-questions)

---

## 1. Installation Guide

### Android TV / Google TV / Firestick

#### Method A: Using the "Downloader" App (Recommended)
1. Install the free **Downloader** app from the Google Play Store or Amazon Appstore.
2. Go to **Settings > Device / My Fire TV > Developer Options** on your TV.
3. Enable **Install Unknown Apps** for the *Downloader* app.
4. Open *Downloader* and enter the direct URL/link to your compiled `PichiPieTv.apk` file.
5. Download and select **Install**.

#### Method B: USB Flash Drive
1. Copy [PichiPieTv.apk](file:///F:/Antigravity/PichiPie%20Apk/PichiPieTv.apk) to a FAT32-formatted USB drive.
2. Connect the drive to your Android TV USB port.
3. Open a file manager app (e.g., *File Commander*) on the TV.
4. Select the APK and click **Install** (make sure "Unknown Sources" permission is enabled for the file manager).

#### Method C: Android Debug Bridge (ADB)
If you have a developer system connected:
```bash
adb install -r PichiPieTv.apk
```

---

### Android Mobile Devices

1. Transfer the APK file to your phone's storage.
2. Open your device file browser, tap `PichiPieTv.apk`, and tap **Install**.
3. If prompted, allow your file browser app to install unknown applications.

---

## 2. Onboarding & Privacy Setup

Upon launch, the application displays the **Welcome & Privacy Policy** dialog. 
* **Accepting Terms:** To play streams, select the **Accept** button. Once accepted, this screen will be bypassed on future launches.
* **Reviewing Policies:** Click the **Privacy Policy** button to review core principles. PichiPie TV collects no data, uses no trackers, contains no analytics, and is fully ad-free.
* **Declining Terms:** Choosing **Exit** closes the application immediately.

---

## 3. D-Pad & Remote Navigation Map

For TV remotes, D-Pad buttons are fully optimized with custom focus rings:

| D-Pad Key | Event Triggered | Description |
|---|---|---|
| **UP** / **CH+** | Next Channel | Switches to the next channel in the current category. |
| **DOWN** / **CH-** | Previous Channel | Switches to the previous channel in the current category. |
| **LEFT** | Open Channel List | Slides out the navigation drawer containing categories and feeds. |
| **RIGHT** | Now Playing Bar | Displays progress details and descriptions of the active program. |
| **CENTER** / **OK** | Toggle OSD Card | Shows/hides the top-left channel info card (auto-hides in 4s). |
| **MENU** | Toggle List | Opens or closes the channel selection drawer overlay. |
| **BACK** | Exit Confirmation | Opens the exit confirmation dialog (double-tap exit is also supported). |
| **0 - 9 Keys** | Digit Stream Jump | Enter numbers (e.g., `12`) to jump directly to channel index. |

---

## 4. Mobile Swipe Gestures Map

Touch regions are divided to prevent interference with video playback:

```
┌───────────────────────────────────────┬────────────┐
│                                       │            │
│          Swipe Up / Down              │  Drag Up/  │
│        (Change Channels)              │   Down     │
│                                       │            │
│         Swipe Right                   │  (Volume   │
│      (Open Channel List)              │   Control) │
│                                       │            │
│            85% Region                 │ 15% Region │
└───────────────────────────────────────┴────────────┘
```

* **Next Channel:** Swipe **Up** on the main region.
* **Previous Channel:** Swipe **Down** on the main region.
* **Open Channel List:** Swipe **Right** from the left side of the screen.
* **Adjust Volume:** Slide your finger **Up/Down** on the rightmost 15% strip of the display.
* **Select Channel:** Tap any list item in the channel overlay drawer.

---

## 5. Understanding the Layout Layers

* **Cinematic Splash Screen:** Greets you with moving purple-pink lighting and a pulsing dots indicator while fetching live channel lists from the remote playlist source.
* **Overlay Channel List:** Slides out over the playing video. It features a Search bar, Category filters, and a Favorites list marked with interactive ⭐ stars.
* **Watermark Overlay:** A semi-transparent brand icon logo in the top-right corner of the video playback. It has built-in safe-padding margins (24dp) for TV screen overscan safe zones.
* **On-Screen Display (OSD):** Premium dark-glass panel displaying the channel logo, number, name, category, stream resolution, and program guide timelines.

---

## 6. IPTV M3U Playlist & EPG Formatting

PichiPie TV parses M3U files dynamically. The stream processor also handles custom headers:

### Custom IPTV Header Support
Some CDNs or private streams require validation headers. PichiPie TV parses:
1. **Kodi Properties (`#KODIPROP`):**
   ```text
   #KODIPROP:inputstream.adaptive.manifest_headers=User-Agent=PichiPieTV&Referer=https://play.source.tv
   ```
2. **HTTP JSON Parameters (`#EXTHTTP`):**
   ```text
   #EXTHTTP:{"user-agent":"PichiPieTV","referer":"https://source.tv"}
   ```

### Standard Playlist Structure
```text
#EXTM3U
#EXTINF:-1 tvg-id="hbo.us" tvg-logo="https://logo.com/hbo.png" group-title="Movies",HBO HD
http://your-iptv-provider.com/stream1.m3u8
```

---

## 7. Troubleshooting & Frequently Asked Questions

#### Q: The screen remains black, or displays a "Playback Error" toast.
* **A:** This usually occurs if the IPTV URL is offline, requires an active subscription, or requires strict referer/user-agent headers. Check your provider links. PichiPie TV attempts to automatically parse headers and resolves cross-protocol redirects automatically.

#### Q: The channel list drawer does not show D-pad selection.
* **A:** D-pad navigation automatically highlights selection cards on TV. If focus is lost, press the **Back** key once to return focus to the list recycler, or press **Left** to re-open the drawer.

#### Q: How do I add a channel to my Favorites?
* **A:** Open the channel list drawer, navigate to the channel you want, and click the **Favorite** star icon. The channel is instantly added to your favorites list and can be filtered by selecting the "Favorites" category chip.

---
*(C) 2026 Rabius Sani Sojib · PichiPie Labs. All rights reserved.*
