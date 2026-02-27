import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import { store } from './store'
import { router } from './router'
import { msalInstance } from './auth/msalConfig'

;(async () => {
  await msalInstance.initialize();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </MsalProvider>
    </StrictMode>,
  )
})();
