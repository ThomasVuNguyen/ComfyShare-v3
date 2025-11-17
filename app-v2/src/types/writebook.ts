import { Timestamp } from "firebase/firestore"

export type BookTheme = "black" | "blue" | "green" | "magenta" | "orange" | "violet" | "white"

export type WritebookLeaf = {
  id: string
  bookId: string
  title: string
  type: "page"
  body?: { content: string }
  position: number
  status: "active" | "trashed"
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export type WritebookBook = {
  id: string
  title: string
  subtitle?: string
  author?: string
  slug: string
  published: boolean
  publishedAt?: Timestamp | Date | null
  everyoneAccess: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy: string
  coverUrl?: string
  theme?: BookTheme
}
