import React from 'react'

import SimilarityPromptComponent from '../../components/filter/SimilarityPrompt'
import { usePromptEmbeddingsState } from '../../hooks'

interface SimilarityPromptProps {
  value: string
  onSubmit: (text: string) => void
}

const SimilarityPrompt: React.FC<SimilarityPromptProps> = ({ value, onSubmit }) => {
  const state = usePromptEmbeddingsState()

  return <SimilarityPromptComponent value={value} onSubmit={onSubmit} isLoading={state === 'loading-in-progress'} />
}

export default SimilarityPrompt
