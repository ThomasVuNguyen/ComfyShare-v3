# Technical Details

## Architecture

### Data Model (Firestore)

- **users/{userId}** - User profiles
- **books/{bookId}** - Book metadata (title, subtitle, author, slug, userId, published, theme)
- **leaves/{leafId}** - Ordered content items (bookId, leafableType, leafableId, title, positionScore, status)
- **pages/{pageId}** - Markdown content (body)
- **sections/{sectionId}** - Styled text blocks (body, theme)
- **pictures/{pictureId}** - Images (caption, storageUrl)
- **comments/{commentId}** - Threaded comments (bookId, userId, parentId, content)
- **edits/{editId}** - Version history (leafId, previousContent, action)

### Content Types (Leafables)

- **Page** - Markdown content (main writing)
- **Section** - Styled text blocks (chapter headers, callouts)
- **Picture** - Images with captions

### Hierarchy

```
Book
  └─ Leaves (ordered by positionScore)
      ├─ Leaf → Page (markdown)
      ├─ Leaf → Section (styled text)
      └─ Leaf → Picture (image)
```

## Tech Stack

- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage, Functions, Hosting)
- **Editor**: Markdown-based
- **Routing**: React Router
- **Ordering**: Position score system for drag-and-drop

## Features

- Markdown editor for writing
- Drag-and-drop reordering
- Version history (10-minute debounce)
- Threaded comments
- Public sharing via unique URLs
- All books public by default
- Writebook design system (minimal, clean CSS)
