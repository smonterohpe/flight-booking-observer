# observability-console

Consola de observabilidad en tiempo real para toda la infraestructura
del **Flight Booking Simulator**: estado de servicios, métricas de
sistema y estado de protección de datos con Zerto — todo en un único
panel, con menú lateral colapsable, modo oscuro y 3 idiomas (ES/PT/EN).

Forma parte de la demo de continuidad de negocio junto con:
- `flight-booking-database` — esquema PostgreSQL (+ `db-probe`, `sys-probe`)
- `flight-booking-backend` — API REST (FastAPI, expone `/api/kpis/*`, `/api/health`, `/api/system`)
- `flight-booking-frontend` — simulador de reservas (+ `sys-probe`)

## Qué incluye este repo

| Carpeta        | Qué es                                                                 |
|----------------|--------------------------------------------------------------------------|
| `frontend/`    | SPA estática (HTML/CSS/JS + Chart.js) con las 4 pestañas                 |
| `zerto-probe/` | Backend FastAPI que se autentica contra los 2 ZVMA y agrega los datos    |
| `nginx/`       | Configuración de NGINX que sirve el SPA y hace de proxy hacia todo lo demás |

## Pestañas

- **Reservas**: KPIs (total, ingresos, última reserva, media/día) + selector
  de rango temporal (15 min → 30 días) + 3 gráficas (timeline, acumulado, distribución horaria)
- **Systems**: estado de Frontend/Backend/Database (ping + HTTP status) y
  tarjetas con CPU/RAM/Disco/Uptime de cada VM, más estadísticas propias de PostgreSQL
- **Zerto**: estado de los VPGs en el site de origen y destino (RPO actual,
  historial de journal/failsafe, VMs protegidas, alertas y eventos)
- **About**: descripción de la consola, stack tecnológico y diagrama de arquitectura

## Arquitectura de red

Esta VM concentra todo el tráfico de monitorización: su NGINX sirve el
SPA y actúa de proxy hacia el resto de servicios, evitando exponer
puertos internos al navegador y evitando problemas de CORS.

```
Navegador
   │ HTTP :80
   ▼
NGINX (esta VM)
   ├── /            → SPA estática (frontend/)
   ├── /api/*       → flight-booking-backend  (:8000)
   ├── /check/frontend/*      → flight-booking-frontend nginx (:80)
   ├── /check/frontend-sys/*  → sys-probe en VM frontend       (:5001)
   ├── /check/db/*            → db-probe en VM database        (:5000)
   ├── /check/db-sys/*        → sys-probe en VM database       (:5001)
   └── /zerto/*               → zerto-probe LOCAL (esta misma VM) (:5002)
```

El `zerto-probe` es el único servicio de backend que corre **en esta
misma VM** (junto al NGINX), porque es quien guarda las credenciales
de los ZVMA — nunca deben llegar al navegador.

## Despliegue en la VM de Observability Console

### 1. NGINX + SPA estática

```bash
sudo apt update && sudo apt install -y nginx

sudo mkdir -p /var/www/observability-console
sudo cp -r frontend/* /var/www/observability-console/
sudo chown -R www-data:www-data /var/www/observability-console

sudo cp nginx/observability-console.conf /etc/nginx/sites-available/observability-console
sudo ln -s /etc/nginx/sites-available/observability-console /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# IMPORTANTE: edita el fichero y sustituye BACKEND_HOST, FRONTEND_HOST
# y DATABASE_HOST por las IPs reales de esas VMs
sudo nano /etc/nginx/sites-available/observability-console

sudo nginx -t
sudo systemctl reload nginx
```

### 2. zerto-probe (en esta misma VM)

```bash
sudo useradd -r -s /bin/false probe || true
sudo mkdir -p /opt/zerto-probe
sudo cp -r zerto-probe/* /opt/zerto-probe/
cd /opt/zerto-probe
sudo python3 -m venv venv
sudo ./venv/bin/pip install -r requirements.txt

sudo cp .env.example .env
sudo nano .env   # credenciales reales de tus dos ZVMA

sudo cp zerto-probe.service /etc/systemd/system/
sudo chown -R probe:probe /opt/zerto-probe
sudo systemctl daemon-reload
sudo systemctl enable --now zerto-probe

# Comprobar que se autentica correctamente contra ambos ZVMA
curl http://localhost:5002/zerto/health
```

La consola quedará accesible en `http://IP_DE_ESTA_VM/`.

## Notas de arquitectura importantes

- Si tu ZVMA usa un `client_id` de Keycloak distinto a `zerto-client`,
  o expone los VPGs/VMs con nombres de campo distintos, ajusta
  `zerto-probe/config.py` y `zerto-probe/aggregator.py` respectivamente
  — están escritos para que ese sea el único punto de ajuste.
- Los puertos de los probes (5000, 5001, 5002) **no deben exponerse a
  internet** — solo deben ser alcanzables desde esta VM.

## Próximos pasos / mejoras posibles

- Añadir autenticación a la propia consola (hoy es de acceso libre, como en el proyecto de referencia)
- Persistir un histórico de estado de Zerto para poder correlacionar caídas con pérdida de RPO real
