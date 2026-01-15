# test_invoke_tools.py
import sys
from pathlib import Path

# ensure the My-TaxPal-Group package folder is importable from this script
ROOT = Path(__file__).resolve().parent / "My-TaxPal-Group"
sys.path.insert(0, str(ROOT))

from langchain_core.messages import HumanMessage
from tools import assistant

def run_test():
    state = {
        "messages": [
            HumanMessage(
                content=(
                    "Please check the Nigeria Tax Act 2025 VAT rate and, if needed, "
                    "call retrieve_tax_documents('VAT rate Nigeria Tax Act 2025')"
                )
            )
        ]
    }

    result = assistant(state)
    msg = result["messages"][0]

    print("=== RAW MESSAGE OBJECT ===")
    print(msg)
    print("\n=== tool_calls ===")
    print(getattr(msg, "tool_calls", None))
    print("\n=== content (first 1000 chars) ===")
    print(getattr(msg, "content", "")[:1000])

if __name__ == "__main__":
    run_test()