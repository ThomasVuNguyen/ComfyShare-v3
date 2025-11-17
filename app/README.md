# ComfyShare

A simple, minimal book sharing application built with React and Firebase.

## Features

- **User Authentication** - Create account and login
- **Book Writing** - Write books using markdown with pages, sections, and pictures
- **Threaded Comments** - Comment on books with nested replies
- **Public Sharing** - Share books via URL links
- **Drag & Drop** - Reorder book content easily
- **Writebook Design** - Clean, minimal design language

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS (with Writebook design system)
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **Editor**: Markdown-based with react-markdown
- **Drag & Drop**: dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

### Installation

1. Clone the repository and navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Firebase configuration to `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Deploy Firestore rules and indexes:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   firebase deploy --only storage
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the app:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Deployment

Deploy to Firebase Hosting:
```bash
npm run deploy
```

Or deploy manually:
```bash
npm run build
firebase deploy --only hosting
```

## Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── books/         # Book display components
│   │   ├── comments/      # Comments system
│   │   └── editor/        # Book editor components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   ├── pages/             # Page components
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles (Writebook design system)
├── firestore/
│   ├── firebase.rules     # Firestore security rules
│   └── firestore.indexes.json
├── storage/
│   └── storage.rules      # Storage security rules
└── firebase.json          # Firebase configuration
```

## Data Model

### Collections

- **users** - User profiles
- **books** - Book metadata
- **leaves** - Content items (ordered)
- **pages** - Markdown content
- **sections** - Styled text blocks
- **pictures** - Images with captions
- **comments** - Threaded comments
- **edits** - Version history

### Hierarchy

```
Book
  └─ Leaves (ordered by positionScore)
      ├─ Leaf → Page (markdown)
      ├─ Leaf → Section (styled text)
      └─ Leaf → Picture (image)
```

## Design Philosophy

ComfyShare follows the **Writebook design language**:
- Minimal and clean interface
- System fonts for fast loading
- OKLCH color space for modern color handling
- Automatic dark mode support
- Accessible and semantic HTML

## Security

- All books are **public by default**
- Only authenticated users can create books
- Only book owners can edit/delete their books
- Only authenticated users can comment
- Image uploads limited to 10MB

## License

MIT
