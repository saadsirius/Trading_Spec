# 🚀 Warrior Trading Platform - Architecture Guide

## Vue d'ensemble

Warrior est une plateforme de trading propriétaire conçue pour offrir toutes les fonctionnalités essentielles de Trading212/TradingView avec une architecture modulaire, testable et sécurisée.

## 🏗️ Architecture Core

### 1. Domain Model (`src/core/domain.ts`)
**Colonne vertébrale des types métiers**
- Types stricts pour tous les objets métier (Instrument, Candle, Quote, Order, Position, Signal, Alert)
- Validation avec Zod
- Événements typés pour le bus d'événements

### 2. Event Bus (`src/lib/event-bus.ts`)
**Système de communication centralisé**
- Pub/Sub avec nanoevents
- Enregistrement/replay pour tests et backtests
- Architecture événementielle pure (UI écoute, ne fait pas d'appels cachés)

### 3. Gestion d'erreurs (`src/lib/errors/`)
**Système d'erreurs robuste**
- Catalogue d'erreurs avec codes stables
- ToastProvider unifié avec actions de remédiation
- ErrorBoundary pour capturer les erreurs React

### 4. Observabilité (`src/lib/analytics/`)
**Monitoring et santé système**
- Hook useSystemHealth pour métriques temps réel
- Page `/system/health` pour diagnostic
- Intégration avec le bus d'événements

## 🎯 Features Implémentées

### ✅ Architecture de base
- [x] Types de domaine stricts
- [x] Event Bus avec replay
- [x] Système d'erreurs unifié
- [x] Toast notifications
- [x] Page de santé système
- [x] Page de démonstration complète

### 🔄 En cours
- [ ] Backtesting complet avec vectorbt
- [ ] Screener TradingView-style
- [ ] Watchlist temps réel
- [ ] Sentiment analysis
- [ ] Pentagon scoring

## 📁 Structure des fichiers

```
src/
├── core/
│   └── domain.ts              # Types métier centraux
├── lib/
│   ├── event-bus.ts          # Bus d'événements
│   ├── errors/
│   │   ├── error-catalog.ts  # Catalogue d'erreurs
│   │   └── ErrorBoundary.tsx # Boundary React
│   ├── ui/
│   │   └── ToastProvider.tsx # Notifications
│   └── analytics/
│       └── useSystemHealth.ts # Monitoring
├── features/
│   ├── backtesting/          # Moteur de backtesting
│   ├── screener/             # Filtrage d'actifs
│   └── watchlist/            # Watchlist réactive
└── app/
    ├── system/health/        # Page de santé
    └── warrior-demo/         # Démonstration complète
```

## 🚀 Utilisation

### 1. Page de démonstration
Visitez `/warrior-demo` pour tester toutes les fonctionnalités :
- Simulation de données de marché
- Test du screener
- Test du backtesting
- Enregistrement/replay d'événements
- Gestion de watchlist

### 2. Page de santé
Visitez `/system/health` pour monitorer :
- État des connexions WebSocket
- Latences réseau
- Erreurs système
- Métriques de performance

### 3. Event Bus
```typescript
import { bus } from '@/src/lib/event-bus';

// Émettre un événement
bus.emit({
  type: 'QUOTE_TICK',
  symbol: 'AAPL',
  quote: { t: Date.now(), bid: 150, ask: 150.1, ... }
});

// Écouter les événements
const unsubscribe = bus.on((event) => {
  console.log('Nouvel événement:', event);
});

// Enregistrer pour replay
bus.recorder.start();
// ... faire des actions ...
const recorded = bus.recorder.stop();
```

### 4. Gestion d'erreurs
```typescript
import { notifyError, notifySuccess } from '@/src/lib/ui/ToastProvider';

// Erreur avec code stable
notifyError('API.LIMIT', 'Trop de requêtes');

// Succès
notifySuccess('Ordre placé avec succès');
```

## 🔧 Configuration

### Variables d'environnement
```env
# Clés API (chiffrées)
SECRET_KEY=your-fernet-key
ENCRYPTED_APCA_API_KEY_ID=encrypted-key
ENCRYPTED_APCA_API_SECRET_KEY=encrypted-secret

# Configuration
NODE_ENV=development
DEBUG=true
```

### Dépendances principales
```json
{
  "nanoevents": "^7.0.1",
  "zod": "^3.22.4",
  "zustand": "^4.4.7",
  "sonner": "^1.2.4",
  "neverthrow": "^6.0.0"
}
```

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Tests d'intégration
```bash
npm run test:integration
```

### Tests E2E
```bash
npm run test:e2e
```

## 📊 Métriques et monitoring

### Métriques collectées
- Latence WebSocket
- Latence REST API
- Erreurs par minute
- Queue lag
- État des connexions

### Dashboards
- Grafana pour métriques
- Sentry pour erreurs
- Prometheus pour métriques système

## 🔒 Sécurité

### Chiffrement des clés
- Clés API chiffrées avec Fernet
- Rotation automatique des clés
- Séparation paper/live

### Audit trail
- Journal de toutes les décisions IA
- Traçabilité des ordres
- Logs structurés

## 🚀 Déploiement

### Docker
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### CI/CD
- GitHub Actions
- Tests automatiques
- Déploiement staging/prod

## 📈 Roadmap

### v0.1 (Actuel)
- [x] Architecture de base
- [x] Event Bus
- [x] Gestion d'erreurs
- [x] Page de démonstration

### v0.2 (Prochaine)
- [ ] Backtesting complet
- [ ] Screener avancé
- [ ] Watchlist temps réel
- [ ] Charts professionnels

### v0.3 (Future)
- [ ] Sentiment analysis
- [ ] Pentagon scoring
- [ ] Alertes IA
- [ ] Trading automatisé

## 🤝 Contribution

### Standards de code
- TypeScript strict
- Tests obligatoires
- Documentation à jour
- Commits conventionnels

### Workflow
1. Fork du repository
2. Créer une branche feature
3. Implémenter avec tests
4. Pull request avec description détaillée

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@warrior-trading.com

---

**Warrior Trading Platform** - Construit pour les traders qui veulent le contrôle total de leur infrastructure de trading.
