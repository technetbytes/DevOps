provider "aws" {
  region = var.region
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_ec2_role" {
  name = "lambda-ec2-scheduler-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Effect = "Allow",
      Sid    = ""
    }]
  })
}

# IAM Policy for Lambda
resource "aws_iam_policy_attachment" "lambda_ec2_permissions" {
  name       = "lambda-ec2-attach"
  roles      = [aws_iam_role.lambda_ec2_role.name]
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2FullAccess"
}

resource "aws_iam_policy_attachment" "lambda_logs" {
  name       = "lambda-logs-attach"
  roles      = [aws_iam_role.lambda_ec2_role.name]
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# Start EC2 Lambda
resource "aws_lambda_function" "start_ec2" {
  function_name = "StartEC2Instances"
  role          = aws_iam_role.lambda_ec2_role.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.9"

  filename         = "${path.module}/start_ec2.zip"
  source_code_hash = filebase64sha256("${path.module}/start_ec2.zip")
}

# Stop EC2 Lambda
resource "aws_lambda_function" "stop_ec2" {
  function_name = "StopEC2Instances"
  role          = aws_iam_role.lambda_ec2_role.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.9"

  filename         = "${path.module}/stop_ec2.zip"
  source_code_hash = filebase64sha256("${path.module}/stop_ec2.zip")
}

# CloudWatch Event Rule for Start
resource "aws_cloudwatch_event_rule" "start_schedule" {
  name                = "StartEC2Schedule"
  schedule_expression = "cron(0 9 * * ? *)"  # 9:00 AM UTC
}

# CloudWatch Event Rule for Stop
resource "aws_cloudwatch_event_rule" "stop_schedule" {
  name                = "StopEC2Schedule"
  schedule_expression = "cron(0 19 * * ? *)"  # 7:00 PM UTC
}

# EventBridge permissions to invoke Lambda
resource "aws_lambda_permission" "allow_start_event" {
  statement_id  = "AllowStartInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.start_ec2.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.start_schedule.arn
}

resource "aws_lambda_permission" "allow_stop_event" {
  statement_id  = "AllowStopInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stop_ec2.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.stop_schedule.arn
}

# CloudWatch Event Targets
resource "aws_cloudwatch_event_target" "start_target" {
  rule      = aws_cloudwatch_event_rule.start_schedule.name
  target_id = "StartEC2Lambda"
  arn       = aws_lambda_function.start_ec2.arn
}

resource "aws_cloudwatch_event_target" "stop_target" {
  rule      = aws_cloudwatch_event_rule.stop_schedule.name
  target_id = "StopEC2Lambda"
  arn       = aws_lambda_function.stop_ec2.arn
}
