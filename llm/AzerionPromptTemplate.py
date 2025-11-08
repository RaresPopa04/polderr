import json
from dataclasses import dataclass
from enum import Enum

@dataclass
class AzerionPromptTemplate:
    model = "mistral-large-2407-v1:0"
    messages = []
    temperature = 0.01
    max_tokens = 4096
    top_p = 0.001
    stream = False

    def __init__(self, prompt:str = ""):
        self.messages = [{"role": "user", "content": prompt}]

    def to_json(self):
        return json.dumps({
            "model": self.model,
            "messages": self.messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
            "stream": self.stream
        })
