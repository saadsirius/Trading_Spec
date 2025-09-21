# Kubernetes Manifests for Alpaca IQ Trading App

This directory contains all the Kubernetes manifests needed to deploy the Alpaca IQ trading application with full observability, security, and GitOps capabilities.

## Directory Structure

```
k8s/
├── README.md                           # This file
├── grafana-dash-tempo.yaml            # Grafana dashboard for traces
├── grafana-provisioning.yaml          # Grafana datasource configuration
├── loki.yaml                          # Loki log aggregation
├── promtail.yaml                      # Promtail log collection
├── prometheus-rules-slo.yaml          # Prometheus SLO recording rules
├── prometheus-alerts-slo.yaml         # Prometheus alert rules
├── alertmanager-config.yaml           # Alertmanager configuration
├── nginx-rate-limiting.yaml           # NGINX rate limiting & WAF
├── fluxcd/
│   └── kustomization.yaml             # FluxCD GitOps configuration
└── argocd/
    ├── application.yaml                # ArgoCD application
    └── rollout.yaml                   # Argo Rollouts canary deployment
```

## Prerequisites

1. **Kubernetes cluster** (1.24+)
2. **NGINX Ingress Controller** installed
3. **Prometheus Operator** (kube-prometheus-stack) installed
4. **ArgoCD** or **FluxCD** installed (for GitOps)
5. **External Secrets Operator** (optional, for secrets management)

## Quick Start

### 1. Deploy Observability Stack

```bash
# Deploy Loki for log aggregation
kubectl apply -f loki.yaml

# Deploy Promtail for log collection
kubectl apply -f promtail.yaml

# Deploy Grafana dashboards and datasources
kubectl apply -f grafana-dash-tempo.yaml
kubectl apply -f grafana-provisioning.yaml

# Deploy Prometheus rules and alerts
kubectl apply -f prometheus-rules-slo.yaml
kubectl apply -f prometheus-alerts-slo.yaml

# Deploy Alertmanager configuration
kubectl apply -f alertmanager-config.yaml
```

### 2. Deploy Application with Security

```bash
# Deploy with rate limiting and WAF
kubectl apply -f nginx-rate-limiting.yaml
```

### 3. GitOps Deployment

#### Option A: ArgoCD
```bash
# Deploy ArgoCD application
kubectl apply -f argocd/application.yaml

# Deploy canary rollout
kubectl apply -f argocd/rollout.yaml
```

#### Option B: FluxCD
```bash
# Deploy FluxCD configuration
kubectl apply -f fluxcd/kustomization.yaml
```

## Configuration

### Environment Variables

Update the following in your deployment manifests:

- `BASE_URL`: Your application URL (e.g., `https://app.example.com`)
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `POLYGON_API_KEY`: Polygon.io API key for market data
- `DATABASE_URL`: Database connection string

### Secrets Management

For production, use External Secrets Operator:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: alpaca-iq-secrets
spec:
  secretStoreRef:
    name: aws-secrets
    kind: SecretStore
  target:
    name: alpaca-iq-secrets
  data:
    - secretKey: OPENAI_API_KEY
      remoteRef:
        key: prod/alpaca-iq/OPENAI_API_KEY
```

### Rate Limiting Configuration

The NGINX rate limiting is configured with:
- 100 requests per minute per IP
- 10 concurrent connections per IP
- Basic authentication (update the secret)

### WAF Rules

ModSecurity is configured with OWASP Core Rule Set:
- SQL injection detection
- XSS protection
- Custom rules for trading endpoints

### SLO Configuration

Service Level Objectives:
- **Availability**: 99.9% (error rate < 0.1%)
- **Latency**: 95th percentile < 2 seconds
- **Error Budget**: Fast burn at 2% for 10 minutes, slow burn at 0.5% for 2 hours

## Monitoring & Alerting

### Grafana Dashboards

1. **Traces Dashboard**: View distributed traces from Tempo
2. **Logs Dashboard**: Search and analyze logs from Loki
3. **Metrics Dashboard**: Monitor application metrics

### Prometheus Alerts

- `SLOErrorBudgetBurnFast`: Critical error rate (pages on-call)
- `SLOErrorBudgetBurnSlow`: Elevated error rate (creates ticket)
- `SLOLatencyHigh`: High latency warning
- `HighErrorRate`: Critical error rate
- `PodDown`: Pod failure

### Alert Channels

Configured for Slack:
- `#critical-alerts`: Critical issues (pages on-call)
- `#on-call`: Pager alerts
- `#warnings`: Warning alerts
- `#tickets`: Ticket alerts

## Canary Deployments

Argo Rollouts provides:
- 10% → 30% → 50% → 100% traffic progression
- Automatic rollback on failure
- Success rate analysis (95% threshold)
- Manual approval gates

## Security Features

1. **Rate Limiting**: Per-IP and per-user limits
2. **WAF**: ModSecurity with OWASP rules
3. **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
4. **Request ID Propagation**: Full request tracing
5. **Structured Logging**: PII redaction and correlation IDs

## Troubleshooting

### Common Issues

1. **Rate Limiting Too Aggressive**: Adjust `nginx.ingress.kubernetes.io/rate-limit` annotation
2. **WAF False Positives**: Add custom rules to `modsecurity-snippet`
3. **Missing Metrics**: Ensure Prometheus is scraping your pods
4. **Logs Not Appearing**: Check Promtail configuration and Loki connectivity

### Useful Commands

```bash
# Check pod status
kubectl get pods -n alpaca-iq

# View logs
kubectl logs -n alpaca-iq -l app=alpaca-iq

# Check ingress
kubectl describe ingress alpaca-iq -n alpaca-iq

# View Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# View Grafana
kubectl port-forward -n monitoring svc/grafana 3000:80
```

## Production Checklist

- [ ] Update all placeholder values (URLs, secrets, etc.)
- [ ] Configure proper TLS certificates
- [ ] Set up external secrets management
- [ ] Configure monitoring and alerting channels
- [ ] Test canary deployments
- [ ] Verify rate limiting and WAF rules
- [ ] Set up backup and disaster recovery
- [ ] Configure log retention policies
- [ ] Test alerting and runbooks

## Support

For issues and questions:
1. Check the application logs: `kubectl logs -n alpaca-iq -l app=alpaca-iq`
2. Review Prometheus metrics: `kubectl port-forward -n monitoring svc/prometheus 9090:9090`
3. Check Grafana dashboards: `kubectl port-forward -n monitoring svc/grafana 3000:80`
4. Review the runbook: [RUNBOOK.md](../../RUNBOOK.md)
