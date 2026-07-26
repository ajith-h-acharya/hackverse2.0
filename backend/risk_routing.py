import math
import requests
import json
import difflib
from typing import Dict, Any, List, Tuple

# =====================================================================
# GEOGRAPHIC PARAMETERS & TIER 1 DATABASE
# =====================================================================

# Default center for Mangaluru
DEFAULT_CENTER = (12.8700, 74.8800)

# Latitude and Longitude bounding box for Mangaluru & Udupi region
REGION_BBOX = {
    "min_lat": 12.75,
    "max_lat": 13.45,
    "min_lon": 74.65,
    "max_lon": 74.98
}

# Pre-defined high-accuracy local landmark database
LOCAL_LANDMARKS = {
    "hampankatta": (12.8698, 74.8431),
    "manipal": (13.3409, 74.7865),
    "kuntikan": (12.8911, 74.8435),
    "kuntikana": (12.8911, 74.8435),
    "ullal": (12.8020, 74.8510),
    "lalbagh": (12.8837, 74.8430),
    "bejai": (12.8906, 74.8385),
    "kadri": (12.8790, 74.8576),
    "pumpwell": (12.8631, 74.8632),
    "panambur beach": (12.9525, 74.7961),
    "panambur": (12.9460, 74.7980),
    "kadiyali": (13.3444, 74.7937),
    "tannirbhavi": (12.8943, 74.8105),
    "jeppu": (12.8511, 74.8422),
    "urwa": (12.8950, 74.8285),
    "surathkal": (13.0084, 74.7963),
    "jyothi circle": (12.8715, 74.8475),
    "jyothi": (12.8715, 74.8475),
    "bendoorwell": (12.8696, 74.8560),
    "bendoor": (12.8696, 74.8560),
    "malpe": (13.3484, 74.7042),
    "udupi": (13.3409, 74.7421),
    "padubidri": (13.1250, 74.7950),
    "mulki": (13.0800, 74.7980),
    "kottara chowki": (12.9056, 74.8340),
    "kottara": (12.9056, 74.8340),
    "kodialbail": (12.8785, 74.8390),
    "kulashekara": (12.8920, 74.8770),
    "deralakatte": (12.8220, 74.8690),
    "thokottu": (12.8250, 74.8480),
    "bajpe": (12.9620, 74.8780),
    "car street": (12.8760, 74.8360)
}

