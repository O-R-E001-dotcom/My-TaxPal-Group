from fastapi import FastAPI, HTTPException, Depends
from langchain_core.messages import HumanMessage
from the_schemas import ChatRequest, ChatResponse, RegisterRequest, RegisterResponse, LoginRequest, TokenResponse
from nodes import build_graph
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

rag_app = build_graph()
print("rag_app:", rag_app)
app = FastAPI(title="Nigerian Tax Reform Q&A Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Nigerian Tax Reform RAG API"
    }
    
@app.post("/register", response_model=RegisterResponse)
def register(req: RegisterRequest):
    if req.email in users_db:
        raise HTTPException(status_code=400, detail="User exists")

    users_db[req.email] = hash_password(req.password)
    return {"message": "User registered successfully"}


@app.post("/login", response_model=TokenResponse)
def login(req: LoginRequest ):
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
    answer = result["messages"][-1].content
    

    return ChatResponse(answer=answer, summary=result.get("summary"))
    
@app.get("/admin")
def admin_panel(user=Depends(admin_only)):
    return {"msg": "Welcome admin"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)