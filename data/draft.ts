import { fetcher } from '../utils/fetcher'
import useSWR from 'swr'
import qs from 'qs'
import { Draft } from '../types/interfaces'

type DraftUse = 'UPLOAD' | 'DEPLOYMENT'
export function useGetDrafts(use: DraftUse = 'UPLOAD') {
  const { data, error, mutate } = useSWR<{ drafts: Array<Draft> }>(
    `/api/v1/drafts?${qs.stringify({
      use,
    })}`,
    fetcher
  )

  return {
    mutateDrafts: mutate,
    drafts: data?.drafts,
    isDraftsLoading: !error && !data,
    isDraftsError: error,
  }
}

export function useGetDraft(id?: string) {
  const { data, error, mutate } = useSWR<{ draft: Draft }>(
    id ? `/api/v1/draft/${id}` : null,
    fetcher
  )

  return {
    mutateDraft: mutate,
    draft: data?.draft,
    isDraftLoading: !error && !data,
    isDraftError: error,
  }
}