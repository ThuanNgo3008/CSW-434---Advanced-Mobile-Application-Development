# CSW 434 – Lab 4

## React Native Note-Taking Application with Firebase

### 1. Project Overview

This application is developed using React Native and Firebase. It allows users to create, view, edit, and delete notes, with real-time synchronization through Cloud Firestore.

The application also integrates Firebase Cloud Messaging (FCM) to deliver push notifications when new notes are created.

### 2. Technologies

- React Native with TypeScript
- Firebase Cloud Firestore
- Firebase Cloud Messaging
- Firebase Cloud Functions (local testing)
- Firebase Admin SDK
- Node.js
- Firebase Emulator Suite

### 3. Exercise 1 – Note-Taking Application

Implemented features:

- Create and save notes to Firestore.
- Display notes in a two-column layout.
- Synchronize notes in real time using `onSnapshot()`.
- Edit existing notes.
- Delete notes with confirmation.
- Search and sort notes.

### 4. Exercise 2 – Firebase Cloud Messaging

Implemented features:

- Request Android notification permission.
- Generate FCM registration tokens.
- Subscribe devices to the `new_notes` topic.
- Detect newly created Firestore documents.
- Send push notifications through a local Node.js backend.
- Open the Recent Notes screen when users tap notifications.

### 5. Installation

**Requirements:** Node.js, npm, Android Studio, an Android emulator with Google Play Services, Firebase CLI, and Java compatible with Firebase Emulator Suite.

From the `mobile` directory, install dependencies:

`npm install`

Install backend dependencies:

`cd local-fcm-server`

`npm install`

Then return to the `mobile` directory.

### 6. Firebase Configuration

The Android app uses `android/app/google-services.json` to connect to Firebase.

For local backend authentication, generate a Firebase service account private key from Firebase Console → Project Settings → Service Accounts.

Save it as:

`local-fcm-server/serviceAccountKey.json`

**Security:** This private key is intentionally excluded from the submission. Never commit or distribute it publicly.

### 7. Running the Application

Open separate terminals.

**Terminal 1 – Firebase Emulator**

Run from the `mobile` directory:

`firebase emulators:start --only functions,firestore`

**Terminal 2 – Local FCM Backend**

Run from the `local-fcm-server` directory:

`node server.js`

**Terminal 3 – React Native**

Run from the `mobile` directory:

`npx react-native start`

In another terminal, build the Android app:

`npx react-native run-android`

The Android Emulator accesses the host machine's Firestore Emulator through `10.0.2.2:8080`.

### 8. Testing Notifications

1. Open the application on the Android emulator.
2. Add a new note.
3. Verify that the note appears in the Firestore Emulator.
4. Check the Node.js backend terminal for the FCM message ID.
5. Move the application to the background.
6. Create another note through the Firestore Emulator UI.
7. Verify that the Android emulator receives a notification.
8. Tap the notification to open Recent Notes.

### 9. Important Notes

- Firestore Emulator stores local test data, separately from production Firestore.
- Cloud Functions are tested locally and have not been deployed.
- The Node.js backend sends actual FCM messages while running.
- The local backend must remain active for automatic notifications.
- Firebase Admin credentials are required for sending notifications.
- Notifications are tested while the application is running in the background.
- This submission demonstrates a local development environment rather than a production deployment.