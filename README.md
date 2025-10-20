# 🧩 Microservices Backend Test – Order System

This project is a **technical test** for Backend Developer candidates.  
It simulates a distributed system built with a **microservices architecture**, using **asynchronous communication** via **RabbitMQ**.

---

## 🚀 Services Overview

| Service | Description | Repository |
|----------|--------------|-------------|
| **order-service** | Exposes an API to create orders and publishes the `order.created` event. | [🔗 View Repo](https://github.com/perdianto27/lst-order-service) |
| **inventory-service** | Listens to `order.created`, checks and updates stock, then publishes `inventory.updated`. | [🔗 View Repo](https://github.com/perdianto27/lst-inventory-service) |
| **notification-service** | Listens to `inventory.updated` and logs a success message when inventory is updated. | [🔗 View Repo](https://github.com/perdianto27/lst-notification-service) |

---

## 🛠️ Tech Stack

- **Node.js** + **TypeScript**
- **NestJS**
- **RabbitMQ** (Message Broker)
- **PostgreSQL**
- **Docker & Docker Compose**

---

## 🏃‍♂️ Running the Application (via Docker)

### 1. **Prerequisites**

Make sure you have:
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed  
- Ports `5672`, `15672` (RabbitMQ), and `3000+` for services are **not in use**

---

### 2. **Clone the Repository**

```bash
git clone https://github.com/perdianto27/lst-order-service
cd lst-order-service
git clone https://github.com/perdianto27/lst-inventory-service
cd lst-inventory-service
git clone https://github.com/perdianto27/lst-notification-service
cd lst-notification-service