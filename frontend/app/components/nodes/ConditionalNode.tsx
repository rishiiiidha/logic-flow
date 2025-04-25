import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  condition: string;
  condition_inputs: string[];
  true_value: number | null;
  false_value: number | null;
}

const ConditionalNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const handleConditionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      data.condition = e.target.value;
    },
    [data]
  );

  const handleTrueValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data.true_value = parseFloat(e.target.value) || 0;
    },
    [data]
  );

  const handleFalseValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data.false_value = parseFloat(e.target.value) || 0;
    },
    [data]
  );

  return (
    <div
      className={`p-3 bg-white border-2 rounded-md ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div className="font-medium">Conditional</div>
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">Condition</label>
        <select
          value={data.condition}
          onChange={handleConditionChange}
          className="w-full p-1 border rounded mb-2"
        >
          <option value=">">Greater Than (&gt;)</option>
          <option value="<">Less Than (&lt;)</option>
          <option value="==">Equal To (==)</option>
          <option value=">=">Greater Than or Equal (&gt;=)</option>
          <option value="<=">Less Than or Equal (&lt;=)</option>
          <option value="!=">Not Equal (!=)</option>
        </select>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">True Value</label>
            <input
              type="number"
              value={data.true_value ?? 0}
              onChange={handleTrueValueChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">False Value</label>
            <input
              type="number"
              value={data.false_value ?? 0}
              onChange={handleFalseValueChange}
              className="w-full p-1 border rounded"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p>Input 1</p>
        <p>Input 2</p>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        id="condition-input-1"
        style={{ background: '#555', top: '30%' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="condition-input-2"
        style={{ background: '#555', top: '45%' }}
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

export default memo(ConditionalNode);