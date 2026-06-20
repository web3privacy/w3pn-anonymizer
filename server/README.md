# W3PN Anonymizer Feedback Server

Small FastAPI service used by the production nginx host to collect anonymous feedback from the app.

It receives subject/message plus basic page, viewport, and user-agent metadata. It never receives photos, video, audio, document content, detection output, or exported files.

## Routes

- `POST /api/feedback` stores anonymous feedback in JSONL.
- `GET /feedback` shows a password-protected admin page.
- `GET /healthz` returns service health.

## Environment

- `FEEDBACK_STORE_PATH`: JSONL file path. Defaults to `/var/lib/w3pn-anonymizer/feedback.jsonl`.
- `FEEDBACK_ADMIN_USER`: Basic Auth username. Defaults to `admin`.
- `FEEDBACK_ADMIN_PASSWORD`: Basic Auth password. Required for `/feedback`.

Requests are capped at 32 KiB, messages at 5,000 characters, and rate-limited per client to 8 submissions per 10 minutes. CORS permits only the Capacitor/Ionic local schemes; the web app uses the same-origin route.

## Run Locally

```bash
uvicorn feedback_main:app --host 127.0.0.1 --port 7866 --reload
```
