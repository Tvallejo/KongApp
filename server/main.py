from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import requests
import pandas as pd
from decimal import Decimal, getcontext
from datetime import datetime
import gspread
from gspread_dataframe import set_with_dataframe
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION FROM ENVIRONMENT VARIABLES ---
# All secrets are loaded from environment variables for security
API_KEY = os.environ.get("ETHERSCAN_API_KEY", "")
GSHEETS_CREDENTIALS = os.environ.get("GSHEETS_CREDENTIALS", "{}")
SPREADSHEET_ID = os.environ.get("SPREADSHEET_ID", "1RECsmm9b1PSjFZVgPr0joUugNFpXuWnPKnxk-U7AoyA")
WORKSHEET_NAME = os.environ.get("WORKSHEET_NAME", "KONG_Staking")

# Contract addresses (these are public, so they can be hardcoded)
KONG_TOKEN_CONTRACT = '0x8db036f007841C21B97eFF7dfc2c187241d59BaF'
STAKING_CONTRACT_ADDRESS = '0x8a9d0C64F708A2feEa843eCF7d92f63522775e94'
BASE_URL = 'https://api.etherscan.io/v2/api'
getcontext().prec = 50

# --- SHARED STATE ---
current_data = None
processed_df = None

# --- UTILS ---
def to_one_decimal_amount(value_str: str, decimals_str: str) -> float:
    decs = int(decimals_str)
    amt = Decimal(value_str) / (Decimal(10) ** decs)
    return float(amt.quantize(Decimal('0.0')))

# --- ENDPOINTS ---

@app.get("/api/health")
def health_check():
    """Health check endpoint for deployment verification"""
    return {"status": "healthy", "api_key_configured": bool(API_KEY)}

@app.get("/api/fetch")
def fetch_etherscan():
    global current_data
    
    if not API_KEY:
        raise HTTPException(status_code=500, detail="ETHERSCAN_API_KEY not configured")
    
    params = {
        'chainid': 1,  # Ethereum Mainnet
        'module': 'account',
        'action': 'tokentx',
        'contractaddress': KONG_TOKEN_CONTRACT,
        'address': STAKING_CONTRACT_ADDRESS,
        'page': 1,
        'offset': 1000,
        'sort': 'desc',
        'apikey': API_KEY
    }
    try:
        resp = requests.get(BASE_URL, params=params, timeout=30)
        data = resp.json()
        if data.get('status') != '1':
            raise HTTPException(status_code=400, detail=f"Etherscan Error: {data}")
        current_data = data
        return {"status": "success", "count": len(data['result'])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/process")
def process_data():
    global current_data, processed_df
    if current_data is None:
        raise HTTPException(status_code=400, detail="No data fetched yet")
    
    try:
        df = pd.DataFrame(current_data['result'])
        df['Transaction Time'] = pd.to_datetime(pd.to_numeric(df['timeStamp']), unit='s', utc=True).dt.tz_convert(None)
        df['Token Amount'] = df.apply(lambda r: to_one_decimal_amount(r['value'], r['tokenDecimal']), axis=1)
        
        staking_addr_lower = STAKING_CONTRACT_ADDRESS.lower()
        df['transaction_type'] = (df['from'].str.lower() == staking_addr_lower).map({True: 'UnStake', False: 'Stake'})
        df['Token Balance'] = df.apply(lambda r: (-r['Token Amount']) if r['transaction_type'] == 'UnStake' else r['Token Amount'], axis=1)
        df['Wallet Origin'] = df.apply(lambda r: r['to'] if r['from'].lower() == staking_addr_lower else r['from'], axis=1)
        
        # Select and rename columns
        rename_map = {
            'Transaction Time': 'time',
            'transaction_type': 'type',
            'Wallet Origin': 'wallet',
            'Token Amount': 'amount',
            'Token Balance': 'balance',
            'hash': 'hash'
        }
        processed_df = df[list(rename_map.keys())].rename(columns=rename_map)
        
        # Format for JSON response
        result = processed_df.head(50).to_dict(orient='records')
        # Convert datetime to string
        for r in result:
            r['time'] = r['time'].strftime('%Y-%m-%d %H:%M:%S')
            
        return {"status": "success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
def upload_gsheets():
    global processed_df
    if processed_df is None:
        raise HTTPException(status_code=400, detail="No data processed yet")
    
    if not GSHEETS_CREDENTIALS or GSHEETS_CREDENTIALS == "{}":
        raise HTTPException(status_code=500, detail="GSHEETS_CREDENTIALS not configured")
    
    try:
        creds_dict = json.loads(GSHEETS_CREDENTIALS)
        if "private_key" in creds_dict and "\\n" in creds_dict["private_key"]:
            creds_dict["private_key"] = creds_dict["private_key"].replace("\\n", "\n")
            
        gc = gspread.service_account_from_dict(creds_dict)
        sh = gc.open_by_key(SPREADSHEET_ID)
        
        try:
            ws = sh.worksheet(WORKSHEET_NAME)
        except gspread.WorksheetNotFound:
            ws = sh.add_worksheet(title=WORKSHEET_NAME, rows="1000", cols="20")
            
        ws.clear()
        set_with_dataframe(ws, processed_df, include_index=False)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
