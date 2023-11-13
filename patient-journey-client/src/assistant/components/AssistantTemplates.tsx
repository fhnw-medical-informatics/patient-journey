import React from 'react'

import { Chip, Stack, Typography } from '@mui/material'

const PromptTemplates = [
  {
    label: 'Similarity',
    prompt: 'Why are these patients similar? List and interpret the 3 key-factors (max 1 sentence each).',
  },
  {
    label: 'Difference',
    prompt:
      'These patient journeys belong to different clusters. Why are these patients different? List the 3 key differentiating factors (max 1 sentence each).',
  },
  {
    label: 'Cluster',
    prompt: `These patients are in the same cluster with close proximitiy to each other (t-SNE reduced 2 dimensional plotting).
  
Based on their patient journeys, please write a text that would describe their cluster (don't describe the patient journeys, just use them to create a cluster title and description with max 3 sentences).`,
  },
  {
    label: 'Analyze',
    prompt: `Please analyze this patient journey and tell me in simple words, what this patient has gone through. Try to interpret the data you have and make assumptions. Be short and concise.`,
  },
]

interface AssistantTemplatesProps {
  onTemplateClick: (template: string) => void
  disabled?: boolean
}

export const AssistantTemplates = ({ onTemplateClick, disabled = false }: AssistantTemplatesProps) => {
  return (
    <>
      {/* Use the material ui Chip component to list the templates, a click should set the template prompt */}
      <Stack direction="row" spacing={1}>
        <Typography variant="caption" sx={{ margin: 0, padding: 0 }}>
          Templates
        </Typography>
        {PromptTemplates.map((template, index) => (
          <Chip
            key={index}
            variant="filled"
            onClick={() => onTemplateClick(template.prompt)}
            disabled={disabled}
            size="small"
            label={template.label}
          />
        ))}
      </Stack>
    </>
  )
}
