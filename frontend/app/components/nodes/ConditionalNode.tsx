import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';
interface NodeData {
  condition: string;
  condition_inputs: string[];
  true_value: number;
  false_value: number;
  onChange?: (id: string, data: any) => void;
}
const ConditionalNode: React.FC<NodeProps<NodeData>> = ({ data, isConnectable, id, selected }) => {
  const [localCondition, setLocalCondition] = useState<string>(data.condition || ">");
  const updateNodeInternals = useUpdateNodeInternals();
  
  const TRUE_VALUE = 1;
  const FALSE_VALUE = -1;
  useEffect(() => {
    setLocalCondition(data.condition || ">");
    
    if (data.onChange) {
      data.onChange(id, { 
        true_value: TRUE_VALUE,
        false_value: FALSE_VALUE 
      });
    } else {
      data.true_value = TRUE_VALUE;
      data.false_value = FALSE_VALUE;
    }
  }, [data.condition]);
  const handleConditionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCondition = e.target.value;
      setLocalCondition(newCondition);
      if (data.onChange) {
        data.onChange(id, { 
          condition: newCondition,
          true_value: TRUE_VALUE,
          false_value: FALSE_VALUE
        });
      } else {
        data.condition = newCondition;
        data.true_value = TRUE_VALUE;
        data.false_value = FALSE_VALUE;
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
      <div className="font-medium">Conditional</div>
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">Condition</label>
        <select
          value={localCondition}
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
            <div className="block text-sm font-medium text-gray-700">True Value: {TRUE_VALUE}</div>
          </div>
          <div>
            <div className="block text-sm font-medium text-gray-700">False Value: {FALSE_VALUE}</div>
          </div>
        </div>
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