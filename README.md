# UniZy - The Student Super App MVP

Welcome to the **UniZy MVP** repository! UniZy is a comprehensive, multi-service platform designed specifically for university students, simplifying campus life by offering everything from housing and transportation to food delivery and administrative services in one cohesive, premium application.

This repository contains the source code for the Minimum Viable Product (MVP), structured around distinct user roles: Students, Drivers, Housing Providers (Landlords), Merchants (Restaurants/Stores), and Super Admins.

---

## 🚀 Features by Modules

The application has been built across 7 iterative phases, establishing the "Demand Side" (Students/Admins) and the "Supply Side" (Providers).

### 1. Core Student App (The "Demand Side")
*   **Premium Landing Page:** A high-conversion public entry point with animated service blocks.
*   **Student Hub:** A centralized "Service Menu" dashboard where students select their primary need (Housing, Transport, Delivery). Includes quick actions and rewards tracking.
*   **Housing Module:** A browsable feed of student housing options with "Verified" badges and detailed property pages (amenities, galleries, landlord info).
*   **Transport Module:** A ride-booking interface with vehicle selection and route visualization.
*   **Delivery Module:** A campus food and product marketplace with vendor categorizations.

### 2. Provider Portals (The "Supply Side")
*   **Driver Dashboard (`/driver`):** A mobile-first hub for drivers featuring a live Online/Offline status toggle, earnings tracking, and job request feeds.
*   **Housing Provider Console (`/provider`):** A management dashboard for landlords to track property views and manage incoming student leads with direct contact actions.
*   **Merchant Dashboard (`/merchant`):** A Kanban-style live order management board for restaurants, complete with quick menu availability toggles.

### 3. Admin Panel
*   **Overview Dashboard:** High-level metric cards (users, revenue, orders) and activity streams.
*   **Housing Moderation:** Data tables for approving/rejecting listed properties.
*   **Verification Center:** A highly efficient dual-pane work queue designed for rapid approval of Student IDs and Landlord Deeds.

### 4. Smart Authentication & Routing
*   **Role-Based Redirection:** The `/login` flow automatically detects user roles and routes them to their specialized hubs (Student, Admin, Driver, Landlord, Merchant).

### 5. Localization & Personalization
*   **Bilingual System (i18n):** Full support for English and Egyptian Arabic, managed via a custom global context.
*   **RTL/LTR Engine:** Dynamic layout flipping based on the selected language.
*   **Dark/Light Mode:** Seamless theme switching with a custom `--color-unizy-navy` color scheme applied universally.

---

## 🛠 Tech Stack

Our stack is chosen for performance, developer experience, and rapid scalability.

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **UI Library:** [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS (for custom glassmorphism and animations)
*   **Database:** SQLite (Development)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Theming:** `next-themes`
*   **Icons & Assets:** Custom UI components + SVG icons

---

## 📂 Project Structure

The project utilizes Next.js Route Groups to keep distinct sections of the app cleanly separated:

```text
src/
├── app/
│   ├── (public)/      # Landing page and open routes
│   ├── (auth)/        # Login and registration flows
│   ├── (student)/     # The core student-facing Super App services
│   ├── (admin)/       # The secure administrative control panel
│   ├── (driver)/      # Tools for transport operators
│   ├── (provider)/    # Tools for real estate landlords
│   └── (merchant)/    # Tools for campus restaurants & stores
├── components/        # Reusable UI elements (Navigation, Theme Controls)
├── i18n/              # Language dictionaries (en.js, ar.js) and Provider
└── prisma/            # Database schema and seed scripts
```

---

## 💻 Running Locally

To get the UniZy MVP running on your local machine, follow these steps:

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/3mrhr/UniZy-App.git
    cd UniZy-App
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup the Database:**
    The project uses SQLite for local development. We included a schema and seed data.
    ```bash
    # Generate Prisma Client
    npx prisma generate
    
    # Push the schema to create dev.db
    npx prisma db push
    
    # (Optional) Seed the database with mock users and listings
    npm run prisma:seed
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Access the Application:**
    Open your browser and navigate to `http://localhost:3000`.

### Testing User Roles
You can test the different portals by navigating to `/login` and using these mock usernames (passwords can be anything for testing purposes right now):
*   **superadmin** -> Admin Panel
*   **driver** -> Driver Hub
*   **landlord** -> Housing Provider Console
*   **merchant** -> Merchant Dashboard
*   **[Any other name]** -> Student Hub

---

## 📅 Roadmap (Next Phases)

*   **Phase 8: Backend API Wiring** - Connecting the Prisma SQLite queries directly to the React Server Components replacing all mock state variables.
*   **Phase 9: Real-Time Services** - Websockets or polling for live driver tracking and immediate order updates.
*   **Phase 10: Production Deployment** - Migrating the SQLite database to PostgreSQL on Vercel or Railway.

---

*Built with passion for simplifying the student experience.* 🎓
