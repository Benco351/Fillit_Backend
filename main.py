from config import OPENAI_API_KEY  # Import the API key
from config import MAX_TOKENS  # Import the max tokens variable
import json
from openai import OpenAI

def lambda_handler(event, context):
    client = OpenAI(api_key=OPENAI_API_KEY)
    print("event = ", event)
    try:
        body = json.loads(event.get('body', '{}'))
        print("body = ", body)
    except json.JSONDecodeError:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON"})}
        
    conversation_history = []
    # Add predefined context to the conversation history
    context_message = {
       "role": "developer", 
       "content": f"You are an AI assistant on a shift management platform. You are limited to {MAX_TOKENS} tokens in your response."
    }
    conversation_history.append(context_message)
    
    user_prompt = body.get('user_prompt')
    if not user_prompt:
        return {"statusCode": 400, "body": json.dumps({"error": "user_prompt is required"})}
    
    conversation_history.append({"role": "user", "content": user_prompt})
    # Truncate only user and assistant messages, keeping the context message
    conversation_history = [context_message] + conversation_history[-5:]
    chat_completion = client.chat.completions.create(
    messages=conversation_history,
    model="gpt-3.5-turbo",
    max_tokens=MAX_TOKENS  # Use the variable here
    )

    ai_reply = chat_completion.choices[0].message.content

    return {
        "statusCode": 200,
        "body": json.dumps({"ai_reply": ai_reply})
    }