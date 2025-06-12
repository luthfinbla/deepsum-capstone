from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import ALLOWED_ORIGINS
from auth import get_current_user
from models import User

# Import routes
from routes import auth, summarize, history, qna

# Create FastAPI app
app = FastAPI(
    title="DeepSum API",
    description="API for AI-powered PDF summarization with Q&A capabilities",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(summarize.router)
app.include_router(history.router)
app.include_router(qna.router)


@app.get("/")
async def root():
    """API status endpoint"""
    return {"status": "online", "message": "DeepSum API is running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Create routes directory if it doesn't exist
import os
os.makedirs("routes", exist_ok=True)

# Create empty __init__.py in routes directory
with open("routes/__init__.py", "w") as f:
    f.write("# Routes package\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)