
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import FileResponse
from langchain_core.messages import HumanMessage
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from the_schemas import ChatRequest, ChatResponse, RegisterRequest, RegisterResponse, LoginRequest, TokenResponse
from graph import build_graph
from fastapi.middleware.cors import CORSMiddleware
from authe import (
    users_db,
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    get_current_user,
    admin_only
)
import json

rag_app = build_graph()
print("rag_app:", rag_app)

app = FastAPI(title="Nigerian Tax Reform Q&A Assistant")

PDF_DIRECTORY = Path(r"C:\Users\HP\Desktop\mywork\NOTEBOOKS\working_with_llms\My-TaxPal-Group\folder")

if not PDF_DIRECTORY.exists():
    print(f"ERROR: The directory {PDF_DIRECTORY} was not found. Check your path!")

# Mount the directory
# This makes files accessible at http://localhost:8000/pdf-files/filename.pdf
app.mount("/pdf-files", StaticFiles(directory=PDF_DIRECTORY, html=True), name="pdf-files")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Nigerian Tax Reform RAG API"
    }
@app.get("/pdf-files/{filename}")
async def get_pdf(filename: str):
    # This manually finds the file and sends it
    file_path = PDF_DIRECTORY / filename
    
    if not file_path.exists():
        print(f"File not found at: {file_path}") # This prints in your terminal
        return {"error": "File not found"}, 404
        
    return FileResponse(path=file_path, media_type='application/pdf')    
@app.post("/register", response_model=RegisterResponse)
def register(req: RegisterRequest):
    if req.email in users_db:
        raise HTTPException(status_code=400, detail="User exists")

    users_db[req.email] = hash_password(req.password)
    return {"message": "User registered successfully"}


@app.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    hashed = users_db.get(req.email)
    if not hashed or not verify_password(req.password, hashed):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": req.email})
    return {"access_token": token}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, token=Depends(verify_token), user=Depends(get_current_user)):
    state = {
        "messages": [HumanMessage(content=request.message)],
        "summary": None
    }

    if rag_app is None:
        raise HTTPException(
            status_code=500,
            detail="RAG application not initialized"
        )

    result = rag_app.invoke(state, config={"configurable": {"thread_id": request.session_id}})
    
    # Get the answer from the last message
    last_message = result["messages"][-1]
    answer = last_message.content if hasattr(last_message, 'content') else str(last_message)
    
    # Extract sources if available from tool calls
    sources = []
    for msg in result["messages"]:
        if hasattr(msg, 'tool_calls'):
            for tool_call in msg.tool_calls:
                if tool_call.get('name') == 'retrieve_tax_documents':
                    # Check if there's a response for this tool call
                    pass
        # Check for ToolMessage responses
        if hasattr(msg, 'content') and isinstance(msg.content, str):
            try:
                # Try to parse JSON from tool responses
                content_data = json.loads(msg.content)
                if isinstance(content_data, dict) and 'sources' in content_data:
                    sources.extend(content_data['sources'])
            except (json.JSONDecodeError, TypeError):
                pass
    
    # Remove duplicates from sources
    unique_sources = []
    seen = set()
    for source in sources:
        source_key = f"{source.get('file', '')}_{source.get('page', '')}"
        if source_key not in seen:
            seen.add(source_key)
            unique_sources.append(source)
    
    return ChatResponse(
        answer=answer,
        summary=result.get("summary"),
        sources=unique_sources if unique_sources else []
    )
    
@app.get("/admin")
def admin_panel(user=Depends(admin_only)):
    return {"msg": "Welcome admin"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)











