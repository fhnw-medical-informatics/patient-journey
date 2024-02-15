import React, { useState, useEffect, ChangeEvent } from 'react'
import { Box, Button, TextareaAutosize, Typography } from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { EMBEDDINGS_API_COSTS_PER_1KTOKENS, TOKENS_PER_CHUNK } from '../../embeddings'
import { deepPurple } from '@mui/material/colors'

interface SimilarityPromptProps {
  value: string
  onSubmit: (text: string) => void
  isLoading: boolean
}

const SimilarityPrompt: React.FC<SimilarityPromptProps> = ({ value, onSubmit, isLoading }) => {
  const [text, setText] = useState(value)

  // Update the textarea value based on external state changes
  useEffect(() => {
    setText(value)
  }, [value])

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
  }

  const handleSubmit = () => {
    onSubmit(text)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <TextareaAutosize
        value={text}
        onChange={handleTextChange}
        minRows={5}
        placeholder="Enter a similarity prompt..."
        style={{ width: '100%', resize: 'vertical', marginBottom: 2 }}
        disabled={isLoading}
      />
      <Typography variant="caption" color="GrayText">
        The prompt should be a short phrase describing a patient journey. Similarity is calculated based on the cosine
        similarity between the prompt and each patient journey. Each request costs $
        {Math.round(EMBEDDINGS_API_COSTS_PER_1KTOKENS * (TOKENS_PER_CHUNK / 1000) * 10000) / 10000}.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 1,
        }}
      >
        {/* End icon is magic stick */}
        <Button
          variant="contained"
          sx={{ marginTop: 2, backgroundColor: deepPurple[100] }}
          onClick={handleSubmit}
          endIcon={<AutoFixHighIcon />}
          disabled={isLoading}
        >
          Get similar patients
        </Button>
      </Box>
    </Box>
  )
}

export default SimilarityPrompt
