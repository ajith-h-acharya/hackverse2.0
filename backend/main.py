import asyncio
import os
import json
import random
import requests
import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Import local modules
from backend.nlp_engine import analyze_sos_post, GEMINI_API_KEY
from backend.risk_routing import geocode_location, calculate_priority, optimize_route, haversine

app = FastAPI(title="A.G.I.S. Disaster Relief API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.getcwd(), "disaster_db.json")

# =====================================================================
# SEED DATABASE CONFIGURATION
# =====================================================================

INITIAL_CAMPS = [
    {
        "id": "camp_alpha",
        "name": "Camp Alpha (Lalbagh)",
        "lat": 12.8837,
        "lng": 74.8430,
        "resources": {
            "food_kg": 500,
            "water_liters": 1200,
            "medical_kits": 80,
            "boats": 3,
            "trucks": 4,
            "helicopters": 1
        }
    },
    {
        "id": "camp_beta",
        "name": "Camp Beta (Manipal Center)",
        "lat": 13.3409,
        "lng": 74.7865,
        "resources": {
            "food_kg": 800,
            "water_liters": 2000,
            "medical_kits": 150,
            "boats": 1,
            "trucks": 6,
            "helicopters": 2
        }
    },
    {
        "id": "camp_coastal",
        "name": "Coastal Rescue Unit (Ullal)",
        "lat": 12.8020,
        "lng": 74.8510,
        "resources": {
            "food_kg": 300,
            "water_liters": 800,
            "medical_kits": 50,
            "boats": 5,
            "trucks": 2,
            "helicopters": 0
        }
    }
]

INITIAL_VEHICLES = [
    {
        "id": "v_amb_1",
        "name": "Ambulance Alpha-1",
        "type": "Ambulance",
        "status": "Idle",
        "camp_id": "camp_alpha",
        "lat": 12.8837,
        "lng": 74.8430,
        "speed_kmh": 45,
        "route_geometry": [],
        "route_index": 0,
        "destinations": [],
        "current_supplies": {}
    },
    {
        "id": "v_boat_1",
        "name": "Rescue Boat Alpha-2",
        "type": "Boat",
        "status": "Idle",
        "camp_id": "camp_alpha",
        "lat": 12.8837,
        "lng": 74.8430,
        "speed_kmh": 25,
        "route_geometry": [],
        "route_index": 0,
        "destinations": [],
        "current_supplies": {}
    },
    {
        "id": "v_truck_1",
        "name": "Supply Truck Beta-1",
        "type": "Truck",
        "status": "Idle",
        "camp_id": "camp_beta",
        "lat": 13.3409,
        "lng": 74.7865,
        "speed_kmh": 35,
        "route_geometry": [],
        "route_index": 0,
        "destinations": [],
        "current_supplies": {}
    },
    {
        "id": "v_heli_1",
        "name": "Helo Lifesaver Beta-2",
        "type": "Helicopter",
        "status": "Idle",
        "camp_id": "camp_beta",
        "lat": 13.3409,
        "lng": 74.7865,
        "speed_kmh": 120,
        "route_geometry": [],
        "route_index": 0,
        "destinations": [],
        "current_supplies": {}
    },
    {
        "id": "v_boat_2",
        "name": "Speed Rescue Ullal-1",
        "type": "Boat",
        "status": "Idle",
        "camp_id": "camp_coastal",
        "lat": 12.8020,
        "lng": 74.8510,
        "speed_kmh": 30,
        "route_geometry": [],
        "route_index": 0,
        "destinations": [],
        "current_supplies": {}
    }
]

INITIAL_BLOCKED_ROADS = [
    {
        "id": "block_1",
        "name": "Kuntikan Flyover Waterlogged",
        "lat": 12.8911,
        "lng": 74.8435,
        "radius_km": 0.4
    }
]

INITIAL_SOS_REQUESTS = [
    {
        "id": "sos_seed_1",
        "source": "Twitter/X",
        "username": "@suresh_k",
        "text": "Water levels rising rapidly in Hampankatta! 4 people trapped on first floor, one elderly needs medicine!",
        "timestamp": datetime.datetime.now().isoformat(),
        "is_emergency": True,
        "pytorch_prob": 0.98,
        "emergency_type": "Rescue",
        "location": "Hampankatta",
        "lat": 12.8698,
        "lng": 74.8431,
        "count": 4,
        "urgency_score": 8,
        "priority_score": 24.0, # Will be recalculated
        "status": "Pending",
        "assigned_vehicle": None,
        "is_estimated_zone": False
    },
    {
        "id": "sos_seed_2",
        "source": "Twitter/X",
        "username": "@kavitha_m",
        "text": "Landslide block road in Manipal road near Kadiyali. Heavy rocks blocking vehicle entry, emergency rescue crew required",
        "timestamp": datetime.datetime.now().isoformat(),
        "is_emergency": True,
        "pytorch_prob": 0.94,
        "emergency_type": "Hazard",
        "location": "Kadiyali",
        "lat": 13.3444,
        "lng": 74.7937,
        "count": 1,
        "urgency_score": 6,
        "priority_score": 12.0,
        "status": "Pending",
        "assigned_vehicle": None,
        "is_estimated_zone": False
    }
]

# =====================================================================
# STATE ACCESS HELPER (disaster_db.json)
# =====================================================================

def load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_FILE):
        db = {
            "camps": INITIAL_CAMPS,
            "vehicles": INITIAL_VEHICLES,
            "blocked_roads": INITIAL_BLOCKED_ROADS,
            "active_emergencies": INITIAL_SOS_REQUESTS,
            "resolved_emergencies": [],
            "social_feed": []
        }
        save_db(db)
        return db
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading DB file: {e}")
        return {
            "camps": INITIAL_CAMPS,
            "vehicles": INITIAL_VEHICLES,
            "blocked_roads": INITIAL_BLOCKED_ROADS,
            "active_emergencies": [],
            "resolved_emergencies": [],
            "social_feed": []
        }

