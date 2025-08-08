import { OpenAI } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import type { Category } from "@/hooks/useCategories";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Calls GPT to categorize a todo text. Returns a clean version of the category.
 * @param text - The todo item to categorize.
 * @returns category object, or throws on error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Category | { error: string }>) {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });
    // Ensure authentication
    const session = await getServerSession(req, res, authOptions);   
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `Categorize the following todo: "${text}" as Work, Health, etc. Respond as JSON: { "name": "Work" }`
            }],
            temperature: 0.3,
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
        const name = parsed.name ? parsed.name.trim().toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase()) : "Uncategorized";
        console.log("AI Categorization response:", name);
        res.status(200).json({ name, selected: false });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to categorize" });
    }
}