from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient

llmclient = LlmClient()

rez =  llmclient.generate_response(AzerionPromptTemplate(
    prompt="tell me what is an astronaut"
))

print(rez)