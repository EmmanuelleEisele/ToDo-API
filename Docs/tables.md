## Table des utilisateurs
|Champs|type|Note|
|---|----|---|
|firstname|string|notnull
|lastname|string|notnull
|email|string|unique, notnull
|password|string|haché avec argon2


## Table des tâches
|Champs|type|Note|
|---|----|---|
|title|string|notnull
|description|string|allownull
|status|string|'en cours', 'validé', 'annulé', 'en retard'
|deadline|Date|allownull, fixer une date limite à une tâche
|userId|ObjectId|id utilisateur
|createdAt|Date|timestamp
|updatedAt|Date|timestamp
