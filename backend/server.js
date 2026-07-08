import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai'; // CORRECTED SDK PATH

dotenv.config();
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer to temporarily store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini SDK
// Replace the old line 17 with this:
const genAI = new GoogleGenerativeAI(process.env.AQ.Ab8RN6IwzPVOO3ZFOEeu2E7CU97yuu0rLyCRtvBBv6gu5c4MQw);

app.post('/api/analyze', upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image of a blood report." });
    }

    // Convert file to base64 format for Gemini API
    const base64File = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const prompt = `
      You are an expert clinical and health supply chain assistant. Analyze this blood test report image.
      1. Extract key parameters (like Hemoglobin, WBC, Glucose, or Cholesterol) with their values, units, and status (Normal, High, Low).
      2. Provide a 2-sentence summary of the report in simple language.
      3. Supply Chain Link: If parameters like Hemoglobin are Low, recommend restocking Iron Supplements. If WBC is High, recommend Antibiotics. 

      Respond ONLY with a valid JSON object matching this exact structure:
      {
        "summary": "2-sentence patient summary here.",
        "supplyChain": "Specific medicine restocking recommendation based on the data.",
        "metrics": [
          { "parameter": "Hemoglobin", "value": "11.2", "unit": "g/dL", "status": "Low" }
        ]
      }
    `;

    // Call the fast Gemini Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64File,
            mimeType: mimeType
          }
        }
      ]
    });

    // Extract text and strip any markdown backticks if present
    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) rawText = rawText.substring(7);
    if (rawText.endsWith('```')) rawText = rawText.substring(0, rawText.length - 3);

    const jsonData = JSON.parse(rawText.trim());
    res.json(jsonData);

  } catch (error) {
    console.error("Error processing report:", error);
    res.status(500).json({ error: "Failed to parse the report." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
