## Backend http://localhost:8000/docs

```bash
pip install -r requirements.txt
```

```bash
python -m api.main
```

### Frontend http://localhost:3000


```bash
cd munincipalitator3000
npm run dev
```

### Re-generate the json with the data

```
python main_generate.py
```

1. a new post comes
2. topic is assigned (find_topic_for_post)
3. see if there are recents events in this topic and try to assigning similar ones, if no similar ones than create a new one 

Models were using :
locally hosted via ollama : qwen3-vl:4b-instruct for image to text for eval newspapers etc...
azerion hosted : elevenlabs-scribe for speech to text
azerion hosted : gemini-embedding-001 for embeddings 
azerion hosted : mistral-large-2407-v1:0 for nlp decision making

showcase via sample.png and sample.mp4