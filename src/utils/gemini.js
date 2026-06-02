export async function getGeminiResponse(userQuery, locations = [], hotels = [], chatHistory = [], userLocation = null) {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userQuery,
        locations,
        hotels,
        chatHistory,
        userLocation
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Network request failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return {
      text: "Connection offline. Running simulated local navigator protocol...",
      action: {
        suggestions: ["Try again", "Navigate to Panambur Beach"]
      }
    };
  }
}
