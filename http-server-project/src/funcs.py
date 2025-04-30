import requests
from config import BASE_URL, EMPLOYEE_ID, ADMIN_MODE

import re


def get_assigned_shifts(assigned_employee_id: int = None):
    filtered_params = {}
    if not ADMIN_MODE:
        filtered_params["assigned_employee_id"] = EMPLOYEE_ID 
    if assigned_employee_id and assigned_employee_id != -1:
        filtered_params["assigned_employee_id"] = assigned_employee_id
    try:
        response = requests.get(f"{BASE_URL}/api/assigned-shifts", params=filtered_params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"status": "error", "message": str(e), "data": []}


def get_requested_shifts(request_status: str = None, request_employee_id: int = None):
    filtered_params = {}
    if not ADMIN_MODE:
        filtered_params["request_employee_id"] = EMPLOYEE_ID 
    if request_status and request_status != "all":
        filtered_params["request_status"] =request_status
    if request_employee_id and request_employee_id != -1:
        filtered_params["request_employee_id"] = request_employee_id

    try:
        response = requests.get(f"{BASE_URL}/api/requested-shifts", params=filtered_params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"status": "error", "message": str(e), "data": []}
    

    

def get_available_shifts(
    shift_date: str = None,           # format: YYYY-MM-DD
    shift_start_date: str = None,     # format: YYYY-MM-DD
    shift_end_date: str = None,       # format: YYYY-MM-DD
    shift_start_before: str = None,   # format: HH:mm:ss
    shift_start_after: str = None,    # format: HH:mm:ss
    shift_end_before: str = None,     # format: HH:mm:ss
    shift_end_after: str = None       # format: HH:mm:ss
):
    
    print(f"Shift Date: {shift_date}")
    # Regex patterns for strict format validation
    date_pattern = re.compile(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
    time_pattern = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$")

    def is_valid_date(s): return bool(s and date_pattern.fullmatch(s))
    def is_valid_time(s): return bool(s and time_pattern.fullmatch(s))

    # Original parameters
    params = {
        "shift_date": shift_date,
        "shift_start_date": shift_start_date,
        "shift_end_date": shift_end_date,
        "shift_start_before": shift_start_before,
        "shift_start_after": shift_start_after,
        "shift_end_before": shift_end_before,
        "shift_end_after": shift_end_after
    }

    # Apply strict validation filters
    filtered_params = {}
    for key, value in params.items():
        if value and value != "all":
            if "date" in key and is_valid_date(value):
                filtered_params[key] = value
            elif "before" in key or "after" in key:
                if is_valid_time(value):
                    filtered_params[key] = value

                    
    try:
        response = requests.get(f"{BASE_URL}/api/available-shifts", params=filtered_params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {"status": "error", "message": str(e), "data": []}
    

# Example usage:
if __name__ == "__main__":
    result = get_available_shifts(
        shift_date="2024-04-29",
        shift_start_after="09:00:00",
        shift_end_before="17:00:00"
    )
    print(result.get("data", []))  # Print the available shifts or an empty list if none are found
