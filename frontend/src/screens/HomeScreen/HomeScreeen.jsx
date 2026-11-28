import React from 'react'
import { useNavigate } from 'react-router'
import { FaTableCellsLarge } from 'react-icons/fa6'
import './HomeScreen.css'
import WorkspaceList from '../../Components/WorkspaceList/WorkspaceList'

function HomeScreeen() {
  const navigate = useNavigate()

  /*
  Cerrar sesion: sacamos el token guardado y volvemos al login. Asi una
  cuenta nueva no hereda los permisos de la sesion anterior.
  */
  function handleLogout() {
    localStorage.removeItem('auth_token')
    navigate('/login')
  }

  return (
    <div className='home'>
      <header className='home-header'>
        <FaTableCellsLarge className='home-header__icon' aria-hidden='true' />
        <h1 className='home-header__title'>My workspaces</h1>
        <button
          type='button'
          className='home-header__logout'
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </header>

      <main className='home-main'>
        <section className='home-card'>
          <WorkspaceList />
        </section>
      </main>
    </div>
  )
}

export default HomeScreeen
