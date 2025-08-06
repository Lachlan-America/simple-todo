import { getServerSession } from "next-auth/next";
import authOptions from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Proceed to do protected stuff
  res.status(200).json({ message: "You’re authenticated!" });
}