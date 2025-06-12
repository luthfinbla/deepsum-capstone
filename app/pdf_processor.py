import PyPDF2
import re
from io import BytesIO
from typing import Tuple
from fastapi import HTTPException, status

from config import MAX_PDF_PAGES, MAX_WORDS


def count_words(text: str) -> int:
    """Count the number of words in a text"""
    return len(re.findall(r'\w+', text))


def extract_text_from_pdf(file_content: bytes) -> Tuple[str, int]:
    """Extract text from PDF and return text and word count"""
    try:
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
        
        # Check if PDF has more than MAX_PDF_PAGES
        if len(pdf_reader.pages) > MAX_PDF_PAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PDF exceeds maximum allowed pages ({MAX_PDF_PAGES})"
            )
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        # Count words
        word_count = count_words(text)
        
        # Check if text exceeds MAX_WORDS
        if word_count > MAX_WORDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Text exceeds maximum allowed words ({MAX_WORDS})"
            )
            
        return text, word_count
        
    except PyPDF2.errors.PdfReadError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PDF file"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )