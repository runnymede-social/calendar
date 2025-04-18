                             Frontend
               ┌──────────────────────────────┐
               │      User Web Browser        │
               │(Mobile/Desktop FullCalendar) │
               └────────────┬─────────────────┘
                            │
                    loads static frontend
                            │
                            ▼
               ┌──────────────────────────────┐
               │   GitHub Pages (Static Host) │
               │  • index.html / main.html    │
               │  • calendar.js (event logic) │
               └────────────┬─────────────────┘
                            │
                  makes HTTPS API calls
                            ▼
               ┌──────────────────────────────┐
               │     AWS API Gateway          │
               │   https://...execute-api...  │
               └────────────┬─────────────────┘
                            │ (JWT required)
             ┌──────────────┴──────────────┐
             │           Lambda            │
             │ ┌────────────┐ ┌──────────┐ │
             │ │ auth/index │ │ events/  │ │
             │ └────────────┘ └──────────┘ │
             └────────────┬───────────────┘
                          │
          reads/writes from DynamoDB tables
                          ▼
         ┌─────────────────────────────────┐
         │         DynamoDB                │
         │ • CalendarEvents                │
         │ • CalendarLoginAttempts         │
         └─────────────────────────────────┘

To do: need to upload IaC
