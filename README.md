# MYR2USDT — Real-time MYR to USDT Converter

This project provides a real-time comparison of cryptocurrency exchange rates between Malaysian Ringgit (MYR) based platforms and USDT-based platforms, with additional reference rates from external sources. It's designed to help users quickly assess potential arbitrage opportunities or simply monitor market rates.

## ⚠️ Disclaimer

This application is provided for **informational purposes only** and should not be considered financial, investment, or trading advice. The accuracy and real-time nature of the displayed exchange rates are entirely dependent on the reliability and availability of the external API sources (e.g., Luno, Binance, CoinGecko, BNM). Cryptocurrency markets are highly volatile, and actual transaction prices may vary significantly due to market fluctuations, liquidity, network congestion, exchange fees, and other unforeseen factors.

The developer of this project hold no responsibility for the accuracy, completeness, or timeliness of the data presented, nor for any financial decisions, transactions, or losses incurred by users based on the information provided by this application. Users are strongly advised to conduct their own thorough research, verify all rates directly on the respective platforms, and consult with a qualified financial professional before engaging in any cryptocurrency transactions. Your use of this application is at your own sole risk.

## 🌟 Features

-   **Real-time Exchange Rate Comparison**: Instantly compare exchange rates for selected cryptocurrency assets (e.g., XRP) between Malaysian Ringgit (MYR) based platforms (e.g., Luno, Hata) and USDT-based platforms (e.g., Binance, Huobi).

-   **Dynamic Price Updates**: Automatically fetches and updates exchange rates, providing the latest market information.
-   **Rate Change Visualization**: Visual cues (green/red pulse animations) to highlight upward or downward movements in exchange rates.
-   **External Rate Comparison**: Displays percentage differences between the calculated exchange rate and external reference rates from CoinGecko, Coinbase, and BNM.
-   **Detailed Market Information**: Access comprehensive details for each platform, including bid/ask prices, 24-hour volume, and timestamp of the last update.
-   **User-Friendly Interface**: Intuitive dropdowns for selecting source platform, target platform, and crypto asset.

## 🛠️ Technology Stack

This project is built with a modern web development stack, leveraging the following technologies:

-   **Framework**: [Next.js](https://nextjs.org/) (v15.5.4) - A React framework for building full-stack web applications.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) (v5) - A typed superset of JavaScript that compiles to plain JavaScript.
-   **Styling**:
    -   [Tailwind CSS](https://tailwindcss.com/) (v4.1.14) - A utility-first CSS framework for rapidly building custom designs.
    -   [PostCSS](https://postcss.org/) (v8.5.6) - A tool for transforming CSS with JavaScript.
-   **UI Components**:
    -   [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
    -   [Radix UI](https://www.radix-ui.com/) - Low-level UI components for building accessible design systems.
-   **Icons**: [Lucide React](https://lucide.dev/) (v0.545.0) - A collection of beautiful and customizable SVG icons.
-   **State Management/Utilities**:
    -   `@number-flow/react` (v0.5.10)
    -   `class-variance-authority` (v0.7.1)
    -   `clsx` (v2.1.1)
    -   `sonner` (v2.0.7) - An opinionated toast component for React.
    -   `tailwind-merge` (v3.3.1)
    -   `tw-animate-css` (v1.4.0)
-   **Development Tools**:
    -   [ESLint](https://eslint.org/) (v9) - Pluggable JavaScript linter.
    -   [Turbopack](https://turbo.build/pack) - Next.js's optimized Rust-powered engine for faster builds.

## ⚙️ Installation and Setup

Follow these steps to get the project up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: (LTS version recommended, e.g., v18.x or v20.x)
    -   You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** or **Yarn** or **pnpm**: A package manager for JavaScript. npm is installed with Node.js.
    -   To install Yarn: `npm install -g yarn`
    -   To install pnpm: `npm install -g pnpm`

### Getting Started

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/nicholaslhq/myr2usdt.git
    cd myr2usdt
    ```

2.  **Install dependencies**:

    Using npm:

    ```bash
    npm install
    ```

    Using Yarn:

    ```bash
    yarn install
    ```

    Using pnpm:

    ```bash
    pnpm install
    ```

3.  **Run the development server**:

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

    The application will automatically reload as you edit the files.

### Build and Deploy (Optional)

To build the project for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This command optimizes your application for production, creating an `.next` folder with the compiled output.

To start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

This will serve the optimized build of your application.

## 🔍 Troubleshooting

Here are some common issues you might encounter and how to resolve them:

### Common Issues

-   **API Rate Limits**:
    -   **Issue**: You might encounter errors related to API rate limits from external exchanges (Binance, Huobi, etc.) if you make too many requests in a short period.
    -   **Solution**: Wait for a few minutes before trying again. For development, consider adding delays between requests or caching responses if you're frequently hitting the same endpoints.
-   **Network Errors**:
    -   **Issue**: The application fails to fetch data, displaying "Oops! Something went wrong" due to network connectivity problems or issues with external API servers.
    -   **Solution**:
        1.  Check your internet connection.
        2.  Verify if the external exchange APIs (Luno, Binance, etc.) are operational by visiting their status pages.
        3.  Try refreshing the page or clicking the refresh button.
-   **Incorrect Crypto Asset/Platform Selection**:
    -   **Issue**: The application might not display data or show an error if an unsupported crypto asset or platform combination is selected.
    -   **Solution**: Ensure you select valid combinations of source platform, target platform, and crypto asset that are supported by the respective APIs. Refer to the API documentation for supported pairs.
-   **`npm install` or `yarn install` failures**:
    -   **Issue**: Dependencies fail to install, often due to Node.js version incompatibility or corrupted `node_modules`.
    -   **Solution**:
        1.  Ensure your Node.js version meets the project's requirements (check `package.json` or `nvm use` if you use Node Version Manager).
        2.  Try clearing the cache and reinstalling:
            ```bash
            npm cache clean --force
            rm -rf node_modules
            npm install
            ```
            or for Yarn:
            ```bash
            yarn cache clean
            rm -rf node_modules
            yarn install
            ```

### For Additional Help

If you encounter issues not covered here, please consider:

-   **Checking the project's GitHub Issues**: Look for similar problems or open a new issue with detailed information.
-   **Consulting the documentation**: Refer to the official documentation for [Next.js](https://nextjs.org/docs), [React](https://react.dev/docs), and other libraries used.
-   **Contacting the developer**: Reach out to the project maintainer for direct assistance.

## 📄 License

This project is licensed under the [MIT License](LICENSE)

## 👤 Credits

-   **Developer**: [Nicholas Lee](https://github.com/nicholaslhq)
-   **Data Sources**:
    -   [Luno](https://www.luno.com/)
    -   [Binance](https://www.binance.com/)
    -   [Huobi](https://www.huobi.com/)
    -   [Hata](https://hata.io/)
    -   [CoinGecko](https://www.coingecko.com/)
    -   [Coinbase](https://www.coinbase.com/)
    -   [Bank Negara Malaysia (BNM)](https://www.bnm.gov.my/)
