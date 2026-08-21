import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// The one and only setup step the library asks of a consumer.
import '@the_viveksingh/vivek-ui/styles.css'
import './playground.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root is missing from index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
