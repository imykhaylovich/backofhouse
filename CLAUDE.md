# BackOfHouse — Multi-Tenant Food Business Management Portal

## What this is
A SaaS platform for cafes, restaurants, and nonprofits to manage
inventory, orders, donations, distributions, and reporting.
Claude is built in as a live chat assistant and weekly report generator.

## Stack
- Backend: Python 3.11, FastAPI, SQLAlchemy (MySQL)
- Auth: JWT (python-jose), bcrypt
- Frontend: React + Tailwind CSS (Vite)
- AI: Anthropic Claude API
- Email: SendGrid

## Multi-tenancy rules (critical)
- Every table has an org_id column
- Every API route extracts org_id from the JWT token
- Every DB query MUST filter by org_id — no exceptions
- Never expose one org's data to another

## Org types
- nonprofit → free plan, uses donations + distributions
- cafe / restaurant → paid plan, uses orders

## Key business logic
- Donations auto-increment inventory quantity
- Distributions auto-decrement (never below 0, raise 400)
- Orders auto-adjust inventory on fulfillment
- Weekly reports run every Sunday 8AM via APSchedule- Weekly reports run every Sunday 8AM via APSchedule- Weekivate
2. Set .env: ANT2. Set .env: ANT2. Set .env: ANT2. Set .env: ANT2. Set .env: AN main:app --reload
4. cd frontend && npm run dev
