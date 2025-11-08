import json

import requests

from config.PrivateKeys import _api_key

class LlmClient:
    def __init__(self):
        self.address = 'https://api.azerion.ai/v1/chat/completions'
        self.api_key = _api_key

    def generate_response(self, prompt):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }

        try:
            response = requests.post(
                self.address,
                headers=headers,
                data=prompt.to_json() if hasattr(prompt, 'to_json') else json.dumps(prompt)
            )

            if response.status_code == 200:
                try:
                    response_data = response.json()
                    # Extract the content from the response structure
                    if 'choices' in response_data and len(response_data['choices']) > 0:
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

