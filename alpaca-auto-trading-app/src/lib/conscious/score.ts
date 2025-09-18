export function consciousScore({ 
  esg = { E: .5, S: .5, G: .5 }, 
  leverage = 1, 
  stress = 0.5 
}: { 
  esg?: any; 
  leverage: number; 
  stress: number 
}) {
  const ethic = Math.max(0, Math.min(1, (esg.E + esg.S + esg.G) / 3));
  const social = Math.max(0, Math.min(1, 0.6 * esg.S + 0.2 * esg.G + 0.2));
  const emotion = Math.max(0, Math.min(1, 0.3 * stress + 0.7 * Math.min(1, leverage / 3)));
  return { ethic, social, emotion };
}
