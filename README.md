# ☁️ CloudDeployX

### Cloud-Native Application Deployment & Monitoring Platform

CloudDeployX is a cloud-native DevOps platform for managing applications, deployments, monitoring, and infrastructure through a unified dashboard.

**Stack:** Java 21 • Spring Boot • React • PostgreSQL • Redis • Docker • Kubernetes • AWS • Terraform • GitHub Actions

## 🚀 Features

- JWT authentication and BCrypt password hashing
- Role-based access control: ADMIN, DEVELOPER, VIEWER
- Application registration and management
- GitHub repository and branch configuration
- Development, Staging, and Production environments
- Deployment creation, tracking, history, and rollback workflow
- Docker containerization
- Kubernetes deployment architecture
- AWS ECR/EKS/RDS integration architecture
- CI/CD with GitHub Actions
- Infrastructure as Code with Terraform
- Health checks and application monitoring
- Deployment and application logs
- Team management and audit activity

## 🏗️ Architecture

```text
Developer
   ↓
React Frontend
   ↓ REST API
Spring Boot Backend
   ↓
PostgreSQL + Redis
   ↓
CI/CD Pipeline
   ↓
Docker
   ↓
AWS ECR
   ↓
Kubernetes / AWS EKS
   ↓
Running Application
   ↓
Monitoring / Logs
```

## 📁 Structure

```text
clouddeployx/
├── backend/
├── frontend/
├── kubernetes/
├── terraform/
├── .github/workflows/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 💻 Local Setup

### Requirements

- Java 21
- Maven 3.9+
- Node.js 20+
- Docker Desktop
- Git

### Run with Docker

```bash
docker compose up --build
```

Services:

```text
Frontend:  http://localhost:5173
Backend:   http://localhost:8080
Swagger:   http://localhost:8080/swagger-ui/index.html
Health:    http://localhost:8080/actuator/health
```

### Run Backend

```bash
docker compose up -d postgres redis
cd backend
mvn clean package
mvn spring-boot:run
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Authentication API

### Register

```http
POST /api/auth/register
```

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Password@123"
}
```

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "demo@example.com",
  "password": "Password@123"
}
```

The login response contains a JWT token used for protected APIs:

```text
Authorization: Bearer <JWT_TOKEN>
```

## 📦 Application Management

Create an application:

```http
POST /api/applications
```

```json
{
  "name": "Payment Service",
  "description": "Payment processing API",
  "repositoryUrl": "https://github.com/example/payment-service",
  "branch": "main",
  "environment": "development"
}
```

List applications:

```http
GET /api/applications
```

## 🚀 Deployment Management

Create deployment:

```http
POST /api/deployments
```

```json
{
  "applicationId": 1,
  "version": "1.0.0",
  "environment": "development"
}
```

Deployment lifecycle:

```text
QUEUED → BUILDING → TESTING → DEPLOYING → SUCCESS
```

A deployment simulation is available through:

```http
POST /api/deployments/{id}/simulate
```

## 🔄 CI/CD Workflow

```text
Git Push
   ↓
GitHub Actions
   ↓
Build
   ↓
Unit Tests
   ↓
Docker Build
   ↓
Push Image to AWS ECR
   ↓
Deploy to Kubernetes
   ↓
Health Check
```

## ☁️ AWS & Terraform

The project contains Terraform and Kubernetes configuration for cloud deployment.

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

For Kubernetes:

```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/ingress.yaml
```

> Never commit AWS credentials, GitHub tokens, database passwords, JWT secrets, or other production secrets. Use environment variables, GitHub Secrets, AWS Secrets Manager, or Kubernetes Secrets.

## 📊 Monitoring

CloudDeployX is designed for:

```text
Spring Boot Actuator
        ↓
    Prometheus
        ↓
      Grafana
```

Tracked metrics include CPU, memory, requests, response time, error rate, application health, and infrastructure health.

## 🧪 Testing

```bash
cd backend
mvn test
```

## 🗺️ Future Enhancements

- GitHub OAuth/GitHub App integration
- Automated GitHub webhooks
- Real deployment workers
- Production AWS EKS/RDS deployment
- Kafka event processing
- Prometheus/Grafana dashboards
- Automated rollback
- Blue/Green deployments
- Canary deployments
- Horizontal Pod Autoscaling
- HTTPS
- AWS Secrets Manager
- SonarQube integration

## 👨‍💻 Author

**Mohammed Abubakkar I**  
B.E. Computer Science Engineering (Honors)

GitHub: `https://github.com/yourusername`  
LinkedIn: `https://www.linkedin.com/in/yourprofile/`

## 📄 License

Educational, portfolio, and demonstration project.