# =====================================================================
# GEODETIC UTILITIES
# =====================================================================

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in km."""
    R = 6371.0 # Earth radius
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def is_within_bounds(lat: float, lon: float) -> bool:
    """Checks if coordinates are inside the target Mangaluru-Udupi bounding box."""
    return (REGION_BBOX["min_lat"] <= lat <= REGION_BBOX["max_lat"] and
            REGION_BBOX["min_lon"] <= lon <= REGION_BBOX["max_lon"])

def is_path_blocked(lat1: float, lon1: float, lat2: float, lon2: float, blocked_zones: List[Tuple[float, float, float]]) -> bool:
    """
    Checks if a straight line between two points passes through any circular blocked zones.
    Each zone is represented as (lat, lon, radius_km).
    """
    # Sample 5 points along the path segment to check proximity to blockages
    for i in range(1, 5):
        t = i / 5.0
        plat = lat1 + t * (lat2 - lat1)
        plon = lon1 + t * (lon2 - lon1)
        for b_lat, b_lon, b_rad in blocked_zones:
            if haversine(plat, plon, b_lat, b_lon) <= b_rad:
                return True
    return False

# =====================================================================
# TIERED GEOCODING SYSTEM
# =====================================================================

def geocode_location(location_name: str, active_emergencies: List[Dict[str, Any]]) -> Tuple[float, float, bool]:
    """
    3-Tier Geocoding Fallback Engine:
    Tier 1: Local fuzzy matching against landmarks.
    Tier 2: Nominatim OSM Query bounded by region box.
    Tier 3: Centroid of highest-density active emergency zone.
    Returns: (latitude, longitude, is_estimated_zone)
    """
    loc_clean = location_name.strip().lower()
    if not loc_clean:
        return fallback_to_centroid(active_emergencies)
        
    # --- TIER 1: Local Landmark Fuzzy Matching ---
    # Find closest match in keys
    matches = difflib.get_close_matches(loc_clean, LOCAL_LANDMARKS.keys(), n=1, cutoff=0.75)
    if matches:
        lat, lon = LOCAL_LANDMARKS[matches[0]]
        print(f"Geocoding T1 Match: '{location_name}' -> '{matches[0]}' ({lat}, {lon})")
        return lat, lon, False

    # --- TIER 2: Nominatim API Search ---
    try:
        query = f"{location_name}, Mangaluru, Karnataka, India"
        url = "https://nominatim.openstreetmap.org/search"
        headers = {
            "User-Agent": "AGIS-Disaster-Command-Center/1.0 (ajith-h-acharya/kudla-travel-planner)"
        }
        params = {
            "q": query,
            "format": "json",
            "limit": 1
        }
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                if is_within_bounds(lat, lon):
                    print(f"Geocoding T2 Match: '{location_name}' -> Nominatim ({lat}, {lon})")
                    return lat, lon, False
    except Exception as e:
        print(f"Geocoding T2 Error (Nominatim): {e}")

    # --- TIER 3: Centroid of Highest-Density Emergency Zone ---
    return fallback_to_centroid(active_emergencies)

def fallback_to_centroid(active_emergencies: List[Dict[str, Any]]) -> Tuple[float, float, bool]:
    """Tier 3 fallback: Calculates centroid of highest-density emergency zone."""
    if not active_emergencies:
        # Default center of Mangaluru
        return DEFAULT_CENTER[0], DEFAULT_CENTER[1], True
        
    # Group emergencies into spatial clusters (within 2km of each other) to find the densest group
    clusters = []
    visited = set()
    
    for i, e1 in enumerate(active_emergencies):
        if i in visited:
            continue
        cluster = [e1]
        visited.add(i)
        for j, e2 in enumerate(active_emergencies):
            if j not in visited:
                if haversine(e1["lat"], e1["lng"], e2["lat"], e2["lng"]) <= 2.0:
                    cluster.append(e2)
                    visited.add(j)
        clusters.append(cluster)
        
    # Sort clusters by size
    clusters.sort(key=len, reverse=True)
    densest_cluster = clusters[0]
    
    # Calculate centroid of this cluster
    avg_lat = sum(e["lat"] for e in densest_cluster) / len(densest_cluster)
    avg_lon = sum(e["lng"] for e in densest_cluster) / len(densest_cluster)
    
    print(f"Geocoding T3 Match (Centroid of cluster size {len(densest_cluster)}): ({avg_lat:.4f}, {avg_lon:.4f})")
    return avg_lat, avg_lon, True

# =====================================================================
# RISK PRIORITY SCORER
# =====================================================================

def calculate_priority(emergency_type: str, urgency_score: int, lat: float, lon: float, active_emergencies: List[Dict[str, Any]]) -> float:
    """
    Calculates priority: P = Urgency Weight * Cluster Density.
    Category Weights: Medical = 5.0, Rescue = 4.0, Hazard = 3.0, Food/Water = 2.0.
    Density: Number of other emergencies within a 1.5km radius.
    """
    # Category base weight
    weights = {
        "Medical": 5.0,
        "Rescue": 4.0,
        "Hazard": 3.0,
        "Food/Water": 2.0
    }
    base_weight = weights.get(emergency_type, 3.0)
    
    # Scale base weight by relative urgency (1-10 scale)
    urgency_weight = base_weight * (urgency_score / 5.0)
    
    # Calculate Cluster Density (count other emergencies within 1.5km)
    density = 1.0
    for other in active_emergencies:
        # Avoid counting self (if comparing IDs or exact coordinate matches)
        if other.get("lat") == lat and other.get("lng") == lon:
            continue
        if haversine(lat, lon, other["lat"], other["lng"]) <= 1.5:
            density += 1.0
            
    # Priority Score
    priority_score = urgency_weight * density
    return round(priority_score, 2)

# =====================================================================
# OSRM ROAD NETWORK TSP ROUTE OPTIMIZER
# =====================================================================

def solve_tsp_permutations(matrix: List[List[float]]) -> List[int]:
    """Brute force optimal permutation path (exact solver for N <= 8 nodes starting at 0)."""
    import itertools
    n = len(matrix)
    best_path = []
    min_dist = float('inf')
    
    # Permutations of indexes [1 ... n-1]
    for perm in itertools.permutations(range(1, n)):
        path = [0] + list(perm) + [0]
        dist = sum(matrix[path[i]][path[i+1]] for i in range(len(path) - 1))
        if dist < min_dist:
            min_dist = dist
            best_path = path[:-1] # Remove the trailing 0 return node for return payload
            
    return best_path

def solve_tsp_nearest_neighbor(matrix: List[List[float]]) -> List[int]:
    """Nearest Neighbor heuristic path solver for N > 8 nodes starting at 0."""
    n = len(matrix)
    visited = {0}
    path = [0]
    
    while len(visited) < n:
        curr = path[-1]
        next_node = -1
        min_dist = float('inf')
        for neighbor in range(n):
            if neighbor not in visited:
                if matrix[curr][neighbor] < min_dist:
                    min_dist = matrix[curr][neighbor]
                    next_node = neighbor
        if next_node != -1:
            path.append(next_node)
            visited.add(next_node)
        else:
            break
            
    return path

def optimize_route(start_camp: Dict[str, float], destinations: List[Dict[str, float]], blocked_zones: List[Tuple[float, float, float]]) -> Dict[str, Any]:
    """
    Computes optimal route starting at camp, visiting all destinations, and returning.
    Respects blocked road penalties using OSRM matrices.
    Returns: { "path": List[Dict], "route_geometry": List[List[float]], "total_distance_km": float, "total_duration_sec": float }
    """
    nodes = [start_camp] + destinations
    n = len(nodes)
    
    # 1. Build Distance / Duration Matrix
    matrix = [[0.0] * n for _ in range(n)]
    
    # Query OSRM Table API
    coords_str = ";".join(f"{node['lng']},{node['lat']}" for node in nodes)
    url = f"https://router.project-osrm.org/table/v1/driving/{coords_str}?annotations=duration,distance"
    
    osrm_success = False
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "durations" in data:
                durations = data["durations"]
                for i in range(n):
                    for j in range(n):
                        matrix[i][j] = durations[i][j]
                osrm_success = True
    except Exception as e:
        print(f"OSRM Table API failed: {e}. Falling back to Haversine matrix.")
        
    if not osrm_success:
        # Fallback to straight-line distance (converted roughly to travel seconds at 40 km/h)
        for i in range(n):
            for j in range(n):
                if i == j:
                    matrix[i][j] = 0.0
                else:
                    d = haversine(nodes[i]["lat"], nodes[i]["lng"], nodes[j]["lat"], nodes[j]["lng"])
                    matrix[i][j] = d * 90.0 # 40 km/h -> ~90 seconds per km
                    
    # Apply Blocked Road Penalty
    for i in range(n):
        for j in range(n):
            if i != j:
                if is_path_blocked(nodes[i]["lat"], nodes[i]["lng"], nodes[j]["lat"], nodes[j]["lng"], blocked_zones):
                    # Multiplier penalty to reroute away from blockage
                    matrix[i][j] *= 50.0
                    
    # 2. Solve TSP
    if n <= 8:
        path_indices = solve_tsp_permutations(matrix)
    else:
        path_indices = solve_tsp_nearest_neighbor(matrix)
        
    ordered_nodes = [nodes[idx] for idx in path_indices]
    
    # 3. Retrieve Actual Road Polyline Geometry from OSRM Route API
    route_geometry = []
    total_distance = 0.0
    total_duration = 0.0
    
    # Add return node (camp) to coordinates path for full loop route query
    coords_loop = [ordered_nodes[i] for i in range(len(ordered_nodes))] + [start_camp]
    coords_loop_str = ";".join(f"{node['lng']},{node['lat']}" for node in coords_loop)
    
    route_url = f"https://router.project-osrm.org/route/v1/driving/{coords_loop_str}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(route_url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "routes" in data and len(data["routes"]) > 0:
                route = data["routes"][0]
                total_distance = float(route["distance"]) / 1000.0 # convert to km
                total_duration = float(route["duration"]) # in seconds
                
                # Flip OSRM geometry coordinates [lng, lat] -> [lat, lng] for Leaflet
                coords_flipped = [[coord[1], coord[0]] for coord in route["geometry"]["coordinates"]]
                route_geometry = coords_flipped
    except Exception as e:
        print(f"OSRM Route API failed: {e}. Falling back to straight-line polylines.")
        
    if not route_geometry:
        # Fallback straight lines
        route_geometry = [[node["lat"], node["lng"]] for node in coords_loop]
        total_distance = sum(haversine(coords_loop[i]["lat"], coords_loop[i]["lng"], coords_loop[i+1]["lat"], coords_loop[i+1]["lng"]) for i in range(len(coords_loop)-1))
        total_duration = total_distance * 90.0
        
    return {
        "path": ordered_nodes,
        "route_geometry": route_geometry,
        "total_distance_km": round(total_distance, 2),
        "total_duration_sec": round(total_duration, 1)
    }
