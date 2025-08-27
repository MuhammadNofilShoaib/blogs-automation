export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-19'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET_B,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET_B'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID_B,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID_B'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
