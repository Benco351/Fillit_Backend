"""
coretest.py  – interactive local harness

⚑  Runs the same two-pass conversation loop used in the Lambda handler
   but from your terminal, honouring run-time overrides for
   `employee_id`, `admin_mode`, and `jwt_token`.

Usage examples
--------------
$ python coretest.py                               # env-only defaults
$ python coretest.py --employee-id 7               # override employee
$ python coretest.py --admin                       # admin mode on
$ python coretest.py --jwt-token eyJhbGciOiJIUzI1...

Press ⏎ to start typing prompts, or just type **exit** to quit.
"""
from __future__ import annotations

import argparse
import json
import logging
from typing import Any, Dict, List

from openai import OpenAI

from config import Config
from tailored_utils import call_function, select_tools

# --------------------------------------------------------------------------- #
#  logging
# --------------------------------------------------------------------------- #
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# --------------------------------------------------------------------------- #
#  command-line arguments
# --------------------------------------------------------------------------- #
parser = argparse.ArgumentParser(description="Local GPT-assistant test harness")
parser.add_argument("--employee-id", type=int, help="override employee ID")
parser.add_argument("--admin", action="store_true", help="enable admin mode")
parser.add_argument("--jwt-token", help="JWT bearer token")
args = parser.parse_args()

# --------------------------------------------------------------------------- #
#  runtime Config
# --------------------------------------------------------------------------- #
config = Config.from_env().override(
    employee_id=args.employee_id if args.employee_id is not None else None,
    admin_mode=args.admin if args.admin else None,
    jwt_token=args.jwt_token or "",
)

logger.info("Running with config: %s", config)

# --------------------------------------------------------------------------- #
#  OpenAI client and tool schema
# --------------------------------------------------------------------------- #
client = OpenAI(api_key=config.openai_api_key)
tools_schema = select_tools(config)

# Conversation state (persists across turns)
messages: List[Dict[str, Any]] = [
    {
        "role": "developer",
        "content": (
            "You are an AI assistant on a shift-management platform. "
            f"You are limited to {config.max_tokens} tokens in your response."
        ),
    }
]

print("Interactive assistant ready. Type 'exit' to quit.\n")

while True:
    user_prompt = input("You: ").strip()
    if user_prompt.lower() == "exit":
        break
    if not user_prompt:
        continue

    # add user message to history
    messages.append({"role": "user", "content": user_prompt})

    # ---------- 1st pass --------------------------------------------------- #
    first = client.responses.create(
        model="gpt-3.5-turbo",
        input=messages,
        tools=tools_schema,
    )

    # handle any function calls requested by the model
    for tool_call in first.output:
        if tool_call.type != "function_call":
            continue

        func_name = tool_call.name
        func_args = json.loads(tool_call.arguments)

        logger.info("→ calling %s(%s)", func_name, func_args)
        result = call_function(config, func_name, func_args)
        logger.info("← result: %s", result)

        # add the function-call exchange to history
        messages.append(tool_call)
        messages.append(
            {
                "type": "function_call_output",
                "call_id": tool_call.call_id,
                "output": json.dumps(result),
            }
        )

    # ---------- 2nd pass --------------------------------------------------- #
    final = client.responses.create(
        model="gpt-3.5-turbo",
        input=messages,
        previous_response_id=first.id,
    )

    reply_text = final.output_text
    print(f"AI: {reply_text}\n")

    # append assistant’s natural language reply for continuity
    messages.append({"role": "assistant", "content": reply_text})
