from fastapi import APIRouter, UploadFile, File, HTTPException, status, Header
from fastapi.responses import JSONResponse
from typing import Optional
from lexrank import LexRank
from lexrank.mappings.stopwords import STOPWORDS
import nltk
from nltk.tokenize import sent_tokenize

from models import SummarizationResponse
from database import db
from pdf_processor import extract_text_from_pdf, count_words
from model_service import model_service
from groq_service import groq_service
from config import MAX_WORDS
from user_service import get_current_user_id  # Import the user service function

router = APIRouter(prefix="/summarize", tags=["upload"])

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    print("Downloading NLTK punkt_tab tokenizer...")
    nltk.download('punkt_tab')

@router.post("/abs", response_model=SummarizationResponse)
async def upload_and_summarize_abstractive(
    file: UploadFile = File(...),
    authorization: str = Header(None) 
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    # Extract token from Authorization header
    access_token = None
    if authorization and authorization.startswith("Bearer "):
        access_token = authorization.split(" ")[1]
    
    # Get current user ID using our user service
    user_id = get_current_user_id(access_token)
    
    file_content = await file.read()
    
    text, word_count = extract_text_from_pdf(file_content)
    
    summary = model_service.generate_summary(text)
    
    # Use the user_id from our user service
    summary_id = db.save_summarization(
        user_id=user_id,  # Use the user_id we got from get_current_user_id
        file_name=file.filename,
        original_text=text,
        summary=summary,
        method="abstractive"
    )
    
    return SummarizationResponse(
        id=summary_id,
        original_text=text,
        summary=summary,
    )


@router.post("/ext", response_model=SummarizationResponse)
async def upload_and_summarize_extractive(
    file: UploadFile = File(...),
    authorization: str = Header(None)  # Get the Authorization header
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    # In both upload_and_summarize_abstractive and upload_and_summarize_extractive functions
    # Replace the current token extraction with:
    
    # Extract access token from Authorization header
    access_token = None
    if authorization and authorization.startswith("Bearer "):
        access_token = authorization.split(" ")[1]
    
    # Get current user ID
    user_id = get_current_user_id(access_token)
    
    file_content = await file.read()
    
    text, word_count = extract_text_from_pdf(file_content)
    
    try:
        cleaned_text = text.replace('\n', ' ').replace('\r', ' ').strip()
        
        sentences = sent_tokenize(cleaned_text)
        
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if len(sentences) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text must contain at least 2 sentences for extractive summarization"
            )
        
        print(f"Number of sentences: {len(sentences)}")
        print(f"First 3 sentences: {sentences[:3]}")

        documents = [[sentence] for sentence in sentences]  
        lxr = LexRank(documents, stopwords=STOPWORDS['en'])
        
        summary_size = max(2, min(10, len(sentences) // 5))
        
        summary_sentences = lxr.get_summary(sentences, summary_size=summary_size, threshold=0.1)
        
        summary = ' '.join(summary_sentences)
        
        if not summary or len(summary.strip()) < 50:
            summary = ' '.join(sentences[:summary_size])
            
    except Exception as e:
        cleaned_text = text.replace('\n', ' ').replace('\r', ' ').strip()
        sentences = sent_tokenize(cleaned_text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        summary_size = max(2, min(5, len(sentences) // 3))
        summary = ' '.join(sentences[:summary_size])
        print(f"LexRank failed, using fallback: {str(e)}")
    
    # Use the user_id from our user service instead of direct supabase call
    summary_id = db.save_summarization(
        user_id=user_id,  # Use the user_id we got from get_current_user_id
        file_name=file.filename,
        original_text=text,
        summary=summary,
        method="extractive"
    )
    
    return SummarizationResponse(
        id=summary_id,
        original_text=text,
        summary=summary,
    )

