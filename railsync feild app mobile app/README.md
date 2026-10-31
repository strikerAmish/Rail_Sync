# RailSync • Frontline Field Crew Mobile Portal (Flutter Conversion)

This repository contains the **complete, exact Flutter conversion** of the RailSync Frontline Field Android Application (`field-app`), rebuilt from the ground up as a native Flutter application for Android, iOS, Windows, and Web.

---

## 🚆 Overview & Architectural Fidelity

This project converts the web/React simulated mobile terminal (`field-app`) into a genuine, production-grade Flutter application while faithfully preserving **100% of the original screens, functionality, business logic, workflows, assets, colors, typography, and interactive behaviors**.

The simulated smartphone mockup and desktop container from the web wrapper are eliminated in favor of a true, edge-to-edge smartphone interface utilizing native Flutter widgets, state management, safe areas, status bars, and hardware sensors.

### Preserved Core Screens & Workflows

1. **Authentication & Biometrics (`LoginScreen` / `MobileLoginView`)**:
   - Indian Railways / ECR official branding & Live Sync Mesh badge.
   - Operator ID & PIN authentication (`worker_a` / `123456`).
   - One-Tap Quick Biometric Scanning with animated feedback and biometric login.
   - Demo credentials prefill helper.
   - Persistent user session via `SharedPreferences`.

2. **My Permits & Work Orders (`_buildPermitsTab`)**:
   - **Incoming Station Master Assigned Work Request card** with active visual pulse beacon, department tag (`OHE`), and multi-department statutory quorum breakdown:
     - Station Master (Approved)
     - Traction Power Controller (Pending)
     - Section Controller (Pending)
     - Field Supervisor (Accepted / Pending)
   - Real-time **Acknowledge & Accept Request** workflow with multi-signature ledger update.
   - Interactive Permit cards with live possession stages (Stage 4 Awaiting Approval, Stage 5 Approved, Stage 6 Active in Progress, Stage 7 Block Cleared).
   - "Commence Work (Step on Track)" and "Work Completed & Safety Cleared" statutory state transitions.
   - Sub-filter chips: `All Permits`, `⚡ SM Work Orders`, `🔴 Ongoing on Track`.
   - Station Master Work Order Memo dialog preview (`WorkOrderMemoDialog`).

3. **Geotagged Camera & Inspection Proof (`_buildCameraTab`)**:
   - Live camera viewfinder frame with corner reticles and dark HUD styling.
   - **Cryptographic Watermark Overlay**:
     - Chainage: `KM 548/14 UP MAIN`
     - Section: `Danapur (DNR) ⇄ Patna Jn (PNBE)`
     - GPS Telemetry: Lat, Lng, Elevation
     - Tamper-proof SHA-256 cryptographic hash
   - Shutter action supporting on-device camera capture, image picker gallery selection, and realistic field asset fallback.
   - Quick actions: `+ Use in Requisition` and `Sync to {eventId}...` directly attaching geotagged proofs to active track possession records.
   - Editable Site Supervisor Inspection Notes with watermarking.

4. **+ New Block Requisition Form (`_buildRequisitionTab`)**:
   - Corridor Section selection (Danapur–Patna Junction, Ara Junction–Danapur, Buxar–Ara Junction, Pt. Deen Dayal Upadhyaya–Buxar).
   - Track Identifier (UP MAIN, DN MAIN, LOOP 01, YARD 04).
   - Duration, KM Start, KM End, and Description fields.
   - **Statutory Impact Vectors**:
     - ⚡ 25kV Catenary Power Cut (Form ETR-1)
     - 🛑 Absolute Traffic Block (G&SR Chapter IV)
     - ⚠️ Adjacent Track TSR 30 km/h Caution
     - 🔒 SM Physical Point Padlocking (#14A/B)
   - Integrated on-site geotagged photo proof preview.
   - Submission engine generating fencing tokens and dispatching to Station Master quorum queue.

5. **Station Master Two-Way Clarification Desk (`_buildQueriesTab`)**:
   - Real-time chat stream with department tags (`@OPERATING`, `@OHE`, `@S_AND_T`, `@CIVIL_P_WAY`).
   - Chat history with Station Master (PNBE), TPC Danapur Grid, and Field Supervisor.
   - Automated simulated Station Master acknowledgement response loop.

6. **Network & Offline Resilience**:
   - Offline SQLite/SharedPreferences caching simulation with `LIVE` vs `OFFLINE` toggle.
   - W3C distributed tracing (`traceparent` header).
   - WebSocket client stream listener for corridor updates.

---

## 📂 Project Structure

```
lib/
├── main.dart                          # App entry point, session restoration & root MaterialApp
├── models/
│   ├── types.dart                     # Strict Dart models (OperationalEvent, FieldUser, ImpactVector, etc.)
│   └── chat_message.dart              # Chat message model for Clarification Desk
├── data/
│   └── corridor_data.dart             # 18 Seeded Operational Events across all 4 corridor sections & Audit Blocks
├── services/
│   ├── api_service.dart               # REST client with W3C traceparent headers, WebSocket listener & fallback
│   └── storage_service.dart           # Persistent storage layer using SharedPreferences
├── theme/
│   └── app_theme.dart                 # Design tokens, color palette, gradients, and typography
├── widgets/
│   ├── work_order_memo_dialog.dart    # Station Master Work Order Memo popup modal
│   ├── camera_viewfinder.dart         # Watermarked camera viewfinder with corner reticles
│   └── telemetry_card.dart            # Verified GPS telemetry & supervisor notes widget
└── screens/
    ├── login_screen.dart              # MobileLoginView with biometrics & demo auto-fill
    └── field_app_screen.dart          # AndroidFieldApp with 4 navigation tabs, toasts & status bar
assets/
├── favicon.svg
├── icons.svg
└── images/
    ├── ohe_crew.jpg                   # Original corridor maintenance crew photo
    └── track_gang.jpg                 # Original track gang inspection photo
```

---

## 🚀 Getting Started

### Prerequisites

- Flutter SDK (v3.22+ or v3.44+)
- Dart SDK (v3.4+ or v3.12+)
- Android Studio / VS Code with Flutter extension

### Install Dependencies

```bash
flutter pub get
```

### Run Static Analysis & Tests

```bash
# Verify code quality and static typing (0 errors, 0 warnings)
dart analyze lib test

# Run automated tests
flutter test
```

### Run on Device / Simulator

```bash
# Run on connected Android phone or emulator
flutter run -d android

# Or run on Chrome / Edge for web preview
flutter run -d chrome

# Or run on Windows desktop
flutter run -d windows
```

### Credentials for Sign In

- **Username / Operator ID**: `worker_a` (or `worker`, `sseohe`, `admin`, `danapur_sm`)
- **PIN / Password**: `123456` (or `admin`, `password`)
- Or simply tap **"Quick Sign-In with Biometrics"** or **"Fill Credentials"**.
