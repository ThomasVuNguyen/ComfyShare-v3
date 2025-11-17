import { collection, getCountFromServer, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export const fetchCommentCount = async (bookId: string) => {
  const commentsRef = collection(db, "comments")
  const snapshot = await getCountFromServer(query(commentsRef, where("bookId", "==", bookId)))
  return snapshot.data().count
}

export const fetchPublishedCount = async (userId: string) => {
  const booksRef = collection(db, "books")
  const published = await getCountFromServer(query(booksRef, where("createdBy", "==", userId), where("published", "==", true)))
  const all = await getCountFromServer(query(booksRef, where("createdBy", "==", userId)))

  return {
    published: published.data().count,
    total: all.data().count,
  }
}
