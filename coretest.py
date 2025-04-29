import json
from config import OPENAI_API_KEY, MAX_TOKENS
from openai import OpenAI
from funcs import get_available_shifts


client = OpenAI(
 api_key=OPENAI_API_KEY)
conversation_history = []

def call_function(name, args):
    if name == "get_available_shifts":
        return get_available_shifts(**args)
    else:
        raise ValueError(f"Function {name} not recognized.")




tools = [{
  "type": "function",
  "name": "get_available_shifts",
  "description": "Query the database for available shift slots based on optional filtering by date and time ranges.",
  "parameters": {
    "type": "object",
    "properties": {
      "shift_date": {
        "type": "string",
        "description": "Exact date of the shift to retrieve (format: YYYY-MM-DD), or 'all' to include all shifts."
      },
      "shift_start_date": {
        "type": "string",
        "description": "Earliest date to consider for the start of a shift (format: YYYY-MM-DD), or 'all' to include all shifts."
      },
      "shift_end_date": {
        "type": "string",
        "description": "Latest date to consider for the end of a shift (format: YYYY-MM-DD), or 'all' to include all shifts."
      },
      "shift_start_before": {
        "type": "string",
        "description": "Only include shifts that start before this time (format: HH:mm:ss), or 'all' to include all shifts."
      },
      "shift_start_after": {
        "type": "string",
        "description": "Only include shifts that start after this time (format: HH:mm:ss), or 'all' to include all shifts."
      },
      "shift_end_before": {
        "type": "string",
        "description": "Only include shifts that end before this time (format: HH:mm:ss), or 'all' to include all shifts."
      },
      "shift_end_after": {
        "type": "string",
        "description": "Only include shifts that end after this time (format: HH:mm:ss), or 'all' to include all shifts."
      }
    },
    "required": [
        "shift_date",
        "shift_start_date",
        "shift_end_date",
        "shift_start_before",
        "shift_start_after",
        "shift_end_before",
        "shift_end_after"
    ],
    "additionalProperties": False
  },
  "strict": True
}]




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

