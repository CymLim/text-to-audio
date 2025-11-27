import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type VoiceConfig = 
  | { type: 'prebuilt'; name: VoiceName }
  | { type: 'custom'; audioData: string };

export async function generateSpeech(text: string, voiceConfig: VoiceConfig, speed: number = 1.0): Promise<string> {
  if (!text || !text.trim()) {
    throw new Error("Text is required");
  }

  try {
    let apiVoiceConfig = {};

    if (voiceConfig.type === 'prebuilt') {
      apiVoiceConfig = {
        prebuiltVoiceConfig: { voiceName: voiceConfig.name },
      };
    } else {
      // Custom voice configuration
      apiVoiceConfig = {
        voiceClone: {
          voiceCloneSample: {
            data: voiceConfig.audioData
          }
        }
      };
    }

    // Note: speakingRate is intentionally omitted from speechConfig as it currently causes 
    // INVALID_ARGUMENT (400) errors with gemini-2.5-flash-preview-tts. 
    // Speed control is handled client-side in App.tsx.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: apiVoiceConfig,
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned from the API.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    // Enhance error message if it's a 400 regarding arguments
    if (error.status === 400 || error.toString().includes("INVALID_ARGUMENT")) {
       throw new Error("Failed to generate speech. The voice configuration might be invalid or unsupported.");
    }
    throw error;
  }
}

export async function extractTextFromImage(imageBase64: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          },
          {
            text: "Extract all text from this image exactly as it appears. Return only the extracted text."
          }
        ]
      }
    });
    
    return response.text || "";
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from image.");
  }
}
