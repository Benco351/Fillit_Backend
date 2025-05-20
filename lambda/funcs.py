from __future__ import annotations
import requests
import re
from typing import Any, Dict, List

from config import Config


def _auth_header(config: Config) -> Dict[str, str]:
    return {"Authorization": f"Bearer {config.jwt_token}"} if config.jwt_token else {}


def get_assigned_shifts(config: Config, assigned_employee_id: int | None = None) -> List[Dict[str, Any]]:
    params: Dict[str, Any] = {}

    if not config.admin_mode:
        params["assigned_employee_id"] = config.employee_id

    if assigned_employee_id is not None and assigned_employee_id != -1:
        params["assigned_employee_id"] = assigned_employee_id

    try:
        resp = requests.get(f"{config.base_url}/api/assigned-shifts",
                            params=params, headers=_auth_header(config))
        resp.raise_for_status()
        return resp.json().get("data", [])
    except requests.RequestException as exc:
        return [{"status": "error", "message": str(exc)}]


def get_requested_shifts(config: Config,
                         request_status: str | None = None,
                         request_employee_id: int | None = None) -> List[Dict[str, Any]]:
    params: Dict[str, Any] = {}

    if not config.admin_mode:
        params["request_employee_id"] = config.employee_id

    if request_status and request_status != "all":
        params["request_status"] = request_status

    if request_employee_id is not None and request_employee_id != -1:
        params["request_employee_id"] = request_employee_id

    try:
        resp = requests.get(f"{config.base_url}/api/requested-shifts",
                            params=params, headers=_auth_header(config))
        resp.raise_for_status()
        return resp.json().get("data", [])
    except requests.RequestException as exc:
        return [{"status": "error", "message": str(exc)}]


def get_available_shifts(
    config: Config,
    shift_date: str | None = None,
    shift_start_date: str | None = None,
    shift_end_date: str | None = None,
    shift_start_before: str | None = None,
    shift_start_after: str | None = None,
    shift_end_before: str | None = None,
    shift_end_after: str | None = None
) -> List[Dict[str, Any]]:
    # Strict format validation
    date_re = re.compile(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
    time_re = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$")

    def ok_date(v: str | None) -> bool: return bool(v and date_re.fullmatch(v))
    def ok_time(v: str | None) -> bool: return bool(v and time_re.fullmatch(v))

    raw_params = dict(
        shift_date=shift_date,
        shift_start_date=shift_start_date,
        shift_end_date=shift_end_date,
        shift_start_before=shift_start_before,
        shift_start_after=shift_start_after,
        shift_end_before=shift_end_before,
        shift_end_after=shift_end_after
    )
    params = {
        k: v for k, v in raw_params.items()
        if v and v != "all" and (
            ("date" in k and ok_date(v)) or
            (("before" in k or "after" in k) and ok_time(v))
        )
    }

    try:
        resp = requests.get(f"{config.base_url}/api/available-shifts",
                            params=params, headers=_auth_header(config))
        resp.raise_for_status()
        return resp.json().get("data", [])
    except requests.RequestException as exc:
        return [{"status": "error", "message": str(exc)}]
