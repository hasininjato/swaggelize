# A propos

C'est la partie frontend pour le test technique de L3M Holding.

# Configuration

Pour exécuter le container, on exécute la commande `./commands/docker-exec.sh`, puis `cd frontend`. On installe ensuite les dépendances `npm install`  
Pour compiler avec hot reload (pour le développement), exécuter la commande `npm run serve`  

# Logique d'authentification

- [x] L'utilisateur peut créer un compte en spécifiant son "fullname", son email et son mot de passe.  
- [x] L'utilisateur peut ensuite s'authentifier avec son email et son mot de passe.  
- [x] Si l'authentification échoue, un message d'érreur est affiché (comme **"Invalid credentials"** par exemple si l'email et/ou le mot de passe est erronné).  
- [x] Si l'authentification réussit, on stocke l'access token généré par le backend dans le local storage avec la clé "user".  
- [x] A chaque accès à une page, dans le router on check si l'access token existe et est valide (non expiré). Si c'est valide on ne fait rien, sinon on redirige l'utilisateur vers la page de login.
- [x] Les pages de login et de crétion d'un utilisateur ne sont pas accessibles si l'utilisteur est déjà authentifié.  
- [x] Les autres pages sont protégées et ne peuvent pas être accédées par les utilisateurs non authentifiées.

# Capture d'écrans

- [Page de login](./catpures/login.png)
- [Page de signup](./catpures/signup.png)
- [Page d'accueil](./catpures/home.png)
- [Page de liste des transactions](./catpures/list%20transaction.png)
- [Page de création d'une transaction](./catpures/creation%20transaction.png)
- [Page d'information de l'utilisateur](./catpures/user%20information.png)