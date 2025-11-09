from dataclasses import dataclass

from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.Prompts import actionable_proposed_answer_prompt, actionable_is_question_prompt
from llm.PromptTemplates.BelastingdienstData import _belastingdienst_data


# actionable_id: int,
# base_link: str,
# content: str,
# is_question: bool,
# proposed_response: str,
@dataclass
class Actionable:
    def __init__(self,
                 actionable_id: int,
                 base_link: str,
                 content: str # the actual raw quote from the post
                 ):
        self.actionable_id = actionable_id
        self.base_link = base_link
        self.content = content

        llm_client = LlmClient()
        self.is_question = self.is_question(llm_client)
        self.proposed_response = self.generate_proposed_answer(llm_client)

    def is_question(self, llm_client):
        is_question_find_prompt = actionable_is_question_prompt.format(raw_citation=self.content, all_the_belastingdienst_data= _belastingdienst_data)

        is_question = llm_client.generate_response(AzerionPromptTemplate(prompt=is_question_find_prompt))

        return is_question

    def generate_proposed_answer(self, llm_client):
        proposed_answer_prompt = actionable_proposed_answer_prompt.format(raw_citation=self.content, all_the_belastingdienst_data=_belastingdienst_data)

        proposed_answer = llm_client.generate_response(AzerionPromptTemplate(prompt=proposed_answer_prompt))

        return proposed_answer