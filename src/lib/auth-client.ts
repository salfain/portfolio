'use client'

import { createAuthClient } from 'better-auth/react'

// Client auth. baseURL dari window.location.origin (auth route /api/auth
// relatif terhadap origin yang sama). JANGAN import env server di sini —
// env.ts memvalidasi DATABASE_URL/BETTER_AUTH_SECRET yang tidak boleh
// bocor ke browser.
export const authClient = createAuthClient()

export const { signIn, signOut, useSession } = authClient
