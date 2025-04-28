import json
from config import OPENAI_API_KEY
from config import MAX_TOKENS  # Import the max tokens variable
from openai import OpenAI

client = OpenAI(
 api_key=OPENAI_API_KEY)
conversation_history = []

def call_function(name, args):
    if name == "test_func":
        return test_func(args["word"])
    else:
        raise ValueError(f"Function {name} not recognized.")

def test_func(word: str) -> str:
    """Function to reverse a string."""
    print(f"Reversing the word: {word}...")
    return word[::-1]



tools = [{
    "type": "function",
    "name": "test_func",
    "description": "reverse a string",
    "parameters": {
        "type": "object",
        "properties": {
            "word": {
                "type": "string",
                "description": "word to be reveresed"
            }
        },
        "required": [
            "word"
        ],
        "additionalProperties": False    
    },
    "strict": True,  # Ensure strict validation of parameters
   
}]

while True:
    user_prompt = input("Enter your prompt (or 'exit' to quit): ")
    if user_prompt.lower() == 'exit':
        break

    input_messages = [
        {
            "role": "system",
            "content": f"You are an AI assistant. You are limited to {MAX_TOKENS} tokens in your response."
        },
        {"role": "user", "content": user_prompt}
    ]
    
    response = client.responses.create(
        model="gpt-3.5-turbo",
        instructions=f"You are an AI assistant. You are limited to {MAX_TOKENS} tokens in your response.",
        input=user_prompt,
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

