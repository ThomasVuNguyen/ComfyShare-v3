# Quick Setup Guide

## 1. Firebase Configuration

First, you need to get your Firebase configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings → General
4. Scroll down to "Your apps" and click the web icon (</>)
5. Copy the Firebase configuration object

## 2. Environment Variables

Create a `.env` file in the `app/` directory:

```bash
cp .env.example .env
```

Then fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 3. Enable Firebase Services

In your Firebase Console:

### Enable Authentication
1. Go to Authentication → Sign-in method
2. Enable "Email/Password"

### Enable Firestore
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in production mode" (rules are already configured)
4. Select your location (e.g., nam5)

### Enable Storage
1. Go to Storage
2. Click "Get started"
3. Use default security rules (will be overwritten)

### Enable Hosting (optional, for deployment)
1. Go to Hosting
2. Click "Get started"
3. Follow the setup wizard

## 4. Deploy Firebase Configuration

```bash
# Login to Firebase
firebase login

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

## 5. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 6. Deploy to Production

When ready to deploy:

```bash
# Build and deploy
npm run deploy

# OR manually:
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://your-project.web.app`

## Troubleshooting

### "Permission denied" errors
- Make sure you've deployed the Firestore and Storage rules
- Check that your Firebase project is active
- Verify your `.env` file has correct credentials

### Build errors
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Make sure you're using Node.js 18+

### Firestore queries failing
- Deploy the Firestore indexes: `firebase deploy --only firestore:indexes`
- Wait a few minutes for indexes to build (check Firebase Console)

## Next Steps

1. Create an account in your app
2. Create your first book
3. Add pages, sections, and pictures
4. Share the book URL with friends!
