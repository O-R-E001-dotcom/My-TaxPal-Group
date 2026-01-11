from langchain_core.documents import Document
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from typing import List, Optional
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pathlib import Path
from langchain_community.vectorstores import Chroma
import traceback

def set_apikey() -> str:
    
    load_dotenv()
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY not found in .env file"
            "Please add your key to .env: OPENAI_API_KEY=sk-..."
        )

    return api_key

def create_llm( api_key: str, model: str = "gpt-5-nano", temperature: float = 0.6) -> ChatOpenAI:
    """
    Initialize the OpenAI chat model
    """
    llm = ChatOpenAI(
        model=model,
        temperature=temperature,
        api_key= api_key
    )
    print(f"LLM  model {model} of (temp={temperature})")
    return llm

def load_documents(folder: str = "folder") -> List[Document]:
        """
        Load all PDFs in the folder and return a list of LangChain Documents.
        Adds source and page metadata.
        """
        if not os.path.exists(folder):
            print(f"⚠️ Folder not found: {folder}")
            return []

        pdf_files = [f for f in os.listdir(folder) if f.lower().endswith(".pdf")]
        if not pdf_files:
            print(f"⚠️ No PDF files found in folder: {folder}")
            return []

        documents = []

        for pdf_file in pdf_files:
            full_path = os.path.join(folder, pdf_file)
            print(f"   Loading: {pdf_file} ... ", end="")

            try:
                loader = PyPDFLoader(full_path)
                docs = loader.load()
                page_count = len(docs)
                print(f"Success! ({page_count} pages)")

                # Add source metadata for each page
                for i, doc in enumerate(docs):
                    doc.metadata["source"] = pdf_file
                    doc.metadata["page"] = i + 1

                documents.extend(docs)
            except Exception as e:
                print(f"Failed! Error: {str(e)}")

        total_pages = len(documents)
        print(f"\n✅ Total pages loaded: {total_pages} across {len(pdf_files)} documents")

        if total_pages == 0:
            print("⚠️ No content extracted. Make sure PDFs are text-based (not scanned images).")

        return documents
    
def create_embeddings(
    api_key: str,
    model: str = "text-embedding-3-small"
) -> OpenAIEmbeddings:
    """
    Initialize OpenAI embeddings model
    """
    embeddings = OpenAIEmbeddings(
        model=model,
        api_key=api_key
    )
    print(f"Embeddings model: {model}")
    return embeddings


def chunk_documents(docs: List[Document]) -> List[Document]:
        """
        Split documents into chunks using RecursiveCharacterTextSplitter.
        Preserves source metadata for each chunk.
        """
        if not docs:
            print("⚠️ No documents to chunk.")
            return []

        all_chunks = []
        splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50
        )
        total_pages = len(docs)

        for i, doc in enumerate(docs, 1):
            source = os.path.basename(doc.metadata.get("source", "unknown"))
            chunks = splitter.split_documents([doc])
            chunk_count = len(chunks)
            print(f"   Document {i}/{total_pages}: {source} → {chunk_count} chunks created")
            all_chunks.extend(chunks)

        total_chunks = len(all_chunks)
        print(f"\n✅ Total chunks created: {total_chunks}")

        return all_chunks

# VECTOR STORE


def create_vectorstore(chunks: List[Document], embeddings: OpenAIEmbeddings, 
        persist_directory: str = "./chroma_db") -> Optional[Chroma]:
    """
    Create a Chroma vector store from document chunks and save it.

    Args:
        chunks: List of document chunks to embed

    Returns:
        Chroma vector store instance
    """
    try:
        total_chunks = len(chunks)
        vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=persist_directory
        )

        print("\n✅ SUCCESS! Vector database built and saved to",persist_directory)
        print(f"Ready with {total_chunks} searchable chunks from your Tax Reform Bills documents!")
        print("RAG system is now ready for accurate answers from the documents!\n")

            
        return vectorstore

    except Exception as e:
        print("\n❌ Critical error during vector store build:")
        print(f"   {str(e)}")
        traceback.print_exc()
        print("\nSuggested fixes:")
        print("   • Ensure PDFs were loaded correctly and are text-based")
        print("   • Check that .env has a valid OPENAI_API_KEY")
        print("   • Try with 1-2 small PDFs first")
        print("   • Make sure you have an internet connection (needed for embeddings)")
        print("   • Try running again — sometimes it’s a temporary connection issue")
    return None
    
def load_vectorstore(embeddings: OpenAIEmbeddings,
    persist_directory: str = "./chroma_db"
) -> Optional[Chroma]:
    """
    Load an existing vector store from disk.
    """
    try:
            
        print("Loading existing vector store...")
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=embeddings
        )
        print("✅ Vector store loaded!")
            
           
        return vectorstore

    except Exception as e:
        print("❌ Failed to load vector store:", str(e))
        traceback.print_exc()
        return None

def sanity_check(vectorstore: Chroma):
    """
    Sanity check to verify vector store retrieval works.
    """
    if not vectorstore:
        print("⚠️ Sanity check skipped: vector store not initialized.")
        return
        
    print("\n🔎 Running vector store sanity check...")

    test_query = "What is the VAT rate according to the tax reform bill?"

    results = vectorstore.similarity_search(test_query, k=2)

    if not results:
        print("⚠️ Sanity check FAILED: No documents retrieved.")
        return

    print(f"✅ Sanity check PASSED: Retrieved {len(results)} documents\n")

    for i, doc in enumerate(results, 1):
        source = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "N/A")

        print(f"Result {i}:")
        print(f"   Source: {source}")
        print(f"   Page: {page}")
        print(f"   Preview: {doc.page_content[:200]}...\n") 