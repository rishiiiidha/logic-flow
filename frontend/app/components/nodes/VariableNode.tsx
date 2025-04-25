import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  name: string;
  value: number;
}

const VariableNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data.name = e.target.value;
    },
    [data]
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value) || 0;
      data.value = newValue;
    },
    [data]
  );

  return (
    <div
      className={`p-3 bg-white border-2 rounded-md ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div className="font-medium">Variable</div>
      <div className="mt-2">
        <input
          type="text"
          value={data.name}
          onChange={handleNameChange}
          placeholder="Name"
          className="w-full p-1 border rounded mb-2"
        />
        <input
          type="number"
          value={data.value}
          onChange={handleValueChange}
          placeholder="Value"
          className="w-full p-1 border rounded"
        />
      </div>
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

export default memo(VariableNode);