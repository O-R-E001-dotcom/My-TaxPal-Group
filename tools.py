import os
from langchain_core.tools import tool
from loader import (
    set_apikey,
    create_embeddings,
    create_llm,
    load_vectorstore
)
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import Literal, List
from langgraph.graph import START, END, StateGraph, MessagesState


# Load API key
api_key = set_apikey()

# Create chat model
llm = create_llm(api_key, temperature=0.5)

# Create embeddings model
embeddings = create_embeddings(api_key)

# Connect to existing vector store
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMADB_PATH = os.path.join(BASE_DIR, "chroma_db")

vectorstore = load_vectorstore(
    embeddings=embeddings,
    persist_directory=CHROMADB_PATH,

)

@tool
def retrieve_tax_documents(query: str) -> str:
    """
    Retrieve relevant sections from Nigerian tax reform documents knowledge base for accurate information.

Use this tool ONLY when:
- There is a need of information from the document collection to answer the user's question accurately.
- Legal authority or section references are needed
- You are not certain of the correct tax rule

Do NOT use this tool for:
- General knowledge questions, explanations or summaries
- High-level “what does this mean for me?” questions
- Greetings, small talks or opinions
- Simple calculations
    Args:
        query: The users tax-related question or information need

    Returns:
        Relevant excerpts from the tax reform documents

    Examples of when to use:
    - "What are the new corporate tax rates in the Nigeria Tax Act 2025?"
    - "Summarize the changes to VAT in the Nigeria Tax Administration Act."
    - "What exemptions are provided for small businesses in the 2024 tax reform bills?"
    
Rules for use:
- Always cite the document title and section number when providing information.
- Never guess or invent tax rules, figures, or section numbers.
- If accuracy matters and you are unsure, retrieve first.

Query guidance:
- Be specific and focused
- Include relevant terms like “Nigeria Tax Act 2025”, “Nigeria Tax Administration Act”, or the tax type involved
- Search for clarity, not completeness

Return only the most relevant excerpts needed to answer accurately.
    Args:
        query: The user query needing document information
        
    Returns:
        A formatted string of relevant document excerpts with citations
"""

    # Use MMR (Maximum Marginal Relevance) for diverse results
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 4, "fetch_k": 8}
    )
    
    # Retrieve documents
    results = retriever.invoke(query)
    
    if not results:
        return "No relevant documents found."
    
    # Format results
    formatted = "\n\n---\n\n".join(
        f"Document {i+1} (Source: {doc.metadata.get('source', 'Unknown')}):\n{doc.page_content}"
        for i, doc in enumerate(results)
    )
    
    return formatted

@tool
def calculate_vat_impact(
    state: str,
    vat_generated: float,
    derivation_rate: float
) -> str:
    """
    Estimate how VAT derivation affects a Nigerian state.
    """

    derived_amount = vat_generated * derivation_rate
    pooled_amount = vat_generated - derived_amount

    return (
        f"VAT Impact Estimate for {state}:\n"
        f"- VAT generated: ₦{vat_generated:,.2f}\n"
        f"- Derivation rate: {derivation_rate * 100:.1f}%\n"
        f"- Amount retained by state: ₦{derived_amount:,.2f}\n"
        f"- Amount pooled federally: ₦{pooled_amount:,.2f}\n\n"
        f"Note: This is a simplified estimate for explanation purposes."
    )

SUMMARY_PROMPT = SystemMessage(
    content=(
        "Summarize the conversation so far in 3–4 short bullet points. "
        "Focus only on the user's situation and key tax topics discussed. "
        "Do not include legal citations."
    )
)

@tool
def summarize_conversation(messages: List[str]) -> str:
    """
    Summarize the conversation so far into 3–4 short bullet points
    focusing on the user's tax situation.
    Preserve:
    - Key tax facts
    - User concerns
    - Any conclusions reached
    """
    if len(messages) < 6:
        return "Conversation too short to summarize."

    response = llm.invoke([
        SUMMARY_PROMPT,
        HumanMessage(content="\n".join(messages))
    ])

    return response.content

SYSTEM_PROMPT = SystemMessage(content="""

You are **My-TaxPal** — a calm, accurate, conversational tax explainer built ONLY to help Nigerians understand the **2025 Nigerian tax reforms**.
Your role is to explain how the reforms affect people in real life using **simple English**, **short answers**, **₦ amounts**, and **relatable Nigerian examples**.
You are NOT a tax consultant, lawyer, or an accountant.

ALWAYS remember:
- **FIRS is now called NRS (Nigeria Revenue Service)**
- Tax reforms apply to **income earned from January 1, 2026**
- You MUST use the current date tool before stating whether a rule has started

If a question is outside this scope, politely redirect.

─RULES:
- Use basic English and an everyday Nigerian tone
- Be calm, clear, and reassuring
- Keep answers concise and confident
- Explain acronyms immediately (e.g. PAYE = Pay As You Earn)
- Prefer bullet points and short paragraphs
- Use simple Nigerian examples and ₦ amounts
- When helpful, cite the law briefly in plain language only  
  (e.g., “According to Section 2 of the Nigeria Tax Act”)
- Keep answers short and to the point

─ NEVER DO THE FOLLOWING:
- Assume tax or VAT applies to everyone
- Guess figures, rates, thresholds, or exemptions
- Hallucinate tax rules, dates, or section numbers
- Mention tools, databases, retrieval, verification, or system behavior
- Provide legal, tax, or financial advice

""")

tools = [retrieve_tax_documents, calculate_vat_impact, summarize_conversation]
llm_with_tools = llm.bind_tools(tools)

def assistant(state: MessagesState) -> dict:
    messages = [SYSTEM_PROMPT] + state['messages']
    response = llm_with_tools.invoke(messages)
    return {'messages': [response]}

def should_continue(state: MessagesState) -> Literal["tools", "__end__"]:
    last_message = state['messages'][-1]
    if last_message.tool_calls:
        return 'tools'
    return '__end__'
