import json
import os
import logging
from openai import OpenAI
from tailoredUtils import tools, call_function
import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    # Initialize per-invocation response ID
    current_response_id = None

    # 1) Parse and validate the JSON body string
    body_str = event.get("body", "")
    if not body_str:
        # If no body, treat event itself as the body
        body = event
    else:
        try:
            body = json.loads(body_str)
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid JSON payload"})
            }

    # 2) Extract optional configuration overrides
    if "employee_id" in body:
        config.EMPLOYEE_ID = body["employee_id"]
    if "admin_mode" in body:
        config.ADMIN_MODE = body["admin_mode"]
    if "jwt_token" in body and body["jwt_token"]:
        print(f"JWT token from body: {body['jwt_token']}")
        config.JWT_TOKEN = body["jwt_token"]
        print(f"JWT token set to: {config.JWT_TOKEN}")

    # # 3) Optional Referer header check (CORS protection)
    # referer = event.get("headers", {}).get("referer")
    # if (referer != f"{config.BASE_URL}/"):
    #     return {
    #         "statusCode": 403,
    #         "body": json.dumps({"error": "Access denied"})
    #     }

    # 4) Extract the user prompt
    user_prompt = body.get("user_prompt")
    if not user_prompt:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "user_prompt is required"})
        }

    # 5) Build the message array for OpenAI
    input_messages = [
        {
            "role": "developer",
            "content": (
                f"You are an AI assistant on a shift management platform. "
                f"You are limited to {config.MAX_TOKENS} tokens in your response."
            )
        },
        {"role": "user", "content": user_prompt}
    ]

    # 6) First call to OpenAI for potential function calls
    client = OpenAI(api_key=config.OPENAI_API_KEY)
    logger.info(f"Sending messages to OpenAI: {input_messages}")
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input=input_messages,
        tools=tools
    )
    logger.info(f"OpenAI initial response: {response}")

    # 7) Process any function calls returned
    for tool_call in response.output:
        if tool_call.type != "function_call":
            continue

        name = tool_call.name
        args = json.loads(tool_call.arguments)
        logger.info(f"Tool call: {name} with args: {args}")
        result = call_function(name, args)
        logger.info(f"Function result: {result}")

        # Append the function call and its output to context
        input_messages.append(tool_call)
        input_messages.append({
            "type": "function_call_output",
            "call_id": tool_call.call_id,
            "output": str(result)
        })

    # 8) Second call to OpenAI to get the final AI reply
    response = client.responses.create(
        model="gpt-3.5-turbo",
        input=input_messages,
        previous_response_id=current_response_id
    )
    current_response_id = response.id

    logger.info(f"OpenAI final response: {response}")

    ai_reply = response.output_text

    # 9) Return the AI reply as JSON
    return {
        "statusCode": 200,
        "body": json.dumps({"ai_reply": ai_reply})
    }
