import React, { ChangeEvent } from 'react'
import { Box, Button, Chip, Stack, TextareaAutosize, Typography } from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { EMBEDDINGS_API_COSTS_PER_1KTOKENS, TOKENS_PER_CHUNK } from '../../embeddings'
import { deepPurple } from '@mui/material/colors'

const PromptTemplates = [
  {
    label: 'Similarity',
    prompt: 'Why are these patients similar? List and interpret the key-factors.',
  },
  {
    label: 'Difference',
    prompt:
      'These patient journeys belong to different clusters. Why are these patients different? List and interpret the key-factors.',
  },
  {
    label: 'Cluster',
    prompt: `These patients are in the same cluster with close proximitiy to each other (t-SNE reduced 2 dimensional plotting).

Based on their patient journeys, please write a text that would describe their cluster (don't describe the patient journeys, just use them to create a cluster title and description).`,
  },
]

interface CohortPromptProps {
  value: string
  onChange: (text: string) => void
  onSubmit: () => void
  isLoading: boolean
  result: string
}

const CohortPrompt: React.FC<CohortPromptProps> = ({ value, onChange, onSubmit, isLoading, result }) => {
  const paragraphs = result.split('\n')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <TextareaAutosize
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        minRows={5}
        placeholder="Enter a cohort prompt..."
        style={{ width: '100%', resize: 'vertical', marginBottom: 2 }}
        disabled={isLoading}
      />
      {/* Use the material ui Chip component to list the templates, a click should set the template prompt */}
      <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
        <Typography variant="caption">Templates</Typography>
        {PromptTemplates.map((template) => (
          <Chip
            variant="filled"
            onClick={() => onChange(template.prompt)}
            disabled={isLoading}
            size="small"
            label={template.label}
          />
        ))}
      </Stack>
      <Typography variant="caption" color="GrayText" sx={{ marginTop: 1 }}>
        The prompt should be a short question you have regarding your cohort. For example: 'Why are these patients
        similar? List and interpret the key-factors.'. Each request costs $
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
          onClick={onSubmit}
          endIcon={<AutoFixHighIcon />}
          disabled={isLoading}
        >
          Get Cohort Information
        </Button>
      </Box>
      <Box
        sx={{
          marginTop: 4,
        }}
      >
        {paragraphs.map((p) => (
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            {p}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}

export default CohortPrompt
