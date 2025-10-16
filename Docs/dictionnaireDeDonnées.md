## Table des utilisateurs
|Champs|type|Note|
|---|----|---|
|firstname|string|notnull|
|lastname|string|notnull|
|email|string|unique, notnull|
|password|string|haché avec argon2|
|createdAt|Date|timestamp|
|updatedAt|Date|timestamp|

## Table des tâches
|Champs|type|Note|
|---|----|---|
|title|string|notnull|
|description|string|allownull|
|status|string|'todo', 'done', 'cancelled', 'overdue'|
|isDone|boolean|par défaut false|
|period|string|'day', 'week', 'month', 'year', notnull|
|priority|string|'low', 'medium', 'high', défaut 'medium'|
|deadline|Date|allownull, fixer une date limite à une tâche|
|completedAt|Date|date d'accomplissement, allownull|
|categoryId|ObjectId|référence à la catégorie|
|userId|ObjectId|id utilisateur|
|createdAt|Date|timestamp|
|updatedAt|Date|timestamp|

## Table des catégories
|Champs|type|Note|
|---|----|---|
|name|string|'work', 'personal', 'shopping', 'health', 'finance', 'others', notnull|
|color|string|code hexadécimal, notnull|
|createdAt|Date|timestamp|
|updatedAt|Date|timestamp|
