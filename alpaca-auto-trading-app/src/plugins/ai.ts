import { Provider } from './index';
import { enqueueAI } from '@/queue';

export const aiProvider: Provider = {
  id: 'ai',
  handles: (p) => p.startsWith('/advisor') || p.startsWith('/nlp'),
  async exec(req) {
    const body = await req.json().catch(() => ({}));
    const job = await enqueueAI('advisor.generate', body);
    return Response.json({ enqueued: true, jobId: job.id });
  }
};
