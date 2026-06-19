from passlib.context import CryptContext

# pwd_context is our password hashing tool
# bcrypt is the algorithm it uses to scramble passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Takes a plain text password and turns it into a scrambled hash
# We store this hash in the database, never the real password
def hash_password(password: str):
    return pwd_context.hash(password)


# Checks if a plain text password matches a stored hash
# Used during login: compare what they typed vs what's saved
def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)


from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

# Pulled from .env — used to sign and verify JWT tokens
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")


# Creates a JWT token after a successful login
# "data" usually contains the user_id and org_id
# The token expires after 24 hours for security
def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from database import get_db
import models

# Tells FastAPI where the login endpoint lives
# This is what powers the "Authorize" button in the Swagger docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# Runs on every protected route to figure out WHO is making the request
# 1. Grabs the JWT token from the request
# 2. Decodes it using our SECRET_KEY
# 3. Pulls the user_id out of the token
# 4. Looks that user up in the database
# 5. Returns the user object, or throws a 401 error if anything fails
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user