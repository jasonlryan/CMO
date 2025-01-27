import os
from dotenv import load_dotenv
from supabase import create_client, Client

# After load_dotenv()
required_env_vars = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Add after OpenAI setup
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
) 