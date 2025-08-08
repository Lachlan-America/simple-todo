import { OpenAI } from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { Todo } from "@/hooks/useTodos";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Calls GPT to summarize an array of todos.
 * @param todos - The array of todo items to summarize.
 * @returns summary string, or throws on error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<{ summary: string } | { error: string }>) {
	// Define the request body and handle any missing or invalid todos
	const { todos }: { todos: Todo[] } = req.body;
	if (!todos || !Array.isArray(todos)) return res.status(400).json({ error: "Missing or invalid todos" });
	// Ensure authentication
	const session = await getServerSession(req, res, authOptions);
	if (!session) return res.status(401).json({ error: "Unauthorized" });

	try {
		const prompt = `Here is a list of todo items. Some are completed, some are not.

      Todos:
      ${todos.map((todo) => `- ${todo.text} [${todo.completed ? "done" : "pending"}]`).join("\n")}

      Please generate a short summary of what was accomplished and what still needs to be done. Keep it concise and human-readable.
      Don't include any specific todo items, just a general overview (Without declaring it is a summary; just a paragraph).`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.5,
		});
		console.log("OpenAI response:", completion);
		const content = completion.choices[0]?.message?.content?.trim() ?? "";
		return res.status(200).json({ summary: content });

	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to categorize" });
	}
}