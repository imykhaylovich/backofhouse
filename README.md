# backofhouse


Multi-tenant management platform for cafés, restaurants, and food pantries —
inventory, orders, donations, and an AI assistant that answers questions about
your live data.

**Live demo:** https://backofhouse3.netlify.app
**API:** https://backofhouse.onrender.com/docs

> Note: the API is on a free tier and sleeps when idle — the first request may take ~50 seconds.

---

## Installing necessary packages

### Backend
```bash
pip install fastapi
pip install "uvicorn[standard]"
pip install sqlalchemy
pip install pymysql
pip install python-dotenv
pip install anthropic
pip install apscheduler
pip install "python-jose[cryptography]"
pip install bcrypt
pip install pydantic
pip install sendgrid
```

### Frontend
```bash
npm install
```

---

## Setup

Create a `.env` file in the root and add your keys: