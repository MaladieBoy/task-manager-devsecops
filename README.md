# Secure Task Manager — DevSecOps Mini-Project

## 1. Project Overview

This project consists of developing and deploying a task management application using a DevSecOps approach.

The main objective is to integrate security practices throughout the software development lifecycle, from source code management to application deployment.

The project implements an automated CI/CD pipeline using Jenkins, with several security tools to analyze source code, dependencies, container images, and the deployed application.

## 2. Project Objectives

- Manage source code using Git and GitHub.
- Develop and test a Java Spring Boot application using Maven.
- Containerize the application using Docker.
- Automate the CI/CD pipeline with Jenkins.
- Perform static code analysis using SonarQube.
- Identify vulnerable dependencies using OWASP Dependency-Check.
- Scan Docker images using Trivy.
- Deploy the application to Kubernetes using Minikube.
- Perform dynamic security testing using OWASP ZAP.

## 3. Technologies and Tools

| Category | Technology |
|---|---|
| Programming language | Java 25 |
| Framework | Spring Boot 4.0.0 |
| Build tool | Apache Maven |
| Version control | Git and GitHub |
| CI/CD | Jenkins |
| Code analysis | SonarQube |
| Dependency scanning | OWASP Dependency-Check |
| Containerization | Docker |
| Image scanning | Trivy |
| Container registry | Docker Hub |
| Orchestration | Kubernetes |
| Local Kubernetes environment | Minikube |
| Dynamic security testing | OWASP ZAP |

## 4. Application Architecture

The application follows a simple layered architecture:

- **Controller:** Exposes REST API endpoints.
- **Service:** Contains the task management logic.
- **Model:** Represents task data.
- **Frontend:** Provides a web interface for managing tasks.

The backend is developed using Spring Boot, while the frontend uses HTML, CSS, and JavaScript.

## 5. CI/CD Pipeline

The automated pipeline follows these main steps:

1. A developer pushes code changes to GitHub.
2. Jenkins retrieves the latest source code.
3. Maven compiles the application and executes unit tests.
4. SonarQube performs static code analysis.
5. OWASP Dependency-Check analyzes project dependencies.
6. Docker builds the application image.
7. Trivy scans the Docker image for vulnerabilities.
8. The image is published to Docker Hub.
9. Jenkins deploys the image to Kubernetes.
10. OWASP ZAP performs dynamic security testing against the deployed application.

## 6. Running the Application Locally

### Prerequisites

- Java 25 or compatible version.
- Apache Maven.
- Git.

### Clone the repository

```bash
git clone https://github.com/MaladieBoy/task-manager-devsecops.git
cd task-manager-devsecops
```

### Build and test

```bash
mvn clean verify
```

### Start the application

```bash
mvn spring-boot:run
```

The application is available at:

http://localhost:8080

The task API is available at:

http://localhost:8080/tasks

## 7. Docker Deployment

Build the Docker image:

```bash
docker build -t task-manager:1.0.0 .
```

Run the container:

```bash
docker run -d -p 8080:8080 --name task-manager task-manager:1.0.0
```

## 8. Kubernetes Deployment

The Kubernetes manifests are located in the `k8s/` directory.

Apply the deployment and service:

```bash
kubectl apply -f k8s/
```

Check the deployment:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

The application is exposed through a Kubernetes NodePort service.

## 9. Security Analysis

The project integrates four security analysis tools:

- **SonarQube:** Static source code analysis and Quality Gate evaluation.
- **OWASP Dependency-Check:** Detection of known vulnerabilities in project dependencies.
- **Trivy:** Vulnerability scanning of Docker images.
- **OWASP ZAP:** Dynamic security testing of the deployed web application.

Reports and screenshots are organized in `documentation/evidence/`.

## 10. Docker Hub

The application image is published in the following repository:

https://hub.docker.com/r/xxmaladiexx/task-manager

## 11. Project Deliverables

- Java Spring Boot source code and unit tests.
- Dockerfile.
- Kubernetes deployment and service manifests.
- Jenkinsfile.
- Published Docker image.
- Security analysis reports.
- Technical documentation.
