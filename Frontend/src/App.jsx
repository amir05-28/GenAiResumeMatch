import {RouterProvider} from 'react-router'
import {router} from './app.routes.jsx'
import {AuthProvider} from './features/auth/auth.context.jsx'
import { interviewProvider } from './features/interview/interview.contex.jsx'


function App() {

  return (
    <AuthProvider>
      <interviewProvider>
        <RouterProvider router={router} />
      </interviewProvider>
    </AuthProvider>
  )
}

export default App;

