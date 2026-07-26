import torch
import torch.nn as nn
import torch.optim as optim
import re
import requests
import json
import os
from typing import Dict, Any, Tuple

# Load GEMINI_API_KEY from .env
GEMINI_API_KEY = ""
env_path = os.path.join(os.getcwd(), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line_strip = line.strip()
            if line_strip.startswith("VITE_GEMINI_API_KEY="):
                GEMINI_API_KEY = line_strip.split("=", 1)[1].strip().strip('"').strip("'")
            elif line_strip.startswith("GEMINI_API_KEY="):
                GEMINI_API_KEY = line_strip.split("=", 1)[1].strip().strip('"').strip("'")


# =====================================================================
# PYTORCH EMERGENCY BINARY CLASSIFIER
# =====================================================================

class SimpleTokenizer:
    def __init__(self, vocab_size: int = 1000):
        self.vocab = {"<pad>": 0, "<unk>": 1}
        self.vocab_size = vocab_size
        self.word_count = 2
        
    def fit(self, texts):
        for text in texts:
            words = self._clean(text).split()
            for word in words:
                if word not in self.vocab and self.word_count < self.vocab_size:
                    self.vocab[word] = self.word_count
                    self.word_count += 1
                    
    def _clean(self, text: str) -> str:
        return re.sub(r'[^a-zA-Z0-9\s]', '', text.lower())
        
    def encode(self, text: str, seq_len: int = 16) -> torch.Tensor:
        words = self._clean(text).split()
        tokens = [self.vocab.get(word, 1) for word in words]
        if len(tokens) < seq_len:
            tokens = tokens + [0] * (seq_len - len(tokens))
        else:
            tokens = tokens[:seq_len]
        return torch.tensor([tokens], dtype=torch.long)

class EmergencyClassifier(nn.Module):
    def __init__(self, vocab_size: int, emb_dim: int = 16, hidden_dim: int = 16):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, emb_dim, padding_idx=0)
        self.fc1 = nn.Linear(emb_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        emb = self.embedding(x)  # [batch_size, seq_len, emb_dim]
        pooled = emb.mean(dim=1)  # [batch_size, emb_dim]
        out = self.fc1(pooled)
        out = self.relu(out)
        out = self.fc2(out)
        return self.sigmoid(out)

# Global variables for the model
tokenizer = SimpleTokenizer()
model = None
device = torch.device("cpu")

def train_classifier():
    global model, tokenizer
    
    # Seeding dataset (20 examples of emergency vs. non-emergency in Mangaluru context)
    train_data = [
        ("Help! Rising flood waters trapped us in Hampankatta", 1.0),
        ("Severe earthquake in Manipal, building collapsed", 1.0),
        ("We need medical assistance immediately, someone is bleeding", 1.0),
        ("Landslide at Kuntikan has blocked the highway, cars crushed", 1.0),
        ("Boat capsized near Ullal beach, 5 people drowning", 1.0),
        ("No drinking water or food in the relief camp at Lalbagh", 1.0),
        ("Flash flood in Bejai area, water entering houses", 1.0),
        ("People stuck on the roof, please send rescue boats", 1.0),
        ("Injured citizens trapped under debris in Kadri", 1.0),
        ("Urgent: SOS! Medical emergency near Pumpwell circle", 1.0),
        ("Water level rising, our family is trapped on the first floor in Ullal", 1.0),
        ("Injured child needs hospital transfer immediately at Hampankatta", 1.0),
        ("Landslide occurred near Udupi Krishna Temple road, block road", 1.0),
        ("We need rescue teams, building shaking after tremor", 1.0),
        ("No food supplies and water remaining, kids starving in Kadri", 1.0),
        
        ("The weather in Mangalore is very beautiful today", 0.0),
        ("Having delicious seafood lunch at Machali restaurant", 0.0),
        ("Weekend vibes at Tannirbhavi Beach with friends", 0.0),
        ("Traffic is normal on the highway near Udupi", 0.0),
        ("Just arrived at Manipal for my college admissions", 0.0),
        ("Shopping for clothes at Forum Fiza mall", 0.0),
        ("Enjoying the sunset at Kudru island", 0.0),
        ("Need to book a hotel room in Mangaluru for next week", 0.0),
        ("Is there any direct bus from Mangaluru to Udupi?", 0.0),
        ("Beautiful rain showers this evening", 0.0),
        ("Had a great time visiting Kadri temple today", 0.0),
        ("Mangalore buns are the best breakfast option", 0.0),
        ("Walking around Manipal lake in the evening", 0.0),
        ("Booking flight tickets from Mangaluru airport", 0.0),
        ("Let's go for a movie in Bharat Mall", 0.0)
    ]
    
    texts = [item[0] for item in train_data]
    labels = torch.tensor([item[1] for item in train_data], dtype=torch.float32).unsqueeze(1)
    
    tokenizer.fit(texts)
    vocab_size = tokenizer.word_count
    
    model = EmergencyClassifier(vocab_size=vocab_size)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.05)
    
    # Simple training loop (15 epochs)
    model.train()
    for epoch in range(15):
        epoch_loss = 0.0
        for i, text in enumerate(texts):
            optimizer.zero_grad()
            input_tensor = tokenizer.encode(text)
            pred = model(input_tensor)
            loss = criterion(pred, labels[i:i+1])
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
    print(f"PyTorch EmergencyClassifier trained successfully. Vocab size: {vocab_size}")

