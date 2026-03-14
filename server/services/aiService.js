const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const MODEL = "gpt-4o";

// ── Generate Itinerary ───────────────────────────────
async function generateItinerary({ city, days, places, preferences, hotelLocation, hotels, budget }) {
  // Separate priority, hidden gems, and normal places
  const highPriority = places.filter(p => p.priority === "HIGH");
  const hiddenGems = places.filter(p => p.is_hidden_gem && p.priority !== "HIGH");
  const normalPlaces = places.filter(p => !p.is_hidden_gem && p.priority !== "HIGH");

  const formatPlace = (p) =>
    `- ${p.name} (id:${p.id}, ${p.category}${p.is_hidden_gem ? ', HIDDEN_GEM' : ''}) | Rating: ${p.rating} | ` +
    `Best: ${p.best_time_of_day} | Duration: ${p.average_visit_duration_hours}h | ` +
    `Lat: ${p.latitude}, Lng: ${p.longitude}` +
    (p.popularity ? ` | Popularity: ${p.popularity}/100` : '') +
    (p.vote_score ? ` | Votes: ${p.vote_score}` : "");

  const highBlock = highPriority.length > 0
    ? `## ⭐ PRIORITY Places (voted/wishlisted by the group — MUST include these)\n${highPriority.map(formatPlace).join("\n")}`
    : "## No priority places — use the best-rated places below.";

  const hiddenBlock = hiddenGems.length > 0
    ? `## 💎 HIDDEN GEMS (high rating, low popularity — local secrets!)\n${hiddenGems.map(formatPlace).join("\n")}`
    : "";

  const normalBlock = `## 📍 Other Available Places (use these to FILL remaining slots)\n${normalPlaces.map(formatPlace).join("\n")}`;

  // Hotel block for AI context
  const formatHotel = (h) =>
    `- ${h.name} (id:${h.id}) | Area: ${h.area} | Rating: ${h.rating}/5 | ` +
    `₹${h.price_per_night}/night (${h.price_category}) | ` +
    `Lat: ${h.latitude}, Lng: ${h.longitude} | ` +
    `Amenities: ${(h.amenities || []).join(", ")}`;

  const hotelBlock = hotels && hotels.length > 0
    ? `## 🏨 Available Hotels in ${city}\n${hotels.map(formatHotel).join("\n")}`
    : "";

  const prompt = `You are an expert travel planner. Create a ${days}-day itinerary for ${city}, India.

${highBlock}

${hiddenBlock}

${normalBlock}

${hotelBlock}

## IMPORTANT RULES
- You MUST fill ALL ${days} days with 3-5 places each. No day should be empty.
- PRIORITY places must be included first — schedule them on the best-suited days.
- FILL remaining slots in each day using other available places, choosing the highest-rated ones.
- Group nearby places on the same day to minimize travel distance.
- Respect each place's best_time_of_day (morning/afternoon/evening/night).
- Total visit duration per day should not exceed 12 hours.
- Order activities chronologically: morning → afternoon → evening → night.
- Do NOT invent new places. Only use places from the lists above.
${hiddenGems.length > 0 ? `- You MUST include exactly 1 HIDDEN GEM place in the itinerary. Pick the one that fits best geographically and thematically. Mark it with "is_hidden_gem": true in the output.` : ""}
${hotelLocation ? `- Hotel location: Lat ${hotelLocation.lat}, Lng ${hotelLocation.lng}. Minimize daily travel from hotel.` : ""}
${preferences ? `- User preferences: ${preferences}` : ""}
${budget ? `- Trip budget: ₹${budget}. Recommend hotels matching this budget level.` : ""}
${hotels && hotels.length > 0 ? `- Recommend TOP 3 best hotels from the hotel list above. Pick hotels that are:
  1. Close to the majority of itinerary locations (minimize travel)
  2. Highest rated in their price category
  3. Matching the trip budget if specified
  - Use ONLY hotels from the provided list. Do NOT invent hotels.` : ""}

## Output — ONLY valid JSON, no markdown fences
{
  "itinerary": {
    "day1": [
      { "place": "Name", "place_id": 1, "time_of_day": "morning", "duration_hours": 2, "notes": "tip", "is_hidden_gem": false }
    ],
    "day2": [...]
  },
  ${hotels && hotels.length > 0 ? `"hotel_recommendations": [
    {
      "hotel_id": 1,
      "name": "Hotel Name",
      "area": "Area Name",
      "rating": 4.5,
      "price_per_night": 5000,
      "price_category": "mid-range",
      "reason": "Brief reason why this hotel is recommended"
    }
  ],` : ""}
  "reasoning": "Brief explanation of grouping logic"
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_completion_tokens: 3000,
  });

  const text = response.choices[0].message.content.trim();

  // Strip markdown code fences if AI adds them
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return JSON.parse(cleaned);
}

// ── Edit Itinerary ───────────────────────────────────
async function editItinerary({ city, currentItinerary, editInstruction, places }) {
  const hiddenGems = places.filter(p => p.is_hidden_gem);
  const regularPlaces = places.filter(p => !p.is_hidden_gem);

  const regularBlock = regularPlaces
    .map((p) => `- ${p.name} (id:${p.id}, ${p.category}, rating:${p.rating})`)
    .join("\n");

  const gemsBlock = hiddenGems.length > 0
    ? `## 💎 Hidden Gems (can swap in if user wants hidden gems)\n${hiddenGems.map(p => `- ${p.name} (id:${p.id}, ${p.category}, rating:${p.rating}, HIDDEN_GEM)`).join("\n")}`
    : "";

  const prompt = `You are an expert travel planner. Modify the existing itinerary for ${city} based on the user's request.

## Current Itinerary
${JSON.stringify(currentItinerary, null, 2)}

## Available Regular Places (can swap in — use ONLY these)
${regularBlock}

${gemsBlock}

## User's Edit Request
"${editInstruction}"

## Rules
- Ideal: 3 places per day, but 4-5 is acceptable if the user requests more activities
- Respect time-of-day constraints
- Keep same JSON structure as current itinerary
- Do NOT invent new places
- If the user asks for "hidden gems", "secret spots", "offbeat", or "less crowded" places, swap in places from the Hidden Gems list and mark them with "is_hidden_gem": true
- Each place in output should have "is_hidden_gem": true or false

## Output — ONLY valid JSON, no markdown fences
{
  "itinerary": {
    "day1": [
      { "place": "Name", "place_id": 1, "time_of_day": "morning", "duration_hours": 2, "notes": "tip" }
    ],
    "day2": [...]
  },
  "reasoning": "Brief explanation of changes made"
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_completion_tokens: 2000,
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  const parsed = JSON.parse(cleaned);

  // Normalize: if AI returned bare itinerary without wrapper, wrap it
  if (parsed.itinerary) {
    return parsed;
  } else {
    return { itinerary: parsed, reasoning: "" };
  }
}

// ── Recommend Hotels (Chat-based) ────────────────────
async function recommendHotels({ city, hotels, userMessage, budget, days }) {
  const formatHotel = (h) =>
    `- ${h.name} (id:${h.id}) | Area: ${h.area} | Rating: ${h.rating}/5 | ` +
    `₹${h.price_per_night}/night (${h.price_category}) | ` +
    `Amenities: ${(h.amenities || []).join(", ")} | ` +
    `Description: ${h.description || "N/A"}`;

  const prompt = `You are an expert hotel concierge for ${city}, India. A traveler needs hotel recommendations.

## Available Hotels in ${city}
${hotels.map(formatHotel).join("\n")}

## Traveler's Request
"${userMessage}"

${budget ? `## Budget Info: ₹${budget} total for ${days || "a few"} days (≈ ₹${Math.round(budget / (days || 3))}/night)` : ""}

## Rules
- Recommend the BEST matching hotels from the list above based on the traveler's request.
- Consider: budget constraints, preferred area, amenities, rating, and value for money.
- If traveler mentions a budget, calculate per-night budget and filter accordingly.
- Return 3-5 hotels ranked by best match.
- Use ONLY hotels from the provided list. Do NOT invent hotels.
- Give a personalized reason for each pick.

## Output — ONLY valid JSON, no markdown fences
{
  "recommendations": [
    {
      "hotel_id": 1,
      "name": "Hotel Name",
      "area": "Area Name",
      "rating": 4.5,
      "price_per_night": 5000,
      "price_category": "mid-range",
      "amenities": ["wifi", "pool"],
      "reason": "Personalized reason why this hotel matches the traveler's request"
    }
  ],
  "summary": "A brief friendly summary of your recommendations, addressing the traveler's specific needs"
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_completion_tokens: 1500,
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return JSON.parse(cleaned);
}

module.exports = { generateItinerary, editItinerary, recommendHotels };
