export const terraformLogsNdjson = `{"@timestamp":"2025-09-01T10:00:00.000Z","@level":"info","@message":"Terraform run started","tf_run_id":"12345"}
{"@timestamp":"2025-09-01T10:00:01.000Z","@level":"debug","@message":"Provider configuration loaded","provider":"aws"}
{"@timestamp":"2025-09-01T10:00:02.000Z","@level":"info","@message":"Resource creation started","resource_type":"aws_instance","resource_name":"web_server"}
{"@timestamp":"2025-09-01T10:00:03.000Z","@level":"warn","@message":"Deprecation warning for attribute 'instance_type'","resource_name":"web_server"}
{"@timestamp":"2025-09-01T10:00:04.000Z","@level":"error","@message":"Failed to create resource","resource_name":"web_server","error":"Invalid AMI ID"}`;
