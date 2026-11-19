import React from 'react'
import { FaTableCellsLarge } from 'react-icons/fa6'
import './HomeScreen.css'
import WorkspaceList from '../../Components/WorkspaceList/WorkspaceList'

function HomeScreeen() {
  return (
    <div className='home'>
      <header className='home-header'>
        <FaTableCellsLarge className='home-header__icon' aria-hidden='true' />
        <h1 className='home-header__title'>My workspaces</h1>
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
