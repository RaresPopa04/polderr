import json

import requests

from config.PrivateKeys import _api_key

class LlmClient:
    def __init__(self):
        self.address = 'https://api.azerion.ai/v1/'
        self.api_key = _api_key

    def generate_response(self, prompt, endpoint = "chat/completions"):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
        
        try:
            response = requests.post(
                self.address + endpoint,
                headers=headers,
                data=prompt.to_json() if hasattr(prompt, 'to_json') else json.dumps(prompt)
            )
            
            if response.status_code == 200:
                try:
                    response_data = response.json()

                    # Handle embeddings endpoint response
                    if 'data' in response_data and isinstance(response_data['data'], list):
                        if len(response_data['data']) > 0 and 'embedding' in response_data['data'][0]:
                            return response_data['data'][0]['embedding']

                    # Handle chat completions response
                    elif 'choices' in response_data and len(response_data['choices']) > 0:
                        message = response_data['choices'][0].get('message', {})
                        return message.get('content', 'No content found')

                    else:
                        return 'Invalid response structure'

                except json.JSONDecodeError:
                    return 'Invalid JSON'
            else:
                return f'Request failed with status code {response.status_code}'

        except requests.exceptions.RequestException as e:
            return f'Request failed: {str(e)}'


