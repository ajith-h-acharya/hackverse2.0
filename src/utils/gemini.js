import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateDistance } from "./haversine";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are the "manglore.nav AI", a highly intelligent travel assistant for the Mangaluru and Udupi regions.
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
2. SWITCH_TAB: { "type": "SWITCH_TAB", "payload": "explore" | "dining" | "stays" | "routes" | "favorites" }
3. ROUTE_TO: { "type": "ROUTE_TO", "payload": locationId } - Use this specifically when a user asks to navigate, get directions, or route to a single destination from their location.

SUGGESTIONS:
You should also include a list of 2-3 suggested follow-up questions in a "suggestions" field of your JSON block, which will be shown to the user as clickable option chips.
Example:
\`\`\`json
{ 
  "type": "SET_STOPS", 
  "payload": [1, 19],
  "suggestions": ["Tell me about Panambur Beach", "How do I get there?", "Find hotels nearby"] 
}
\`\`\`
Even if there is no main system action (like mapping stops or switching tabs), you can still output an action block just for suggestions, for example:
\`\`\`json
{
  "suggestions": ["What are the best seafood restaurants?", "Plan a temple route"]
}
\`\`\`
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
    const contextString = `
    LOCATIONS (sorted by proximity to user):
    ${sortedLocations.map(l => `ID ${l.id}: ${l.name} | Category: ${l.category} | Region: ${l.region} | Experience: ${l.experience} | Description: ${l.description} | Sustainable: ${l.sustainable ? 'Yes' : 'No'} | Transport: ${l.lastMile?.join(', ') || 'N/A'}`).join('\n    ')}

    HOTELS (sorted by proximity to user):
    ${sortedHotels.map(h => `ID ${h.id}: ${h.name} | Type: ${h.type} | Region: ${h.region} | Price: ${h.price} | Rating: ${h.rating}/5 | Description: ${h.description}`).join('\n    ')}
    `;

    const systemInstruction = `${SYSTEM_PROMPT}\n\nCONTEXT:\n${contextString}`;
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    // Map history and ensure alternating roles
    const formattedHistory = [];
    chatHistory.forEach(msg => {
      const role = msg.role === 'bot' ? 'model' : 'user';
      const text = msg.content || "";
      if (!text.trim()) return;

      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
        formattedHistory[formattedHistory.length - 1].parts[0].text += "\n" + text;
      } else {
        formattedHistory.push({
          role: role,
          parts: [{ text: text }]
        });
      }
    });

    // If chat history ends with user role, pop it so we can send the current userQuery cleanly
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.pop();
    }

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(userQuery);
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

  // Match any curly braces JSON block containing type or suggestions
  const jsonRegex = /({[\s\S]*?})/s;
  const match = text.match(jsonRegex);

  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed && (parsed.type || parsed.suggestions)) {
        action = parsed;
        cleanText = text.replace(match[0], '').trim();
      }
    } catch (e) {
      try {
        const fixedJson = match[0].replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        const parsed = JSON.parse(fixedJson);
        if (parsed && (parsed.type || parsed.suggestions)) {
          action = parsed;
          cleanText = text.replace(match[0], '').trim();
        }
      } catch (e2) {
        console.warn("Could not parse AI JSON:", match[0]);
      }
    }
  }

  // Clean up any remaining markdown backticks if any are left
  cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();

  return { text: cleanText, action };
}

function simulateIntelligentResponse(query, locations, chatHistory = [], isError = false) {
  const q = query.toLowerCase();
  let response = { text: "", action: null };
  const offlineNote = isError ? "\n\n*(Neural link error)*" : "\n\n*(Running in Local Mode)*";

  // Check for region filter
  let regionFilter = null;
  if (q.includes('udupi')) {
    regionFilter = 'Udupi';
  } else if (q.includes('mangaluru') || q.includes('mangalore')) {
    regionFilter = 'Mangaluru';
  }

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
      
      // If region filter is active, check region match
      if (regionFilter && loc.region !== regionFilter) continue;
      
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

  // Filter locations by region if filter active and not already filtered
  let availableLocations = locations;
  if (regionFilter) {
    availableLocations = locations.filter(l => l.region === regionFilter);
  }

  if (matchedLocations.length > 0) {
    const loc = matchedLocations[0];
    const names = matchedLocations.map(l => l.name).join(' and ');
    const ids = matchedLocations.map(l => l.id);

    if (matchedLocations.length > 1 || q.includes('circuit')) {
      response.text = `Circuit sequence initiated. I've mapped a route for ${names}.`;
      response.action = { 
        type: 'SET_STOPS', 
        payload: ids,
        suggestions: [`Tell me about ${loc.name}`, "Suggest hotels near here", "How to get there?"]
      };
    } else if (q.includes('navigate') || q.includes('route') || q.includes('directions') || q.includes('take me') || q.includes('path') || q.includes('how to reach')) {
      response.text = `Routing sequence initiated. Calculating optimal path from your current location to ${loc.name}...`;
      response.action = { 
        type: 'ROUTE_TO', 
        payload: loc.id,
        suggestions: [`Tell me about ${loc.name}`, `Find hotels near ${loc.name}`, "Switch to dining tab"]
      };
    } else {
      response.text = `Target acquired: ${loc.name}. I've pulled up its coordinates from my local database and set it as your destination!`;
      response.action = { 
        type: 'SET_STOPS', 
        payload: [loc.id],
        suggestions: [`Navigate to ${loc.name}`, `What is special about ${loc.name}?`, `Find hotels near ${loc.name}`]
      };
    }
  } 
  // Handle conversational requests for paths without a specific location
  else if (q.includes('path') || q.includes('route') || q.includes('navigate')) {
    response.text = "I need a specific destination! For example, try saying: 'Navigate to Panambur Beach'.";
    response.action = {
      suggestions: ["Navigate to Panambur Beach", "Plan a temple route", "Show me Udupi beaches"]
    };
  }
  // 3. Handle categories and needs analysis
  else if (q.includes('beach') || q.includes('coast') || q.includes('ocean') || q.includes('sea') || q.includes('surf')) {
    const beachIds = availableLocations.filter(l => l.category === 'Coastal').slice(0, 2).map(l => l.id);
    const beachNames = availableLocations.filter(l => l.category === 'Coastal').slice(0, 2).map(l => l.name);
    response.text = `Coastal Expedition protocol active! I've mapped the best beach nodes for your mission (${beachNames.join(', ')}).`;
    response.action = { 
      type: 'SET_STOPS', 
      payload: beachIds,
      suggestions: ["Show hotels near the beach", "Find seafood spots nearby", "What's the best time to visit?"]
    };
  } else if (q.includes('temple') || q.includes('spiritual') || q.includes('pray') || q.includes('matha')) {
    const templeIds = availableLocations.filter(l => l.category === 'Religious').slice(0, 2).map(l => l.id);
    const templeNames = availableLocations.filter(l => l.category === 'Religious').slice(0, 2).map(l => l.name);
    response.text = `Spiritual Circuit mapped. I've added the top religious nodes (${templeNames.join(', ')}) to your itinerary.`;
    response.action = { 
      type: 'SET_STOPS', 
      payload: templeIds,
      suggestions: ["Show historical places", "Suggest local stays", "How do I travel between these?"]
    };
  } else if (q.includes('hotel') || q.includes('stay') || q.includes('sleep') || q.includes('rest') || q.includes('resort')) {
    response.text = "Hospitality nodes accessed. Switching to the Stays module for you.";
    response.action = { 
      type: 'SWITCH_TAB', 
      payload: 'stays',
      suggestions: ["Show luxury stays", "Show budget options", "Recommend a beach resort"]
    };
  } else if (q.includes('peace') || q.includes('relax') || q.includes('quiet') || q.includes('sunset')) {
    const peacefulIds = availableLocations.filter(l => l.category === 'Coastal' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "I sense you need tranquility. I've mapped the most peaceful coastal and nature nodes for your relaxation protocol.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: peacefulIds,
      suggestions: ["Find a hotel near one of these", "Suggest local food options", "Show historical chapels"]
    };
  } else if (q.includes('family') || q.includes('kids') || q.includes('fun')) {
    const familyIds = availableLocations.filter(l => l.category === 'Heritage' || l.category === 'Urban' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "Family expedition mapped! I've selected the safest and most engaging cultural and natural hubs.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: familyIds,
      suggestions: ["Are these kids-friendly?", "Show hotels with pool", "Recommend ice cream parlors"]
    };
  } else if (q.includes('sad') || q.includes('depressed') || q.includes('down') || q.includes('unhappy')) {
    const upliftingIds = availableLocations.filter(l => l.category === 'Coastal' || l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "I sense your mood. Let's lift those spirits! I've plotted a soothing therapeutic circuit of peaceful coastal and natural nodes to help you recharge.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: upliftingIds,
      suggestions: ["Show beach details", "Where can I get good food?", "Switch to explore tab"]
    };
  } else if (q.includes('energetic') || q.includes('adventure') || q.includes('excited') || q.includes('happy') || q.includes('trek') || q.includes('kayak') || q.includes('climb')) {
    const adventureIds = availableLocations.filter(l => l.category === 'Urban' || l.category === 'Nature' || l.category === 'Adventure').slice(0, 3).map(l => l.id);
    response.text = "High energy levels detected! I've mapped a thrilling adventure circuit for maximum exploration.";
    response.action = { 
      type: 'SET_STOPS', 
      payload: adventureIds,
      suggestions: ["How difficult is the trek?", "Find surfing spots", "Plan a beach trip"]
    };
  } else if (q.includes('food') || q.includes('eat') || q.includes('hungry') || q.includes('dinner') || q.includes('lunch') || q.includes('restaurant') || q.includes('seafood') || q.includes('dosa') || q.includes('ice cream')) {
    const foodIds = availableLocations.filter(l => l.category === 'Culinary').slice(0, 3).map(l => l.id);
    if (foodIds.length > 0) {
      response.text = "Culinary sensors activated. I've instantly mapped the closest dining spots for you.";
      response.action = { 
        type: 'SET_STOPS', 
        payload: foodIds,
        suggestions: ["Switch to dining tab", "Which is famous for Gadbad?", "Recommend budget dining"]
      };
    } else {
      response.text = "Culinary sensors activated. Switching to the Stays module where you can find hotel restaurants.";
      response.action = { 
        type: 'SWITCH_TAB', 
        payload: 'stays',
        suggestions: ["Show dining spots", "Where is Mitra Samaj?", "Where is Giri Manja's?"]
      };
    }
  } else if (q.includes('fort') || q.includes('heritage') || q.includes('history') || q.includes('ancient') || q.includes('monument')) {
    const heritageIds = availableLocations.filter(l => l.category === 'Heritage').slice(0, 3).map(l => l.id);
    const heritageNames = availableLocations.filter(l => l.category === 'Heritage').slice(0, 3).map(l => l.name);
    response.text = `Heritage protocol active! I've selected ancient monuments and forts: ${heritageNames.join(', ')}.`;
    response.action = {
      type: 'SET_STOPS',
      payload: heritageIds,
      suggestions: ["Tell me about Sultan Battery", "Show spiritual places", "Find stays nearby"]
    };
  } else if (q.includes('nature') || q.includes('waterfall') || q.includes('falls') || q.includes('lake') || q.includes('zoo') || q.includes('park') || q.includes('butterfly')) {
    const natureIds = availableLocations.filter(l => l.category === 'Nature').slice(0, 3).map(l => l.id);
    response.text = "Nature trail coordinates mapped. Added parks, lakes and waterfalls to your map.";
    response.action = {
      type: 'SET_STOPS',
      payload: natureIds,
      suggestions: ["Show details of Kudlu Falls", "Is Pilikula Zoo open?", "Find beach routes"]
    };
  } else if (q.includes('shop') || q.includes('mall') || q.includes('city') || q.includes('nightlife') || q.includes('bar') || q.includes('lounge')) {
    const urbanIds = availableLocations.filter(l => l.category === 'Urban').slice(0, 3).map(l => l.id);
    response.text = "Urban coordinates active. Mapping city attractions, malls, and lounges.";
    response.action = {
      type: 'SET_STOPS',
      payload: urbanIds,
      suggestions: ["Switch to dining tab", "Recommend stays nearby", "What is the best pub?"]
    };
  }
  // 4. Default fallback
  else {
    response.text = "I'm ready to assist! Try asking me for specific places like 'Navigate to Panambur Beach' or interests like 'waterfalls near Udupi'.";
    response.action = {
      suggestions: ["Plan a beach circuit", "Find restaurants in Mangalore", "Recommend a luxury resort"]
    };
  }

  response.text += offlineNote;
  return response;
}

