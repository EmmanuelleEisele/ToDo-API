| Method | Route | Description |
|--------|-------|-------------|
||AUTHENTIFICATION|
| POST | /auth/register | créer un utilisateur |
| POST | /auth/login | récupérer un token |
| POST | /auth/logout | déconnexion utilisateur |
| POST | /auth/forgot-password | demande de réinitialisation du mdp |
| POST | /auth/reset-password | Réinitialisation du mdp avec token |
| POST | /auth/change-password | Changement du mdp|
||TACHES||
| GET | /tasks | lister les tâches de l'utilisateur (auth required) |
| GET | /tasks/{id} | Récupérer une tâche |
| GET | /tasks/archived | Récupérer les tâches archivées|
| POST | /tasks | créer une tâche |
| POST | /tasks/:id/archive | mettre une tâche en archivé |
| PUT | /tasks/{id} | modifier une tâche |
| DELETE | /tasks/{id}| supprimer une tâche |

||CATEGORIES|
| POST | /categories | Créer une nouvelle catégorie |
||STATS|
| GET | /stats/taskByDay | Statistiques des tâches accomplies par jour |
| GET | /stats/taskByWeek | Statistiques par semaine |
| GET | /stats/taskByMonth | Statistiques par mois |
| GET | /stats/taskByYear | Statistiques par année |
||TOKENS|
| POST | /auth/refresh | Rafraichir de token d'accès |