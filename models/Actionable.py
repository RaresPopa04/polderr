from dataclasses import dataclass


@dataclass
class Actionable:
    def __init__(self,
                 actionable_id: int,
                 base_link: str,
                 content: str,
                 is_question: bool,
                 proposed_response: str,
                 ):
        self.actionable_id = actionable_id
        self.base_link = base_link
        self.content = content
        self.is_question = is_question
        self.proposed_response = proposed_response