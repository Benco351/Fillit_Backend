from __future__ import annotations
import json
import logging
from typing import Dict, Any

from openai import OpenAI
from config import Config
from tailored_utils import call_function, select_tools

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def _parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """Return body as dict, whether provided raw or already parsed."""
    body_raw = event.get("body", "")
    if not body_raw:
        return event  # direct-invoke path
    try:
        return json.loads(body_raw)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON payload") from exc


def lambda_handler(event: Dict[str, Any], context):  # noqa: ANN001
    try:
        body = _parse_body(event)
    except ValueError as err:
        return {"statusCode": 400, "body": json.dumps({"error": str(err)})}

    # -------------------- build runtime Config --------------------
    base_conf = Config.from_env()

    overrides = {}
    if "employee_id" in body:
        overrides["employee_id"] = int(body["employee_id"])
    if "admin_mode" in body:
        overrides["admin_mode"] = str(body["admin_mode"]).lower() == "true"
    jwt_token = body.get("jwt_token", "")
    if jwt_token:
        overrides["jwt_token"] = jwt_token

    config = base_conf.override(**overrides)

    # -------------------- security: referer check -----------------
    referer = event.get("headers", {}).get("referer", "")
    if referer != f"{config.base_url}/":
        return {"statusCode": 403, "body": json.dumps({"error": "Access denied"})}

    # -------------------- user prompt validation -----------------
    user_prompt = body.get("user_prompt", "").strip()
    if not user_prompt:
        return {"statusCode": 400,
                "body": json.dumps({"error": "user_prompt is required"})}

    # -------------------- OpenAI conversation messages -----------
    messages = [
        {
            "role": "developer",
            "content": (
                "You are an AI assistant on a shift-management platform. "
                f"You are limited to {config.max_tokens} tokens in your response."
            ),
        },
        {"role": "user", "content": user_prompt},
    ]

    client = OpenAI(api_key=config.openai_api_key)
    tools_schema = select_tools(config)

    # ----------- 1st pass: allow model to call a function --------
    logger.info("Sending messages to OpenAI (1st pass)")
    first = client.responses.create(
        model="gpt-3.5-turbo",
        input=messages,
        tools=tools_schema,
    )
    logger.info("OpenAI first response: %s", first)

    # Handle any function tool calls
    for tool_call in first.output:
        if tool_call.type != "function_call":
            continue

        func_name = tool_call.name
        func_args = json.loads(tool_call.arguments)
        logger.info("Executing: %s(%s)", func_name, func_args)

        result = call_function(config, func_name, func_args)
        logger.info("Function result: %s", result)

        messages.append(tool_call)  # the call itself
        messages.append({
            "type": "function_call_output",
            "call_id": tool_call.call_id,
            "output": json.dumps(result),
        })

    # ------------ 2nd pass: get final assistant message ----------
    logger.info("Sending messages to OpenAI (2nd pass)")
    final = client.responses.create(
        model="gpt-3.5-turbo",
        input=messages,
        previous_response_id=first.id,
    )
    logger.info("OpenAI final response: %s", final)

    return {
        "statusCode": 200,
        "body": json.dumps({"ai_reply": final.output_text}),
    }
