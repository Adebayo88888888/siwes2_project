import uuid
import numpy as np
import os
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
from supabase import create_client, Client
from app.config.settings import Settings

load_dotenv()

# In-memory fallback database for local dev / offline mode
_in_memory_users: Dict[str, Dict[str, Any]] = {}
_in_memory_chats: List[Dict[str, Any]] = []
_in_memory_docs: List[Dict[str, Any]] = []
_in_memory_chunks: List[Dict[str, Any]] = []

class SupabaseDB:
    def __init__(self):
        settings = Settings()
        try:
            self.client: Optional[Client] = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
        except Exception:
            self.client = None

    def verify_setup(self) -> Dict[str, Any]:
        """Verify that required tables and functions exist"""
        if not self.client:
            return {"setup_complete": False, "mode": "in_memory_fallback"}
        try:
            tables = self.client.table('users').select('id').limit(1).execute()
            return {"setup_complete": True, "mode": "supabase"}
        except Exception as e:
            return {
                "setup_complete": False,
                "mode": "in_memory_fallback",
                "error": str(e)
            }

    def create_user(self, user_data: dict) -> Dict[str, Any]:
        email = user_data.get("email")
        user_id = str(uuid.uuid4())
        record = {
            "id": user_id,
            "email": email,
            "password": user_data.get("password"),
            "full_name": user_data.get("full_name", email.split("@")[0] if email else "User")
        }
        if self.client:
            try:
                res = self.client.table('users').insert(user_data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        _in_memory_users[email] = record
        return record

    def get_user(self, email: str) -> Optional[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table('users').select('*').eq('email', email).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        return _in_memory_users.get(email)

    def save_chat(self, user_id: str, message: str, response: str) -> Dict[str, Any]:
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "message": message,
            "response": response,
            "created_at": str(np.datetime64('now'))
        }
        if self.client:
            try:
                res = self.client.table('chat_history').insert({
                    "user_id": user_id,
                    "message": message,
                    "response": response
                }).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass
        _in_memory_chats.append(record)
        return record

    def get_chat_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table('chat_history')\
                    .select('*')\
                    .eq('user_id', user_id)\
                    .order('created_at', desc=True)\
                    .limit(limit)\
                    .execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        user_chats = [c for c in _in_memory_chats if c["user_id"] == user_id]
        return list(reversed(user_chats[-limit:]))

    def add_document(self, user_id: str, title: str, content: str, source_type: str, source_url: Optional[str] = None) -> Dict[str, Any]:
        doc_id = str(uuid.uuid4())
        record = {
            "id": doc_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "source_type": source_type,
            "source_url": source_url,
            "created_at": str(np.datetime64('now'))
        }
        if self.client:
            try:
                doc_res = self.client.table('documents').insert({
                    "title": title,
                    "content": content,
                    "source_type": source_type,
                    "source_url": source_url
                }).execute()
                if doc_res.data:
                    doc = doc_res.data[0]
                    try:
                        self.client.table('user_documents').insert({
                            "user_id": user_id,
                            "document_id": doc['id']
                        }).execute()
                    except Exception:
                        pass
                    return doc
            except Exception:
                pass
        _in_memory_docs.append(record)
        return record

    def add_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        added = []
        for idx, chunk in enumerate(chunks):
            emb = chunk["embedding"].tolist() if isinstance(chunk["embedding"], np.ndarray) else chunk["embedding"]
            record = {
                "id": str(uuid.uuid4()),
                "document_id": document_id,
                "content": chunk["content"],
                "embedding": emb,
                "chunk_index": idx
            }
            added.append(record)
            _in_memory_chunks.append(record)
            if self.client:
                try:
                    self.client.table('document_chunks').insert({
                        "document_id": document_id,
                        "content": chunk["content"],
                        "embedding": emb,
                        "chunk_index": idx
                    }).execute()
                except Exception:
                    pass
        return added

    def search_similar_chunks(self, user_id: str, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.rpc(
                    'match_documents',
                    {
                        'query_embedding': query_embedding,
                        'match_threshold': 0.5,
                        'match_count': limit
                    }
                ).execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        # Cosine similarity on in-memory chunks
        if not _in_memory_chunks:
            return []
        q_arr = np.array(query_embedding)
        norm_q = np.linalg.norm(q_arr)
        if norm_q == 0:
            return []
        results = []
        for chk in _in_memory_chunks:
            c_arr = np.array(chk["embedding"])
            norm_c = np.linalg.norm(c_arr)
            if norm_c > 0:
                sim = float(np.dot(q_arr, c_arr) / (norm_q * norm_c))
                results.append((sim, chk))
        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results[:limit]]

    def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        if self.client:
            try:
                res = self.client.table('documents').select('*').execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return [d for d in _in_memory_docs if d.get("user_id") == user_id or True]
