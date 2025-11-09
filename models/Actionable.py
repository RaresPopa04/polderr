from dataclasses import dataclass

from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.Prompts import actionable_proposed_answer_prompt, actionable_is_question_prompt
from llm.PromptTemplates.BelastingdienstData import _belastingdienst_data


@dataclass
class Actionable:
    actionable_id: str
    base_link: str
    content: str  # the actual raw quote from the post
    is_question: str = 'False'
    proposed_response: str = ""

    @classmethod
    def create_with_enrichment(cls, actionable_id: str, base_link: str, content: str) -> 'Actionable':
        """Factory method to create an Actionable with LLM enrichment"""
        llm_client = LlmClient()
        
        is_question = cls._is_question(content, llm_client)
        proposed_response = cls._generate_proposed_answer(content, llm_client)
        
        return cls(
            actionable_id=actionable_id,
            base_link=base_link,
            content=content,
            is_question=is_question,
            proposed_response=proposed_response
        )

    @staticmethod
    def _is_question(content: str, llm_client: LlmClient) -> str:
        is_question_find_prompt = actionable_is_question_prompt.format(
            raw_citation=content, 
            all_the_belastingdienst_data=_belastingdienst_data
        )
        is_question = llm_client.generate_response(AzerionPromptTemplate(prompt=is_question_find_prompt))
        
        if is_question.lower() == "yes":
            return 'True'
        else:
            return 'False'

    @staticmethod
    def _generate_proposed_answer(content: str, llm_client: LlmClient) -> str:
        proposed_answer_prompt = actionable_proposed_answer_prompt.format(
            raw_citation=content, 
            all_the_belastingdienst_data=_belastingdienst_data
        )
        proposed_answer = llm_client.generate_response(AzerionPromptTemplate(prompt=proposed_answer_prompt))
        return proposed_answer