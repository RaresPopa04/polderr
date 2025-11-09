import json

import requests

from config.PrivateKeys import _api_key

class LlmClient:
    def __init__(self, address = 'https://api.azerion.ai/v1/'):
        self.address = address
        self.api_key = _api_key

    @staticmethod
    def clean_response(text: str) -> str:
        """Remove surrounding quotation marks and extra whitespace from AI responses"""
        if not isinstance(text, str):
            return text
        
        text = text.strip()
        
        # Remove surrounding quotes (both single and double)
        if (text.startswith('"') and text.endswith('"')) or \
           (text.startswith("'") and text.endswith("'")):
            text = text[1:-1]
        
        return text.strip()

    def generate_response(self, prompt, endpoint = "chat/completions"):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
        
        try:
            data= prompt.to_json() if hasattr(prompt, 'to_json') else json.dumps(prompt)
            response = requests.post(
                self.address + endpoint,
                headers=headers,
                data=data
            )

            if response.status_code == 200:
                try:
                    response_data = response.json()

                    # Handle embeddings endpoint response (OpenAI-style)
                    if 'data' in response_data and isinstance(response_data['data'], list):
                        if response_data['data'] and 'embedding' in response_data['data'][0]:
                            return response_data['data'][0]['embedding']

                    # Handle chat completions response (OpenAI-style)
                    elif 'choices' in response_data and isinstance(response_data['choices'], list) \
                            and response_data['choices']:
                        message = response_data['choices'][0].get('message', {})
                        content = message.get('content', 'No content found')
                        return self.clean_response(content)

                    # Handle Ollama /api/generate response
                    elif 'response' in response_data:
                        # e.g. {"model":"llama3.2-vision:11b", "response":"...", "done":true, ...}
                        content = response_data.get('response', '')
                        return self.clean_response(content)

                    else:
                        return 'Invalid response structure'

                except json.JSONDecodeError:
                    return 'Invalid JSON'
            else:
                return f'Request failed with status code {response.status_code}'

        except requests.exceptions.RequestException as e:
            return f'Request failed: {str(e)}'


