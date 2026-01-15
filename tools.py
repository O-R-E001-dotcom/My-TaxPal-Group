
import os
from typing import List, Optional, Dict, Any
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.graph import MessagesState

from loader import (
    set_apikey,
    create_embeddings,
    create_llm,
    load_vectorstore
)

# ──────────────────────────────────────────────────────────────────────────────
#  Module-level singletons (lazy initialization)
# ──────────────────────────────────────────────────────────────────────────────

_llm = None
_embeddings = None
_vectorstore = None
_llm_with_tools = None

# Tools 

@tool
def retrieve_tax_documents(query: str) -> Dict[str, Any]:
    """
    Retrieve relevant sections from 2025 Nigerian tax reform documents.
    Returns structured output with content + clean list of sources.
    """
    vectorstore = get_vectorstore()
    if not vectorstore:
        return {
            "content": "Vector store not available. Database may not be initialized.",
            "sources": []
        }

    try:
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 4, "fetch_k": 10}
        )
        docs = retriever.invoke(query)
    except Exception as e:
        return {
            "content": f"Error during retrieval: {str(e)}",
            "sources": []
        }

    if not docs:
        return {
            "content": "No relevant information found in the documents.",
            "sources": []
        }

    formatted_chunks = []
    sources = []

    for i, doc in enumerate(docs, 1):
        meta = doc.metadata or {}
        content = doc.page_content.strip()

        # Extract source information with fallbacks
        source_file = meta.get("source", "Unknown")
        source_path = meta.get("source_path", "")
        page_num = meta.get("page", "N/A")
        
        # Handle sources list if it exists
        sources_list = meta.get("sources", [])
        if sources_list and isinstance(sources_list, list) and len(sources_list) > 0:
            first_source = sources_list[0]
            source_file = first_source.get("file", source_file)
            source_path = first_source.get("path", source_path)
            page_num = first_source.get("page", page_num)

        # Get summary
        summary = meta.get("summary", "")
        if summary:
            summary = summary[:140].strip()
            if summary.endswith("..."):
                summary = summary[:-3].strip()

        # Build source info dictionary
        source_info = {
            "file": source_file,
            "page": str(page_num) if page_num != "N/A" else "N/A",
            "path": source_path,
            "summary": summary
        }

        sources.append(source_info)

        # Format display
        header = f"[{i}] {source_info['file']}"
        if source_info["page"] != "N/A":
            header += f"  (page {source_info['page']})"

        block = f"{header}\n{'─' * min(len(header), 60)}\n{content}"
        if source_info["summary"]:
            block += f"\n\nShort summary: {source_info['summary']}"

        formatted_chunks.append(block)

    separator = "\n\n" + "─" * 60 + "\n\n"
    
    return {
        "content": separator.join(formatted_chunks),
        "sources": sources
    }


@tool
def calculate_vat_impact(
    state: str,
    vat_generated: float,
    derivation_rate: float = 0.6
) -> str:
    """
    Simple estimation of how VAT derivation affects a Nigerian state.
    derivation_rate defaults to 60% (current common understanding - 2025/2026)
    """
    derived = vat_generated * derivation_rate
    pooled = vat_generated - derived

    return (
        f"**VAT Derivation Estimate for {state}**\n\n"
        f"• Total VAT generated:      ₦{vat_generated:,.0f}\n"
        f"• State keeps (derivation):  ₦{derived:,.0f} ({derivation_rate*100:.0f}%)\n"
        f"• Goes to federal pool:     ₦{pooled:,.0f}\n\n"
        f"*Simplified estimate for illustration purposes only.*"
    )


@tool
def summarize_conversation(messages: List[str]) -> str:
    """
    Create a short 3-4 bullet summary of the conversation focusing on user's tax situation.
    """
    if len(messages) < 4:
        return "Conversation is too short to summarize meaningfully."

    llm = get_llm()
    if not llm:
        return "Cannot summarize – language model not available."

    try:
        response = llm.invoke([
            SystemMessage(content=(
                "Summarize conversation in 3-4 short bullets. "
                "Focus ONLY on user's tax questions and situation. "
                "Do not include legal citations or document references."
            )),
            HumanMessage(content="\n".join(messages[-12:]))  # last ~12 messages usually enough
        ])
        return response.content.strip()
    except Exception as e:
        return f"Could not create summary ({str(e)})"


