import React from 'react'
import { Route, Routes } from 'react-router'
import HomeScreeen from './screens/HomeScreen/HomeScreeen'
import LoginScreen from './screens/LoginScreen/LoginScreen'
import RegisterScreen from './screens/RegisterScreen/RegisterScreen'
import AuthMiddleware from './Middlewares/AuthMiddleware'
import WorkspaceScreen from './screens/WorkspaceScreen/WorkspaceScreen'
import WorkspaceContextProvider from './Context/WorkspaceContext'

const App = () => {
  return (
    <Routes>
      <Route element={<AuthMiddleware/>}>

        <Route 
          path='/' 
          element={<HomeScreeen/>}
        />
        <Route 
          path='/home' 
          element={<HomeScreeen/>}
        />
        <Route
    path='/workspace/:workspace_id'
    element={
        <WorkspaceContextProvider>
            <WorkspaceScreen/>
        </WorkspaceContextProvider>
    }
/>

      </Route>
      <Route path='/login' element={<LoginScreen/>}/>
      <Route path='/register' element={<RegisterScreen/>} />
    </Routes>
  )
}


export default App