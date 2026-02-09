# SuiCare Project Documentation

## 1. Overview & Vision

SuiCare is a decentralized application (dApp) built on the Sui blockchain designed to revolutionize charitable giving. It provides a transparent, efficient, and user-friendly platform for donating directly to verified causes and victims. By leveraging the power of zkLogin for seamless onboarding and a gasless transaction model, SuiCare removes common barriers to entry in the Web3 space, making it easy for anyone to make a direct impact.

The core problem SuiCare addresses is the lack of transparency and high overhead costs in traditional charitable organizations. Donors are often left wondering how much of their contribution reaches the intended recipient. SuiCare solves this by creating a direct, peer-to-peer connection between donors and verified campaign recipients, with all transactions publicly auditable on the Sui blockchain.

## 2. Goals and Objectives

*   **Foster Trust and Transparency**: Provide a fully transparent donation process where donors can see the direct impact of their contributions in real-time.
*   **Enhance User Experience**: Simplify the crypto donation process through gasless transactions and easy onboarding with existing social accounts (zkLogin).
*   **Ensure Legitimacy**: Guarantee that donations are directed only to verified campaigns and individuals through a robust NGO/Admin verification system.
*   **Empower Donors**: Give donors a clear and immediate sense of impact through a live activity feed.
*   **Provide Administrative Control**: Allow authorized administrators (NGOs) to easily create, manage, and update fundraising campaigns.

## 3. Target Audience

*   **Donors**: Individuals who are digitally savvy, value transparency, and want to ensure their contributions have a maximum impact. They may be new to cryptocurrency and require a simple, intuitive user experience.
*   **NGOs/Administrators**: Verified non-governmental organizations or trusted entities responsible for creating and managing campaigns. They need a simple interface to list causes and manage recipient information.
*   **Victims/Recipients**: The end-beneficiaries of the campaigns who need a straightforward way to claim and access the funds donated to them.

## 4. Core Features

### 4.1. User Onboarding (zkLogin)
-   **Description**: Users can create a Sui wallet and log into the platform using their existing Google accounts via the integrated dapp-kit. This eliminates the need for complex seed phrases or browser extensions for new users.
-   **User Story**: As a new donor, I want to sign in with my Google account so I can start donating quickly without having to learn how to set up a traditional crypto wallet.

### 4.2. Gasless Donations (Conceptual)
-   **Description**: The application is designed with the concept of a backend "Gas Station" that would sponsor all transaction fees on behalf of the user. This means donors do not need to hold SUI tokens for gas, making the donation process free and frictionless. The "Gasless Mode" indicator in the UI represents this feature.
-   **User Story**: As a donor, I want to donate the full amount I intend to give without worrying about extra transaction fees, ensuring 100% of my donation goes to the cause.

### 4.3. Verified Campaign Registry & Admin Role
-   **Description**: Only an authorized administrator can create, edit, or delete campaigns. A specific wallet address (`0x71859530b57c519ab3de63d7d0fd10eb16cb651fc554a2a337ce199361625ac6`) is designated as the "Admin" address. When this user connects their wallet, they gain access to management controls on the campaign cards.
-   **User Story**: As an administrator, I want to be the only one who can create and manage campaigns to prevent fraud and ensure all listed causes are legitimate.
-   **User Story**: As a donor, I want to be confident that all campaigns I see are verified by a trusted organization.

### 4.4. Campaign Management (CRUD)
-   **Description**: The designated admin has the ability to Create, Read, Update, and Delete (CRUD) campaigns. This includes setting the campaign title, description, funding goal, and the recipient's Sui wallet address.
-   **User Story**: As an administrator, I want to easily add new campaigns, update their details if information changes, and remove them once they are complete or no longer active.

### 4.5. Real-time Impact Feed
-   **Description**: A live ticker on the homepage displays simulated donations as they happen. This provides immediate, gratifying feedback to donors and creates a sense of collective impact and community momentum. In a production environment, this would be driven by on-chain events.
-   **User Story**: As a user, I want to see a live feed of recent donations to feel a sense of community and see the platform's activity in real-time.

### 4.6. Anti-Spam Gate
-   **Description**: A minimum donation threshold (0.01 SUI) is enforced to prevent spamming of the network and potential abuse of the gas sponsorship system.
-   **User Story**: As a platform operator, I want to prevent bad actors from submitting micro-transactions that could congest the system or drain the gas station funds.

## 5. Technical Stack

-   **Framework**: Next.js 15.5.9
-   **Blockchain**: Sui
-   **Wallet Integration**: `@mysten/dapp-kit` with zkLogin
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI
-   **Form Management**: React Hook Form
-   **State Management**: React Context with Local Storage persistence
-   **Data Fetching**: TanStack Query
-   **AI**: Genkit (for potential future features)

## 6. Project Structure

The project follows a standard Next.js App Router structure.

-   `src/app/`: Contains the main application pages and layouts.
    -   `layout.tsx`: The root layout for the entire application. It sets up fonts and providers.
    -   `page.tsx`: The homepage, which displays the hero section and the list of campaigns.
    -   `create-campaign/page.tsx`: The page for the admin to create a new campaign.
    -   `edit-campaign/[id]/page.tsx`: The page for the admin to edit an existing campaign.
    -   `globals.css`: The global stylesheet, including Tailwind CSS directives and Shadcn UI theme variables.
-   `src/components/`: A collection of reusable React components.
    -   `ui/`: Contains the UI components from the Shadcn UI library.
    -   `layout/`: Components used for the overall page structure, like `header.tsx` and `footer.tsx`.
    -   `campaign-card.tsx`: Displays a single campaign, including admin controls.
    -   `donation-drawer.tsx`: The slide-out panel used for making donations.
    -   `impact-feed.tsx`: The live activity feed component.
    -   `app-providers.tsx`: Wraps the application with all necessary context providers (TanStack Query, SuiClientProvider, WalletProvider, CampaignProvider).
-   `src/context/`: Manages the application's global state.
    -   `campaign-context.tsx`: The heart of the application's local state. It manages the list of campaigns, handling creation, updates, and deletion. It also persists the campaign data to the browser's Local Storage.
-   `src/hooks/`: Includes custom React hooks for shared logic.
    -   `use-toast.ts`: A custom hook for displaying toast notifications.
-   `src/lib/`: Utility functions and libraries.
    -   `utils.ts`: Contains helper functions, like `cn` for merging Tailwind classes.
-   `src/ai/`: Contains files related to generative AI features using Genkit.
    -   `genkit.ts`: Genkit configuration file.
    -   `dev.ts`: Genkit development server entrypoint.
-   `docs/`: Contains project documentation.
    -   `PRD.md`: The Product Requirements Document.
-   `package.json`: Lists all project dependencies and scripts.
-   `next.config.ts`: The configuration file for Next.js.
-   `tailwind.config.ts`: The configuration file for Tailwind CSS.

## 7. Getting Started

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

3.  **(Optional) Start the Genkit AI server**:
    ```bash
    npm run genkit:dev
    ```

## 8. Style Guidelines

-   **Primary Color**: Teal (`#14B8A6`)
-   **Background Color**: Light Gray/White
-   **Font**: 'Inter' for all body and headline text.
-   **Icons**: `lucide-react` for minimalist, clean, and easily understandable icons.
-   **Overall Feel**: Mobile-first, clean, modern, and trustworthy. The design prioritizes clarity and ease of use, with a spacious layout and intuitive navigation.
