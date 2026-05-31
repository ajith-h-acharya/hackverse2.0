# Gemini AI Integration for Mangalore Navigator

Integrate Google's Gemini AI into the `ChatAssistant` component to provide intelligent responses, follow instructions, and perform automated tasks (like itinerary building).

## User Review Required

> [!IMPORTANT]
> You will need to provide a Gemini API Key. I will create a `.env` file where you can paste it.
> The key should be set as `VITE_GEMINI_API_KEY`.

## Proposed Changes

### Dependencies

- Install `@google/generative-ai`

### [NEW] [gemini.js](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/src/utils/gemini.js)

Create a utility service to handle communication with Gemini.
- Initialize the Google Generative AI client.
- Define a system prompt that provides context about Mangaluru/Udupi locations and hotels.
- Implement a function to get AI responses and parse potential "actions".

### [MODIFY] [ChatAssistant.jsx](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/src/components/ChatAssistant.jsx)

- Replace the local `generateAIResponse` function with calls to the new Gemini service.
- Update the UI to show a "Thinking..." state more prominently.
- Handle the JSON-based action protocol from the AI (e.g., `SET_STOPS`, `SWITCH_TAB`).

### [NEW] [.env](file:///c:/Users/Ajith/OneDrive/Desktop/New%20folder/.env)

- Add `VITE_GEMINI_API_KEY=` placeholder.

## Verification Plan

### Automated Tests
- I will verify the code structure and ensure the API call logic is correct.
- Since I cannot run the actual API without a valid key, I will provide clear instructions for you to test it.

### Manual Verification
- Verify that the chat window opens and sends messages.
- Verify that the "Typing" animation appears.
- Verify (after user adds API key) that Gemini responds with relevant Mangalore travel info.
- Verify that commands like "Plan a beach trip" trigger the automated route building.
