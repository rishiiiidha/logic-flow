import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  result: number | null;
}

const ResultNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  return (
    <div
      className={`p-3 bg-white border-2 rounded-md ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div className="font-medium">Result</div>
      <div className="mt-2">
        <div className="p-2 bg-gray-100 rounded min-h-8">
          {data.result !== null ? data.result : 'No result yet'}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(ResultNode);