# SuiCare - Transparent Donations on Sui

SuiCare is a decentralized application (dApp) prototype built on the Sui blockchain that facilitates transparent and efficient donations to verified victims. The platform leverages zkLogin for seamless user onboarding and a gasless transaction model to enhance user experience.

This project was built to demonstrate key concepts of dApp development on the Sui network within a modern Next.js environment.

**For detailed information about the project's architecture, features, and technical implementation, please see the [full documentation](DOCUMENTATION.md).**

## Core Features

-   **zkLogin Integration**: Sign in with Google.
-   **Gasless Donations**: A conceptual "Gas Station" sponsors user transactions.
-   **Admin-Verified Campaigns**: Campaigns are managed by a designated admin wallet.
-   **Persistent State**: Campaigns are saved in the browser's local storage.
-   **Real-time Impact Feed**: A live ticker provides transparency on donation activity.
-   **AI-Powered Donation Suggestions**: Genkit and Gemini provide users with intelligent donation amount suggestions.

## Technical Stack

-   **Framework**: Next.js
-   **AI**: Genkit & Google Gemini
-   **Blockchain**: Sui
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI
-   **State Management**: React Context & Local Storage

## Getting Started

To run the project locally, follow these steps:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.
