<p align="center">
    <img src="/readme/icon.svg" width="128px" alt="Logo" />
</p>

<h1 align="center">Event Registration System</h1>
<p align="center">This application was created for the purposes of ESN.</p>
<p align="center"><a href="https://api.slabys.cz/docs">API docs</a> · <a href="https://slabys.cz/">WEB demo</a></p>
<br />

[//]: # (TODO - image)

[//]: # (<p align="center">)

[//]: # (  <a href="/readme/hero.png">)

[//]: # (    <img src="/readme/hero.png" alt="Screenshot app preview" />)

[//]: # (  </a>)

[//]: # (</p>)

<br />

# Table of Content

1. [About this Project](#about-this-project)
    1. [Main Focus](#main-focus)
1. [Built With](#built-with)
    1. [Data / Storage](#data--storage)
    1. [Backend](#backend)
    1. [Frontend](#frontend)
1. [Project Structure](#project-structure)
    1. [Backend Structure](#backend-structure)
    1. [Frontend Structure](#frontend-structure)
    1. [NGINX and Certbot Structure](#nginx-and-certbot-structure)
1. [How to use](#how-to-use)
    1. [Local development](#local-development)
        1. [RUN Backend](#run-backend)
        1. [RUN Frontend](#run-frontend)
        1. [RUN Docker Compose locally](#run-docker-compose-locally)
    1. [Production deploy](#production-deploy)
        1. [RUN Docker Compose WITHOUT NGINX](#run-docker-compose-without-nginx)
        1. [RUN Docker Compose WITH NGINX](#run-docker-compose-with-nginx)
1. [Contributors](#contributors)
1. [Roadmap](#roadmap)

## About This Project

The Event Registration System (ERS) simplifies event management for organizations. Designed to streamline workflows
for admins and users alike, the system includes features such as:

- **Event Creation and Management**: Admins can create events, manage participants, and handle registrations.
- **User Registration and Participation**: Users can register for events, view details, and join activities
  effortlessly.
- **Automated PDF Invoices**: Generate invoices with QR codes for payment.
- **Payment Tracking**: Users can upload payment confirmations, ensuring easier financial management.
- **Organization Management**: Assign users to specific organizations and manage their access in applications
  accordingly.

### Main Focus

The Main Focus based on needs of ESN organisation and its alignment with need for Event Registration System. This
includes:

- **High-Level Description of the Business Problem**: Current Event Registration System that is in use is deprecated and
  hard to use. This old system is built on top of Drupal CMS that is kept without updates.
- **The Big Picture**: "The Big Picture" or the main goal is to create ERS platform in modern, easily accessible
  technologies, so this project can be kept and updated.
- **Use Case Design**: Use Case for this project is to create platform for management with easy control regarding
  creation and event management, but also easy use for members that will participate on these events.

## Built With

### Data / Storage

[![PostgreSQL][PostgreSQL]][PostgreSQL-url] [![Redis][Redis]][Redis-url]

The database layer is powered by **PostgreSQL**, relational database management system. The structure
includes:

- **Database migrations** for version control and schema updates.
- Support for advanced features like indexing, triggers, and JSON data types for flexibility and scalability.

The **Document API** utilizes **Redis** as a fast and in-memory data structure store, is integrated to help with
document generation.

### Backend

[![Nest.js][Nest.js]][Nest-url] [![Typescript][Typescript]][Typescript-url]

The backend is developed using **Nest.js**, a progressive Node.js framework designed for building efficient, reliable,
and scalable server-side applications. Its modular architecture supports maintainability and scalability, enabling the
seamless integration of features such as:

- **RESTful APIs**
- **Document generation**
- A **structured library system** for shared configurations, utilities, and core modules.

### Frontend

[![Next][Next.js]][Next-url] [![React][React.js]][React-url] [![Mantine][Mantine]][Mantine-url] [![Typescript][Typescript]][Typescript-url]

Next.js is a React framework for building full-stack web applications. React Components are used to build user
interfaces, and Next.js for additional features and optimizations.

Under the hood, Next.js also abstracts and automatically configures tooling needed for React, like bundling, compiling,
etc...

## Project Structure

![Next](/readme/architecture.svg)

The project is organized into distinct directories to maintain clarity and ensure modular development. Below is a
detailed breakdown of the structure:

```
.
├── backend
│   ├── apps
│   │   ├── api
│   │   └── documents
│   ├── database
│   │   └── migrations
│   ├── libs
│   │   ├── config
│   │   ├── modules
│   │   └── utilities
│   └── storage
├── database
├── frontend
│   ├── public
│   │   ├── icons
│   │   └── screenshots
│   └── src
│       ├── app
│       │   ├── (authorized)
│       │   │   ├── account
│       │   │   ├── event
│       │   │   │   ├── [id]
│       │   │   │   └── manage
│       │   │   │       └── [id]
│       │   │   ├── manage-events
│       │   │   ├── manage-organizations
│       │   │   ├── organization
│       │   │   │   └── [id]
│       │   │   │       └── members
│       │   │   └── sent-applications
│       │   ├── (unauthorized)
│       │   │   ├── login
│       │   │   └── registration
│       │   ├── privacy-policy
│       │   └── terms-and-conditions
│       ├── components
│       └── utils
├── nginx
│   └── conf.d
└── readme

```

### Backend Structure

The backend is built using **Nest.js**, structured into two primary services:

1. **API Service**: This service handles all user requests, serving as the main interface for interacting with the
   system.
2. **Document Service**: Dedicated to managing document generation, including invoice creation.

For file management, the system utilizes the application’s **local storage** to securely save user-uploaded files, such
as event photos and payment confirmations.

### Frontend Structure

The frontend utilizes **Next.js**, a React-based framework that provides server-side rendering (SSR) and static site
generation (SSG) for enhanced performance and SEO optimization. Key features include:

- A modular design with **authorized** and **unauthorized** routes.
- Dynamic and static pages, such as event details, account management, and registration.
- **Reusable components** to streamline development and ensure consistency across the application.
- A modern and responsive user interface built with React and Mantine.

### NGINX and Certbot Structure

The project employs **NGINX** as a reverse proxy. It manages incoming traffic, ensuring security and optimized
performance.
For easier configuration NGINX is included inside `docker-compose.nginx.yml`, which automatically creates configuration
for the whole application based on .env variables.
In combination with Certbot which adds benefits of HTTPS certificate and utilizes automatic certificate renewals.

## How to use

### Local development

This section guides you through setting up the project for local development, including configuring the backend,
database, and frontend.

#### RUN Database and Redis

```shell
docker run --name postgres-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=database -p 5432:5432 -d postgres:15
```

```shell
docker run --name redis -p 6379:6379 -d redis:7
```

#### RUN Backend

For this step its required to have running Postgres database and Redis.

##### **BE: Environment Variables**

Create a `.env` file in the backend directory with the following content to set up the local environment:

```dotenv
# .env - inside /backend folder
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=database
DB_USER=user
DB_PASS=password

PORT_API=4000
JWT_SECRET=secret

BASE_URL=http://localhost:4000
WEB_DOMAIN=localhost

NODE_ENV=development

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

##### **BE: Running scripts**

```shell
# Inside /backend folder
# Install dependencies
pnpm start:dev

# Database migrations
pnpm migration:run

# Start local development
pnpm install
```

#### RUN Frontend

For this step its required to have running Postgres database and Redis.

##### **FE: Environment Variables**

```dotenv
# .env - inside /frontend folder
NEXT_PUBLIC_API_DOMAIN=http://localhost:4000
PORT_FE=3000
```

##### **FE: Running scripts**

```shell
# Inside /frontend folder
# Install dependencies
yarn install

# Start local development
yarn dev
```

#### RUN Docker Compose locally

```dotenv
# .env - next to docker-compose.local.yml
### General
NODE_ENV=production
PORT_FRONTEND=3000
PORT_BACKEND=4000
WEB_DOMAIN="http://localhost:${PORT_FRONTEND}"
API_DOMAIN="http://localhost:${PORT_BACKEND}"

### APP 1
BASE_URL="${API_DOMAIN}"
PORT_API="${PORT_BACKEND}"
JWT_SECRET=secret

### FRONTEND
NEXT_PUBLIC_API_DOMAIN="${API_DOMAIN}"
PORT_FE="${PORT_FRONTEND}"

### DATABASE
DB_HOST=database
DB_PORT=5432
DB_NAME=database
DB_USER=user
DB_PASS=password

### Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Production deploy

For production deployment the .env file can be shared used for both WITH or WITHOUT NGINX configuration.

```dotenv
# .env - next to docker-compose.yml
### General
NODE_ENV=production
WEB_DOMAIN=example.com
API_DOMAIN=api.example.com

### APP 1
BASE_URL="${API_DOMAIN}"
PORT_API=4000
JWT_SECRET=secret

### FRONTEND
NEXT_PUBLIC_API_DOMAIN="${API_DOMAIN}"
PORT_FE=3000

### DATABASE
# DB_HOST - linked to docker container with name "database" 
DB_HOST=database
DB_PORT=5432
DB_NAME=database
DB_USER=user
DB_PASS=password

### Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

#### RUN Docker Compose WITHOUT NGINX

```shell
# Build images
docker compose -f docker-compose.yml build

# Start images in detached mode
docker compose -f docker-compose.yml up -d
```

## Contributors

|                                               Šimon Slabý                                               |                                                Petr Vavřínek                                                |                                               Petr Mlejnek                                                |                   Ondřej Kmínek                    |
|:-------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------------------------:|:--------------------------------------------------:|
|                                       ![Slaby-Simon][Slaby-Simon]                                       |                                       ![Vavrinek-Petr][Vavrinek-Petr]                                       |                                       ![Mlejnek-Petr][Mlejnek-Petr]                                       |                                                    |
| [![GitHub][github-logo]][Slaby-Simon-github-url] [![LinkedIn][linkedin-logo]][Slaby-Simon-linkedin-url] | [![GitHub][github-logo]][Vavrinek-Petr-github-url] [![LinkedIn][linkedin-logo]][Vavrinek-Petr-linkedin-url] | [![GitHub][github-logo]][Mlejnek-Petr-github-url] [![LinkedIn][linkedin-logo]][Mlejnek-Petr-linkedin-url] | [![GitHub][github-logo]][Kminek-Ondrej-github-url] |

## Roadmap

The roadmap includes future enhancements such as:

- [ ] Create statistics for events.
- [ ] Events and Users exports into table sheets.

<!-- MARKDOWN LINKS & IMAGES -->

[PostgreSQL]: https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white

[PostgreSQL-url]: https://www.postgresql.org/

[Redis]: https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white

[Redis-url]: https://redis.io/

[OpenAPI-url]: https://nestjs.com/

[Nest.js]: https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white

[Nest-url]: https://nestjs.com/

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white

[Next-url]: https://nextjs.org/

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB

[React-url]: https://reactjs.org/

[Mantine]: https://img.shields.io/badge/Mantine-339AF0?logo=mantine&logoColor=fff&style=for-the-badge

[Mantine-url]: https://mantine.dev/

[Typescript]: https://shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=FFF

[Typescript-url]: https://www.typescriptlang.org/

<!-- CONTRIBUTOR LINKS -->

[Slaby-Simon]: https://avatars.githubusercontent.com/u/62111588?v=4&s=64

[Slaby-Simon-github-url]: https://github.com/slabys

[Slaby-Simon-linkedin-url]: https://www.linkedin.com/in/slabys/

[Vavrinek-Petr]: https://avatars.githubusercontent.com/u/57972107?v=4&s=64

[Vavrinek-Petr-github-url]: https://github.com/petrvavrinek

[Vavrinek-Petr-linkedin-url]: https://www.linkedin.com/in/petr-vav%C5%99%C3%ADnek-630297179/

[Mlejnek-Petr]: https://avatars.githubusercontent.com/u/72386535?v=4&s=64

[Mlejnek-Petr-github-url]: https://github.com/mlejnpe1

[Mlejnek-Petr-linkedin-url]: https://www.linkedin.com/in/petr-mlejnek-80517332b/

[Kminek-Ondrej]: https://avatars.githubusercontent.com/u/101573343?v=4&s=64

[Kminek-Ondrej-github-url]: https://github.com/kminekondrej

<!-- CONTRIBUTOR LINK Images -->

[github-logo]: /readme/github-logo.svg

[linkedin-logo]: /readme/linkedin-logo.svg