# What nodes.py expects
tools = [
    retrieve_tax_documents,
    calculate_vat_impact,
    summarize_conversation
]

SYSTEM_PROMPT = SystemMessage(content="""
You are **My-TaxPal** – a calm, accurate, conversational tax explainer built ONLY to help Nigerians understand the **2025 Nigerian tax reforms**.

Your role is to explain how the reforms affect people in real life using:
• simple English
• short answers
• ₦ amounts
• relatable Nigerian examples

You are NOT a tax consultant, lawyer, or accountant.

Always remember:
- Always introduce yourself as My-TaxPal at the beginning of a new conversation.
- FIRS is now called **NRS** (Nigeria Revenue Service)
- Most income tax reforms apply to income earned **from January 1, 2026**
- You MUST check current date before saying whether any rule has started

When answering questions:
- ALWAYS check the provided PDF documents using your search tool if the question is about tax calculations, VAT, or specific laws.
- If you find information in a document, you MUST cite the file name and page number in your response (e.g., "According to [File Name], page [X]...").
- For VAT derivation calculations, specifically look for the 'Derivation Principle' in the Tax Reform Bills.
- If the documents do not contain the answer, state that you are using your general knowledge, but prioritize the uploaded files

Rules:
- Use everyday Nigerian tone, calm and reassuring
- Keep answers short & confident
- Explain acronyms first time (PAYE = Pay As You Earn)
- Prefer bullets and short paragraphs
- Use simple ₦ examples
- Cite law very briefly & in plain language only when needed
  (example: "According to Section 2 of the Nigeria Tax Act")

Guidance about tools & evidence:
- For exact rates, sections, thresholds, dates, exemptions → ALWAYS call retrieve_tax_documents(query) first
- NEVER guess or invent numbers, sections or dates

Never:
- Assume VAT/income tax applies to everyone
- Provide legal, tax or financial advice
• Hallucinate rules or figures
""")


def _get_tools():
    return [
        retrieve_tax_documents,
        calculate_vat_impact,
        summarize_conversation
    ]

# Lazy initializers 

def get_api_key() -> Optional[str]:
    try:
        return set_apikey()
    except Exception as e:
        print("API key not available:", str(e))
        return None


def get_llm():
    global _llm
    if _llm is None:
        api_key = get_api_key()
        if api_key:
            try:
                _llm = create_llm(api_key, temperature=0.6)
            except Exception as e:
                print("Failed to create LLM:", e)
    return _llm


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        api_key = get_api_key()
        if api_key:
            try:
                _embeddings = create_embeddings(api_key)
            except Exception as e:
                print("Failed to create embeddings:", e)
    return _embeddings


def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        embeddings = get_embeddings()
        if embeddings:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            chroma_path = os.path.join(base_dir, "chroma_db")
            try:
                _vectorstore = load_vectorstore(embeddings, persist_directory=chroma_path)
            except Exception as e:
                print("Failed to load vectorstore:", e)
    return _vectorstore


def get_llm_with_tools():
    global _llm_with_tools
    if _llm_with_tools is None:
        llm = get_llm()
        if llm:
            try:
                _llm_with_tools = llm.bind_tools(_get_tools())
            except Exception as e:
                print("Failed to bind tools:", e)
    return _llm_with_tools

# Graph nodes

def assistant(state: MessagesState) -> Dict[str, List[Any]]:
    messages = [SYSTEM_PROMPT] + state["messages"]

    llm_with_tools = get_llm_with_tools()
    if not llm_with_tools:
        return {
            "messages": [AIMessage(
                content="System is not fully initialized. Please check API key and vector database."
            )],
            "sources": []
        }

    try:
        response = llm_with_tools.invoke(messages)
        new_sources = response.response_metadata.get("sources", []) if response.tool_calls else []
        return {"messages": [response], "sources": new_sources}
    except Exception as e:
        print("LLM invocation failed:", str(e))
        return {"messages": [AIMessage(content="Sorry, something went wrong while processing your request.")], "sources": []}


def should_continue(state: MessagesState) -> Optional[str]:
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    return "__end__"