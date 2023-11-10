import { createSlice } from '@reduxjs/toolkit'
import { assistantGPT } from './assistantGPT'

interface AssistantState {
  isLoading: boolean
}

const initialState: AssistantState = {
  isLoading: false,
}

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {},
})

export const assistantReducer = assistantSlice.reducer

const gptAssistant = assistantGPT
