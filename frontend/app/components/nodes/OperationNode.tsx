import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  operation: string;
}

const OperationNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const handleOperationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      data.operation = e.target.value;
    },
    [data]
  );

  return (
    <div
      className={`p-3 bg-white border-2 rounded-md ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div className="font-medium">Operation</div>
      <div className="mt-2">
        <select
          value={data.operation}
          onChange={handleOperationChange}
          className="w-full p-1 border rounded"
        >
          <option value="+">Addition (+)</option>
          <option value="-">Subtraction (-)</option>
          <option value="*">Multiplication (*)</option>
          <option value="/">Division (/)</option>
          <option value="**">Power (**)</option>
          <option value="%">Modulo (%)</option>
        </select>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input-1"
        style={{ background: '#555', top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-2"
        style={{ background: '#555', bottom: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(OperationNode);