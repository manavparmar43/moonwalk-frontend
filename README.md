# MoonWalk Frontend

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Edit `frontend/.env`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_SECRET_KEY="<same value as backend's SECRET_KEY>"
```

`NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL` are only needed if the backend runs somewhere other than `localhost:4000`. `NEXT_PUBLIC_SECRET_KEY` must exactly match the backend's `SECRET_KEY` — it's used to encrypt the login payload and is required for login to work.

## 3. Start the server

```bash
npm run dev
```

Requires the backend API and Postgres to already be running (see `../backend/README.md`). Visit `http://localhost:3000`.
