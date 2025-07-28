#!/usr/bin/env python3
"""
Start the server with proper email configuration
"""
import os
import sys

# Set the email password directly
os.environ["EMAIL_PASS"] = "vlvfbbzcywjotfkl"

# Verify it's set
print(f"EMAIL_PASS set to: {os.environ.get('EMAIL_PASS', 'NOT SET')}")
print(f"Length: {len(os.environ.get('EMAIL_PASS', ''))}")

# Now start the server
if __name__ == "__main__":
    from app.main import app
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)