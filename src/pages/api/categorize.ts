
import { OpenAI } from "openai";
import { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Calls GPT to categorize a todo text.
 * @param text - The todo item to categorize.
 * @returns category string, or throws on error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const prompt = `Categorize the following todo: "${text}" as Work, Health, etc. Respond as JSON: { "name": "Work" }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    console.log("OpenAI response:", completion);
    const result = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(result);
    res.status(200).json({ name: parsed.name || "Uncategorized" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to categorize" });
  }
}