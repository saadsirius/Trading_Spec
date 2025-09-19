import { readFileSync } from "fs";

export interface KnowledgeChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata?: {
    chunkIndex: number;
    totalChunks: number;
    timestamp: string;
  };
}

export interface Service {
  name: string;
  file?: string;
  methods?: any[];
  description?: string;
  isExported?: boolean;
}

export interface Hook {
  name: string;
  file?: string;
  params?: any[];
  returns?: string;
  description?: string;
  isAsync?: boolean;
  isExported?: boolean;
}

export interface TypeDef {
  name: string;
  file?: string;
  fields?: {name: string; type: string; optional?: boolean}[];
  type?: string;
  description?: string;
  isExported?: boolean;
}

export interface Component {
  name: string;
  file?: string;
  props?: string;
  description?: string;
  isExported?: boolean;
}

export interface Endpoint {
  route: string;
  file?: string;
  methods?: string[];
}

export interface Utils {
  name: string;
  file?: string;
  params?: any[];
  returns?: string;
  description?: string;
  isAsync?: boolean;
  isExported?: boolean;
}

export interface KnowledgeBase {
  services: Service[];
  hooks: Hook[];
  types: TypeDef[];
  components: Component[];
  utils: Utils[];
  endpoints: Endpoint[];
}

export interface KnowledgeContext {
  knowledge: KnowledgeBase;
  embeddings: KnowledgeChunk[] | null;
}

export function loadKnowledge(): KnowledgeContext {
  try {
    const json = JSON.parse(readFileSync("knowledge.json", "utf8"));
    let embeddings: KnowledgeChunk[] | null = null;
    
    try {
      embeddings = JSON.parse(readFileSync("vector/knowledge_embeddings.json", "utf8"));
    } catch (error) {
      console.warn("No embeddings found, continuing without vector search");
    }
    
    return { knowledge: json, embeddings };
  } catch (error) {
    console.error("Failed to load knowledge base:", error);
    return {
      knowledge: {
        services: [],
        hooks: [],
        types: [],
        components: [],
        utils: [],
        endpoints: []
      },
      embeddings: null
    };
  }
}

// Utility functions for working with knowledge
export function findService(name: string, knowledge: KnowledgeBase): Service | undefined {
  return knowledge.services.find(s => s.name === name);
}

export function findHook(name: string, knowledge: KnowledgeBase): Hook | undefined {
  return knowledge.hooks.find(h => h.name === name);
}

export function findType(name: string, knowledge: KnowledgeBase): TypeDef | undefined {
  return knowledge.types.find(t => t.name === name);
}

export function findComponent(name: string, knowledge: KnowledgeBase): Component | undefined {
  return knowledge.components.find(c => c.name === name);
}

export function findEndpoint(route: string, knowledge: KnowledgeBase): Endpoint | undefined {
  return knowledge.endpoints.find(e => e.route === route);
}

export function searchInKnowledge(query: string, knowledge: KnowledgeBase): any[] {
  const results: any[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search in services
  knowledge.services.forEach(service => {
    if (service.name.toLowerCase().includes(lowerQuery) || 
        service.description?.toLowerCase().includes(lowerQuery)) {
      results.push({ type: 'service', ...service });
    }
  });
  
  // Search in hooks
  knowledge.hooks.forEach(hook => {
    if (hook.name.toLowerCase().includes(lowerQuery) || 
        hook.description?.toLowerCase().includes(lowerQuery)) {
      results.push({ type: 'hook', ...hook });
    }
  });
  
  // Search in types
  knowledge.types.forEach(type => {
    if (type.name.toLowerCase().includes(lowerQuery) || 
        type.description?.toLowerCase().includes(lowerQuery)) {
      results.push({ type: 'type', ...type });
    }
  });
  
  // Search in components
  knowledge.components.forEach(component => {
    if (component.name.toLowerCase().includes(lowerQuery) || 
        component.description?.toLowerCase().includes(lowerQuery)) {
      results.push({ type: 'component', ...component });
    }
  });
  
  return results;
}

// Example usage for agents
export function getContextForAgent(agentType: 'frontend' | 'backend' | 'fullstack'): KnowledgeContext {
  const context = loadKnowledge();
  
  // Filter knowledge based on agent type
  if (agentType === 'frontend') {
    context.knowledge = {
      ...context.knowledge,
      services: context.knowledge.services.filter(s => 
        s.file?.includes('/components/') || 
        s.file?.includes('/hooks/') || 
        s.file?.includes('/utils/')
      ),
      endpoints: [] // Frontend agents don't need API endpoints
    };
  } else if (agentType === 'backend') {
    context.knowledge = {
      ...context.knowledge,
      components: [], // Backend agents don't need React components
      hooks: [] // Backend agents don't need React hooks
    };
  }
  
  return context;
}

// Memory management for agents
export class KnowledgeMemory {
  private context: KnowledgeContext;
  
  constructor() {
    this.context = loadKnowledge();
  }
  
  refresh(): void {
    this.context = loadKnowledge();
  }
  
  getContext(): KnowledgeContext {
    return this.context;
  }
  
  search(query: string): any[] {
    return searchInKnowledge(query, this.context.knowledge);
  }
  
  getRelatedTypes(typeName: string): TypeDef[] {
    const type = findType(typeName, this.context.knowledge);
    if (!type) return [];
    
    // Find types that reference this type
    return this.context.knowledge.types.filter(t => 
      t.fields?.some(f => f.type.includes(typeName)) ||
      t.type?.includes(typeName)
    );
  }
  
  getServicesUsingType(typeName: string): Service[] {
    return this.context.knowledge.services.filter(service =>
      service.methods?.some(method =>
        method.params?.some((p: any) => p.type.includes(typeName)) ||
        method.returns?.includes(typeName)
      )
    );
  }
}

// Export for easy usage
export const knowledgeMemory = new KnowledgeMemory();
