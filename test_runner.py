"""
Comprehensive test to verify the entire RAG system works correctly
"""
import os
import sys
from pathlib import Path

# Setup paths
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

# Set environment variables for testing
os.environ.setdefault('SECRET_KEY', 'dev_secret')
os.environ.setdefault('ALGORITHM', 'HS256')
os.environ.setdefault('EXPIRY', '60')

def test_imports():
    """Test that all modules can be imported"""
    print("=" * 60)
    print("TEST 1: Module Imports")
    print("=" * 60)
    
    modules = [
        'the_schemas',
        'authe',
        'loader',
        'tools',
        'nodes',
        'main'
    ]
    
    results = {}
    for module in modules:
        try:
            __import__(module)
            results[module] = 'OK'
            print(f"✓ {module}: OK")
        except Exception as e:
            results[module] = f'ERROR: {type(e).__name__}: {e}'
            print(f"✗ {module}: {results[module]}")
    
    all_ok = all(v == 'OK' for v in results.values())
    print(f"\nImport test: {'PASSED' if all_ok else 'FAILED'}")
    return all_ok

def test_tool_invocation():
    """Test that tools can be invoked properly"""
    print("\n" + "=" * 60)
    print("TEST 2: Tool Invocation")
    print("=" * 60)
    
    try:
        from langchain_core.messages import HumanMessage
        from tools import assistant, retrieve_tax_documents
        
        # Test 1: Check if assistant function works
        print("\n▶ Testing assistant function...")
        state = {
            "messages": [
                HumanMessage(content="What is the VAT rate in the Nigeria Tax Act 2025?")
            ]
        }
        
        result = assistant(state)
        msg = result["messages"][0]
        
        print("✓ Assistant function executed")
        print(f"  - Message type: {type(msg).__name__}")
        print(f"  - Has content: {hasattr(msg, 'content')}")
        print(f"  - Has tool_calls: {hasattr(msg, 'tool_calls')}")
        
        if hasattr(msg, 'tool_calls'):
            print(f"  - Tool calls: {len(msg.tool_calls) if msg.tool_calls else 0}")
        
        # Test 2: Direct tool call
        print("\n▶ Testing retrieve_tax_documents tool directly...")
        tool_result = retrieve_tax_documents.invoke({"query": "VAT rate"})
        
        print("✓ Tool executed successfully")
        print(f"  - Result type: {type(tool_result)}")
        
        if isinstance(tool_result, dict):
            print(f"  - Has 'content': {'content' in tool_result}")
            print(f"  - Has 'sources': {'sources' in tool_result}")
            
            if 'sources' in tool_result:
                sources = tool_result['sources']
                print(f"  - Number of sources: {len(sources)}")
                
                if sources:
                    print("\n  First source details:")
                    first_source = sources[0]
                    for key, value in first_source.items():
                        print(f"    • {key}: {value}")
        
        return True
        
    except Exception as e:
        print(f"✗ Tool invocation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_source_metadata():
    """Test that source metadata is properly preserved"""
    print("\n" + "=" * 60)
    print("TEST 3: Source Metadata")
    print("=" * 60)
    
    try:
        from tools import get_vectorstore
        
        vectorstore = get_vectorstore()
        if not vectorstore:
            print("✗ Vector store not available")
            return False
        
        print("✓ Vector store loaded")
        
        # Test retrieval
        print("\n▶ Testing document retrieval...")
        results = vectorstore.similarity_search("VAT rate Nigeria Tax Act", k=2)
        
        print(f"✓ Retrieved {len(results)} documents")
        
        for i, doc in enumerate(results, 1):
            print(f"\n  Document {i}:")
            print(f"    - Metadata keys: {list(doc.metadata.keys())}")
            print(f"    - Source: {doc.metadata.get('source', 'N/A')}")
            print(f"    - Page: {doc.metadata.get('page', 'N/A')}")
            print(f"    - Has sources list: {'sources' in doc.metadata}")
            
            if 'sources' in doc.metadata:
                sources_list = doc.metadata['sources']
                print(f"    - Sources list length: {len(sources_list)}")
                if sources_list:
                    print(f"    - First source: {sources_list[0]}")
        
        return True
        
    except Exception as e:
        print(f"✗ Source metadata test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_graph_execution():
    """Test the complete graph execution"""
    print("\n" + "=" * 60)
    print("TEST 4: Graph Execution")
    print("=" * 60)
    
    try:
        from nodes import build_graph
        from langchain_core.messages import HumanMessage
        
        print("▶ Building graph...")
        graph = build_graph()
        print("✓ Graph built successfully")
        
        print("\n▶ Executing graph with test query...")
        state = {
            "messages": [
                HumanMessage(content="What is the VAT rate according to the tax reform?")
            ]
        }
        
        result = graph.invoke(state, config={"configurable": {"thread_id": "test-123"}})
        
        print("✓ Graph executed successfully")
        print(f"  - Number of messages in result: {len(result['messages'])}")
        
        last_message = result['messages'][-1]
        print(f"  - Last message type: {type(last_message).__name__}")
        
        if hasattr(last_message, 'content'):
            content_preview = str(last_message.content)[:200]
            print(f"  - Content preview: {content_preview}...")
        
        return True
        
    except Exception as e:
        print(f"✗ Graph execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("RUNNING COMPREHENSIVE TESTS")
    print("=" * 60 + "\n")
    
    results = {
        "Imports": test_imports(),
        "Tool Invocation": test_tool_invocation(),
        "Source Metadata": test_source_metadata(),
        "Graph Execution": test_graph_execution()
    }
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 60)
    print(f"OVERALL: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    print("=" * 60 + "\n")
    
    if not all_passed:
        print("Troubleshooting tips:")
        print("  • Ensure OPENAI_API_KEY is set in .env")
        print("  • Verify chroma_db directory exists with vector data")
        print("  • Check that all dependencies are installed")
        print("  • Run: pip install -r requirements.txt")

if __name__ == "__main__":
    main()