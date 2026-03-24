# NPS TEXO Dashboard

Dashboard completo para agencias y holding TEXO, conectado al mismo Google Sheet que alimenta la encuesta.

## Qué trae

- Login con usuario y contraseña por agencia.
- Contraseñas hasheadas con `bcryptjs`.
- Usuario holding `TEXO` con vista completa.
- Lectura directa desde Google Sheets por Service Account.
- Cálculo automático de NPS por quarter.
- Selector de quarter.
- Ranking entre agencias para TEXO.
- Fortalezas y oportunidades priorizadas.
- Recomendaciones con IA si configurás `OPENAI_API_KEY`.
- Fallback automático a recomendaciones heurísticas si no hay API key.

## Estructura esperada del Google Sheet

La hoja debe llamarse `Respuestas` y tener estas columnas en este orden:

1. timestamp
2. periodoEvaluado
3. agenciaEvaluada
4. correo
5. nombreApellido
6. organizacion
7. cargo
8. servicioContratado
9. q1DisfrutoTrabajar
10. q2Fiables
11. q3Colaborativo
12. q4CreoValor
13. q5BasadoEstrategia
14. q6MentalidadCreativa
15. aspectos
16. npsRecomendacion
17. npsCategoriaRecomendacion
18. npsContinuidad
19. npsCategoriaContinuidad
20. motivoPuntuacion
21. comentariosAdicionales
22. reunionSolicitada

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```env
GOOGLE_SHEETS_ID=
GOOGLE_SHEET_NAME=Respuestas
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
AUTH_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
APP_USERS_JSON=[]
```

## Usuarios

Generá hashes individuales:

```bash
npm run hash:password -- "Lupe2026!"
```

O generá un bloque base para todas las agencias:

```bash
npm run hash:users -- "Cambiar123!"
```

Después pegá el JSON resultante en `APP_USERS_JSON`.

Ejemplo:

```json
[
  {
    "username": "lupe",
    "agency": "LUPE",
    "role": "agency",
    "passwordHash": "$2a$10$..."
  },
  {
    "username": "texo",
    "agency": "TEXO",
    "role": "holding",
    "passwordHash": "$2a$10$..."
  }
]
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`.

## Deploy en Vercel

1. Subí este proyecto a GitHub.
2. Importalo en Vercel.
3. En Settings > Environment Variables cargá todas las variables del `.env.local`.
4. Deploy.

## Importante

- No subas `.env.local` a GitHub.
- No pegues la `GOOGLE_PRIVATE_KEY` en commits, issues ni chats.
- Si una key se expone, revocala y generá una nueva.
