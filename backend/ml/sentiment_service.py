
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F




from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

# โหลดโมเดลสำหรับแยกประโยค (sentence segmentation)
sent_split_model_name = "mattpowell/segment-any-text-wtpsplit"
sent_split_tokenizer = AutoTokenizer.from_pretrained(sent_split_model_name)
sent_split_model = AutoModelForTokenClassification.from_pretrained(sent_split_model_name)
sentencizer = pipeline("sentencizer", model=sent_split_model, tokenizer=sent_split_tokenizer)

def split_sentences_with_model(text):
    results = sentencizer(text)
    return [s['text'] for s in results]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# โหลดโมเดลและ tokenizer ครั้งเดียว
model_name = "poom-sci/WangchanBERTa-finetuned-sentiment"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)




# ใช้ WangchanBERTa sentiment






# รับข้อความแล้วให้ TinyLlama-1.1B-Chat จัดหมวด Outstanding/Opportunity

@app.post("/sentiment")
async def sentiment(request: Request):
    import re
    data = await request.json()
    text = data.get("text", "")
    sentences = split_sentences_with_model(text)
    outstanding = []
    opportunity = []
    debug_results = []
    for sent in sentences:
        # ป้องกัน error ถ้าไม่ได้เป็น list of list
        try:
            score_dict = {s['label'].lower(): s['score'] for s in score_items}
        except Exception as e:
            outstanding = []
            opportunity = []
            debug_results = []
            for sent in sentences:
                inputs = tokenizer(sent, return_tensors="pt")
                with torch.no_grad():
                    logits = model(**inputs).logits
                    probs = F.softmax(logits, dim=1).squeeze().tolist()
                labels = list(model.config.id2label.values())
                try:
                    score_dict = dict(zip(labels, probs))
                    print(f"[DEBUG] scores for: {sent} => {score_dict}", flush=True)
                except Exception as e:
                    print(f"[DEBUG] ERROR for: {sent} => {e}", flush=True)
                    score_dict = {}
                debug_results.append({"sentence": sent, "scores": score_dict})
                pos_score = score_dict.get('pos', 0)
                neg_score = score_dict.get('neg', 0)
                if pos_score > neg_score:
                    outstanding.append(sent)
                elif neg_score > pos_score:
                    opportunity.append(sent)
            print("[DEBUG] Sentiment results:", debug_results, flush=True)
            return {"outstanding": outstanding, "opportunity": opportunity, "debug": debug_results}
