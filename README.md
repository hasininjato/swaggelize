# A propos de ce projet

Il s'agit du dépôt du projet de test de L3M Holding. Il utilise ExpressJS pour le backend, PostgreSQL comme système de gestion de base de données et VueJS pour le frontend.


# Configuration du projet

Renommer .env.example en .env

Donner les informations de connection à la base Postgres dans .env (utilisateur, mot de passe et nom de la base). La valeur de DATABASE_URL est donnée en exemple

Le script bash Docker/db/init-db.sh crée la base, l'utilisateur et configure ses privilèges

Nous utilisons nginx pour gérer facilement les conteneurs en cours d'exécution. Son fichier de configuration se trouve dans Docker/vhosts/nginx.local.conf.

Pour builder les containers, exécuter la commande `./commands/docker-build.bat`

Pour démarrer les containers, run the command `./commands/docker-start.bat`

Pour exécuter le container en cours d'exécution (listable depuis la commande `docker ps`), exécuter la commande `./command/docker-exec.bat`