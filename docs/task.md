Terraform LogViewer: from chaos to order

During large-scale infrastructure deployments, Terraform logs grow to tens of megabytes and contain records of mixed formats: messages from planning (plan) and applying (apply), HTTP request logs to providers, warnings, and errors. The lack of a single interface for quickly detecting anomalies, tracing request execution, and deeply analyzing JSON bodies complicates support work: you have to manually scan huge text files or write ad-hoc scripts, which increases diagnosis time and leads to delays in service recovery.

Participants build a web service that accepts Terraform log files in JSON format as input.

Parsing and storage
- Extract timestamps and log levels, even if a line doesn’t explicitly contain a timestamp or log level (heuristic splitting and regex-based algorithm).
- Recognize sections of `terraform plan` and `terraform apply` output with start and end markers.
- Extract JSON blocks from the `tf_http_req_body` and `tf_http_res_body` fields with lazy loading (JSON bodies are hidden by default; you can click to fully or selectively expand).

Terraform LogViewer: from chaos to order

Interface and visualization
- Color highlighting by levels.
- Tag request and response records with the same `tf_req_id` to group them into chains.
- Search across multiple fields (for example, `tf_resource_type=t1_compute_instance` and a timestamp range) via a dedicated view or tab.
- Instant full-text search across the contents of all records.
- A “mark as read” function for selected records to exclude them from the overall anomalies list.

Extensibility
- A gRPC-based plugin system: participants can connect their own filters and handlers (e.g., for automatic aggregation of errors by type and frequency).
- An API for programmatic integration with external monitoring and incident-management tools.

Analysis
- Generate a Gantt chart or flowchart showing the chronology of requests and responses taking into account `tf_req_id` and their dependencies. The graph is built from the start and end timestamps of processing each request.

Terraform LogViewer: from chaos to order

Evaluation criteria:
Import and parsing of logs (20 points)
- Correct identification and labeling of `terraform plan` and `terraform apply` sections: 0–10 points
- Recognition of timestamps and log levels even when absent in lines: 0–10 points

Search, filtering, and visualization (20 points)
- Search across multiple fields (e.g., `tf_resource_type` and timestamp range) via the interface, grouping records by `tf_req_id`, and full-text search across contents: 0–10 points
- Interactive expanding/collapsing of request/response JSON blocks by click; interface usability: tasks (find an error, expand JSON, navigate by groups) require a minimum number of clicks, demonstrated in a video: 0–10 points

Extensibility and plugins (20 points)
- Connecting and demonstrating at least one gRPC plugin for filtering or processing: 0–10 points
- API call demonstrated (export of filtered logs or integration with an external service) via the interface or `curl`: 0–10 points

Chronology visualization (20 points)
- Generation and visualization of a Gantt chart or a flowchart of request chronology in the interface: 0–20 points

Presentation and concept elaboration (20 points)
- Quality of the presentation and product demo: 0–10 points
- Depth of the business logic and user scenario design: 0–10 points

Terraform LogViewer: from chaos to order

Additional materials and instructions:
- Examples of real Terraform logs (plan/apply) from various providers
- Documentation on gRPC plugins for filtering and processing records
- Log link: https://sigma.disk.t1.cloud/public/sUMtABJM

Checkpoint guide:
- Checkpoint 1: demonstrate the parser and correct labeling of plan/apply, timestamp, and log level
- Checkpoint 2: perform field-based search and grouping by `tf_req_id`, show interactive JSON expansion
- Checkpoint 3: visualize the request chronology as a chart or flowchart; present extensibility via gRPC plugins

_________________________________________________________________________________________________

What to submit for review:
- A link to an open repository with the complete source code of the solution. It must include instructions for easy launch on any OS (Docker recommended).
- An architectural diagram of components: parser, storage engine, API, web client
- A demo video showing log import, search, grouping, and JSON expansion
- A presentation describing the technique for building the Gantt chart/flowchart
