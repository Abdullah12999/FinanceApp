import os
import re
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Load environment variables from the .env file at the project root
load_dotenv()

# Lazily initialized globals to avoid import-time failures
llm = None
db = None

# Vector DB constants
VECTOR_DB_PATH = 'backend/vectorDB'
COLLECTION_NAME = 'pakistan_products'

def ensure_resources():
    """Initialize LLM and Vector DB if needed, using environment variables.
    Raises a descriptive error if OPENAI_API_KEY is missing.
    """
    global llm, db
    if llm is not None and db is not None:
        return llm, db

    from langchain_community.vectorstores import Chroma
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set. Add it to a .env file or environment.")

    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7, openai_api_key=openai_api_key)
    db = Chroma(
        persist_directory=VECTOR_DB_PATH,
        embedding_function=OpenAIEmbeddings(openai_api_key=openai_api_key),
        collection_name=COLLECTION_NAME,
    )
    return llm, db

# --- Exact Word Search Helper ---
def get_matching_products(expense_text, db, top_k=1):
    """
    Search the vector DB for exact keyword matches based on words from the user's expense.
    Returns concatenated context string of matches.
    """
    matches = []
    words = re.findall(r"[A-Za-z]+", expense_text.lower())

    seen = set()
    for word in words:
        if word not in seen:
            seen.add(word)
            res = db.similarity_search(word, k=top_k)
            if res:
                matches.extend(res)

    return "\n".join([doc.page_content for doc in matches])

# --- Financial Advice Generator ---
def generate_financial_advice(user_expenses_summary, llm, db):
    context = get_matching_products(user_expenses_summary, db, top_k=1)

    custom_template = """
You are a professional financial advisor from Pakistan.

Your goal is to give realistic, human-like money-saving advice using ONLY the provided product data when it exists, 
and only fall back to market/web knowledge if no match is found.

Your answer must be one continuous conversational paragraph, not a bullet list.

---
FEW-SHOT EXAMPLES

Example 1 (MATCH FOUND):
User's Expenses:
Rice, 1000g, 400 PKR

Provided Products:
Basmati Rice, 1000g, 300 PKR

Expected Response:
You paid 400 PKR for 1000 grams of rice, but a similar product in our records costs 300 PKR for the same weight — meaning you overpaid by 100 PKR. Opting for the cheaper option could help you save without compromising quality.

Example 2 (NO MATCH — FALLBACK):
User's Expenses:
Mango Juice, 1 liter, 250 PKR

Provided Products:
(No matching product)

Expected Response:
In the Pakistani market, good quality mango juice typically sells for around 200 PKR per liter. By choosing a more competitively priced brand, you could potentially save about 50 PKR while still enjoying a refreshing drink.

---
STEPS FOR YOUR RESPONSE:
1. Identify Match: For each item in the user's expenses, look for the closest product in "Provided Products" that matches the same category and is most similar in description.
2. Quantity Matching: Convert both user quantity and provided product quantity into the same units (grams, liters, or pieces) before comparison.
3. Direct Price Comparison:
   - If a matching product exists in "Provided Products", use its price and quantity ONLY for the comparison.
   - Calculate the price for the same quantity as the user bought, then show:
     “You paid X PKR for Y grams, but a similar product costs Z PKR for Y grams — saving W PKR.”
   - If the user's item is cheaper, praise their choice and state no savings.
4. Fallback to Market Knowledge: If no match exists in "Provided Products", then and only then use Pakistani market knowledge or web search to suggest a realistic alternative.
5. Single Response: Write a single, professional, and encouraging message combining all items’ analysis.
6. Savings Summary: End with the total potential savings in PKR.

---
User's Expenses:
{question}

Provided Products:
{context}

Now, strictly follow the steps above and provide your advice:
"""

    CUSTOM_PROMPT = PromptTemplate(
        template=custom_template,
        input_variables=["context", "question"]
    )

    chain = LLMChain(llm=llm, prompt=CUSTOM_PROMPT)
    advice = chain.run(context=context if context else "(No matching product)", question=user_expenses_summary)

    return advice

