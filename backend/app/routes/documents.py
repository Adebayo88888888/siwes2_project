from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.models.document import Document, DocumentCreate, DocumentSearch
from app.services.rag_service import RAGService
from app.services.auth_service import AuthService
from app.routes.auth import oauth2_scheme
from app.database.supabase import SupabaseDB

router = APIRouter()
db = SupabaseDB()
rag_service = RAGService(db)
auth_service = AuthService()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme)
):
    try:
        user_email = auth_service.get_current_user(token)
        user = db.get_user(user_email)
        user_id = user["id"] if user else user_email

        content_bytes = await file.read()
        file_content = content_bytes.decode("utf-8", errors="ignore")
        
        doc = await rag_service.process_document(file_content, user_id, title=file.filename)
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_user_documents(
    token: str = Depends(oauth2_scheme)
):
    try:
        user_email = auth_service.get_current_user(token)
        user = db.get_user(user_email)
        user_id = user["id"] if user else user_email
        return await rag_service.get_user_documents(user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_documents(
    search: DocumentSearch,
    token: str = Depends(oauth2_scheme)
):
    try:
        user_email = auth_service.get_current_user(token)
        user = db.get_user(user_email)
        user_id = user["id"] if user else user_email
        return await rag_service.search_similar_chunks(user_id, search.query)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))