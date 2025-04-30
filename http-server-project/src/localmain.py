from config import OPENAI_API_KEY  # Import the API key
from config import MAX_TOKENS  # Import the max tokens variable
import json
from openai import OpenAI
from tailoredUtils import tools, call_function

def main(event):
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    print("event = ", event)
    
    user_prompt = event.get('user_prompt')
    if not user_prompt:
        return json.dumps({"error": "user_prompt is required"})
        
    input_messages = [
        {
            "role": "developer",
            "content": f"You are an AI assistant on a shift management platform. You are limited to {MAX_TOKENS} tokens in your response."
        },
        {"role": "user", "content": user_prompt}
    ]
    
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
        input_messages.append(tool_call)  # append model's function call message
        input_messages.append({
            "type": "function_call_output",
            "call_id": tool_call.call_id,
            "output": str(result)
        })
        
    # Generate a new response with the updated input messages
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input=input_messages,
        tools=tools,
    )

    ai_reply = response.output_text

    return json.dumps({"ai_reply": ai_reply})