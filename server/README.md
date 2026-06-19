# W3PN Anonymizer Feedback Server

Small FastAPI service used by the production nginx host to collect anonymous feedback from the app.

## Routes

- `POST /api/feedback` stores anonymous feedback in JSONL.
- `GET /feedback` shows a password-protected admin page.
- `GET /healthz` returns service health.

## Environment

- `FEEDBACK_STORE_PATH`: JSONL file path. Defaults to `/var/lib/w3pn-anonymizer/feedback.jsonl`.
- `FEEDBACK_ADMIN_USER`: Basic Auth username. Defaults to `admin`.
- `FEEDBACK_ADMIN_PASSWORD`: Basic Auth password. Required for `/feedback`.

## Run Locally

```bash
uvicorn feedback_main:app --host 127.0.0.1 --port 7866 --reload
```
