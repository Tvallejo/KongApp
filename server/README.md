# KONG Dashboard - Backend API

## Deployment on Render

This is a FastAPI backend for the KONG Dashboard.

### Environment Variables (set in Render dashboard)
No additional environment variables needed - all config is embedded.

### Build Command
```
pip install -r requirements.txt
```

### Start Command
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```
