import { auth as authenticateUser } from "@clerk/nextjs";

async function handleRequest(req: Request) {
  const { userId } = authenticateUser();
  const body = await req.json();

  return { userId, body };
}

export { handleRequest };
