# Product Requirements Document: SuiCare

## 1. Introduction

SuiCare is a decentralized application (dApp) built on the Sui blockchain designed to revolutionize charitable giving. It provides a transparent, efficient, and user-friendly platform for donating directly to verified causes and victims. By leveraging the power of zkLogin for seamless onboarding and a gasless transaction model, SuiCare removes common barriers to entry in the Web3 space, making it easy for anyone to make a direct impact.

The core problem SuiCare addresses is the lack of transparency and high overhead costs in traditional charitable organizations. Donors are often left wondering how much of their contribution reaches the intended recipient. SuiCare solves this by creating a direct, peer-to-peer connection between donors and verified campaign recipients, with all transactions publicly auditable on the Sui blockchain.

## 2. Goals and Objectives

*   **Foster Trust and Transparency**: Provide a fully transparent donation process where donors can see the direct impact of their contributions in real-time.
*   **Enhance User Experience**: Simplify the crypto donation process through gasless transactions and easy onboarding with existing social accounts (zkLogin).
*   **Ensure Legitimacy**: Guarantee that donations are directed only to verified campaigns and individuals through a robust NGO/Admin verification system.
*   **Empower Donors**: Give donors a clear and immediate sense of impact through a live activity feed and unique proof-of-donation receipts.
*   **Provide Administrative Control**: Allow authorized administrators (NGOs) to easily create, manage, and update fundraising campaigns.

## 3. Target Audience

*   **Donors**: Individuals who are digitally savvy, value transparency, and want to ensure their contributions have a maximum impact. They may be new to cryptocurrency and require a simple, intuitive user experience.
*   **NGOs/Administrators**: Verified non-governmental organizations or trusted entities responsible for creating and managing campaigns. They need a simple interface to list causes and manage recipient information.
*   **Victims/Recipients**: The end-beneficiaries of the campaigns who need a straightforward way to claim and access the funds donated to them.

## 4. Core Features

### 4.1. User Onboarding (zkLogin)
-   **Description**: Users can create a Sui wallet and log into the platform using their existing Google accounts. This eliminates the need for complex seed phrases or browser extensions for new users.
-   **User Story**: As a new donor, I want to sign in with my Google account so I can start donating quickly without having to learn how to set up a traditional crypto wallet.

### 4.2. Gasless Donations
-   **Description**: A backend "Gas Station" will sponsor all transaction fees on behalf of the user. This means donors do not need to hold SUI tokens for gas, making the donation process free and frictionless.
-   **User Story**: As a donor, I want to donate the full amount I intend to give without worrying about extra transaction fees, ensuring 100% of my donation goes to the cause.

### 4.3. Verified Campaign Registry & Admin Role
-   **Description**: Only authorized administrators (NGOs) can create, edit, or delete campaigns. A specific wallet address is designated as the "Admin" address. When this user connects their wallet, they gain access to management controls on the campaign cards.
-   **User Story**: As an administrator, I want to be the only one who can create and manage campaigns to prevent fraud and ensure all listed causes are legitimate.
-   **User Story**: As a donor, I want to be confident that all campaigns I see are verified by a trusted organization.

### 4.4. Campaign Management (CRUD)
-   **Description**: The designated admin has the ability to Create, Read, Update, and Delete (CRUD) campaigns. This includes setting the campaign title, description, funding goal, and the recipient's Sui wallet address.
-   **User Story**: As an administrator, I want to easily add new campaigns, update their details if information changes, and remove them once they are complete or no longer active.

### 4.5. Real-time Impact Feed
-   **Description**: A live ticker on the homepage displays all donations as they happen. This provides immediate, gratifying feedback to donors and creates a sense of collective impact and community momentum.
-   **User Story**: As a user, I want to see a live feed of recent donations to feel a sense of community and see the platform's activity in real-time.

### 4.6. Anti-Spam Gate
-   **Description**: A minimum donation threshold (e.g., 0.01 SUI) is enforced to prevent spamming of the network and abuse of the gas sponsorship system.
-   **User Story**: As a platform operator, I want to prevent bad actors from submitting micro-transactions that could congest the system or drain the gas station funds.

### 4.7. Impact Receipts (Future Feature)
-   **Description**: Upon a successful donation, a non-transferable NFT is automatically minted to the donor's wallet. This NFT serves as a permanent, on-chain proof of their contribution and impact.
-   **User Story**: As a donor, I want to receive a unique digital receipt (NFT) to commemorate my donation and have a permanent record of my support.

## 5. Design and Style Guidelines

-   **Primary Color**: Light green (`#B2FF59`)
-   **Background Color**: Very light green (`#F0FFF0`)
-   **Accent Color**: Yellow-green (`#BFFF57`)
-   **Font**: 'Inter' for all body and headline text.
-   **Icons**: Minimalist, clean, and easily understandable `lucide-react` icons.
-   **Overall Feel**: Mobile-first, clean, modern, and trustworthy. The design should prioritize clarity and ease of use, with a spacious layout and intuitive navigation.

## 6. Technical Stack

-   **Framework**: Next.js
-   **Blockchain**: Sui
-   **Wallet Integration**: `@mysten/dapp-kit` with zkLogin
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI
-   **State Management**: React Context with Local Storage persistence
-   **AI (Future)**: Genkit for potential AI-powered features.

## 7. Non-Functional Requirements

-   **Performance**: The app must be fast and responsive, with initial page loads under 2 seconds. Blockchain interactions should provide clear loading states.
-   **Security**: Admin controls must be strictly gated to the designated admin wallet. All smart contracts (future) must be audited.
-   **Usability**: The user flow, especially for new-to-crypto users, must be exceptionally simple and intuitive.
-   **Responsiveness**: The application must be fully functional and aesthetically pleasing on all devices, from mobile phones to desktop monitors.

## 8. Future Enhancements

-   Implementation of on-chain smart contracts to manage campaign logic and fund distribution.
-   A dedicated dashboard for NGOs to track the performance of their campaigns.
-   Detailed donation history for users.
-   Implementation of Donation Claim Links for victims without wallets.
-   Integration of Genkit for AI features, such as generating campaign descriptions or suggesting causes.
