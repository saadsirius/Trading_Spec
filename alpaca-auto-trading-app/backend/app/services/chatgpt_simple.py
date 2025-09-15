import os
import httpx
from typing import Dict, Any

class ChatGPTService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1"

    async def generate_trade_explanation(self, trade_data: Dict[str, Any]) -> str:
        """Generate trade explanation using OpenAI API"""
        if not self.api_key:
            return "OpenAI API key not configured"
        
        prompt = self.create_prompt(trade_data)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.base_url}/chat/completions", 
                                           headers=headers, 
                                           json=data)
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                return f"Error generating explanation: {str(e)}"

    def create_prompt(self, trade_data: Dict[str, Any]) -> str:
        """Create a prompt for trade explanation"""
        return f"""
        Explain the following trade decision in simple terms:
        
        Trade Details:
        - Symbol: {trade_data.get('symbol', 'Unknown')}
        - Quantity: {trade_data.get('quantity', 'Unknown')}
        - Side: {trade_data.get('side', 'Unknown')}
        - Trade ID: {trade_data.get('trade_id', 'Unknown')}
        
        Please provide a brief explanation of why this trade might have been made, considering:
        1. Market conditions
        2. Trading strategy
        3. Risk management
        
        Keep the explanation under 200 words and make it easy to understand.
        """

