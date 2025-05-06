from config import OPENAI_API_KEY  # Import the API key
from config import MAX_TOKENS, MAX_HISTORY_LEN  # Import the max tokens variable
import json
from openai import OpenAI
from tailoredUtils import tools, call_function
from collections import deque  # Import deque for maintaining a fixed-size history

# Initialize a deque with a maximum size of 5 to store the last 5 messages
message_history = deque(maxlen=MAX_HISTORY_LEN)

def main(event):
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    print("event = ", event)
    
    user_prompt = event.get('user_prompt')
    if not user_prompt:
        return json.dumps({"error": "user_prompt is required"})
        
    # Add the user prompt to the message history
    message_history.append({"role": "user", "content": user_prompt})
    
    # Prepare input messages from the message history
    input_messages = list(message_history)
    input_messages.insert(0, {
        "role": "developer",
        "content": f"You are an AI assistant on a shift management platform. You are limited to {MAX_TOKENS} tokens in your response."
    })
    
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input=input_messages,
        tools=tools,
    )

    for tool_call in response.output:
        if tool_call.type != "function_call":
            continue

        name = tool_call.name
        args = json.loads(tool_call.arguments)
        
        result = call_function(name, args)
        message_history.append(tool_call)  # Append model's function call message
        message_history.append({
            "type": "function_call_output",
            "call_id": tool_call.call_id,
            "output": str(result)
        })
        
    # Generate a new response with the updated message history
    input_messages = list(message_history)
    input_messages.insert(0, {
        "role": "developer",
        "content": f"You are an AI assistant on a shift management platform. You are limited to {MAX_TOKENS} tokens in your response."
    })
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input=input_messages,
        tools=tools,
    )

    ai_reply = response.output_text
    
    # Add the AI's reply to the message history
    message_history.append({"role": "assistant", "content": ai_reply})

    return json.dumps({"ai_reply": ai_reply})