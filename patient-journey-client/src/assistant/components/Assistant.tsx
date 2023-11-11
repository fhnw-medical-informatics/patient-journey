import React, { useCallback, useState } from 'react'
import OpenAI from 'openai'

interface AssistantProps {
  messages: OpenAI.Beta.Threads.Messages.ThreadMessage[]
  onSubmitMessage: (message: string, useCohort: boolean, useSelectedPatient: boolean) => void
  cohortSize: number
  hasSelectedPatient: boolean
  isLoading: boolean
}

export const Assistant = ({ messages, onSubmitMessage, cohortSize, hasSelectedPatient, isLoading }: AssistantProps) => {
  const [inputValue, setInputValue] = useState('')
  const [useCohort, setUseCohort] = useState(false)
  const [useSelectedPatient, setUseSelectedPatient] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleSubmit = useCallback(() => {
    onSubmitMessage(inputValue, useCohort, useSelectedPatient)
    setInputValue('')
  }, [onSubmitMessage, inputValue, useCohort, useSelectedPatient])

  return (
    <div style={{ height: '500px', backgroundColor: 'red' }}>
      <div style={{ height: 'calc(500px - 100px)', overflowY: 'auto' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.role === 'user' ? 'right' : 'left' }}>
            {message.content.map((content, index) => {
              switch (content.type) {
                case 'text':
                  return <p key={index}>{content.text.value}</p>
                case 'image_file':
                default:
                  return <img key={index} src={content.image_file.file_id} alt="" />
              }
            })}
          </div>
        ))}
      </div>
      <div style={{ height: '100px' }}>
        <div>
          <input
            type="checkbox"
            checked={useCohort}
            onChange={() => setUseCohort(!useCohort)}
            disabled={cohortSize === 0}
          />
          <label>Use Cohort</label>
        </div>
        <div>
          <input
            type="checkbox"
            checked={useSelectedPatient}
            onChange={() => setUseSelectedPatient(!useSelectedPatient)}
            disabled={!hasSelectedPatient}
          />
          <label>Use Selected Patient</label>
        </div>
        <textarea value={inputValue} onChange={handleInputChange} />
        <button onClick={handleSubmit}>Submit</button>
        {isLoading && <p>Loading...</p>}
      </div>
    </div>
  )
}
