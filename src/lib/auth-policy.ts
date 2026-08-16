/** Kebijakan autentikasi admin tunggal, terpisah agar bisa diuji tanpa DB. */
export const adminEmailAndPassword = {
  enabled: true,
  disableSignUp: true,
  autoSignIn: false,
  requireEmailVerification: false,
} as const

export function isAdminRole(role: unknown): role is 'admin' {
  return role === 'admin'
}
