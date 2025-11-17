"use client"

import { useEffect, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { WritebookLeaf } from "@/types/writebook"

export const useLeaves = (bookId?: string) => {
  const [leaves, setLeaves] = useState<WritebookLeaf[]>([])

  useEffect(() => {
    if (!bookId) return

    const leavesRef = collection(db, "leaves")
    const q = query(leavesRef, where("bookId", "==", bookId), orderBy("position", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeaves(
        snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<WritebookLeaf, "id">),
            }) satisfies WritebookLeaf,
        ),
      )
    })

    return () => unsubscribe()
  }, [bookId])

  return { leaves }
}

export const createLeaf = async (bookId: string, data: { title: string; content: string; position: number }) => {
  const leavesRef = collection(db, "leaves")
  await addDoc(leavesRef, {
    bookId,
    title: data.title,
    type: "page",
    body: { content: data.content },
    position: data.position,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateLeaf = async (
  _bookId: string,
  leafId: string,
  data: Partial<{ title: string; content: string; position: number }>,
) => {
  const docRef = doc(db, "leaves", leafId)
  await updateDoc(docRef, {
    ...(data.title ? { title: data.title } : {}),
    ...(data.content ? { "body.content": data.content } : {}),
    ...(typeof data.position === "number" ? { position: data.position } : {}),
    updatedAt: serverTimestamp(),
  })
}

export const deleteLeaf = async (_bookId: string, leafId: string) => {
  await deleteDoc(doc(db, "leaves", leafId))
}
