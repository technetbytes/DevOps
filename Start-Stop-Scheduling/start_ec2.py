import boto3

def lambda_handler(event, context):
    ec2 = boto3.client('ec2')
    filters = [{'Name': 'tag:Schedule', 'Values': ['StartStop']}]
    instances = ec2.describe_instances(Filters=filters)
    ids = [i['InstanceId'] for r in instances['Reservations'] for i in r['Instances'] if i['State']['Name'] == 'stopped']
    if ids:
        ec2.start_instances(InstanceIds=ids)
