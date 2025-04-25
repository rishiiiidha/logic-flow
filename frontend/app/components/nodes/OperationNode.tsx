import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';

interface NodeData {
  operation: string;
  onChange?: (id: string, data: any) => void;
}

const OperationNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const [localOperation, setLocalOperation] = useState<string>(data.operation || "+");
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    setLocalOperation(data.operation || "+");
  }, [data.operation]);

  const handleOperationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newOperation = e.target.value;
      setLocalOperation(newOperation);
      if (data.onChange) {
        data.onChange(id, { operation: newOperation });
      } else {
        data.operation = newOperation;
        updateNodeInternals(id);
      }
    },
    [data, id, updateNodeInternals]
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
          value={localOperation}
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