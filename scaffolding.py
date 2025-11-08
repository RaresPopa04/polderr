from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.SemanticSimilarityService import SemanticSimilarityService


llmclient = LlmClient()

rez =  llmclient.generate_response(AzerionPromptTemplate(
    prompt="tell me what is an astronaut"
))

str1 = "hill"
str2 = "mountain"

ssService = SemanticSimilarityService(llmclient)

emb1 = ssService.embed(str1)
print(emb1)
emb2 = ssService.embed(str2)

print(ssService.cosine_similarity(emb1, emb2))
print(ssService.similarity(str1, str2))


print(rez)
