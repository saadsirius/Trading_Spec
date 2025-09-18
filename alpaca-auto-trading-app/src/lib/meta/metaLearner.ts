import { prisma } from '@/lib/db/prisma';

// Poids = [wDon, wMom, wRSI] stockés en Float32
export async function getMetaParams(userEmail: string) {
  const name = 'maml_tech_v1';
  const row = await prisma.meta_model.findUnique({ 
    where: { userEmail_name: { userEmail, name } } as any 
  }).catch(() => null);
  
  if (!row) {
    const buf = Buffer.from(new Float32Array([0.45, 0.35, 0.20]).buffer);
    await prisma.meta_model.create({ 
      data: { 
        userEmail, 
        name, 
        params: buf, 
        metaInfo: { lr: 0.02 } 
      }
    });
    return { w: [0.45, 0.35, 0.20], lr: 0.02 };
  }
  
  const f = new Float32Array(row.params.buffer, row.params.byteOffset, row.params.byteLength / 4);
  return { w: [f[0], f[1], f[2]], lr: Number((row.metaInfo as any)?.lr ?? 0.02) };
}

export async function fastAdapt(userEmail: string, gradient: [number, number, number]) {
  const name = 'maml_tech_v1';
  const cur = await getMetaParams(userEmail);
  const w = cur.w.map((wi, i) => wi + cur.lr * gradient[i]) as [number, number, number];
  // normaliser
  const sum = w[0] + w[1] + w[2]; 
  const wn = [w[0] / sum, w[1] / sum, w[2] / sum] as [number, number, number];
  const buf = Buffer.from(new Float32Array(wn).buffer);
  await prisma.meta_model.upsert({ 
    where: { userEmail_name: { userEmail, name } } as any, 
    update: { params: buf }, 
    create: { userEmail, name, params: buf, metaInfo: { lr: cur.lr } }
  });
  return wn;
}