def save_db(db: Dict[str, Any]):
    try:
        with open(DB_FILE, "w") as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"Error writing DB file: {e}")

# Initialize and recalculate initial priorities
db = load_db()
for e in db["active_emergencies"]:
    e["priority_score"] = calculate_priority(e["emergency_type"], e["urgency_score"], e["lat"], e["lng"], db["active_emergencies"])
save_db(db)

# =====================================================================
# WEBSOCKET CONNECTIONS MANAGER
# =====================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Push immediate full state
        await self.send_state(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_state(self, websocket: WebSocket):
        current_state = load_db()
        payload = {
            "type": "STATE_UPDATE",
            "data": current_state
        }
        await websocket.send_json(payload)

    async def broadcast_state(self):
        current_state = load_db()
        payload = {
            "type": "STATE_UPDATE",
            "data": current_state
        }
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_event(self, event_type: str, data: Any):
        payload = {
            "type": event_type,
            "data": data
        }
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# =====================================================================
# SYSTEM SCHEMAS
# =====================================================================

class ManualSOSReport(BaseModel):
    reporter: str
    text: str
    location_name: str
    emergency_type: str
    count: int
    urgency: int

class DispatchRequest(BaseModel):
    vehicle_id: str
    sos_ids: List[str]
    supplies: Dict[str, int] # e.g. {"food_kg": 50, "water_liters": 100}

class RouteRecalcRequest(BaseModel):
    vehicle_id: str

class ChatRequest(BaseModel):
    message: str

class BlockedRoadRequest(BaseModel):
    name: str
    lat: float
    lng: float
    radius_km: float

class SimulateEventRequest(BaseModel):
    event_type: str # Earthquake, Flood, Landslide
    location_name: str # e.g. Hampankatta, Ullal, Manipal

# =====================================================================
# REST ENDPOINTS
# =====================================================================

@app.get("/api/state")
def get_state():
    return load_db()

@app.post("/api/posts/manual")
async def add_manual_report(report: ManualSOSReport):
    state = load_db()
    
    # 3-Tier geocoder
    lat, lng, is_estimated = geocode_location(report.location_name, state["active_emergencies"])
    
    new_sos = {
        "id": f"sos_manual_{int(datetime.datetime.now().timestamp())}",
        "source": "Radio Dispatch",
        "username": f"@{report.reporter}",
        "text": report.text,
        "timestamp": datetime.datetime.now().isoformat(),
        "is_emergency": True,
        "pytorch_prob": 1.0,
        "emergency_type": report.emergency_type,
        "location": report.location_name,
        "lat": lat,
        "lng": lng,
        "count": report.count,
        "urgency_score": report.urgency,
        "priority_score": 0.0, # Recalculated below
        "status": "Pending",
        "assigned_vehicle": None,
        "is_estimated_zone": is_estimated
    }
    
    # Append to active
    state["active_emergencies"].append(new_sos)
    
    # Recalculate all priorities (due to possible clustering changes)
    for e in state["active_emergencies"]:
        e["priority_score"] = calculate_priority(
            e["emergency_type"], e["urgency_score"], e["lat"], e["lng"], state["active_emergencies"]
        )
        
    save_db(state)
    
    # Check if we need to auto-recalculate active routes
    await recalculate_all_active_routes(state)
    
    await manager.broadcast_state()
    await manager.broadcast_event("NEW_EMERGENCY", new_sos)
    return {"status": "success", "data": new_sos}

@app.post("/api/dispatch")
async def dispatch_rescue(req: DispatchRequest):
    state = load_db()
    
    # Find vehicle
    vehicle = next((v for v in state["vehicles"] if v["id"] == req.vehicle_id), None)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle["status"] != "Idle":
        raise HTTPException(status_code=400, detail="Vehicle is not idle")
        
    # Find camp
    camp = next((c for c in state["camps"] if c["id"] == vehicle["camp_id"]), None)
    if not camp:
        raise HTTPException(status_code=404, detail="Home camp not found")
        
    # Deduct supplies from camp
    for supply_key, amount in req.supplies.items():
        if camp["resources"].get(supply_key, 0) < amount:
            raise HTTPException(status_code=400, detail=f"Insufficient camp resources: {supply_key}")
        camp["resources"][supply_key] -= amount
        
    # Get associated SOS requests
    sos_items = [e for e in state["active_emergencies"] if e["id"] in req.sos_ids]
    if not sos_items:
        raise HTTPException(status_code=400, detail="No matching SOS requests provided")
        
    # Map blocked roads coordinates for penalty calculation
    blocked_zones = [(b["lat"], b["lng"], b["radius_km"]) for b in state["blocked_roads"]]
    
    # Run TSP Route Optimization
    dest_coords = [{"id": item["id"], "lat": item["lat"], "lng": item["lng"]} for item in sos_items]
    start_camp_coord = {"lat": camp["lat"], "lng": camp["lng"]}
    
    route_details = optimize_route(start_camp_coord, dest_coords, blocked_zones)
    
    # Update vehicle state
    vehicle["status"] = "En Route"
    vehicle["destinations"] = route_details["path"] # Ordered visiting path
    vehicle["route_geometry"] = route_details["route_geometry"]
    vehicle["route_index"] = 0
    vehicle["current_supplies"] = req.supplies
    
    # Update SOS requests
    for item in state["active_emergencies"]:
        if item["id"] in req.sos_ids:
            item["status"] = "Responding"
            item["assigned_vehicle"] = vehicle["name"]
            
    save_db(state)
    await manager.broadcast_state()
    return {"status": "success", "vehicle": vehicle, "route_details": {
        "distance_km": route_details["total_distance_km"],
        "duration_sec": route_details["total_duration_sec"]
    }}

@app.post("/api/blocked-roads/add")
async def add_blocked_road(req: BlockedRoadRequest):
    state = load_db()
    new_block = {
        "id": f"block_{int(datetime.datetime.now().timestamp())}",
        "name": req.name,
        "lat": req.lat,
        "lng": req.lng,
        "radius_km": req.radius_km
    }
    state["blocked_roads"].append(new_block)
    save_db(state)
    
    # Dynamic route recalculation: If a road is blocked, trigger routing updates for active vehicles
    await recalculate_all_active_routes(state)
    
    await manager.broadcast_state()
    return {"status": "success", "data": new_block}

@app.post("/api/blocked-roads/remove/{block_id}")
async def remove_blocked_road(block_id: str):
    state = load_db()
    state["blocked_roads"] = [b for b in state["blocked_roads"] if b["id"] != block_id]
    save_db(state)
    
    # Dynamic recalculation
    await recalculate_all_active_routes(state)
    
    await manager.broadcast_state()
    return {"status": "success"}

async def recalculate_all_active_routes(state: Dict[str, Any]):
    """Automatically recalculate optimal routes for all active vehicles en route."""
    blocked_zones = [(b["lat"], b["lng"], b["radius_km"]) for b in state["blocked_roads"]]
    modified = False
    
    for vehicle in state["vehicles"]:
        if vehicle["status"] == "En Route" and len(vehicle["destinations"]) > 0:
            # Reconstruct remaining destinations
            remaining_dest_ids = [dest["id"] for dest in vehicle["destinations"]]
            # Filter active emergencies that are still pending/responding and matching these IDs
            active_destinations = [
                {"id": e["id"], "lat": e["lat"], "lng": e["lng"]}
                for e in state["active_emergencies"]
                if e["id"] in remaining_dest_ids and e["status"] == "Responding"
            ]
            
            if not active_destinations:
                continue
                
            # Current location of the vehicle acts as starting node
            vehicle_start = {"lat": vehicle["lat"], "lng": vehicle["lng"]}
            
            # Re-optimize
            route_details = optimize_route(vehicle_start, active_destinations, blocked_zones)
            
            vehicle["destinations"] = route_details["path"]
            vehicle["route_geometry"] = route_details["route_geometry"]
            vehicle["route_index"] = 0
            modified = True
            print(f"Dynamic Route Recalculated for {vehicle['name']} due to map/event updates.")
            
    if modified:
        save_db(state)

@app.post("/api/chat")
async def chat_advisor(req: ChatRequest):
    """AI Command Advisor chat utilizing Gemini with a structured situation payload."""
    state = load_db()
    
    # 1. Construct Dynamic Situation Payload
    active_count = len(state["active_emergencies"])
    highest_priority_sos = "None"
    if state["active_emergencies"]:
        sorted_sos = sorted(state["active_emergencies"], key=lambda x: x.get("priority_score", 0), reverse=True)
        top = sorted_sos[0]
        highest_priority_sos = f"{top['location']} (Priority Score: {top['priority_score']}, Category: {top['emergency_type']}, Victims: {top['count']})"
        
    # Aggregate camp inventories
    total_resources = {"boats": 0, "medical_kits": 0, "food_kg": 0, "water_liters": 0}
    for camp in state["camps"]:
        total_resources["boats"] += camp["resources"].get("boats", 0)
        total_resources["medical_kits"] += camp["resources"].get("medical_kits", 0)
        total_resources["food_kg"] += camp["resources"].get("food_kg", 0)
        total_resources["water_liters"] += camp["resources"].get("water_liters", 0)
        
    blocked_list = [b["name"] for b in state["blocked_roads"]]
    
    situation_payload = {
        "active_emergencies_count": active_count,
        "highest_priority_location": highest_priority_sos,
        "available_resources": total_resources,
        "blocked_roads": blocked_list,
        "user_query": req.message
    }
    
    # 2. Build Gemini Prompt
    system_prompt = (
        "You are A.G.I.S. (Automated Geodetic Intelligence System) Command Advisor, "
        "an advanced AI assistant designed to help disaster response commanders coordinate resources, "
        "prioritize rescue operations, and resolve logistics bottlenecks in the Mangaluru / Udupi region. "
        "Your tone must be technical, authoritative, precise, and highly tactical (military command dashboard style).\n\n"
        "Here is the LIVE Situation Payload generated by the command grid:\n"
        f"{json.dumps(situation_payload, indent=2)}\n\n"
        "Answer the user query by directly analyzing this payload. Suggest specific actions, camps, "
        "and logistics steps where applicable. Use markdown tables or bullet points for readability. "
        "Do not write generic advice; reference specific numbers and landmarks."
    )
    
    if not GEMINI_API_KEY or GEMINI_API_KEY == "YOUR_API_KEY_HERE":
        # Local mock advisor when no API Key is available
        mock_response = (
            f"**[A.G.I.S. TELEMETRY - LOCAL ADVISORY MODE]**\n\n"
            f"Operational Status: **{active_count} active emergencies** detected.\n"
            f"Critical Threat Cluster: **{highest_priority_sos}**.\n\n"
            f"**Tactical Checklist based on query '{req.message}':**\n"
            f"1. **Resource Check**: We have {total_resources['boats']} active boats and {total_resources['medical_kits']} medical kits across camps.\n"
            f"2. **Mobility Alert**: Avoid navigation near blocked zones: *{', '.join(blocked_list) if blocked_list else 'None detected'}*.\n"
            f"3. **Proposed Action**: Dispatch medical units from the nearest camp (Camp Alpha/Beta) directly to the highest priority cluster. Ensure water logistics are routed around road blockages.\n\n"
            f"*(Connect a valid Gemini API key in .env for fully dynamic neural intelligence)*"
        )
        return {"response": mock_response}
        
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{
                    "text": system_prompt
                }]
            }]
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            answer = data['candidates'][0]['content']['parts'][0]['text']
            return {"response": answer}
        else:
            return {"response": f"Error: Advisor network linked failed (HTTP {response.status_code})"}
    except Exception as e:
        return {"response": f"Error linking with A.G.I.S. neural node: {e}"}

