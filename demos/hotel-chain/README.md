# RaasPass — Navratri Pass Booking WebMCP Demo

Local demo: `http://localhost:5173/` after running `npm run dev`.

A festive Gujarat pass-booking experience designed to showcase the power of **WebMCP** (Web Model Context Protocol). This demo illustrates how AI agents can interact with a modern web application through both imperative and declarative tools.

## 🌟 Overview

RaasPass helps people find the music, movement, and midnight magic of Gujarat's Navratri. The application features:

- **Venue Discovery**: Find garba and dandiya venues across Ahmedabad, Vadodara, Surat, and Rajkot.
- **Pass Filtering**: Filter by price and festival perks such as dining, live music, family zones, and free parking.
- **Venue Details**: Explore the night schedule, entry policy, and pass inclusions.
- **Pass Checkout**: Complete a mocked booking flow that supports AI-driven form automation.

## 🤖 WebMCP Integration

This application exposes several tools to the `document.modelContext` API, allowing an AI agent (like a sidepanel assistant) to navigate and perform actions on behalf of the user.

### Imperative Tools

These tools are registered via `document.modelContext.registerTool`:

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `search_location` | Navigate to Navratri pass results for a Gujarat city or venue. | `query` (string) |
| `lookup_amenity` | Deep-link to a venue's detail page and highlight a pass perk or policy. | `hotel_id` (string), `amenity` (string) |
| `view_hotel` | Navigate directly to a Navratri venue by name or ID. | `hotel_name_or_id` (string) |
| `filter_search_results` | Apply price and festival-perk filters to the venue results. | `max_price` (number), `amenities` (string[]) |
| `reset_filters` | Remove all pass filters and show all venues for the current city. | (none) |
| `get_hotel_search_results` | Retrieve venues matching the current city and pass filters. | (none) |
| `start_booking` | Initiate pass checkout for the currently viewed venue. | (none) |

### Declarative Tools

The final confirmation step uses a **Declarative Tool**, where the agent can populate and submit a form automatically.

- **Tool Name**: `complete_booking`
- **Description**: Populates dancer information (First Name, Last Name, Email) and submits the pass booking form.
- **Implementation**: Uses standard HTML form attributes (`toolname`, `tooldescription`) which are automatically detected by WebMCP-enabled browsers.

## 🛠️ Performance & Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks + URL Search Params for shareable state.
- **Design System**: Custom premium palette featuring glassmorphism and Material Symbols.

## 🚀 Getting Started

For the complete presentation setup, inspector walkthrough, prompts, and troubleshooting, see [NAVRATRI_DEMO_GUIDE.md](./NAVRATRI_DEMO_GUIDE.md).

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Verify WebMCP**:
   Open the browser console and check `document.modelContext`. If you are using a WebMCP-enabled browser or extension, you can see the registered tools.

### Presentation prompt

> Find Navratri passes in Ahmedabad for October 10, 2026, open GMDC Ground, check whether dining is available, and start booking the pass.

---
*Note: This is a demo application for the WebMCP standard. All venue data and payment methods are mocked.*
