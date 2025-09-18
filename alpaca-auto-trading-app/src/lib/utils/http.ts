import { z } from "zod";

export const withZod =
  <T extends z.ZodTypeAny>(schema: T, handler: (data: z.infer<T>) => Promise<Response>) =>
  async (req: Request) => {
    const body = await req.json().catch(() => ({}));
    const result = schema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid payload", issues: result.error.issues }), { status: 400 });
    }
    return handler(result.data);
  };
