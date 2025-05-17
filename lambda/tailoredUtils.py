from funcs import get_available_shifts, get_requested_shifts, get_assigned_shifts
from config import ADMIN_MODE

def call_function(name, args):
    if name == "get_available_shifts":
        return get_available_shifts(**args).get("data", [])
    elif name == "get_requested_shifts":
        return get_requested_shifts(**args).get("data", [])
    elif name == "get_assigned_shifts":
        return get_assigned_shifts(**args).get("data", [])
    else:
        raise ValueError(f"Function {name} not recognized.")



available_tool = {
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
}

requested_tool = {
  "type": "function",
  "name": "get_requested_shifts",
  "description": "Query the database for requested shift slots based on optional filtering by request status.",
  "parameters": {
    "type": "object",
    "properties": {
      "request_status": {
        "type": "string",
        "enum": ["pending", "approved", "denied", "all"],
        "description": "whatever the status of the request is, it can be pending, approved or denied, pass 'all' to include all."
      }    
      },
    "required": [
        "request_status"
        
    ],
    "additionalProperties": False
  },
  "strict": True
}

requested_tool_admin = {
  "type": "function",
  "name": "get_requested_shifts",
  "description": "Query the database for requested shift slots based on optional filtering by request status and employee id.",
  "parameters": {
    "type": "object",
    "properties": {
      "request_status": {
        "type": "string",
        "enum": ["pending", "approved", "denied", "all"],
        "description": "whatever the status of the request is, it can be pending, approved or denied, pass 'all' to include all."
      },
      "request_employee_id": {
        "type": "integer",
        "description": "The ID of the employee making the request, pass -1 to include all employees."
      },
      },
    "required": [
        "request_status",
        "request_employee_id"
        
    ],
    "additionalProperties": False
  },
  "strict": True
}

assigned_tool_admin = {
  "type": "function",
  "name": "get_assigned_shifts",
  "description": "Query the database for assigned shift slots, optionally filtered by employee ID.",
  "parameters": {
    "type": "object",
    "properties": {
      "assigned_employee_id": {
        "type": "integer",
        "description": "The ID of the employee that his assigned shifts we want to see, pass -1 to include all employees."
      },
      },
    "required": [
        "assigned_employee_id"
        
    ],
    "additionalProperties": False
  },
  "strict": True
}

assigned_tool = {
  "type": "function",
  "name": "get_assigned_shifts",
  "description": "Query the database for assigned shift slots"
}

if ADMIN_MODE:
    # If in admin mode, include the requested_tool_admin
    tools = [available_tool, requested_tool_admin, assigned_tool_admin ]
else:
  #tools = [available_tool, requested_tool]
    tools =  [available_tool, requested_tool, assigned_tool]


