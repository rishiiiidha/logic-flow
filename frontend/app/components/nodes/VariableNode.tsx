import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';

interface NodeData {
  name: string;
  value: number;
  onChange?: (id: string, data: any) => void;
}

const VariableNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const [localName, setLocalName] = useState<string>(data.name || "x");
  const [localValue, setLocalValue] = useState<string>(data.value?.toString() || "0");
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    setLocalName(data.name || "x");
    setLocalValue(data.value?.toString() || "0");
  }, [data.name, data.value]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setLocalName(newName);
    },
    []
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    },
    []
  );

  const handleNameBlur = useCallback(() => {
    if (localName !== data.name) {
      if (data.onChange) {
        data.onChange(id, { name: localName });
      } else {
        data.name = localName;
        updateNodeInternals(id);
      }
    }
  }, [localName, data, id, updateNodeInternals]);

  const handleValueBlur = useCallback(() => {
    const numericValue = parseFloat(localValue) || 0;
    if (numericValue !== data.value) {
      if (data.onChange) {
        data.onChange(id, { value: numericValue });
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
      <div className="font-medium">Variable</div>
      <div className="mt-2">
        <input
          type="text"
          value={localName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          placeholder="Name"
          className="w-full p-1 border rounded mb-2"
        />
        <input
          type="number"
          value={localValue}
          onChange={handleValueChange}
          onBlur={handleValueBlur}
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