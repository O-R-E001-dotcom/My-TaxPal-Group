from tools import tools, assistant, should_continue
from langgraph.graph import START, END, StateGraph, MessagesState
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
from loader import set_apikey

# Load API key
api_key = set_apikey()
if not api_key:
    raise ValueError("OPENAI_API_KEY not found! Please set it in your .env file.")


def build_graph():
    builder = StateGraph(MessagesState)

    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(tools))
    
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges(
        'assistant',
        should_continue,
        {'tools': 'tools', '__end__': END},
    )
    builder.add_edge('tools', 'assistant')

    # Add memory
    memory = MemorySaver()
    agent = builder.compile(checkpointer=memory)
   
    return agent

