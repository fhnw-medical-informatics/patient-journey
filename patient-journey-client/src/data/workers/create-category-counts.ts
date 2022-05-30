export type CategoryCountsWorkerData = {
  categories: ReadonlyArray<string>
  uniqueCategories: ReadonlyArray<string>
}

export type CategoryCountsWorkerResponse = Map<string, number>

const createCategoryCountsWorker = () => {
  function createCategoryCountMap(
    categories: ReadonlyArray<string>,
    uniqueCategories: ReadonlyArray<string>
  ): CategoryCountsWorkerResponse {
    return new Map<string, number>(
      uniqueCategories.map((category) => [category, categories.filter((c) => c === category).length])
    )
  }

  onmessage = (e: MessageEvent<CategoryCountsWorkerData>) => {
    const { categories, uniqueCategories } = e.data

    const countMap = createCategoryCountMap(categories, uniqueCategories)

    postMessage(countMap)
  }
}

export default createCategoryCountsWorker()
