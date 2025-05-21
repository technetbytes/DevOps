import boto3

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    filters = [{'Name': 'tag:Schedule', 'Values': ['StartStop']}]
    instances = ec2.describe_instances(Filters=filters)
    ids = [i['InstanceId'] for r in instances['Reservations'] for i in r['Instances'] if i['State']['Name'] == 'running']
    if ids:
        ec2.stop_instances(InstanceIds=ids)
