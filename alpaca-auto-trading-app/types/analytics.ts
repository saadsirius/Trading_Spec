export interface ClickEvent {
  id: string; 
  action: string; 
  ts: number;
  meta?: Record<string, string|number|boolean>;
}
