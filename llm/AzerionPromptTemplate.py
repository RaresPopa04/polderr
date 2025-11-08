
import json
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class AzerionPromptTemplate:
    prompt: str = ""
    model: str = "mistral-large-2407-v1:0"
    messages: List[Dict[str, str]] = field(default_factory=list)
    temperature: float = 0.01
    max_tokens: int = 4096
    top_p: float = 0.001
    stream: bool = False

    def __init__(self, prompt):
        self.prompt = prompt
        self.messages = [{"role": "user", "content": self.prompt}]

    def to_json(self):
        return json.dumps({
            "model": self.model,
            "messages": self.messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "top_p": self.top_p,
            "stream": self.stream
        })