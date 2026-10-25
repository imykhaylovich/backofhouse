import anthropic
import os
from dotenv import load_dotenv
from datetime import date, timedelta

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

import models
def get_org_data(db,org_id):
    inventories=db.query(models.Inventory).filter( 
        #grabs only this org's inventory rows from MySQL
        models.Inventory.org_id==org_id).all()
    lines=[] #empty list that'll collect one text line per item
    for inventory in inventories:
        lines.append(f"- {inventory.name}: {inventory.quantity} {inventory.unit} (low below {inventory.low_threshold})")
    if not lines:
        return "No inventory items yet."
    return "\n".join(lines)
        # glues all lines into one text block; sits 
        #outside the loop so it runs once after every item is processed

def chat_with_claude(db,org,user_message):
    inventory_data=get_org_data(db,org.id)
    system_prompt=f"""You are assistant for {org.name}, a {org.type}.
    Their current inventory is {inventory_data}
    Answer questions clearly. The user is not technical."""
    response=client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )
    return response.content[0].text

    # chat_with_claude
#
# Lets a manager ask questions about their business in plain English and get
# answers grounded in their own live data. This is a lightweight RAG pattern:
# 1. Retrieve — pull this org's inventory from MySQL, scoped by org_id so one
#    org can never see another's data through the AI
# 2. Inject — build a system prompt containing that data plus instructions on
#    who Claude is and how to respond
# 3. Call — send the system prompt and the user's question to the Claude API
# 4. Extract — pull the text out of Claude's structured response
# No fine-tuning needed: data is fetched fresh at request time, so answers
# always reflect current inventory.

def generate_weekly_report(db,org):
    week_end=date.today()
    week_start=week_end-timedelta(days=7)
    inventory_data = get_org_data(db, org.id)

    donations = db.query(models.Donation).filter(
        models.Donation.org_id == org.id,
        models.Donation.donated_at >= week_start
    ).all()

    distributions = db.query(models.Distribution).filter(
        models.Distribution.org_id == org.id,
        models.Distribution.distributed_at >= week_start
    ).all()

    donation_units = sum(d.quantity for d in donations)
    households = sum(d.recipient_count or 0 for d in distributions)
    prompt = f"""Write a short weekly operations summary for {org.name}, a {org.type}.

Week of {week_start} to {week_end}.

Current inventory:
{inventory_data}

This week's activity:
- {len(donations)} donations logged, {donation_units} units received
- {len(distributions)} distributions, {households} households served

Keep it under 250 words, plain English, for a manager who is not technical.
Cover: overall status, what needs restocking, and 2-3 action items for next week."""
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    report_text = response.content[0].text
    report = models.WeeklyReport(
        org_id=org.id,
        week_start=week_start,
        week_end=week_end,
        report_text=report_text,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report