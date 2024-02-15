/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_REDUX_TOOLKIT_DEVCHECKS: string
  readonly VITE_APP_DATA_GRID_LICENSE_KEY: string
  readonly VITE_OPENAI_ORG: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_ASSISTANT_ID: string
  readonly VITE_OPENAI_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
