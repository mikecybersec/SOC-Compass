Getting Started
===============

Welcome to the SOC Compass documentation! Getting started is easy.

You can now run SOC Compass using **Docker** (recommended), which bundles the
frontend, backend API, and PostgreSQL database together. For local development
without Docker, you can still use npm.

-----------------
Installing & Running SOC Compass with Docker (Recommended)
-----------------

Clone the repository and start the Docker stack::

    git clone https://github.com/soc-compass/soc-compass.git
    cd soc-compass/soc-improvement-app
    cp env.example .env
    # Optionally edit .env and set a secure DB_PASSWORD
    docker compose up --build

Once the services are running, visit::

    http://localhost:3000

The backend API will be available at::

    http://localhost:3001/api/v1

To stop the stack gracefully, from the same directory run::

    docker compose down

To start it again in the background::

    docker compose up -d