@app.post("/api/simulate/event")
async def trigger_simulation_event(req: SimulateEventRequest):
    """Triggers a synthetic disaster event spawning multiple related emergency messages."""
    state = load_db()
    
    event_templates = {
        "Earthquake": [
            "Tremors felt near {loc}! Building collapse reported with 5 people trapped under concrete debris. Urgent medical rescue needed!",
            "Earthquake shakes {loc} area. Cracks in major structures. People running out, 3 minor injuries needing first aid.",
            "SOS! Wall collapsed near {loc}. 2 people trapped inside building basement. Immediate help requested."
        ],
        "Flood": [
            "Flash flood warning! Water level reaching 6 feet in {loc}! 6 family members stuck on house roof, please dispatch boats!",
            "Extreme flooding at {loc}. Drinkable water supplies spoiled. Need emergency food/water packets for 15 trapped villagers.",
            "SOS: Drowning hazard near {loc}. Heavy current. Need water rescue team immediately!"
        ],
        "Landslide": [
            "Landslide incident at {loc}! Mudslide has crushed a local shelter, 4 victims trapped. Access road blocked.",
            "Severe landslide mud blocking transit highway near {loc}. 2 vehicles caught under debris, drivers injured."
        ]
    }
    
    templates = event_templates.get(req.event_type, ["Emergency reported near {loc}."])
    new_sos_list = []
    
    # We will generate 2-3 SOS tweets from these templates
    num_to_generate = min(len(templates), random.randint(2, 3))
    selected_templates = random.sample(templates, num_to_generate)
    
    usernames = ["@relief_net", "@kudla_update", "@weather_alert", "@sos_seeker", "@mangalore_news"]
    
    for temp in selected_templates:
        text = temp.format(loc=req.location_name)
        
        # Analyze it
        analysis = analyze_sos_post(text, GEMINI_API_KEY)
        
        # Override the geocoder location explicitly to the request location name for consistency
        lat, lng, is_estimated = geocode_location(req.location_name, state["active_emergencies"])
        
        # Add random scatter so they don't overlay on the exact same pixel
        lat += random.uniform(-0.005, 0.005)
        lng += random.uniform(-0.005, 0.005)
        
        new_sos = {
            "id": f"sos_sim_{int(datetime.datetime.now().timestamp())}_{random.randint(100,999)}",
            "source": "Twitter/X Simulation",
            "username": random.choice(usernames),
            "text": text,
            "timestamp": datetime.datetime.now().isoformat(),
            "is_emergency": True,
            "pytorch_prob": analysis.get("pytorch_prob", 0.95),
            "emergency_type": analysis.get("emergency_type", "Rescue"),
            "location": req.location_name,
            "lat": lat,
            "lng": lng,
            "count": analysis.get("count", 3),
            "urgency_score": analysis.get("urgency_score", 7),
            "priority_score": 0.0,
            "status": "Pending",
            "assigned_vehicle": None,
            "is_estimated_zone": is_estimated
        }
        
        new_sos_list.append(new_sos)
        state["active_emergencies"].append(new_sos)
        state["social_feed"].insert(0, {
            "id": new_sos["id"],
            "username": new_sos["username"],
            "text": text,
            "timestamp": new_sos["timestamp"],
            "is_emergency": True,
            "category": new_sos["emergency_type"]
        })
        
    # Recalculate priorities
    for e in state["active_emergencies"]:
        e["priority_score"] = calculate_priority(
            e["emergency_type"], e["urgency_score"], e["lat"], e["lng"], state["active_emergencies"]
        )
        
    save_db(state)
    
    # Auto-recalculate paths
    await recalculate_all_active_routes(state)
    
    await manager.broadcast_state()
    for sos in new_sos_list:
        await manager.broadcast_event("NEW_EMERGENCY", sos)
        
    return {"status": "success", "generated_count": len(new_sos_list)}

