from typing import Any, Dict
import openai

class ChatGPTService:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def generate_trade_explanation(self, trade_data: Dict[str, Any]) -> str:
        prompt = self.create_prompt(trade_data)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response['choices'][0]['message']['content']

    def create_prompt(self, trade_data: Dict[str, Any]) -> str:
        return f"Explain the following trade decision: {trade_data}"