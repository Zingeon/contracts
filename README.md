# Dapp contracts integration

The project integrates IoTeX mainnet chain tracking API that returns transactions count and UAW count for the given dApp smart contracts.

## Prerequisites

Before running the project, ensure you have the following installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/Zingeon/contracts .

2. Navigate to the directory:

   ```shell
   cd ./contracts

2. Run docker-compose:

   ```shell
   docker-compose up --build


## Using

Go to http://0.0.0.0:8000/contracts?contracts={smart_contract_address}
For example, http://0.0.0.0:8000/contracts?contracts=0x95cB18889B968AbABb9104f30aF5b310bD007Fd8