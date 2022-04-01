/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_REDUX_TOOLKIT_DEVCHECKS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
