const ONBOARDING_STORAGE_KEY = "startpilot_pending_onboarding"

export interface PendingOnboardingData {
  sector: string
  background: Record<string, string>
}

export function savePendingOnboarding(data: PendingOnboardingData): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable – silently ignore
  }
}

export function getPendingOnboarding(): PendingOnboardingData | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as PendingOnboardingData
  } catch {
    return null
  }
}

export function clearPendingOnboarding(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ONBOARDING_STORAGE_KEY)
}