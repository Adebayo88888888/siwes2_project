from fastapi import APIRouter, HTTPException, Depends
from app.database.supabase import SupabaseDB
from app.services.auth_service import AuthService
from app.services.chat_service import ChatService
from app.routes.auth import oauth2_scheme
from app.models.chat import ChatMessage, ChatResponse
from typing import List

router = APIRouter()
db = SupabaseDB()
chat_service = ChatService()
auth_service = AuthService()

@router.post("/message", response_model=ChatResponse)
async def send_message(
    message: ChatMessage,
    token: str = Depends(oauth2_scheme)
):
    try:
        user_email = auth_service.get_current_user(token)
        user = db.get_user(user_email)
        user_id = user["id"] if user else user_email

        # Get relevant document chunks
        relevant_chunks = await chat_service.get_relevant_chunks(user_id, message.content)
        
        # Generate response using Gemini
        response = await chat_service.generate_response(
            message.content,
            relevant_chunks
        )

        # Save chat history
        try:
            db.save_chat(user_id, message.content, response)
        except Exception as save_err:
            print(f"Could not save chat history: {save_err}")

        return ChatResponse(
            message=response,
            relevant_chunks=relevant_chunks
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[ChatResponse])
async def get_chat_history(
    limit: int = 10,
    token: str = Depends(oauth2_scheme)
):
    try:
        user_email = auth_service.get_current_user(token)
        user = db.get_user(user_email)
        user_id = user["id"] if user else user_email

        try:
            history = db.get_chat_history(user_id, limit)
        except Exception:
            history = []

        return [
            ChatResponse(
                message=chat.get("response", ""),
                relevant_chunks=[]  # We don't store chunks in history
            )
            for chat in history
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))