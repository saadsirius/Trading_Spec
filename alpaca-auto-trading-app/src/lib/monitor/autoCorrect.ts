import { prisma } from '@/lib/db/prisma';

export async function monitorAndAutoCorrect(event: { 
  kind: 'drift' | 'latency' | 'error'; 
  detail: string; 
  meta?: any 
}) {
  await prisma.monitor_event.create({ 
    data: { 
      kind: event.kind, 
      detail: event.detail, 
      metaJson: event.meta || {} 
    } 
  });
  
  // auto-fix prototype : si drift → baisse wMomentum via meta-learner
  if (event.kind === 'drift' && event.meta?.userEmail) {
    // gradient négatif sur momentum
    const { fastAdapt } = await import('@/lib/meta/metaLearner');
    await fastAdapt(event.meta.userEmail, [0, -0.02, 0]);
    await prisma.monitor_event.create({ 
      data: { 
        kind: 'autofix', 
        detail: 'lower momentum weight', 
        metaJson: { userEmail: event.meta.userEmail } 
      }
    });
  }
}
