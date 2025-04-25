# Logic Flow 

A web application to create and evaluate logic flow graphs using a drag-and-drop interface, containerized with Docker.

## How to Run Locally

### Prerequisites
- **Docker** and **Docker Compose** installed ([Install Docker](https://www.docker.com/get-started)).

### Steps
1. Clone or navigate to the project directory:
   ```bash
   cd logic-flow-evaluator
   ```
2. Build and run the containers:
   ```bash
   docker-compose up --build
   ```
3. Access the app:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
4. Stop the containers:
   ```bash
   docker-compose down
   ```

## Result


## Use Cases

### Case 1: Basic Addition (9 + 5 = 14)
1. Open `http://localhost:3000`.
2. Drag two **Constant** nodes to the canvas.
3. Set values to `9` (Node A) and `5` (Node B).
4. Drag an **Operation** node, set to `+` (addition).
5. Drag a **Result** node.
6. Connect:
   - Node A → Operation (input-1)
   - Node B → Operation (input-2)
   - Operation → Result
7. Click **Evaluate Graph**.
8. Result node shows `14`.

### Case 2: Chained Addition ((9 + 5) + 5 = 19)
1. Drag three **Constant** nodes, set to `9`, `5`, and `5`.
2. Drag two **Operation** nodes, both set to `+`.
3. Drag a **Result** node.
4. Connect:
   - First Constant (9) → First Operation (input-1)
   - Second Constant (5) → First Operation (input-2)
   - First Operation → Second Operation (input-1)
   - Third Constant (5) → Second Operation (input-2)
   - Second Operation → Result
5. Click **Evaluate Graph**.
6. Result node shows `19`.

### Case 3: Conditional (If 10 > 5, output 1)
1. Drag two **Constant** nodes, set to `10` and `5`.
2. Drag a **Conditional** node, set to `>` (greater than).
3. Drag a **Result** node.
4. Connect:
   - Constant (10) → Conditional (condition-input-1)
   - Constant (5) → Conditional (condition-input-2)
   - Conditional → Result
5. Click **Evaluate Graph**.
6. Result node shows `1` (true value, since 10 > 5).