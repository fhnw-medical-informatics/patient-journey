import React, { useState, useEffect, ChangeEvent } from 'react'
import { Box, Button, TextareaAutosize, Typography } from '@mui/material'

interface SimilarityPromptProps {
  label: string
  value: string
  onSubmit: (text: string) => void
}

const SimilarityPrompt: React.FC<SimilarityPromptProps> = ({ label, value, onSubmit }) => {
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
      <Typography variant="subtitle1">{label}</Typography>
      <TextareaAutosize
        value={text}
        onChange={handleTextChange}
        minRows={3}
        style={{ width: '100%', resize: 'vertical' }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 1,
        }}
      >
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  )
}

export default SimilarityPrompt
