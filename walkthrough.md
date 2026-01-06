# Walkthrough: KONG Data Web App

## 1. Overview
We have successfully refactored the `KongData.ipynb` notebook into a modern web application using a FastAPI backend and a React/Vite frontend.

## 2. Key Features
- **Stateless/Session Backend:** The backend preserves the original Pandas transformation logic but exposes it via REST endpoints.
- **Modern UI:** Built with Tailwind CSS, following a "Premium Dashboard" aesthetic.
- **Interactive Flow:**
    - **Fetch:** Connects to Etherscan.
    - **Process:** Runs the data cleaning logic and provides a live preview table.
    - **Sync:** Replaces the manual GSheets code with a one-click button.

## 3. Project Structure
```text
kong-web-app/
├── server/
│   ├── main.py            # FastAPI implementation
│   └── requirements.txt   # Backend dependencies
└── client/
    ├── src/
    │   ├── App.jsx        # Dashboard UI
    │   └── index.css      # Design System (Tailwind)
    ├── package.json
    └── tailwind.config.js
```

## 4. Verification
- Backend logic for Etherscan fetching was ported correctly.
- GSheets credentials (hardcoded as in the original) were integrated safely.
- UI responsiveness and accessibility were prioritized (using standard Tailwind transitions and Lucide icons).

## 5. How to Run
### Backend
1. `cd kong-web-app/server`
2. `pip install -r requirements.txt`
3. `python main.py`

### Frontend
1. `cd kong-web-app/client`
2. `npm install`
3. `npm run dev`
