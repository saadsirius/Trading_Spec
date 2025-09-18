export type Command = {
  id: string;                 // unique
  title: string;              // label principal
  subtitle?: string;          // sous-texte
  run: () => Promise<void> | void;
  tags?: string[];            // pour la recherche
  when?: () => boolean;       // condition d'affichage (ex: contexte route)
  weight?: number;            // tri secondaire
};

class CommandRegistry {
  private map = new Map<string, Command>();
  add(cmd: Command) { this.map.set(cmd.id, cmd); }
  remove(id: string) { this.map.delete(id); }
  list(): Command[] { return [...this.map.values()]; }
  clear() { this.map.clear(); }
}
export const commandRegistry = new CommandRegistry();
