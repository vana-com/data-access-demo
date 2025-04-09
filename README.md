# Vana Social Demo

This project demonstrates how to build applications that leverage Vana's distributed data layer and secure compute infrastructure. It showcases a practical implementation of querying user data through Vana's secure pipeline using the Compute Engine and Query Engine.

## Overview

This demo application shows how to:

1. Submit jobs to Vana's Compute Engine via blockchain transactions
2. Execute a SQL query against a Data Layer Provider's (DLP) structured data
3. Process the results in a secure TEE (Trusted Execution Environment)
4. Store and display the processed results in a user-friendly dashboard

The application fetches user profile data from a DLP, processes it within Vana's secure compute infrastructure, and displays it in a social insights dashboard.

## Architecture

### Key Components

- **Cron Job (`app/api/cron/job-status/route.ts`)**: Periodically submits and monitors compute jobs to fetch the latest data
- **React Frontend**: Visualizes the data and provides navigation between different views
- **Zustand Store**: Manages application state and data fetching
- **Vercel Blob Storage**: Stores the processed results for efficient retrieval

### Data Flow

1. The cron job submits a transaction to the Compute Engine smart contract
2. Job details (including the SQL query) are sent to Vana's API server
3. The job is executed in a secure TEE that can access encrypted DLP data
4. Results are fetched, processed, and stored in Vercel Blob storage
5. The frontend retrieves and displays the data

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
COMPUTE_INSTRUCTION_ID=15
NEXT_PUBLIC_SOCIAL_STATS_BLOB_URL=your_blob_url
```

## Adapting for Your Own Application

To use this demo as a starting point for your own application:

1. **Set up your wallet**: Generate a wallet with sufficient funds on the Moksha network
2. **Modify the SQL query**: Update the query in `app/api/cron/job-status/route.ts` to match your data needs
3. **Register your compute instruction**: Follow the steps in the Vana documentation to register your compute instruction
4. **Update your data transformations**: Modify the data processing logic to suit your application
5. **Customize the UI**: Modify the components in the `app/views` directory

## Key Files to Study

- `app/api/cron/job-status/route.ts`: Contains the complete workflow for submitting and monitoring compute jobs
- `app/store/store.ts`: Manages application state and data fetching
- `app/views/`: Contains the visualization components for different data views

## Vana Network Contracts (Moksha Testnet)

- DataRefinerRegistry: `0x93c3EF89369fDcf08Be159D9DeF0F18AB6Be008c`
- QueryEngine: `0xd25Eb66EA2452cf3238A2eC6C1FD1B7F5B320490`
- ComputeInstructionRegistry: `0x5786B12b4c6Ba2bFAF0e77Ed30Bf6d32805563A5`
- ComputeEngine: `0xb2BFe33FA420c45F1Cf1287542ad81ae935447bd`

## Learn More

For more details on how to interact with Vana's data infrastructure, check out:

- [Vana Data Refinement Template](https://github.com/vana-com/vana-data-refinement-template)
- [Vana Compute Job Template](https://github.com/vana-com/vana-compute-job-template-py/)
- [Vana Refinement Service](https://github.com/vana-com/vana-refinement-service)