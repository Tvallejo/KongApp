# Implementation Plan - KONG Web App

**Goal:** Build a FastAPI + React application to manage KONG token data.

## Backend Structure
- `endpoint /fetch`: Returns raw data from Etherscan.
- `endpoint /transform`: Processes data and returns a JSON preview.
- `endpoint /export`: Saves Excel and returns status.
- `endpoint /upload`: Uploads to GSheets and returns status.

## Frontend Structure
- Layout with Sidebar and Main Content.
- Action Panel with 4 buttons.
- Preview Table for the dynamic data.
- Success/Error notifications (Toasts).

## Tech Stack
- **Backend:** FastAPI, Pandas, gspread, uvicorn.
- **Frontend:** React, Vite, Tailwind CSS, Axios.
