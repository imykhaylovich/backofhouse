@router.post("/register", response_model=schemas.Token)
def register(org_data: schemas.OrganizationCreate, user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if email is already taken
    existing_org = db.query(models.Organization).filter(models.Organization.email == org_data.email).first()
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization email already registered")

    # Create the organization
    new_org = models.Organization(
        name=org_data.name,
        type=org_data.type,
        email=org_data.email,
        city=org_data.city,
        state=org_data.state,
    )
    db.add(new_org)
    db.commit()
    db.refresh(new_org)

    # Create the admin user, hash their password
    new_user = models.User(
        org_id=new_org.id,
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="admin",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Build and return the token
    token = create_token({"user_id": new_user.id, "org_id": new_org.id})
    return {"access_token": token, "token_type": "bearer"}