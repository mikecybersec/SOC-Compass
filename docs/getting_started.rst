Getting Started
===============

Welcome to the SOC Compass documentation! Getting started takes just a few minutes.

SOC Compass is distributed as prebuilt Docker images and runs as a small
containerized stack. No source code checkout or local builds are required.

-----------------
Quick Install (Recommended)
-----------------

The easiest way to install SOC Compass is using the provided installer script.
This will:

- Verify Docker and Docker Compose are installed
- Create the required configuration files
- Pull the latest SOC Compass images
- Start the application

**Prerequisites**

- Docker (20+)
- Docker Compose v2

To verify::

    docker --version
    docker compose version

**Linux / macOS**

Run the installer script::

    curl -fsSL https://github.com/mikecybersec/SOC-Compass/raw/main/install/install.sh | bash

**Windows (PowerShell)**

Run the installer script::

    iwr https://github.com/mikecybersec/SOC-Compass/raw/main/install/install.ps1 | iex

-----------------
Accessing SOC Compass
-----------------

Once the installation completes, SOC Compass will be available at::

    http://localhost:3000

The backend API will be available at::

    http://localhost:3001/api/v1

-----------------
Stopping and Restarting
-----------------

To stop SOC Compass::

    docker compose down

To start it again::

    docker compose up -d

-----------------
Upgrading SOC Compass
-----------------

To upgrade to the latest version::

    docker compose pull
    docker compose up -d

-----------------
Local Development (Advanced)
-----------------

If you want to develop or modify SOC Compass locally, you can still run the
application from source using Docker Compose.

Clone the repository and start the development stack::

    git clone https://github.com/mikecybersec/SOC-Compass.git
    cd SOC-Compass/soc-improvement-app
    cp env.example .env
    # Optionally edit .env and set a secure DB_PASSWORD
    docker compose up --build

This mode is intended for contributors and development use only.
