export type DataLoadingPending = Readonly<{
  type: 'loading-pending'
}>

export type DataLoadingInProgress = Readonly<{
  type: 'loading-in-progress'
}>

export type DataLoadingFailed = Readonly<{
  type: 'loading-failed'
  errorMessage: string
}>

export type DataLoadingComplete<T> = Readonly<{
  type: 'loading-complete'
}> &
  T
