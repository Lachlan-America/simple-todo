import { OpenAI } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserHash } from "@/lib/utils";
import { todoLimiter } from "@/lib/rateLimiter";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Calls GPT to categorize a todo text. Returns a clean version of the category.
 * @param text - The todo item to categorize.
 * @returns category object, or throws on error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<{ categories: { id: string; name: string }[] } | { error: string }>) {

    // Ensure data is in correct form
    const { todos } = req.body;
    if (!todos || !Array.isArray(todos)) return res.status(400).json({ error: "Missing or invalid todos" });

    // Ensure authentication
	const session = await getServerSession(req, res, authOptions);
	if (!session) return res.status(401).json({ error: "Unauthorized. To use the AI features, please sign in" });

    // Check rate limit
    const userHash = getUserHash(session.user?.email ?? "default");
    const { success, reset } = await todoLimiter.limit(`${userHash}:categorise`);
    if (!success) {
        const retryAfterMs = reset - Date.now();
        const retryAfterSec = Math.ceil(retryAfterMs / 1000);
        res.status(429).json({ error: `Too many requests. Try again in ${retryAfterSec}s` });
    }
    
    try {
        const todoTexts = todos.map(t => ({ id: t.id, text: t.text }));

        const prompt = `
        You will receive a list of todos with IDs and text.
        Categorize each todo into a category like Work, Health, Personal, etc.
        Return JSON in this exact format:

        [
        { "id": "TODO_ID", "name": "CATEGORY_NAME" }
        ]

        IDs must match exactly the IDs provided.

        Todos:
        ${JSON.stringify(todoTexts, null, 2)}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        });

        const parsed: { id: string; name: string }[] = JSON.parse(completion.choices[0]?.message?.content || "[]");
        res.status(200).json({ categories: parsed });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to categorize" });
    }
}