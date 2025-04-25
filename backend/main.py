from fastapi import FastAPI, HTTPException #type: ignore
from fastapi.middleware.cors import CORSMiddleware #type: ignore
from pydantic import BaseModel #type: ignore
from typing import Dict, List, Optional
import networkx as nx #type: ignore
from enum import Enum

app = FastAPI(title="Logic Flow Evaluator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NodeType(str, Enum):
    constant = "constant"
    variable = "variable"
    operation = "operation"
    result = "result"
    conditional = "conditional"

class NodeData(BaseModel):
    label: Optional[str] = None
    value: Optional[float] = None
    name: Optional[str] = None
    operation: Optional[str] = None
    result: Optional[float] = None
    condition: Optional[str] = None
    true_value: Optional[float] = None
    false_value: Optional[float] = None
    condition_inputs: Optional[List[str]] = None

class Node(BaseModel):
    id: str
    type: NodeType
    data: NodeData

class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    sourceHandle: Optional[str] = None
    target: str
    targetHandle: Optional[str] = None

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class EvaluationResponse(BaseModel):
    results: Dict[str, float]
    status: str = "success"

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_graph(graph_data: GraphData):
    try:
        G = nx.DiGraph()
        for node in graph_data.nodes:
            G.add_node(node.id, type=node.type, data=node.data.dict())
        
        for edge in graph_data.edges:
            G.add_edge(edge.source, edge.target,
                      sourceHandle=edge.sourceHandle,
                      targetHandle=edge.targetHandle)
        
        if not nx.is_directed_acyclic_graph(G):
            raise HTTPException(status_code=400, detail="Graph contains cycles, evaluation not possible")
        
        evaluation_order = list(nx.topological_sort(G))
        
        computed_values = {}
        
        for node_id in evaluation_order:
            node_data = G.nodes[node_id]
            node_type = node_data["type"]
            
            if node_type == NodeType.constant:
                if node_data["data"]["value"] is None:
                    raise HTTPException(status_code=400, detail=f"Constant node {node_id} missing value")
                computed_values[node_id] = node_data["data"]["value"]
            
            elif node_type == NodeType.variable:
                if node_data["data"]["value"] is None:
                    raise HTTPException(status_code=400, detail=f"Variable node {node_id} missing value")
                computed_values[node_id] = node_data["data"]["value"]
            
            elif node_type == NodeType.operation:
                input_edges = list(G.in_edges(node_id))
                
                if len(input_edges) < 2:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Operation node {node_id} requires at least 2 inputs, found {len(input_edges)}"
                    )
                
                input_values = []
                for source, _ in input_edges:
                    if source not in computed_values:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Input node {source} for operation {node_id} not yet computed"
                        )
                    input_values.append(computed_values[source])
                
                operation = node_data["data"]["operation"]
                if not operation:
                    raise HTTPException(status_code=400, detail=f"Operation node {node_id} missing operation type")
                
                if operation == "+":
                    result = sum(input_values)
                elif operation == "-":
                    result = input_values[0] - sum(input_values[1:])
                elif operation == "*":
                    result = 1
                    for val in input_values:
                        result *= val
                elif operation == "/":
                    if any(v == 0 for v in input_values[1:]):
                        raise HTTPException(status_code=400, detail="Division by zero")
                    result = input_values[0]
                    for val in input_values[1:]:
                        result /= val
                elif operation == "**":
                    if len(input_values) != 2:
                        raise HTTPException(status_code=400, detail="Power operation requires exactly 2 inputs")
                    result = input_values[0] ** input_values[1]
                elif operation == "%":
                    if len(input_values) != 2:
                        raise HTTPException(status_code=400, detail="Modulo operation requires exactly 2 inputs")
                    if input_values[1] == 0:
                        raise HTTPException(status_code=400, detail="Modulo by zero")
                    result = input_values[0] % input_values[1]
                else:
                    raise HTTPException(status_code=400, detail=f"Unknown operation: {operation}")
                
                computed_values[node_id] = result
            
            elif node_type == NodeType.conditional:
                condition = node_data["data"]["condition"]
                condition_inputs = node_data["data"]["condition_inputs"] or []
                
                if len(condition_inputs) != 2:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Conditional node {node_id} must have exactly 2 condition inputs"
                    )
                
                input_values = []
                for input_id in condition_inputs:
                    if input_id not in computed_values:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Condition input node {input_id} not yet computed"
                        )
                    input_values.append(computed_values[input_id])
                
                a, b = input_values
                if condition == ">":
                    condition_result = a > b
                elif condition == "<":
                    condition_result = a < b
                elif condition == "==":
                    condition_result = a == b
                elif condition == ">=":
                    condition_result = a >= b
                elif condition == "<=":
                    condition_result = a <= b
                elif condition == "!=":
                    condition_result = a != b
                else:
                    raise HTTPException(status_code=400, detail=f"Unknown condition: {condition}")
                
                computed_values[node_id] = (
                    node_data["data"]["true_value"]
                    if condition_result
                    else node_data["data"]["false_value"]
                )
                
                if computed_values[node_id] is None:
                    input_edges = list(G.in_edges(node_id))
                    if input_edges:
                        source = input_edges[0][0]
                        computed_values[node_id] = computed_values.get(source, None)
            
            elif node_type == NodeType.result:
                input_edges = list(G.in_edges(node_id))
                
                if not input_edges:
                    computed_values[node_id] = None
                else:
                    source = input_edges[0][0]
                    computed_values[node_id] = computed_values.get(source, None)
        
        result_nodes = {
            node_id: computed_values[node_id]
            for node_id in computed_values
            if G.nodes[node_id]["type"] == NodeType.result and computed_values[node_id] is not None
        }
        
        return EvaluationResponse(results=result_nodes)
    
    except nx.NetworkXError as e:
        raise HTTPException(status_code=400, detail=f"Graph error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn #type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)