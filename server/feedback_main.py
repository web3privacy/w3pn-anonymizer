from __future__ import annotations

import html
import json
import os
import secrets
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse


STORE_PATH = Path(os.environ.get("FEEDBACK_STORE_PATH", "/var/lib/w3pn-anonymizer/feedback.jsonl"))
ADMIN_USER = os.environ.get("FEEDBACK_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.environ.get("FEEDBACK_ADMIN_PASSWORD", "")
MAX_BODY_BYTES = 32_768
MAX_MESSAGE_CHARS = 5_000
MAX_SUBJECT_CHARS = 180
RATE_LIMIT_COUNT = 8
RATE_LIMIT_WINDOW_SECONDS = 600

app = FastAPI(title="W3PN Anonymizer Feedback", docs_url=None, redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["capacitor://localhost", "ionic://localhost"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

rate_limits: dict[str, deque[float]] = defaultdict(deque)


def _clean_text(value: Any, max_chars: int) -> str:
    if not isinstance(value, str):
        return ""
    return " ".join(value.replace("\x00", "").split())[:max_chars]


def _clean_message(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return value.replace("\x00", "").strip()[:MAX_MESSAGE_CHARS]


def _truncate_json(value: Any, max_chars: int) -> Any:
    if isinstance(value, str):
        return value[:max_chars]
    if isinstance(value, dict):
        return {str(k)[:80]: _truncate_json(v, max_chars) for k, v in value.items()}
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return str(value)[:max_chars]


def _read_feedback(limit: int = 500) -> list[dict[str, Any]]:
    if not STORE_PATH.exists():
        return []
    rows: list[dict[str, Any]] = []
    with STORE_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows[-limit:][::-1]


def _enforce_rate_limit(request: Request) -> None:
    forwarded = request.headers.get("x-forwarded-for", "")
    client_key = forwarded.split(",", 1)[0].strip() or (request.client.host if request.client else "unknown")
    now = time.monotonic()
    bucket = rate_limits[client_key]
    while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT_COUNT:
        raise HTTPException(status_code=429, detail="Too many feedback messages. Please try again later.")
    bucket.append(now)


def _require_basic_auth(request: Request) -> None:
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Feedback admin password is not configured.")

    auth = request.headers.get("authorization", "")
    scheme, _, token = auth.partition(" ")
    if scheme.lower() != "basic" or not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={"WWW-Authenticate": 'Basic realm="W3PN Anonymizer Feedback"'},
        )

    import base64

    try:
        decoded = base64.b64decode(token).decode("utf-8")
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid authentication.") from exc

    username, _, password = decoded.partition(":")
    user_ok = secrets.compare_digest(username, ADMIN_USER)
    pass_ok = secrets.compare_digest(password, ADMIN_PASSWORD)
    if not (user_ok and pass_ok):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication.",
            headers={"WWW-Authenticate": 'Basic realm="W3PN Anonymizer Feedback"'},
        )


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/feedback")
async def collect_feedback(request: Request) -> JSONResponse:
    _enforce_rate_limit(request)
    body = await request.body()
    if len(body) > MAX_BODY_BYTES:
        raise HTTPException(status_code=413, detail="Feedback payload is too large.")

    try:
        payload = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON.") from exc

    message = _clean_message(payload.get("message"))
    if len(message) < 2:
        raise HTTPException(status_code=422, detail="Feedback message is required.")

    record = {
        "id": str(uuid.uuid4()),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "subject": _clean_text(payload.get("subject"), MAX_SUBJECT_CHARS) or "No subject",
        "message": message,
        "page": _clean_text(payload.get("page"), 500),
        "userAgent": _clean_text(payload.get("userAgent"), 500),
        "viewport": _truncate_json(payload.get("viewport"), 80),
    }

    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with STORE_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")

    return JSONResponse({"ok": True, "id": record["id"]})


@app.get("/feedback", response_class=HTMLResponse)
async def feedback_admin(request: Request) -> HTMLResponse:
    _require_basic_auth(request)
    rows = _read_feedback()
    items = []
    for item in rows:
        subject = html.escape(str(item.get("subject") or "No subject"))
        message = html.escape(str(item.get("message") or "")).replace("\n", "<br>")
        created = html.escape(str(item.get("createdAt") or ""))
        page = html.escape(str(item.get("page") or ""))
        user_agent = html.escape(str(item.get("userAgent") or ""))
        viewport = html.escape(json.dumps(item.get("viewport") or {}, ensure_ascii=False))
        items.append(
            f"""
            <article class="card">
              <header>
                <h2>{subject}</h2>
                <time>{created}</time>
              </header>
              <p class="message">{message}</p>
              <dl>
                <dt>Page</dt><dd>{page}</dd>
                <dt>Viewport</dt><dd>{viewport}</dd>
                <dt>User agent</dt><dd>{user_agent}</dd>
              </dl>
            </article>
            """
        )

    content = "\n".join(items) or '<p class="empty">No feedback yet.</p>'
    return HTMLResponse(
        f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>W3PN Anonymizer Feedback</title>
  <style>
    :root {{ color-scheme: dark; --accent: #00ff78; --bg: #050605; --panel: #101310; --muted: #8e988f; }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; background: var(--bg); color: #f4f7f3; font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }}
    main {{ width: min(980px, calc(100vw - 32px)); margin: 0 auto; padding: 40px 0 64px; }}
    .top {{ display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }}
    h1 {{ margin: 0; font-size: clamp(28px, 5vw, 54px); letter-spacing: -0.06em; }}
    .count {{ color: #071007; background: var(--accent); border-radius: 999px; padding: 6px 12px; font-weight: 800; }}
    .card {{ border: 1px solid rgba(255,255,255,0.11); background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025)); border-radius: 18px; padding: 20px; margin: 14px 0; }}
    .card header {{ display: flex; justify-content: space-between; align-items: baseline; gap: 18px; }}
    h2 {{ margin: 0; font-size: 18px; color: var(--accent); }}
    time {{ color: var(--muted); font-size: 12px; white-space: nowrap; }}
    .message {{ white-space: normal; font-size: 16px; }}
    dl {{ display: grid; grid-template-columns: 96px 1fr; gap: 6px 12px; margin: 18px 0 0; color: var(--muted); font-size: 12px; word-break: break-word; }}
    dt {{ color: #dce4dd; }}
    .empty {{ color: var(--muted); }}
    a {{ color: var(--accent); }}
  </style>
</head>
<body>
  <main>
    <div class="top">
      <h1>Anonymizer Feedback</h1>
      <span class="count">{len(rows)} messages</span>
    </div>
    {content}
  </main>
</body>
</html>"""
    )


@app.get("/{path:path}")
async def not_found(path: str) -> Response:
    return PlainTextResponse("Not found", status_code=404)