import os
import re
from dotenv import load_dotenv

# LangChain Imports
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# Defer heavy imports to runtime to avoid boot errors when optional deps are missing

# Load environment variables from the .env file at the project root
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

# LLM setup
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7, openai_api_key=OPENAI_API_KEY)

# Vector DB setup
VECTOR_DB_PATH = 'backend/vectorDB'
COLLECTION_NAME = 'pakistan_products'

print(f"Loading ChromaDB from {VECTOR_DB_PATH}...")
db = Chroma(
    persist_directory=VECTOR_DB_PATH,
    embedding_function=OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY),
    collection_name=COLLECTION_NAME
)
print("Successfully loaded collection.")

# --- Exact Word Search Helper ---
def get_matching_products(expense_text, db, top_k=1):
    """
    Search the vector DB for exact keyword matches based on words from the user's expense.
    Returns concatenated context string of matches.
    """
    matches = []
    words = re.findall(r"[A-Za-z]+", expense_text.lower())

    seen = set()
    for word in words:
        if word not in seen:
            seen.add(word)
            res = db.similarity_search(word, k=top_k)
            if res:
                matches.extend(res)

    return "\n".join([doc.page_content for doc in matches])

# --- Financial Advice Generator ---
def generate_financial_advice(user_expenses_summary, _llm=None, _db=None):
    # Local imports to avoid module import-time failures
    from langchain.prompts import PromptTemplate
    from langchain.chains import LLMChain
    # Lazy init
    _llm, _db = ensure_resources()
    context = get_matching_products(user_expenses_summary, _db, top_k=1)

    custom_template = """
You are a professional financial advisor from Pakistan.

Your goal is to give realistic, human-like money-saving advice using ONLY the provided product data when it exists, 
and only fall back to market/web knowledge if no match is found.

Your answer must be one continuous conversational paragraph, not a bullet list.

---
FEW-SHOT EXAMPLES

Example 1 (MATCH FOUND):
User's Expenses:
Rice, 1000g, 400 PKR

Provided Products:
Basmati Rice, 1000g, 300 PKR

Expected Response:
You paid 400 PKR for 1000 grams of rice, but a similar product in our records costs 300 PKR for the same weight — meaning you overpaid by 100 PKR. Opting for the cheaper option could help you save without compromising quality.

Example 2 (NO MATCH — FALLBACK):
User's Expenses:
Mango Juice, 1 liter, 250 PKR

Provided Products:
(No matching product)

Expected Response:
In the Pakistani market, good quality mango juice typically sells for around 200 PKR per liter. By choosing a more competitively priced brand, you could potentially save about 50 PKR while still enjoying a refreshing drink.

---
STEPS FOR YOUR RESPONSE:
1. Identify Match: For each item in the user's expenses, look for the closest product in "Provided Products" that matches the same category and is most similar in description.
2. Quantity Matching: Convert both user quantity and provided product quantity into the same units (grams, liters, or pieces) before comparison.
3. Direct Price Comparison:
   - If a matching product exists in "Provided Products", use its price and quantity ONLY for the comparison.
   - Calculate the price for the same quantity as the user bought, then show:
     “You paid X PKR for Y grams, but a similar product costs Z PKR for Y grams — saving W PKR.”
   - If the user's item is cheaper, praise their choice and state no savings.
4. Fallback to Market Knowledge: If no match exists in "Provided Products", then and only then use Pakistani market knowledge or web search to suggest a realistic alternative.
5. Single Response: Write a single, professional, and encouraging message combining all items’ analysis.
6. Savings Summary: End with the total potential savings in PKR.

---
User's Expenses:
{question}

Provided Products:
{context}

Now, strictly follow the steps above and provide your advice:
"""

    CUSTOM_PROMPT = PromptTemplate(
        template=custom_template,
        input_variables=["context", "question"]
    )

    chain = LLMChain(llm=_llm, prompt=CUSTOM_PROMPT)
    advice = chain.run(context=context if context else "(No matching product)", question=user_expenses_summary)

    return advice
