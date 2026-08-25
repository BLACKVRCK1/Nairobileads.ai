import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Preset neighborhood coordinates for Google Maps grounding context
const NAIROBI_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Westlands": { lat: -1.2683, lng: 36.8044 },
  "Ruiru": { lat: -1.1472, lng: 36.9577 },
  "Upper Hill": { lat: -1.2985, lng: 36.8188 },
  "Kilimani": { lat: -1.2894, lng: 36.7886 },
  "Industrial Area": { lat: -1.3134, lng: 36.8524 },
  "CBD": { lat: -1.2864, lng: 36.8172 },
  "Karen": { lat: -1.3197, lng: 36.7065 },
  "Gigiri": { lat: -1.2333, lng: 36.8000 },
  "Parklands": { lat: -1.2600, lng: 36.8200 },
  "Mombasa Road": { lat: -1.3350, lng: 36.8850 },
  "Thika Road": { lat: -1.2180, lng: 36.8900 },
  "Nairobi All": { lat: -1.2921, lng: 36.8219 },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Nairobi Lead Research Dashboard API" });
  });

  // 1. Places Discovery via Google Maps Grounding (gemini-3.7-flash)
  app.post("/api/discovery/maps-search", async (req, res) => {
    try {
      const { category, location, additionalKeywords } = req.body;
      if (!category || !location) {
        return res.status(400).json({ error: "category and location are required" });
      }

      const ai = getGenAI();
      const coords = NAIROBI_COORDINATES[location] || NAIROBI_COORDINATES["Nairobi All"];

      const prompt = `Search for top registered, operating businesses and company headquarters in Nairobi, Kenya matching:
Category/Sector: "${category}"
Location/Neighborhood: "${location}", Nairobi, Kenya
Additional Focus: "${additionalKeywords || "Established B2B companies, regional offices, headquarters"}"

Identify 6 to 10 prominent commercial companies, enterprises, or established service providers physically located in or serving ${location}, Nairobi.
For each company, retrieve:
1. Company Name
2. Exact Physical Location/Building/Street in ${location} or Nairobi
3. Approximate Rating and Review count if known
4. Primary business specializations
5. Public business presence notes

Please format each company clearly with structured headings so we can extract them for compliant research.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: coords.lat,
                longitude: coords.lng,
              },
            },
          },
        },
      });

      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Extract map links and citations
      const mapSources: Array<{ title?: string; uri?: string }> = [];
      for (const chunk of groundingChunks) {
        if ((chunk as any).maps?.uri) {
          mapSources.push({
            title: (chunk as any).maps?.title || "Google Maps Place",
            uri: (chunk as any).maps?.uri,
          });
        }
      }

      // Now pass to a fast structural parser to get clean JSON records
      const parsePrompt = `Here is raw research text found from Google Maps place grounding for businesses in ${location}, Nairobi in category "${category}":
"""
${text}
"""

Available Map Grounding Source Links:
${JSON.stringify(mapSources)}

Extract an array of verified companies. Return valid JSON matching this schema:
Array of objects where each has:
- name (string)
- locationDetail (string, e.g. "Watermark Business Park, Karen" or "The Mirage, Chiromo Rd, Westlands" or "Enterprise Road, Industrial Area")
- category (string, matched category)
- subSector (string, specific subsector e.g. "FinTech SaaS", "Cold Storage Logistics", "Agri-Processing")
- summary (string, 1-2 sentences on what they do)
- estimatedSize (string, e.g. "50-200 employees", "Enterprise", "Mid-market", "Growth SME")
- mapsUri (string or null, matched from map sources if available or null)
- rating (number or null)
- reviewCount (number or null)`;

      const parsedResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: parsePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                locationDetail: { type: Type.STRING },
                category: { type: Type.STRING },
                subSector: { type: Type.STRING },
                summary: { type: Type.STRING },
                estimatedSize: { type: Type.STRING },
                mapsUri: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                reviewCount: { type: Type.NUMBER },
              },
              required: ["name", "locationDetail", "category", "subSector", "summary"],
            },
          },
        },
      });

      let rawCompanies = [];
      try {
        rawCompanies = JSON.parse(parsedResponse.text?.trim() || "[]");
      } catch (err) {
        console.error("Failed to parse companies JSON:", err);
      }

      res.json({
        rawText: text,
        groundingChunks,
        mapSources,
        companies: rawCompanies,
      });
    } catch (error: any) {
      console.error("Maps search error:", error);
      res.status(500).json({ error: error.message || "Failed to search places on Google Maps" });
    }
  });

  // 2. Public Contact Verification & Web Grounding (gemini-3.7-flash with Google Search)
  app.post("/api/discovery/enrich-verify", async (req, res) => {
    try {
      const { companyName, location, category } = req.body;
      if (!companyName) {
        return res.status(400).json({ error: "companyName is required" });
      }

      const ai = getGenAI();
      const prompt = `Conduct compliant public-domain business research for company: "${companyName}" located in "${location || "Nairobi"}", Kenya (Category: ${category || "General Business"}).

Search official public web sources (official company website, contact page, verified public registry / directory, LinkedIn official company page).
Find ONLY independently public business contact details:
1. Official business website URL (e.g. https://www.company.co.ke)
2. Public general business email (e.g., info@company.co.ke, sales@, contact@, hq@, inquiries@)
3. Public business phone line (formatted as Kenyan phone: +254 20... or +254 7... / +254 1...)
4. Verified physical office address / Building name / Floor / Road in Nairobi
5. Operational indicators: key products/services, clients served, year founded if public
6. ODPC compliance classification: Confirm this is public legal business entity data without unauthorized private personal PII.

Provide factual information and cite sources.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const searchSources: Array<{ title: string; uri: string }> = [];

      for (const chunk of groundingChunks) {
        if ((chunk as any).web?.uri) {
          searchSources.push({
            title: (chunk as any).web?.title || "Official Public Source",
            uri: (chunk as any).web?.uri,
          });
        }
      }

      // Structure into compliant lead record
      const structPrompt = `Given this verified search grounding information for "${companyName}" in Nairobi, Kenya:
"""
${text}
"""
Sources:
${JSON.stringify(searchSources)}

Extract verified public business fields in JSON format:
- officialWebsite: (string or null, e.g. "https://...")
- publicEmail: (string or null, official business inquiry email e.g. "info@...")
- publicPhone: (string or null, official phone e.g. "+254...")
- officeAddress: (string, physical office in Nairobi)
- foundedYear: (string or null)
- coreOfferings: (array of strings, 3-5 main B2B products/services)
- decisionMakerTitle: (string, typical target B2B buyer title e.g. "Head of Supply Chain", "Chief Technology Officer", "Procurement Director")
- dataProtectionStatus: (string, e.g. "Compliant - Public Domain Corporate Record")
- sources: (array of objects { title, uri })
- confidenceScore: (number from 0 to 100 on contact accuracy)`;

      const structResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: structPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              officialWebsite: { type: Type.STRING },
              publicEmail: { type: Type.STRING },
              publicPhone: { type: Type.STRING },
              officeAddress: { type: Type.STRING },
              foundedYear: { type: Type.STRING },
              coreOfferings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              decisionMakerTitle: { type: Type.STRING },
              dataProtectionStatus: { type: Type.STRING },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    uri: { type: Type.STRING },
                  },
                  required: ["title", "uri"],
                },
              },
              confidenceScore: { type: Type.NUMBER },
            },
            required: [
              "officeAddress",
              "coreOfferings",
              "decisionMakerTitle",
              "dataProtectionStatus",
              "confidenceScore",
            ],
          },
        },
      });

      let enrichedData = {};
      try {
        enrichedData = JSON.parse(structResponse.text?.trim() || "{}");
      } catch (err) {
        console.error("Failed to parse enriched JSON:", err);
      }

      res.json({
        rawText: text,
        searchSources,
        enriched: enrichedData,
      });
    } catch (error: any) {
      console.error("Enrich verify error:", error);
      res.status(500).json({ error: error.message || "Failed to verify public business details" });
    }
  });

  // 3. High Thinking Deep Qualification (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  app.post("/api/leads/qualify-deep", async (req, res) => {
    try {
      const { lead, customOffering, targetPersona } = req.body;
      if (!lead || !lead.name) {
        return res.status(400).json({ error: "lead object is required" });
      }

      const ai = getGenAI();
      const prompt = `You are a Senior B2B Market Analyst specializing in East African Enterprise and Nairobi Commercial Sectors.
Perform an in-depth corporate qualification and deal-angle strategy for this company:

Company Profile:
- Name: ${lead.name}
- Sector / Category: ${lead.category} (${lead.subSector || "General"})
- Location: ${lead.locationDetail || lead.officeAddress || "Nairobi"}
- Website: ${lead.officialWebsite || "Not provided"}
- Summary: ${lead.summary || ""}
- Offerings: ${(lead.coreOfferings || []).join(", ")}
- Pitching Our Solution: ${customOffering || "Enterprise B2B Software, Supply Chain Optimization, or Managed Services"}
- Target Buyer Persona: ${targetPersona || lead.decisionMakerTitle || "Executive / Department Head"}

Perform an exhaustive, deep reasoning evaluation:
1. ICP Fit Score (0-100) with detailed rubric breakdown (Market Presence, Commercial Maturity, Operational Scale, Contact Accessibility).
2. Key Operational Pain Points & Strategic Opportunities specific to Nairobi / Kenya market dynamics (e.g. KRA eTIMS integration, FX volatility, supply chain bottlenecks, East African regional expansion, digital transformation).
3. Procurement & Decision-Making Dynamics (e.g., procurement committee, RFP cycles, executive sign-off).
4. Kenya Data Protection Act 2019 Compliance Memo: Explicitly justify that this lead research adheres to lawful public-domain data collection with zero unauthorized personal tracking.
5. High-Converting B2B Multi-Touch Outreach Sequence tailored for Kenyan corporate culture:
   - Touch 1: Formal Executive Email (Respectful, value-driven, clear Kenyan commercial context).
   - Touch 2: Direct WhatsApp Business Introduction (Concise, professional, standard in Kenya B2B).
   - Touch 3: Discovery Call Elevator Hook (30-second script for introductory meeting).

Return your response as structured JSON matching this exact structure:
{
  "icpScore": number (0-100),
  "scoreBreakdown": {
    "marketPresence": number (0-25),
    "commercialMaturity": number (0-25),
    "operationalScale": number (0-25),
    "contactQuality": number (0-25)
  },
  "qualificationSummary": string,
  "keyPainPoints": string[],
  "b2bOpportunityAngles": string[],
  "procurementProfile": {
    "decisionMakers": string[],
    "salesCycleEstimate": string,
    "budgetScale": string
  },
  "complianceMemo": {
    "lawfulBasis": string,
    "dataAudited": string,
    "privacyNotice": string
  },
  "outreachSequence": {
    "formalEmail": {
      "subject": string,
      "body": string
    },
    "whatsAppIntro": string,
    "discoveryCallHook": string
  }
}`;

      // High Thinking with gemini-3.1-pro-preview
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              icpScore: { type: Type.NUMBER },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  marketPresence: { type: Type.NUMBER },
                  commercialMaturity: { type: Type.NUMBER },
                  operationalScale: { type: Type.NUMBER },
                  contactQuality: { type: Type.NUMBER },
                },
                required: ["marketPresence", "commercialMaturity", "operationalScale", "contactQuality"],
              },
              qualificationSummary: { type: Type.STRING },
              keyPainPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              b2bOpportunityAngles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              procurementProfile: {
                type: Type.OBJECT,
                properties: {
                  decisionMakers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  salesCycleEstimate: { type: Type.STRING },
                  budgetScale: { type: Type.STRING },
                },
                required: ["decisionMakers", "salesCycleEstimate", "budgetScale"],
              },
              complianceMemo: {
                type: Type.OBJECT,
                properties: {
                  lawfulBasis: { type: Type.STRING },
                  dataAudited: { type: Type.STRING },
                  privacyNotice: { type: Type.STRING },
                },
                required: ["lawfulBasis", "dataAudited", "privacyNotice"],
              },
              outreachSequence: {
                type: Type.OBJECT,
                properties: {
                  formalEmail: {
                    type: Type.OBJECT,
                    properties: {
                      subject: { type: Type.STRING },
                      body: { type: Type.STRING },
                    },
                    required: ["subject", "body"],
                  },
                  whatsAppIntro: { type: Type.STRING },
                  discoveryCallHook: { type: Type.STRING },
                },
                required: ["formalEmail", "whatsAppIntro", "discoveryCallHook"],
              },
            },
            required: [
              "icpScore",
              "scoreBreakdown",
              "qualificationSummary",
              "keyPainPoints",
              "b2bOpportunityAngles",
              "procurementProfile",
              "complianceMemo",
              "outreachSequence",
            ],
          },
        },
      });

      let deepResult = {};
      try {
        deepResult = JSON.parse(response.text?.trim() || "{}");
      } catch (err) {
        console.error("Deep qualification parse error:", err);
      }

      res.json({ qualification: deepResult });
    } catch (error: any) {
      console.error("Deep qualification error:", error);
      res.status(500).json({ error: error.message || "Failed to run deep qualification" });
    }
  });

  // 4. Low-Latency Instant Action Generator (gemini-3.1-flash-lite)
  app.post("/api/leads/fast-action", async (req, res) => {
    try {
      const { actionType, companyName, category, location, myValueProp } = req.body;
      const ai = getGenAI();

      let prompt = "";
      if (actionType === "quick-pitch") {
        prompt = `Generate a 2-sentence crisp B2B value proposition tailored for ${companyName} (${category} in ${location}, Nairobi). Our value: ${myValueProp || "accelerating revenue and optimizing supply chain operations"}. Return JSON with field "pitch" (string).`;
      } else if (actionType === "sms-reminder") {
        prompt = `Generate a professional, polite 160-character SMS follow-up message to a B2B contact at ${companyName}, Nairobi. Return JSON with field "sms" (string).`;
      } else if (actionType === "compliance-badge") {
        prompt = `Generate a concise 1-sentence legal compliance assurance statement verifying that ${companyName}'s public records comply with Section 28 of Kenya Data Protection Act 2019. Return JSON with field "complianceStatement" (string).`;
      } else {
        prompt = `Generate a rapid 3-point icebreaker list for a meeting with leadership of ${companyName} in ${location}, Nairobi. Return JSON with field "icebreakers" (array of strings).`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let result = {};
      try {
        result = JSON.parse(response.text?.trim() || "{}");
      } catch (err) {
        result = { text: response.text };
      }

      res.json(result);
    } catch (error: any) {
      console.error("Fast action error:", error);
      res.status(500).json({ error: error.message || "Failed to generate fast action" });
    }
  });

  // Vite middleware for dev or static dist for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lead Research Dashboard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
