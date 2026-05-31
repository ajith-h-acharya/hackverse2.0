import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateDistance } from "./haversine";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are the "Mangalore Navigator AI", a highly intelligent travel assistant for the Mangaluru and Udupi regions.
Your mission is to help users explore destinations, plan itineraries, find hotels, and learn about the local culture.

INTELLIGENCE GUIDELINES:
1. Typo & Phonetic Matching: If a user misspells a location (e.g., "taneru bhavi", "sultan btry", "manipal"), map it to the closest phonetic/logical match in the LOCATIONS list (e.g. "Tannirbhavi Beach", "Sultan Battery"). Do not hallucinate places.
2. Needs Analysis: If the user states an abstract need ("I want peace", "family friendly", "hungry"), intelligently select 2-3 locations from the list that match their needs AND ALWAYS use the SET_STOPS action to instantly map them on the user's screen. The provided LOCATIONS and HOTELS lists are ordered by distance from the user. ALWAYS prioritize the closest (top) options first unless they specify otherwise. If they ask for "all" places, list them all.
3. Emotional Intelligence: If the user expresses a mood or emotion (e.g., "I am sad", "feeling stressed", "energetic", "happy"), automatically build a therapeutic or matching circuit (2-3 locations). For example, if they are sad, create a soothing nature/coastal circuit to uplift them. If energetic, suggest an adventure or urban circuit. Always trigger the SET_STOPS action for this.
4. Conversational Tone: Be highly enthusiastic, authoritative, and helpful. Use a sci-fi/navigator persona ("Target acquired", "Plotting coordinates", "Sensors indicate").

ACTION PROTOCOL:
You can perform special system actions by including a JSON block at the end of your response.
CRITICAL: Location IDs must be integers (e.g. 19), NOT strings (e.g. "19").
Possible actions:
1. SET_STOPS: { "type": "SET_STOPS", "payload": [locationId1, locationId2, ...] }
2. SWITCH_TAB: { "type": "SWITCH_TAB", "payload": "explore" | "routes" | "culture" | "stays" | "events" }
3. ROUTE_TO: { "type": "ROUTE_TO", "payload": locationId } - Use this specifically when a user asks to navigate, get directions, or route to a single destination from their location.

Example: "I've mapped the best sunset spots for you!
\`\`\`json
{ "type": "SET_STOPS", "payload": [1, 19] }
\`\`\`"
`;

