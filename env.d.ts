/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'sql.js/dist/sql-wasm.js' {
  import type { SqlJsStatic } from 'sql.js'
  const initSqlJs: (config?: {
    locateFile?: (file: string) => string
  }) => Promise<SqlJsStatic>
  export default initSqlJs
}
