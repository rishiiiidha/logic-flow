"use client";
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node as ReactFlowNode,
  Connection,
  OnConnect,
  Edge as ReactFlowEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeSelector from './components/NodeSelector';
import ConstantNode from './components/nodes/ConstantNode';
import VariableNode from './components/nodes/VariableNode';
import OperationNode from './components/nodes/OperationNode';
import ResultNode from './components/nodes/ResultNode';
import ConditionalNode from './components/nodes/ConditionalNode';

interface NodeData {
  label?: string;
  value?: number;
  name?: string;
  operation?: string;
  result?: number | null;
  condition?: string;
  condition_inputs?: string[];
  true_value?: number | null;
  false_value?: number | null;
  onChange?: (id: string, data: any) => void;
}

interface Node extends ReactFlowNode<NodeData> {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

type Edge = {
  id?: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
} & Omit<ReactFlowEdge, 'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'>;

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface EvaluationResponse {
  results: { [key: string]: number };
  status: string;
}

const nodeTypes = {
  constant: ConstantNode,
  variable: VariableNode,
  operation: OperationNode,
  result: ResultNode,
  conditional: ConditionalNode,
};

const LogicFlowEditor: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onNodeDataChange = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          if (typeof data === 'number') {
            return {
              ...node,
              data: {
                ...node.data,
                value: data
              }
            };
          }
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNodeId = `${type}_${Date.now()}`;
      let nodeData: NodeData = { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      };

      switch (type) {
        case 'constant':
          nodeData = { ...nodeData, value: 0 };
          break;
        case 'variable':
          nodeData = { ...nodeData, name: 'x', value: 0 };
          break;
        case 'operation':
          nodeData = { ...nodeData, operation: '+' };
          break;
        case 'result':
          nodeData = { ...nodeData, result: null };
          break;
        case 'conditional':
          nodeData = {
            ...nodeData,
            condition: '>',
            condition_inputs: [],
            true_value: 0,
            false_value: 0,
          };
          break;
        default:
          break;
      }

      nodeData.onChange = onNodeDataChange;

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: nodeData,
      };
 //@ts-ignore
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, onNodeDataChange]
  );

  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: onNodeDataChange,
        },
      }))
    );
  }, [onNodeDataChange, setNodes]);

  const evaluateGraph = async () => {
    if (nodes.length === 0) {
      setError('No nodes to evaluate');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nodesToSend = nodes.map(node => {
         //@ts-ignore
        const { onChange, ...cleanData } = node.data;
        
        if (node.type === 'conditional') {
          const conditionInputs = edges
            .filter(
              (e) =>
                e.target === node.id &&
                ['condition-input-1', 'condition-input-2'].includes(
                  e.targetHandle ?? ''
                )
            )
            .map((e) => e.source);
          
          return {
            id: node.id,
            type: node.type,
            data: {
              ...cleanData,
              condition_inputs: conditionInputs
            }
          };
        }
        
        return {
          id: node.id,
          type: node.type,
          data: cleanData
        };
      });

      const graphData: GraphData = {
        //@ts-ignore
        nodes: nodesToSend,
        edges,
      };

      const response = await fetch('https://logic-flow-server.vercel.app/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to evaluate graph');
      }

      const result: EvaluationResponse = await response.json();

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'result' && result.results[node.id] !== undefined) {
            return {
              ...node,
              data: {
                ...node.data,
                result: result.results[node.id],
              },
            };
          }
          return node;
        })
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during evaluation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between p-4 bg-gray-100 border-b">
        <h1 className="text-2xl font-bold">Logic Flow Builder</h1>
        <div>
          <button
            onClick={evaluateGraph}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          >
            {isLoading ? 'Evaluating...' : 'Evaluate Graph'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 text-red-700">{error}</div>
      )}

      <div className="flex flex-1">
        <NodeSelector />
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              nodesDraggable={true}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default LogicFlowEditor;