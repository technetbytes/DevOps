### Kubernetes Vertical Pod Autoscaler Scaling

Vertical Scaling Vertical scaling, also known as scaling up or down, involves adjusting the resources allocated to individual instances of your application components. It typically involves increasing or decreasing the CPU, memory, or storage capacity of a single instance. Vertical scaling allows you to handle increased workload by providing more resources to a specific component, but it may have limitations in terms of the maximum capacity of a single instance.

Clone the VPA Source Code: Use Git to clone the VPA source code repository to your local machine. Run the following command:

 ```
 git clone https://github.com/kubernetes/autoscaler.git
 ```

Run the script

 ```
 ./hack/vpa-up.sh
 ```

## deployment.yaml
 
 ```
 apiVersion: apps/v1
kind: Deployment
metadata:
  name: high-cpu-utilization-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cpu-utilization-app
  template:
    metadata:
      labels:
        app: cpu-utilization-app
    spec:
      containers:
      - name: cpu-utilization-container
        image: ubuntu
        command: ["/bin/sh", "-c", "apt-get update && apt-get install -y stress-ng && while true; do stress-ng --cpu 1; done"]
        resources:
          limits:
            cpu: "0.05"
          requests:
            cpu: "0.05"
 ```

 ## vpa.yaml
 
 ```
 apiVersion: "autoscaling.k8s.io/v1"
kind: VerticalPodAutoscaler
metadata:
  name: stress-vpa
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: high-cpu-utilization-deployment
  updatePolicy:
    updateMode: Auto
  resourcePolicy:
    containerPolicies:
      - containerName: '*'
        minAllowed:
          cpu: 100m
          memory: 50Mi
        maxAllowed:
          cpu: 200m  #maximum vpa will be allocating this many cpus even if demand is higher.
          memory: 500Mi
        controlledResources: ["cpu", "memory"]
 ```

 ### Pods Listing
 Now get running pods using following commands
 ```
  kubectl get po
 ```
 Output
  ```
  NAME                                               READY   STATUS    RESTARTS   AGE
    high-cpu-utilization-deployment-7cf65f6f58-fjzst   1/1     Running   0          23m
    high-cpu-utilization-deployment-7cf65f6f58-tbp9g   1/1     Running   0          24m
    load-generator                                     0/1     Error     0          52m
  ```

 Delete one of the pod using delete command

  ```
  kubectl delete pod high-cpu-utilization-deployment-7cf65f6f58-fjzst
  ```
  now take the listing again and observe the output

  ```
NAME                                               READY   STATUS        RESTARTS   AGE
high-cpu-utilization-deployment-7cf65f6f58-fjzst   1/1     Terminating   0          24m
high-cpu-utilization-deployment-7cf65f6f58-n729c   1/1     Running       0          26s
high-cpu-utilization-deployment-7cf65f6f58-tbp9g   1/1     Running       0          25m
load-generator                                     0/1     Error         0          53m
  ```