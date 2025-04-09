# Vana Data Access Application Demo

This project demonstrates how to build applications that leverage Vana's secure data access infrastructure. It showcases a practical implementation of querying user data through Vana's secure pipeline using the Compute Engine and Query Engine.

## Overview

This demo application shows how to:

1. Submit jobs to Vana's Compute Engine via blockchain transactions
2. Submit a SQL query to the Query Engine for structured data access
3. Process the query results within a secure TEE (Trusted Execution Environment)
4. Store and display the processed results in a user-friendly dashboard

The application fetches user profile data, processes it within Vana's secure compute infrastructure, and displays it in a social insights dashboard.

## Architecture

### Key Components

- **Cron Job (`app/api/cron/job-status/route.ts`)**: Periodically submits and monitors compute jobs to fetch the latest data
- **React Frontend**: Visualizes the data and provides navigation between different views
- **Zustand Store**: Manages application state and data fetching
- **Vercel Blob Storage**: Stores the processed results for efficient retrieval

### Data Flow

1. The cron job submits a transaction to the Compute Engine smart contract
2. Job details (including the SQL query and compute instruction ID) are sent to Vana's API server
3. The Query Engine executes the SQL query based on on-chain permissions and structured data (via `refinerId`)
4. The Compute Engine processes the query results inside a TEE using the specified compute instruction
5. Results are written to artifacts and stored in Vercel Blob storage
6. The frontend retrieves and displays the data

> ⚠️ Before submitting a job, the data must be refined and registered by a DLP, and the necessary permissions must be granted to your wallet through the Query Engine smart contract.

## Getting Started

```bash
# Install dependencies
npm install

# Set up your environment variables (see below)
cp .env.example .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Environment Variables

Create a `.env.local` file with the following variables:

```

APP_WALLET_PRIVATE_KEY=your_private_key
CRON_SECRET=your_cron_secret
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
COMPUTE_INSTRUCTION_ID=2
NEXT_PUBLIC_SOCIAL_STATS_BLOB_URL=your_blob_url

```

### About COMPUTE_INSTRUCTION_ID

The `COMPUTE_INSTRUCTION_ID` refers to the ID of your registered compute instruction on the Vana network. A compute instruction is a Docker image that defines how to process the results of a query. It must be:

1. Built and exported as a `.tar.gz` Docker image
2. Uploaded to a publicly accessible URL
3. Registered on-chain via the [ComputeInstructionRegistry contract](https://moksha.vanascan.io/address/0x5786B12b4c6Ba2bFAF0e77Ed30Bf6d32805563A5?tab=write_proxy#248e02a6)
4. Approved by DLPs whose data you are accessing (based on the associated `refinerId`)

> This demo uses a pre-approved compute instruction ([social-demo-compute-job](https://github.com/vana-com/social-demo-compute-job)) with ID `2`, which is approved for a specific refiner ID and processes user profile data.

## Adapting for Your Own Application

To use this demo as a starting point for your own application:

1. **Set up your wallet**: Generate a wallet with sufficient funds on the Moksha testnet
2. **Negotiate permissions with a DLP**: Ensure your wallet address has been granted permission to access the desired schema/table/column via the `addPermission` transaction on the `QueryEngine` contract
3. **Modify the SQL query**: Update the query in `app/api/cron/job-status/route.ts` to match your data needs
4. **Build and register your own compute instruction**: Follow the steps in the [Vana Compute Job Template](https://github.com/vana-com/vana-compute-job-template-py/) and register the instruction on-chain
5. **Update your data transformations**: Modify the compute job logic to suit your application's requirements
6. **Customize the UI**: Modify components in the `app/views` directory to match your use case

## Key Files to Study

- `app/api/cron/job-status/route.ts`: Contains the complete workflow for submitting and monitoring compute jobs
- `app/store/store.ts`: Manages application state and data fetching
- `app/views/`: Contains the visualization components for different data views

## Vana Network Contracts (Moksha & Mainnet)

The following contract addresses are the same on both Moksha testnet and Mainnet:

- DataRefinerRegistry: `0x93c3EF89369fDcf08Be159D9DeF0F18AB6Be008c`
- QueryEngine: `0xd25Eb66EA2452cf3238A2eC6C1FD1B7F5B320490`
- ComputeInstructionRegistry: `0x5786B12b4c6Ba2bFAF0e77Ed30Bf6d32805563A5`
- ComputeEngine: `0xb2BFe33FA420c45F1Cf1287542ad81ae935447bd`

> 💡 You can explore transactions and contracts on the [Moksha Explorer](https://moksha.vanascan.io/)

## Learn More

For more details on how to interact with Vana's data infrastructure, check out:

- [Vana Data Refinement Template](https://github.com/vana-com/vana-data-refinement-template)
- [Vana Compute Job Template](https://github.com/vana-com/vana-compute-job-template-py/)
- [Vana Refinement Service](https://github.com/vana-com/vana-refinement-service)
