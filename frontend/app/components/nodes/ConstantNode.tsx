import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';
interface NodeData {
  value: number;
  onChange?: (id: string, value: number) => void;
}
const ConstantNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const [localValue, setLocalValue] = useState<string>(data.value?.toString() || "0");
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    setLocalValue(data.value?.toString() || "0");
  }, [data.value]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    },
    []
  );

  const handleBlur = useCallback(() => {
    const numericValue = parseFloat(localValue) || 0;
    if (numericValue !== data.value) {
      if (data.onChange) {
        data.onChange(id, numericValue);
      } else {
        data.value = numericValue;
        updateNodeInternals(id);
      }
    }
  }, [localValue, data, id, updateNodeInternals]);

  return (
    <div
      className={`p-3 bg-white border-2 rounded-md ${
        selected ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div className="font-medium">Constant</div>
      <div className="mt-2">
        <input
          type="number"
          value={localValue}
          onChange={handleValueChange}
          onBlur={handleBlur}
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

export default memo(ConstantNode);