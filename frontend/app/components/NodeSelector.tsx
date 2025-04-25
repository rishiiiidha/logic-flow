import React from 'react';

const NodeSelector: React.FC = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 p-4 bg-gray-200 overflow-y-auto">
      <h3 className="text-lg font-medium mb-4">Node Types</h3>
      <div className="space-y-2">
        <div
          className="p-3 bg-white border rounded shadow cursor-move hover:bg-gray-50"
          onDragStart={(event) => onDragStart(event, 'constant')}
          draggable
        >
          Constant
        </div>
        <div
          className="p-3 bg-white border rounded shadow cursor-move hover:bg-gray-50"
          onDragStart={(event) => onDragStart(event, 'variable')}
          draggable
        >
          Variable
        </div>
        <div
          className="p-3 bg-white border rounded shadow cursor-move hover:bg-gray-50"
          onDragStart={(event) => onDragStart(event, 'operation')}
          draggable
        >
          Operation
        </div>
        <div
          className="p-3 bg-white border rounded shadow cursor-move hover:bg-gray-50"
          onDragStart={(event) => onDragStart(event, 'result')}
          draggable
        >
          Result
        </div>
        <div
          className="p-3 bg-white border rounded shadow cursor-move hover:bg-gray-50"
          onDragStart={(event) => onDragStart(event, 'conditional')}
          draggable
        >
          Conditional
        </div>
      </div>
    </div>
  );
};

export default NodeSelector;