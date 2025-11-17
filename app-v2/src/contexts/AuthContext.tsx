"use client"

import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  User,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  updateProfile,
  signOut,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore"

export type UserProfile = {
  userId: string
  displayName: string
  email: string
  createdAt?: Date
  updatedAt?: Date
}

type AuthContextValue = {
  firebaseUser: User | null
  profile: UserProfile | null
  loading: boolean
  signOutUser: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfileDetails: (input: {
    displayName?: string
    email?: string
    password?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const hydrateProfile = useCallback(async (user: User) => {
    const profileRef = doc(collection(db, "users"), user.uid)
    const snap = await getDoc(profileRef)

    if (snap.exists()) {
      const data = snap.data()
      setProfile({
        userId: user.uid,
        displayName: data.displayName,
        email: data.email,
        createdAt: data.createdAt?.toDate?.(),
        updatedAt: data.updatedAt?.toDate?.(),
      })
    } else {
      const defaultProfile: UserProfile = {
        userId: user.uid,
        displayName: user.displayName || "User",
        email: user.email || "",
      }
      await setDoc(profileRef, {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setProfile(defaultProfile)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        await hydrateProfile(user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [hydrateProfile])

  const signOutUser = useCallback(async () => {
    await signOut(auth)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      await hydrateProfile(firebaseUser)
    }
  }, [firebaseUser, hydrateProfile])

  const updateProfileDetails = useCallback<AuthContextValue["updateProfileDetails"]>(
    async ({ displayName, email, password }) => {
      if (!firebaseUser) return
      const profileRef = doc(collection(db, "users"), firebaseUser.uid)

      if (displayName && displayName !== profile?.displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      if (email && email !== firebaseUser.email) {
        await updateEmail(firebaseUser, email)
      }

      if (password) {
        await updatePassword(firebaseUser, password)
      }

      await updateDoc(profileRef, {
        ...(displayName ? { displayName } : {}),
        ...(email ? { email } : {}),
        updatedAt: serverTimestamp(),
      })

      await refreshProfile()
    },
    [firebaseUser, profile?.displayName, refreshProfile],
  )

  const value = useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      signOutUser,
      refreshProfile,
      updateProfileDetails,
    }),
    [firebaseUser, profile, loading, signOutUser, refreshProfile, updateProfileDetails],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