# =====================================================================
# WEBSOCKET ENDPOINT
# =====================================================================

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive client packets (like ping/pong)
            data = await websocket.receive_text()
            # If client requests forced refresh
            if data == "REFRESH":
                await manager.send_state(websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# =====================================================================
# BACKGROUND TACTICAL SIMULATOR
# =====================================================================

async def simulation_loop():
    """
    Background simulation running every 3 seconds:
    - Moves active vehicles along their routes.
    - Resolves SOS requests upon vehicle arrival.
    - Simulates occasional background social media posts.
    """
    await asyncio.sleep(2) # startup delay
    print("A.G.I.S. Background Simulation loop started.")
    
    social_templates = [
        ("Coffee is amazing this morning in Hampankatta", False, "None"),
        ("Beautiful sun rising over Tannirbhavi Beach beach", False, "None"),
        ("Traffic is moving slow near Pumpwell circle flyover", False, "None"),
        ("Mangalore buns and tea at Jyothi circle makes my day", False, "None"),
        ("College admissions are crowded today at Manipal campus", False, "None"),
        ("Heard some heavy rain is expected in Udupi tomorrow", False, "None"),
        ("Help! Drowning incident near Panambur beach! Send rescue boat, 2 kids swept away!", True, "Rescue"),
        ("Water flooded our house ground floor in Ullal! 5 of us trapped on roof!", True, "Rescue"),
        ("Major accident near Kuntikan crossroads, multi-vehicle pileup, multiple injuries!", True, "Medical"),
        ("Supply shortage: no food and milk for children in Lalbagh shelter", True, "Food/Water"),
        ("Landslide reported near Surathkal hills, mud covers road", True, "Hazard")
    ]
    
    counter = 0
    while True:
        await asyncio.sleep(3)
        counter += 1
        
        state = load_db()
        db_modified = False
        
        # 1. Update Vehicle Movements
        for vehicle in state["vehicles"]:
            if vehicle["status"] == "En Route" and len(vehicle["route_geometry"]) > 0:
                geom = vehicle["route_geometry"]
                idx = vehicle["route_index"]
                
                # Move vehicle forward by steps (simulate speed difference)
                step_increment = 2
                if vehicle["type"] == "Helicopter":
                    step_increment = 5
                elif vehicle["type"] == "Boat":
                    step_increment = 1
                    
                next_idx = min(idx + step_increment, len(geom) - 1)
                vehicle["route_index"] = next_idx
                
                # Update current position coordinates
                curr_pos = geom[next_idx]
                vehicle["lat"] = curr_pos[0]
                vehicle["lng"] = curr_pos[1]
                db_modified = True
                
                # Check if we reached any destination node
                for dest in list(vehicle["destinations"]):
                    dest_sos = next((e for e in state["active_emergencies"] if e["id"] == dest["id"]), None)
                    if dest_sos and dest_sos["status"] == "Responding":
                        # Check distance to target SOS coordinate
                        dist = haversine(vehicle["lat"], vehicle["lng"], dest_sos["lat"], dest_sos["lng"])
                        if dist < 0.2: # Arrived (within 200m)
                            # Resolve SOS request
                            dest_sos["status"] = "Resolved"
                            dest_sos["assigned_vehicle"] = None
                            
                            # Move to resolved list
                            state["active_emergencies"].remove(dest_sos)
                            state["resolved_emergencies"].append(dest_sos)
                            
                            # Remove from vehicle active destinations
                            vehicle["destinations"] = [d for d in vehicle["destinations"] if d["id"] != dest["id"]]
                            print(f"Vehicle {vehicle['name']} successfully resolved SOS {dest['id']} at {dest_sos['location']}")
                            
                # Check if we completed the full route geometry loop
                if next_idx == len(geom) - 1:
                    # Vehicle has returned home
                    vehicle["status"] = "Idle"
                    vehicle["route_geometry"] = []
                    vehicle["route_index"] = 0
                    vehicle["destinations"] = []
                    vehicle["current_supplies"] = {}
                    
                    # Replenish vehicle (if needed)
                    print(f"Vehicle {vehicle['name']} completed full dispatch circuit and returned to camp.")
                    
        # 2. Simulate Random Tweet Feed Ingestion (every ~18 seconds)
        if counter % 6 == 0:
            template = random.choice(social_templates)
            text, is_sos_text, category = template
            username = f"@{random.choice(['citizen_x', 'alert_kudla', 'traveler_22', 'rain_watcher', 'rescue_log'])}"
            
            # Analyze using NLP pipeline
            analysis = analyze_sos_post(text, GEMINI_API_KEY)
            
            feed_item = {
                "id": f"sos_sim_feed_{int(datetime.datetime.now().timestamp())}",
                "username": username,
                "text": text,
                "timestamp": datetime.datetime.now().isoformat(),
                "is_emergency": analysis["is_emergency"],
                "category": analysis.get("emergency_type", "None")
            }
            
            # Insert to social feed
            state["social_feed"].insert(0, feed_item)
            if len(state["social_feed"]) > 30:
                state["social_feed"] = state["social_feed"][:30]
                
            db_modified = True
            
            # If it is classified as emergency, add to active emergencies list!
            if analysis["is_emergency"]:
                # Geocode
                lat, lng, is_estimated = geocode_location(analysis.get("location", "Unknown"), state["active_emergencies"])
                
                # Add random scatter
                lat += random.uniform(-0.003, 0.003)
                lng += random.uniform(-0.003, 0.003)
                
                new_sos = {
                    "id": feed_item["id"],
                    "source": "Twitter/X Feed",
                    "username": username,
                    "text": text,
                    "timestamp": feed_item["timestamp"],
                    "is_emergency": True,
                    "pytorch_prob": analysis.get("pytorch_prob", 0.90),
                    "emergency_type": analysis.get("emergency_type", "Rescue"),
                    "location": analysis.get("location", "Unknown"),
                    "lat": lat,
                    "lng": lng,
                    "count": analysis.get("count", 1),
                    "urgency_score": analysis.get("urgency_score", 5),
                    "priority_score": 0.0, # Recalculated below
                    "status": "Pending",
                    "assigned_vehicle": None,
                    "is_estimated_zone": is_estimated
                }
                
                state["active_emergencies"].append(new_sos)
                print(f"Ingested new emergency via tweet feed: {new_sos['summary']} (Urgency: {new_sos['urgency_score']})")
                
                # Recalculate all priorities
                for e in state["active_emergencies"]:
                    e["priority_score"] = calculate_priority(
                        e["emergency_type"], e["urgency_score"], e["lat"], e["lng"], state["active_emergencies"]
                    )
                
                await manager.broadcast_event("NEW_EMERGENCY", new_sos)
                
                # Dynamic route recalculation (update routes because density changed)
                await recalculate_all_active_routes(state)
            else:
                await manager.broadcast_event("NEW_FEED_POST", feed_item)
                
        if db_modified:
            save_db(state)
            await manager.broadcast_state()

# Start background simulation task when FastAPI starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())
