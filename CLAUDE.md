## Team split

### Ivan — backend (owns everything in /backend)
Week 1:
- database.py → MySQL connection + SQLAlchemy setup
- models.py → all table definitions
- main.py → FastAPI app + CORS + router includes
- auth.py → JWT + bcrypt helpers
- routers/auth.py → register + login endpoints
- schemas.py → Pydantic request/response models

Week 2:
- routers/inventory.py → CRUD endpoints
- routers/orders.py → cafe/restaurant orders
- routers/donations.py → nonprofit donations
- routers/distributions.py → nonprofit distributions

Week 3:
- services/claude_service.py → Claude API integration
- routers/claude.py → chat endpoint
- services/email_service.py → SendGrid setup
- scheduler.py → weekly report cron job
- routers/reports.py → report endpoints

Week 4:
- Bug fixes, testing all endpoints via /docs
- Help Dima connect frontend to API

---

### Dima — frontend (owns everything in /frontend)
Week 1:
- Set up React project structure
- Create pages: Login.jsx, Register.jsx
- Set up react-router-dom routing
- Set up axios for API calls

Week 2:
- Onboarding.jsx → questionnaire after first login
- Dashboard.jsx → main dashboard (org-type aware)
- Inventory.jsx → inventory table + add/edit forms

Week 3:
- Orders.jsx → for cafes/restaurants
- Donations.jsx → for nonprofits
- Distributions.jsx → for nonprofits
- Reports.jsx → view weekly reports

Week 4:
- AskClaude.jsx → chat interface with Claude
- Low stock alerts component
- Polish UI, test full user flows

---

## Rule
Ivan pushes backend changes, Dima pulls and builds UI on top.
Never edit the other person's folder.
Always git pull before starting a session.