# Initialize model
train_classifier()

def classify_text_pytorch(text: str) -> float:
    """Runs binary emergency classification returning probability between 0 and 1."""
    if model is None:
        return 0.5
    model.eval()
    with torch.no_grad():
        input_tensor = tokenizer.encode(text)
        prob = model(input_tensor).item()
    return prob

# =====================================================================
# HEURISTIC NER FALLBACK
# =====================================================================

LANDMARKS = [
    "Hampankatta", "Manipal", "Kuntikan", "Ullal", "Lalbagh", 
    "Bejai", "Kadri", "Pumpwell", "Panambur Beach", "Kadiyali",
    "Tannirbhavi", "Jeppu", "Urwa", "Surathkal", "Jyothi Circle",
    "Mulki", "Padubidri", "Malpe", "Udupi", "Kuntikana", "Bendoorwell"
]

def extract_entities_fallback(text: str) -> Dict[str, Any]:
    """Fallback method using regex and dictionaries when Gemini is unavailable."""
    text_lower = text.toLowerCase() if hasattr(text, 'toLowerCase') else text.lower()
    
    # 1. Classify Category
    category = "Rescue" # Default
    if any(k in text_lower for k in ["medical", "doctor", "blood", "hospital", "injured", "wound", "bleed"]):
        category = "Medical"
    elif any(k in text_lower for k in ["food", "water", "starv", "hunger", "drink"]):
        category = "Food/Water"
    elif any(k in text_lower for k in ["landslide", "block", "collapse", "bridge", "crush", "road"]):
        category = "Hazard"
        
    # 2. Extract Location
    location = "Unknown Area"
    for l in LANDMARKS:
        if l.lower() in text_lower:
            location = l
            break
            
    # 3. Extract Count (victims)
    count = 1
    # Search for numbers close to people/trapped/family
    match = re.search(r'(\d+)\s*(?:people|person|citizen|victim|family|child|men|women|us|trapped)', text_lower)
    if match:
        try:
            count = int(match.group(1))
        except ValueError:
            pass
    elif any(word in text_lower for word in ["family", "group"]):
        count = 4
        
    # 4. Estimate Urgency
    urgency = 5
    if any(k in text_lower for k in ["dying", "drown", "urgent", "immediate", "sos", "critical", "bleeding"]):
        urgency = 9
    elif any(k in text_lower for k in ["stuck", "trapped", "flood", "collapse"]):
        urgency = 7
        
    return {
        "emergency_type": category,
        "location": location,
        "count": count,
        "urgency_score": urgency,
        "summary": text[:60] + "..." if len(text) > 60 else text
    }

# =====================================================================
# GEMINI API INTEGRATION
# =====================================================================

def analyze_sos_post(text: str, api_key: str) -> Dict[str, Any]:
    """
    Analyzes an SOS text using PyTorch classifier to filter out noise,
    and Gemini API (or regex fallback) for entity extraction.
    """
    # 1. Run PyTorch Classifier
    is_emergency_prob = classify_text_pytorch(text)
    is_emergency = is_emergency_prob > 0.65
    
    result = {
        "is_emergency": is_emergency,
        "pytorch_prob": is_emergency_prob,
        "emergency_type": "None",
        "location": "Unknown",
        "count": 0,
        "urgency_score": 0,
        "summary": text
    }
    
    if not is_emergency:
        return result
        
    # 2. Extract Entities
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        # Fallback to local heuristic
        fallback = extract_entities_fallback(text)
        result.update(fallback)
        return result
        
    # Query Gemini API via REST
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        prompt = (
            "Analyze the following social media post from a disaster zone. "
            "Extract details and return ONLY a raw JSON object (do not wrap in markdown or anything else) with the following structure:\n"
            "{\n"
            '  "emergency_type": "Medical" | "Rescue" | "Food/Water" | "Hazard",\n'
            '  "location": "A landmark, street name, or area in Mangaluru / Udupi region",\n'
            '  "count": integer_number_of_people_affected_or_trapped,\n'
            '  "urgency_score": integer_rating_from_1_to_10,\n'
            '  "summary": "Brief summary sentence"\n'
            "}\n\n"
            f"Post content: \"{text}\""
        )
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        
        if response.status_code == 200:
            data = response.json()
            gemini_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
            # Clean possible markdown wrapping if Gemini ignored mime type
            gemini_text = re.sub(r'^```json\s*|\s*```$', '', gemini_text, flags=re.MULTILINE).strip()
            extracted = json.loads(gemini_text)
            
            result.update({
                "emergency_type": extracted.get("emergency_type", "Rescue"),
                "location": extracted.get("location", "Unknown Area"),
                "count": max(1, int(extracted.get("count", 1))),
                "urgency_score": min(10, max(1, int(extracted.get("urgency_score", 5)))),
                "summary": extracted.get("summary", text[:60])
            })
        else:
            print(f"Gemini API returned error code {response.status_code}. Using fallback.")
            fallback = extract_entities_fallback(text)
            result.update(fallback)
            
    except Exception as e:
        print(f"Error querying Gemini API: {e}. Using fallback.")
        fallback = extract_entities_fallback(text)
        result.update(fallback)
        
    return result
