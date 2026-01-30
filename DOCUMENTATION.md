# SuiCare Project Documentation

## Overview

SuiCare is a decentralized application (dApp) built on the Sui blockchain that facilitates transparent and efficient donations to verified victims. The platform leverages zkLogin for seamless user onboarding, a gasless transaction model to enhance user experience, and a verified victim registry to ensure the secure and accurate distribution of funds.

## Core Features

- **zkLogin Integration**: Simplifies user onboarding and wallet creation by enabling users to sign in with their Google accounts through Slush Wallet.
- **Gasless Donations**: A backend "Gas Station" sponsors user transactions, eliminating the need for users to pay gas fees.
- **Verified Victim Registry**: An on-chain registry where NGOs can verify victim addresses, ensuring donations are sent to legitimate recipients.
- **Donation Claim Links**: NGOs can send donation "Claim Links" via SMS/WhatsApp, allowing victims to easily access their funds.
- **Real-time Impact Feed**: A live ticker displays real-time donations using on-chain events, providing transparency and immediate feedback.
- **Anti-Spam Gate**: A minimum donation threshold is enforced to prevent spam and abuse of the gas sponsorship system.
- **Impact Receipts**: Donors receive a non-transferable NFT as proof of their donation and impact.

## Technical Stack

- **Framework**: Next.js 15.5.9
- **Blockchain**: Sui
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Management**: React Hook Form
- **Data Fetching**: TanStack Query
- **AI**: Genkit

## Project Structure

- `src/app/`: Contains the main application pages, including the home page (`page.tsx`), layout (`layout.tsx`), and pages for creating (`create-campaign/page.tsx`) and editing (`edit-campaign/[id]/page.tsx`) campaigns.
- `src/components/`: A collection of reusable React components, such as `campaign-card.tsx`, `donation-drawer.tsx`, and `impact-feed.tsx`, as well as UI elements from Shadcn UI.
- `src/context/`: Manages the application's global state, including the `campaign-context.tsx`, which handles campaign-related data.
- `src/hooks/`: Includes custom hooks that provide specific functionality, such as `use-mobile.tsx` for detecting mobile devices and `use-toast.ts` for displaying notifications.
- `src/lib/`: A set of utility functions and libraries, including `utils.ts` for general-purpose functions and `placeholder-images.ts` for managing placeholder images.
- `src/ai/`: Implements the AI-powered features of the application, with `genkit.ts` for Genkit integration and `dev.ts` for development-related AI tasks.
- `docs/`: Contains project documentation, including the `blueprint.md` file, which outlines the project's core features and style guidelines.

## Getting Started

To run the project locally, follow these steps:

1. **Install dependencies**: `npm install`
2. **Run the development server**: `npm run dev`
3. **Start the Genkit AI server**: `npm run genkit:dev`

## Style Guidelines

- **Primary Color**: Light green (#B2FF59)
- **Background Color**: Very light green (#F0FFF0)
- **Accent Color**: Yellow-green (#BFFF57)
- **Font**: Inter
- **Icons**: Minimalist and clear
- **Design**: Mobile-first with a clean and spacious layout
