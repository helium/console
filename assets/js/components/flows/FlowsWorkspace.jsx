import React, { useState } from 'react';
import ReactFlow, { removeElements, addEdge } from 'react-flow-renderer';

export default ({ initialElements, selectNode }) => {
  const [elements, setElements] = useState(initialElements);
  const onElementsRemove = (elementsToRemove) => setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params) => setElements((els) => addEdge(params, els));

  const onElementClick = (e, el) => selectNode(el)

  return (
    <ReactFlow
      elements={elements}
      onElementsRemove={onElementsRemove}
      onConnect={onConnect}
      onElementClick={onElementClick}
    />
  );
};
