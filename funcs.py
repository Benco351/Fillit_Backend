import requests
from config import BASE_URL

def get_available_shifts(
    shift_date: str = None,           # format: YYYY-MM-DD
    shift_start_date: str = None,     # format: YYYY-MM-DD
    shift_end_date: str = None,       # format: YYYY-MM-DD
    shift_start_before: str = None,   # format: HH:mm:ss
    shift_start_after: str = None,    # format: HH:mm:ss
    shift_end_before: str = None,     # format: HH:mm:ss
    shift_end_after: str = None       # format: HH:mm:ss
):
    params = {
        "shift_date": shift_date,
        "shift_start_date": shift_start_date,
        "shift_end_date": shift_end_date,
        "shift_start_before": shift_start_before,
        "shift_start_after": shift_start_after,
        "shift_end_before": shift_end_before,
        "shift_end_after": shift_end_after
    }

    # Remove any parameters that are None
    filtered_params = {k: v for k, v in params.items() if v is not None and v != "all"}

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
