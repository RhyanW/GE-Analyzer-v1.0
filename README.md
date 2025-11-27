# OSRS Grand Exchange Analyzer 📉💰

A powerful, modern web application for identifying profitable flipping and high alchemy opportunities in Old School RuneScape. Built with React, TypeScript, and Tailwind CSS.

![OSRS GE Flipper](https://oldschool.runescape.wiki/images/Grand_Exchange_logo.png)

## ✨ Features

-   **Real-Time Market Analysis**: Fetches live data from the OSRS Wiki API.
-   **Smart Flipping Logic**:
    -   Calculates profit margins after GE tax.
    -   Analyzes 24h volume and buy limits.
    -   Determines price trends (UP/DOWN/STABLE).
    -   Filters by budget, ROI, and risk level.
-   **High Alchemy Mode**: Dedicated mode to find profitable alch items.
-   **Budget Awareness**: Profit calculations are capped by your available capital.
-   **Modern UI**: Sleek, dark-themed interface inspired by modern gaming dashboards.
-   **Mobile Responsive**: Fully functional on desktop and mobile devices.
-   **No API Key Required**: Runs entirely client-side using public APIs.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/grand-exchange-analyzer.git
    cd grand-exchange-analyzer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:3000`.

## 🛠️ Deployment

This application is designed to be hosted as a static site. It comes pre-configured for **GitHub Pages**.

### Deploying to GitHub Pages

1.  Push your code to a GitHub repository.
2.  Go to **Settings** > **Pages**.
3.  Under **Build and deployment**, select **GitHub Actions** as the source.
4.  The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy your site on every push to the `main` branch.

## 🧰 Tech Stack

-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Data Source**: [OSRS Wiki Real-time Prices API](https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Note: This application is not affiliated with Jagex or Old School RuneScape.*
