const createCategoryCountsWorker = () => {
  function createCategoryCountMap(categories: ReadonlyArray<string>, uniqueCategories: ReadonlyArray<string>) {
    return new Map<string, number>(
      uniqueCategories.map((category) => [category, categories.filter((c) => c === category).length])
    )
  }

  onmessage = (e) => {
    const { categories, uniqueCategories } = e.data

    const countMap = createCategoryCountMap(categories, uniqueCategories)

    postMessage(countMap)
  }
}

export default createCategoryCountsWorker()
