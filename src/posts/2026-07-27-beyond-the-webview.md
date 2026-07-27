---
title: "Beyond the Webview"
date: 2026-07-27
description: "When a Capacitor-wrapped web app stops being the right answer, and what to reach for instead"
tags: ["mobile", "architecture"]
draft: false
---

When a Capacitor-wrapped web app stops being the right answer, and what to reach for instead. The dividing line is what must run on screen at 60 fps or behind the lock screen — not how many features the app has.

## The tools

| Tool | Role |
|---|---|
| Capacitor | web wrapper |
| React Native | native views, JS |
| Expo | RN framework |
| Flutter | own renderer |
| Swift / SwiftUI | iOS native |
| Kotlin + Compose | Android native |
| Compose Multiplatform | KMP UI |
| .NET MAUI | C# shops |
| Unity | game engine |
| Godot | game engine, OSS |

## When not Capacitor

| App profile | Why the webview fails | Reach for |
|---|---|---|
| Games, physics, heavy animation | Needs a real render loop, GPU pipeline, sprite batching. | Unity, Godot |
| Media-heavy feeds — infinite scroll of images/video, TikTok-like | List virtualization plus video decode stutters exactly where the product lives. | React Native, Expo, Flutter |
| Camera / AR-centric — live filters, scanning, Snapchat-like | Frame-level camera access and GPU shaders. | Swift, Kotlin, RN with native modules |
| Maps-first — the map is the app, Uber-like | A gesture-heavy native map embedded in web is a seam you fight forever. | React Native with native map views, Swift, Kotlin |
| Audio-first — player, recorder, podcasts | Background execution, lock-screen controls, low-latency audio. Webview JS and AudioContexts get suspended seconds after backgrounding. | Swift, Kotlin, RN (mature libs), Flutter (`audio_service`) |
| Background location & fitness — turn-by-turn, workout GPS, HealthKit / Health Connect | Background sensor access and OS health APIs are beyond webview reach. | Swift, Kotlin, React Native |
| Real-time calling — VoIP, video calls | CallKit / ConnectionService integration and background audio. | Swift, Kotlin, React Native |
| OS-surface products — widgets, live activities, watch companion, App Clips, share / Siri / keyboard extensions | These surfaces are native-only; the webview never renders them. watchOS is SwiftUI-only; Wear OS runs Compose or Flutter. | SwiftUI, Compose, Flutter (Wear OS only) |
| Heavy free-text input — editors, messaging, keyboard open 90% of the time | Webview keyboard, viewport, and scroll-into-view handling compounds at that scale. RN uses real native text inputs. | React Native |
| BLE / hardware companion — wearables, smart home, IoT | Reliable **background** BLE: reconnection after OS kill, state restoration, firmware-update flows. | Swift, Kotlin, RN (`ble-plx`, state restore) |
| Pro canvas & stylus tools — drawing, photo editing, Procreate-like | Low-latency stylus input and a custom GPU renderer. | Swift (Metal), Kotlin (Vulkan), Flutter (custom canvas) |
| CAD-grade 3D — large scenes, engineering viewers | Engine-grade rendering and scene management. | Unity, Swift (SceneKit), Kotlin (Filament) |
| DRM video streaming — Widevine L1 / FairPlay | Webview DRM support is inconsistent; needs native players. | Swift, Kotlin, RN and Flutter DRM video libs |
| Mobile + desktop, no web heritage — one codebase, nothing to preserve | No web asset to reuse; pick one rendering engine everywhere. | Flutter, Compose Multiplatform, .NET MAUI (C# shops) |

Two caveats to the table above:

- **BLE:** Flutter only for foreground BLE — no iOS CoreBluetooth state restoration.
- **3D:** simple product configurators are fine as webview WebGL (three.js) — stay Capacitor.

## Still Capacitor — with one caveat

**Documents-shaped UI.** Text, forms, lists, settings, dashboards, checkout. This is the wrapper's home turf — commerce, banking, and content apps ship here at scale.

**Offline-first with large local data.** Viable, but do not trust IndexedDB / localStorage: iOS can evict webview storage under pressure. Use the native SQLite plugin for anything that must survive.

**Simple 3D & visualization.** Product configurators, charts, model viewers — WebGL in the webview is mainstream and adequate.

## The rule

**Capacitor when the UI is a document** — text, forms, lists, dashboards, checkout.

**Something else when the UI is a surface** — canvas, camera, map, video, background audio, or the OS itself.

For a React team, the default "something else" is **Expo / React Native**: same language and mental model, native renderer. Flutter when there is no web codebase worth preserving; full native when one platform's integration depth is the product.

---

*Vetted July 2026.*