export async function getGeminiResponse(userQuery, locations = [], hotels = [], chatHistory = [], userLocation = null) {
  let sortedLocations = [...locations];
  let sortedHotels = [...hotels];

  if (userLocation) {
    const [lat, lng] = userLocation;
    sortedLocations.sort((a, b) => calculateDistance(lat, lng, a.lat, a.lng) - calculateDistance(lat, lng, b.lat, b.lng));
    sortedHotels.sort((a, b) => calculateDistance(lat, lng, a.lat, a.lng) - calculateDistance(lat, lng, b.lat, b.lng));
  }

  // If API Key is missing, provide a "Smart Fallback" so the bot still works to some extent
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    return simulateIntelligentResponse(userQuery, sortedLocations, chatHistory);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const contextString = `
    LOCATIONS: ${sortedLocations.map(l => `${l.name}(ID:${l.id})`).join(', ')}
    HOTELS: ${sortedHotels.map(h => h.name).join(', ')}
    `;

    const prompt = `${SYSTEM_PROMPT}\n\nCONTEXT: ${contextString}\n\nQuery: ${userQuery}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseAIResponse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return simulateIntelligentResponse(userQuery, sortedLocations, chatHistory, true);
  }
}

function parseAIResponse(text) {
  let action = null;
  let cleanText = text;

  // Try to find anything that looks like a JSON object with a type property
  const jsonRegex = /\{.*"type".*\}/s;
  const match = text.match(jsonRegex);

  if (match) {
    try {
      action = JSON.parse(match[0]);
      cleanText = text.replace(match[0], '').trim();
    } catch (e) {
      // If parsing fails, try to fix common issues like trailing commas
      try {
        const fixedJson = match[0].replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        action = JSON.parse(fixedJson);
        cleanText = text.replace(match[0], '').trim();
      } catch (e2) {
        console.warn("Could not parse AI action JSON:", match[0]);
      }
    }
  }

  return { text: cleanText, action };
}

function simulateIntelligentResponse(query, locations, chatHistory = [], isError = false) {
  const q = query.toLowerCase();
  let response = { text: "", action: null };
  const offlineNote = isError ? "\n\n*(Neural link error)*" : "\n\n*(Running in Local Mode)*";

  // Helper to find locations in text with robust fuzzy matching
  const findLocationsInText = (text) => {
    const textLower = text.toLowerCase();
    const matched = new Set();

    const levenshtein = (a, b) => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      let prevRow = Array(b.length + 1).fill(0).map((_, i) => i);
      for (let i = 0; i < a.length; i++) {
        const currRow = [i + 1];
        for (let j = 0; j < b.length; j++) {
          const indicator = a[i] === b[j] ? 0 : 1;
          currRow.push(Math.min(currRow[j] + 1, prevRow[j + 1] + 1, prevRow[j] + indicator));
        }
        prevRow = currRow;
      }
      return prevRow[b.length];
    };

    const textWords = textLower.split(/\W+/).filter(w => w.length >= 3);
    const bigrams = [];
    for (let i = 0; i < textWords.length - 1; i++) {
      bigrams.push(textWords[i] + textWords[i+1]);
    }
    const combinedWords = [...textWords, ...bigrams];

    for (const loc of locations) {
      const name = loc.name.toLowerCase();
      
      // 1. Exact substring match
      if (textLower.includes(name)) {
        matched.add(loc);
        continue;
      }
      
      // 2. Core name match (ignoring generic terms)
      const coreName = name.replace(/\b(beach|temple|park|lake|mall|chapel|church|hotel|restaurant|falls|caves|island|matha)\b/g, '').trim();
      if (coreName.length >= 4 && textLower.includes(coreName)) {
        matched.add(loc);
        continue;
      }

      // 3. Fuzzy word match with bigram support
      const significantWords = coreName.split(/\W+/).filter(w => 
        w.length >= 4 && !['city', 'centre', 'the', 'sri'].includes(w)
      );

      for (const sw of significantWords) {
        let found = false;
        for (const tw of combinedWords) {
          const dist = levenshtein(sw, tw);
          const maxDist = sw.length > 5 ? 2 : 1;
          if (dist <= maxDist || (sw.length >= 5 && tw.length >= 5 && (sw.startsWith(tw.substring(0, 4)) || tw.startsWith(sw.substring(0, 4))))) {
             found = true;
             break;
          }
        }
        if (found) {
          matched.add(loc);
          break;
        }
      }
    }
    return Array.from(matched);
  };

  // 1. Try to find location in current query
  let matchedLocations = findLocationsInText(q);

  // 2. If no location in current query, check chat history for context
  if (matchedLocations.length === 0) {
    // Look backwards through history for the most recent user message that mentioned a location
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role === 'user') {
        const histLocs = findLocationsInText(chatHistory[i].content);
        if (histLocs.length > 0) {
          matchedLocations = histLocs;
          break;
        }
      }
    }
  }

  if (matchedLocations.length > 0) {
    if (matchedLocations.length > 1 || q.includes('circuit')) {
      response.text = `Circuit sequence initiated. I've mapped a route for ${matchedLocations.map(l => l.name).join(' and ')}.`;
      response.action = { type: 'SET_STOPS', payload: matchedLocations.map(l => l.id) };
    } else if (q.includes('navigate') || q.includes('route') || q.includes('directions') || q.includes('take me') || q.includes('path')) {
      response.text = `Routing sequence initiated. Calculating optimal path from your current location to ${matchedLocations[0].name}...`;
      response.action = { type: 'ROUTE_TO', payload: matchedLocations[0].id };
    } else {
      response.text = `Target acquired: ${matchedLocations[0].name}. I've pulled up its coordinates from my local database and set it as your destination!`;
      response.action = { type: 'SET_STOPS', payload: [matchedLocations[0].id] };
    }
  } 
  // Handle conversational requests for paths without a specific location
  else if (q.includes('path') || q.includes('route') || q.includes('navigate')) {
    response.text = "I need a specific destination! For example, try saying: 'Navigate to Panambur Beach'.";
  }
  // 3. Handle categories and needs analysis
  else if (q.includes('beach') || q.includes('coast') || q.includes('ocean')) {
    const beachIds = locations.filter(l => l.category === 'Coastal').slice(0, 2).map(l => l.id);
    response.text = "Coastal Expedition protocol active! I've mapped the best beach nodes for your mission.";
    response.action = { type: 'SET_STOPS', payload: beachIds };
  } else if (q.includes('temple') || q.includes('spiritual') || q.includes('pray')) {
    const templeIds = locations.filter(l => l.category === 'Religious').slice(0, 2).map(l => l.id);
    response.text = "Spiritual Circuit mapped. I've added the top religious nodes to your itinerary.";
    response.action = { type: 'SET_STOPS', payload: templeIds };
  } else if (q.includes('hotel') || q.includes('stay') || q.includes('sleep') || q.includes('rest')) {
    response.text = "Hospitality nodes accessed. Switching to the Stays module for you.";
    response.action = { type: 'SWITCH_TAB', payload: 'stays' };
  } else if (q.includes('peace') || q.includes('relax') || q.includes('quiet') || q.includes('sunset')) {
    const peacefulIds = locations.filter(l => l.category === 'Coastal' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "I sense you need tranquility. I've mapped the most peaceful coastal and nature nodes for your relaxation protocol.";
    response.action = { type: 'SET_STOPS', payload: peacefulIds };
  } else if (q.includes('family') || q.includes('kids') || q.includes('fun')) {
    const familyIds = locations.filter(l => l.category === 'Heritage' || l.category === 'Urban').slice(0, 3).map(l => l.id);
    response.text = "Family expedition mapped! I've selected the safest and most engaging cultural and urban hubs.";
    response.action = { type: 'SET_STOPS', payload: familyIds };
  } else if (q.includes('sad') || q.includes('depressed') || q.includes('down') || q.includes('unhappy')) {
    const upliftingIds = locations.filter(l => l.category === 'Coastal' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "I sense your mood. Let's lift those spirits! I've plotted a soothing therapeutic circuit of peaceful coastal and natural nodes to help you recharge.";
    response.action = { type: 'SET_STOPS', payload: upliftingIds };
  } else if (q.includes('energetic') || q.includes('adventure') || q.includes('excited') || q.includes('happy')) {
    const adventureIds = locations.filter(l => l.category === 'Urban' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "High energy levels detected! I've mapped a thrilling adventure circuit for maximum exploration.";
    response.action = { type: 'SET_STOPS', payload: adventureIds };
  } else if (q.includes('food') || q.includes('eat') || q.includes('hungry') || q.includes('dinner') || q.includes('lunch')) {
    const foodIds = locations.filter(l => l.category === 'Culinary').slice(0, 3).map(l => l.id);
    if (foodIds.length > 0) {
      response.text = "Culinary sensors activated. I've instantly mapped the closest dining spots for you.";
      response.action = { type: 'SET_STOPS', payload: foodIds };
    } else {
      response.text = "Culinary sensors activated. Switching to the Stays module where you can find hotel restaurants.";
      response.action = { type: 'SWITCH_TAB', payload: 'stays' };
    }
  } 
  // 4. Default fallback
  else {
    response.text = "I'm ready to assist! Try asking me for specific places like 'Navigate to Panambur Beach'.";
  }

  response.text += offlineNote;
  return response;
}
