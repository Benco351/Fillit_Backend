import json
from config import OPENAI_API_KEY, MAX_TOKENS
from openai import OpenAI
from funcs import get_available_shifts
from tailoredUtils import tools, call_function



client = OpenAI(
 api_key=OPENAI_API_KEY)
conversation_history = []



while True:
    user_prompt = input("Enter your prompt (or 'exit' to quit): ")
    if user_prompt.lower() == 'exit':
        break

    input_messages = [
        {
            "role": "developer",
            "content": f"You are an AI assistant on a shift management platform. You are limited to {MAX_TOKENS} tokens in your response."
   
        },
        {"role": "user", "content": user_prompt}
    ]
    
    response = client.responses.create(
        model="gpt-3.5-turbo",
        #instructions=f"You are an AI assistant. You are limited to {MAX_TOKENS} tokens in your response.",
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
        
    
    print(input_messages)

    # Generate a new response with the updated input messages
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input=input_messages,
        tools=tools,
    )

    print("AI:", response.output_text)

