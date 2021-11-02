import React from 'react'

export default (props) => {
  return (
    <div
      style={{
        position: 'fixed',
        height: '100vh',
        width: '100vw',
        zIndex: 110,
        top: 0,
        left: 0
      }}
      onClick={props.toggleHelpLinks}
    >
      <div style={{ marginTop: 55, height: '100vh', width: '100vw', backgroundColor: 'rgba(37,41,46,0.8)' }}>
        <div style={{ backgroundColor: 'white' }}>
          YESSSSS
        </div>
      </div>
    </div>
  )
}
