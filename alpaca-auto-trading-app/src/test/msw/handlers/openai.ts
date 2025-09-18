import { http, HttpResponse } from 'msw';

export const openaiHandlers = [
  http.post('/api/advisor/generate', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    return HttpResponse.json({ 
      explanation: `[MOCK] ${body?.symbols?.[0] || 'SYM'}: Explication IA synthétique.` 
    });
  })
];
