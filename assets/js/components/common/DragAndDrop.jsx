import React, { useEffect, useRef, useState } from 'react';
import { blueForDeviceStatsLarge, dragAndDropBackgroundColor } from '../../util/colors';

export const style = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '20px',
  width: '100%',
  border: `1px dashed ${blueForDeviceStatsLarge}`,
  borderRadius: 5,
  backgroundColor: dragAndDropBackgroundColor
};
let dragCounter = 0;

// device import
const DragAndDrop = ({children, fileSelected}) => {
  const dropRef = useRef();
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const preventDefaultAndPropogation = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }
  const addFile = (e) => {
    preventDefaultAndPropogation(e);
    if (e.target.files && e.target.files.length === 1) {
      fileSelected(e.target.files[0]);
    }
  }
  useEffect(() => {
    const div = dropRef.current;

    const handleDragIn = (e) => {
      preventDefaultAndPropogation(e);
      dragCounter++;
      if (e.dataTransfer.items && e.dataTransfer.items.length === 1) {
        setDragging(true);
      }
    }
    const handleDragOut = (e) => {
      preventDefaultAndPropogation(e);
      dragCounter--;
      if (dragCounter > 0) return;
      setDragging(false);
    }
    const handleDragOver = (e) => {
      preventDefaultAndPropogation(e);
    }
    const handleDrop = (e) => {
      preventDefaultAndPropogation(e);
      if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
        fileSelected(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
        setDragging(false);
        dragCounter = 0;
      }
    }
    div.addEventListener('dragenter', handleDragIn);
    div.addEventListener('dragleave', handleDragOut);
    div.addEventListener('dragover', handleDragOver);
    div.addEventListener('drop', handleDrop);

    return () => {
      div.removeEventListener('dragenter', handleDragIn);
      div.removeEventListener('dragleave', handleDragOut);
      div.removeEventListener('dragover', handleDragOver);
      div.removeEventListener('drop', handleDrop);
    }
  }, [dragging]);
  const dropStyle = {...style, border: dragging ? `1px dashed black` : `1px dashed ${blueForDeviceStatsLarge}`}
  return (
    <div style={dropStyle} ref={dropRef} onClick={() => fileInputRef.current.click()}>
      <input type="file" ref={fileInputRef} style={{display: "none"}} onChange={addFile}/>
      {children}
    </div>
  )
}

export default DragAndDrop;
