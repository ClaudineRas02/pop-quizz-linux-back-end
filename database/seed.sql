-- Donnees de test pour le projet POP QUIZZ.
-- A executer apres database/schema.sql.
--
-- Commande depuis la racine du projet :
-- psql "postgresql://pop_quizz_user:1234@localhost:5432/pop_quizz" -f database/seed.sql
--
-- Dans le shell psql deja connecte :
-- \i database/seeds.sql
--

-- =====================================================
-- SEED DATA — Concours Linux, première année
-- Respecte RG3 : 10 culture_generale + 30 linux (10 QCM /
-- 10 command / 5 combination / 5 fill_blank) + 3 shell
-- =====================================================
-- Hypothèse : question_choice sert de table générique
-- pour stocker la/les bonne(s) réponse(s) attendues, y
-- compris pour les types command / fill_blank / combination
-- / shell_code (pas seulement les QCM). Adapte la logique
-- de correction de ton use case en conséquence.
-- Les password_hash sont des valeurs factices, à remplacer
-- par de vrais hash bcrypt générés par ton flux d'inscription.
--
-- NOTE : tous les id sont auto-générés (SERIAL/IDENTITY).
-- Ce script suppose des tables vides et un INSERT dans
-- l'ordre indiqué, de sorte que les id générés correspondent
-- à l'ordre d'apparition (1, 2, 3, ...) et donc aux
-- références utilisées dans les tables liées (question_id,
-- player_id, contest_id, etc.).
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADMIN
-- =====================================================
INSERT INTO admin (email, password_hash) VALUES
('admin@concours-linux.mg', '$2b$10$dummyHashAdminOrganisateur00000000000000000001'),
('assistant@concours-linux.mg', '$2b$10$dummyHashAdminAssistant000000000000000000002');

-- =====================================================
-- 2. PLAYERS (18 étudiants de première année)
-- =====================================================
INSERT INTO player (username, email, password_hash, avatar_url) VALUES
('rakoto_j',     'rakoto.j@etu.mg',     '$2b$10$dummyHashPlayer0000000000000000000001', 'https://api.dicebear.com/7.x/identicon/svg?seed=rakoto_j'),
('hery_ravo',    'hery.ravo@etu.mg',    '$2b$10$dummyHashPlayer0000000000000000000002', 'https://api.dicebear.com/7.x/identicon/svg?seed=hery_ravo'),
('miora_ny',     'miora.ny@etu.mg',     '$2b$10$dummyHashPlayer0000000000000000000003', 'https://api.dicebear.com/7.x/identicon/svg?seed=miora_ny'),
('fanja21',      'fanja21@etu.mg',      '$2b$10$dummyHashPlayer0000000000000000000004', 'https://api.dicebear.com/7.x/identicon/svg?seed=fanja21'),
('tojo_andry',   'tojo.andry@etu.mg',   '$2b$10$dummyHashPlayer0000000000000000000005', 'https://api.dicebear.com/7.x/identicon/svg?seed=tojo_andry'),
('lova_rabe',    'lova.rabe@etu.mg',    '$2b$10$dummyHashPlayer0000000000000000000006', 'https://api.dicebear.com/7.x/identicon/svg?seed=lova_rabe'),
('nirina_h',     'nirina.h@etu.mg',     '$2b$10$dummyHashPlayer0000000000000000000007', 'https://api.dicebear.com/7.x/identicon/svg?seed=nirina_h'),
('zo_andriana',  'zo.andriana@etu.mg',  '$2b$10$dummyHashPlayer0000000000000000000008', 'https://api.dicebear.com/7.x/identicon/svg?seed=zo_andriana'),
('tahiana_r',    'tahiana.r@etu.mg',    '$2b$10$dummyHashPlayer0000000000000000000009', 'https://api.dicebear.com/7.x/identicon/svg?seed=tahiana_r'),
('faly2026',     'faly2026@etu.mg',     '$2b$10$dummyHashPlayer0000000000000000000010', 'https://api.dicebear.com/7.x/identicon/svg?seed=faly2026'),
('hasina_m',     'hasina.m@etu.mg',     '$2b$10$dummyHashPlayer0000000000000000000011', 'https://api.dicebear.com/7.x/identicon/svg?seed=hasina_m'),
('voahangy_t',   'voahangy.t@etu.mg',   '$2b$10$dummyHashPlayer0000000000000000000012', 'https://api.dicebear.com/7.x/identicon/svg?seed=voahangy_t'),
('ny_aina',      'ny.aina@etu.mg',      '$2b$10$dummyHashPlayer0000000000000000000013', 'https://api.dicebear.com/7.x/identicon/svg?seed=ny_aina'),
('mialy_rasoa',  'mialy.rasoa@etu.mg',  '$2b$10$dummyHashPlayer0000000000000000000014', 'https://api.dicebear.com/7.x/identicon/svg?seed=mialy_rasoa'),
('tiana_r',      'tiana.r@etu.mg',      '$2b$10$dummyHashPlayer0000000000000000000015', 'https://api.dicebear.com/7.x/identicon/svg?seed=tiana_r'),
('fenitra_k',    'fenitra.k@etu.mg',    '$2b$10$dummyHashPlayer0000000000000000000016', 'https://api.dicebear.com/7.x/identicon/svg?seed=fenitra_k'),
('andry_be',     'andry.be@etu.mg',     '$2b$10$dummyHashPlayer0000000000000000000017', 'https://api.dicebear.com/7.x/identicon/svg?seed=andry_be'),
('soa_rakoto',   'soa.rakoto@etu.mg',   '$2b$10$dummyHashPlayer0000000000000000000018', 'https://api.dicebear.com/7.x/identicon/svg?seed=soa_rakoto');

-- =====================================================
-- 3. QUESTIONS (43 au total, cf. RG3)
-- =====================================================

-- 3a. Culture générale (10) — multiple_choice
INSERT INTO question (statement, category, type, duration, points, explanation, difficulty) VALUES
('Qui est le créateur original du noyau Linux ?', 'culture_generale', 'multiple_choice', 15, 10, 'Linus Torvalds a créé le noyau Linux en 1991 alors qu''il était étudiant en Finlande.', 'easy'),
('En quelle année la première version du noyau Linux a-t-elle été publiée ?', 'culture_generale', 'multiple_choice', 15, 10, 'Linus Torvalds a annoncé Linux pour la première fois en 1991.', 'easy'),
('Que signifie l''acronyme GNU ?', 'culture_generale', 'multiple_choice', 15, 10, 'GNU est un acronyme récursif qui se définit lui-même.', 'easy'),
('Sous quelle licence le noyau Linux est-il principalement distribué ?', 'culture_generale', 'multiple_choice', 15, 10, 'Le noyau Linux est distribué sous licence GPL version 2.', 'easy'),
('Quel est le nom de la mascotte officielle de Linux ?', 'culture_generale', 'multiple_choice', 15, 10, 'Tux le pingouin est la mascotte officielle du noyau Linux depuis 1996.', 'easy'),
('Quel système d''exploitation des années 1960-1970 a fortement inspiré la création d''Unix ?', 'culture_generale', 'multiple_choice', 15, 10, 'Multics, un système d''exploitation expérimental, a directement inspiré la conception d''Unix.', 'easy'),
('Quelle entreprise développe macOS, un système d''exploitation basé sur Unix ?', 'culture_generale', 'multiple_choice', 15, 10, 'macOS, développé par Apple, repose sur une base Unix certifiée (Darwin).', 'easy'),
('Qui a fondé le projet de distribution Debian en 1993 ?', 'culture_generale', 'multiple_choice', 15, 10, 'Ian Murdock a fondé Debian en 1993, le nom étant une contraction de son prénom et de celui de sa compagne Deborah.', 'easy'),
('Quelle distribution Linux d''entreprise utilise un chapeau rouge comme symbole de marque ?', 'culture_generale', 'multiple_choice', 15, 10, 'Red Hat est connue pour son logo en forme de chapeau rouge et ses solutions Linux destinées aux entreprises.', 'easy'),
('Que signifie le sigle FOSS dans le monde du logiciel libre ?', 'culture_generale', 'multiple_choice', 15, 10, 'FOSS signifie Free and Open Source Software, regroupant logiciels libres et open source.', 'easy');

-- 3b. Linux — QCM sur les commandes (10) — multiple_choice
INSERT INTO question (statement, category, type, duration, points, explanation, difficulty) VALUES
('Quelle commande affiche le chemin du répertoire de travail courant ?', 'linux', 'multiple_choice', 15, 10, 'pwd signifie print working directory.', 'easy'),
('Quelle commande permet de lister le contenu d''un répertoire ?', 'linux', 'multiple_choice', 15, 10, 'ls affiche la liste des fichiers et dossiers d''un répertoire.', 'easy'),
('Quelle commande permet de se déplacer dans l''arborescence des répertoires ?', 'linux', 'multiple_choice', 15, 10, 'cd signifie change directory.', 'easy'),
('Quelle commande affiche le contenu d''un fichier texte sur la sortie standard ?', 'linux', 'multiple_choice', 15, 10, 'cat concatène et affiche le contenu d''un ou plusieurs fichiers.', 'easy'),
('Quelle commande permet de copier un fichier ?', 'linux', 'multiple_choice', 15, 10, 'cp copie un fichier ou un répertoire vers une nouvelle destination.', 'easy'),
('Quelle commande permet de déplacer ou de renommer un fichier ?', 'linux', 'multiple_choice', 15, 10, 'mv déplace un fichier, ou le renomme s''il reste dans le même répertoire.', 'easy'),
('Quelle commande supprime un fichier ?', 'linux', 'multiple_choice', 15, 10, 'rm supprime définitivement un fichier (à utiliser avec précaution).', 'easy'),
('Quelle commande crée un nouveau répertoire ?', 'linux', 'multiple_choice', 15, 10, 'mkdir signifie make directory.', 'easy'),
('Quelle commande affiche la liste des processus en cours d''exécution ?', 'linux', 'multiple_choice', 15, 10, 'ps affiche un instantané des processus actifs.', 'easy'),
('Quelle commande permet de modifier les permissions d''un fichier ?', 'linux', 'multiple_choice', 15, 10, 'chmod signifie change mode et modifie les droits d''accès.', 'easy');

-- 3c. Linux — saisir la commande correcte (10) — command
INSERT INTO question (statement, category, type, duration, points, explanation, difficulty) VALUES
('Quelle commande affiche la date et l''heure actuelles du système ?', 'linux', 'command', 30, 15, 'La commande date affiche la date et l''heure système.', 'medium'),
('Quelle commande affiche l''espace disque utilisé et disponible sur les systèmes de fichiers ?', 'linux', 'command', 30, 15, 'df (disk free) affiche l''utilisation de l''espace disque.', 'medium'),
('Quelle commande affiche la mémoire RAM utilisée et disponible ?', 'linux', 'command', 30, 15, 'free affiche l''état de la mémoire vive et du swap.', 'medium'),
('Quelle commande permet de rechercher un motif texte à l''intérieur d''un fichier ?', 'linux', 'command', 30, 15, 'grep recherche des lignes correspondant à un motif dans un fichier.', 'medium'),
('Quelle commande affiche les 10 premières lignes d''un fichier ?', 'linux', 'command', 30, 15, 'head affiche par défaut les 10 premières lignes d''un fichier.', 'medium'),
('Quelle commande affiche les 10 dernières lignes d''un fichier ?', 'linux', 'command', 30, 15, 'tail affiche par défaut les 10 dernières lignes d''un fichier.', 'medium'),
('Quelle commande change le propriétaire d''un fichier ?', 'linux', 'command', 30, 15, 'chown modifie le propriétaire (et éventuellement le groupe) d''un fichier.', 'medium'),
('Quelle commande affiche le nom de l''utilisateur actuellement connecté ?', 'linux', 'command', 30, 15, 'whoami affiche le nom de l''utilisateur courant.', 'medium'),
('Quelle commande crée une archive compressée nommée backup.tar.gz à partir du répertoire /data ?', 'linux', 'command', 30, 15, 'tar -czf crée (c), compresse en gzip (z) et nomme (f) l''archive.', 'medium'),
('Quelle commande affiche le manuel de la commande ls ?', 'linux', 'command', 30, 15, 'man affiche le manuel détaillé d''une commande.', 'medium');

-- 3d. Linux — combinaison de commandes (5) — combination
INSERT INTO question (statement, category, type, duration, points, explanation, difficulty) VALUES
('Quelle commande liste les fichiers du répertoire courant triés par ordre alphabétique en utilisant un pipe ?', 'linux', 'combination', 45, 20, 'Le pipe (|) transmet la sortie de ls à la commande sort.', 'hard'),
('Quelle commande permet de compter le nombre de fichiers dans le répertoire courant ?', 'linux', 'combination', 45, 20, 'wc -l compte le nombre de lignes reçues, ici une ligne par fichier listé.', 'hard'),
('Quelle commande affiche uniquement les processus dont le nom contient ''ssh'' ?', 'linux', 'combination', 45, 20, 'ps aux liste tous les processus, grep filtre ceux contenant ssh.', 'hard'),
('Quelle commande affiche les 5 plus gros fichiers ou dossiers du répertoire courant ?', 'linux', 'combination', 45, 20, 'du -ah liste les tailles, sort -rh trie du plus gros au plus petit, head -5 garde les 5 premiers.', 'hard'),
('Quelle commande affiche le nombre de lignes contenant le mot ''ERROR'' dans le fichier access.log ?', 'linux', 'combination', 45, 20, 'grep filtre les lignes contenant ERROR, wc -l compte ces lignes.', 'hard');

-- 3e. Linux — compléter une commande incomplète (5) — fill_blank
INSERT INTO question (statement, category, type, duration, points, explanation, difficulty) VALUES
('Complétez la commande pour lister tous les fichiers, y compris les fichiers cachés, avec les détails : ___ -la', 'linux', 'fill_blank', 20, 15, 'ls -la affiche tous les fichiers (y compris cachés) avec les détails.', 'medium'),
('Complétez la commande pour copier récursivement le dossier projet vers backup : cp ___ projet backup', 'linux', 'fill_blank', 20, 15, 'L''option -r (récursive) permet de copier un dossier et tout son contenu.', 'medium'),
('Complétez la commande pour rendre un script exécutable : chmod ___ script.sh', 'linux', 'fill_blank', 20, 15, 'chmod +x ajoute le droit d''exécution au fichier.', 'medium'),
('Complétez la commande pour trouver les fichiers .log modifiés il y a moins d''un jour dans /var : find /var -name ''*.log'' ___ -1', 'linux', 'fill_blank', 20, 15, 'L''option -mtime -1 sélectionne les fichiers modifiés il y a moins d''un jour.', 'medium'),
('Complétez la commande pour rediriger la sortie d''erreur d''un programme vers le fichier erreurs.txt : commande 2___ erreurs.txt', 'linux', 'fill_blank', 20, 15, 'Le descripteur 2 représente la sortie d''erreur (stderr), et > redirige vers un fichier.', 'medium');

-- 3f. Programmation Shell (3) — shell_code
INSERT INTO question (statement, category, type, duration, points, explanation, difficulty) VALUES
('Écrivez un script shell qui affiche les nombres de 1 à 10, un par ligne.', 'shell', 'shell_code', 120, 30, 'Une boucle for parcourt la séquence {1..10} et affiche chaque valeur avec echo.', 'hard'),
('Écrivez un script shell qui demande le nom de l''utilisateur et affiche un message de bienvenue personnalisé.', 'shell', 'shell_code', 120, 30, 'read récupère la saisie de l''utilisateur dans une variable, puis echo l''affiche dans un message.', 'hard'),
('Écrivez un script shell qui vérifie si le fichier config.txt existe dans le répertoire courant et affiche Trouve ou Absent selon le cas.', 'shell', 'shell_code', 120, 30, 'Le test -f vérifie l''existence d''un fichier régulier ; if/else affiche le résultat correspondant.', 'hard');

-- =====================================================
-- 4. QUESTION_CHOICE
-- =====================================================
-- NOTE : les question_id ci-dessous (1 à 43) correspondent à
-- l'ordre d'insertion des questions ci-dessus (auto-incrément).

-- 4a. Choix QCM (questions 1 à 20) — 4 options A-D
INSERT INTO question_choice (question_id, label, content, is_correct, order_index) VALUES
-- Q1
(1, 'A', 'Linus Torvalds', true, 1), (1, 'B', 'Richard Stallman', false, 2), (1, 'C', 'Dennis Ritchie', false, 3), (1, 'D', 'Ken Thompson', false, 4),
-- Q2
(2, 'A', '1989', false, 1), (2, 'B', '1991', true, 2), (2, 'C', '1995', false, 3), (2, 'D', '2001', false, 4),
-- Q3
(3, 'A', 'General Network Utility', false, 1), (3, 'B', 'GNU''s Not Unix', true, 2), (3, 'C', 'Global Network Unit', false, 3), (3, 'D', 'Graphical Native Utility', false, 4),
-- Q4
(4, 'A', 'MIT', false, 1), (4, 'B', 'Apache 2.0', false, 2), (4, 'C', 'GPL v2', true, 3), (4, 'D', 'BSD', false, 4),
-- Q5
(5, 'A', 'Tux le pingouin', true, 1), (5, 'B', 'Beastie le démon', false, 2), (5, 'C', 'Konqi le dragon', false, 3), (5, 'D', 'GNU le buffle', false, 4),
-- Q6
(6, 'A', 'CP/M', false, 1), (6, 'B', 'Multics', true, 2), (6, 'C', 'MS-DOS', false, 3), (6, 'D', 'VMS', false, 4),
-- Q7
(7, 'A', 'Microsoft', false, 1), (7, 'B', 'IBM', false, 2), (7, 'C', 'Apple', true, 3), (7, 'D', 'Google', false, 4),
-- Q8
(8, 'A', 'Mark Shuttleworth', false, 1), (8, 'B', 'Ian Murdock', true, 2), (8, 'C', 'Patrick Volkerding', false, 3), (8, 'D', 'Matthias Ettrich', false, 4),
-- Q9
(9, 'A', 'Red Hat', true, 1), (9, 'B', 'Ubuntu', false, 2), (9, 'C', 'Fedora', false, 3), (9, 'D', 'SUSE', false, 4),
-- Q10
(10, 'A', 'Free and Open Source Software', true, 1), (10, 'B', 'Fully Open System Software', false, 2), (10, 'C', 'Foundation of Software Standards', false, 3), (10, 'D', 'Free Operating System Suite', false, 4),
-- Q11
(11, 'A', 'pwd', true, 1), (11, 'B', 'ls', false, 2), (11, 'C', 'cd', false, 3), (11, 'D', 'dir', false, 4),
-- Q12
(12, 'A', 'cat', false, 1), (12, 'B', 'ls', true, 2), (12, 'C', 'find', false, 3), (12, 'D', 'tree', false, 4),
-- Q13
(13, 'A', 'cd', true, 1), (13, 'B', 'mv', false, 2), (13, 'C', 'go', false, 3), (13, 'D', 'dir', false, 4),
-- Q14
(14, 'A', 'cat', true, 1), (14, 'B', 'make', false, 2), (14, 'C', 'run', false, 3), (14, 'D', 'open', false, 4),
-- Q15
(15, 'A', 'mv', false, 1), (15, 'B', 'cp', true, 2), (15, 'C', 'copy', false, 3), (15, 'D', 'dup', false, 4),
-- Q16
(16, 'A', 'mv', true, 1), (16, 'B', 'cp', false, 2), (16, 'C', 'ren', false, 3), (16, 'D', 'move', false, 4),
-- Q17
(17, 'A', 'del', false, 1), (17, 'B', 'erase', false, 2), (17, 'C', 'rm', true, 3), (17, 'D', 'delete', false, 4),
-- Q18
(18, 'A', 'newdir', false, 1), (18, 'B', 'mkdir', true, 2), (18, 'C', 'touch', false, 3), (18, 'D', 'makedir', false, 4),
-- Q19
(19, 'A', 'top', false, 1), (19, 'B', 'ps', true, 2), (19, 'C', 'jobs', false, 3), (19, 'D', 'proc', false, 4),
-- Q20
(20, 'A', 'chown', false, 1), (20, 'B', 'chmod', true, 2), (20, 'C', 'chgrp', false, 3), (20, 'D', 'perm', false, 4);

-- 4b. Réponse attendue pour command / combination / fill_blank / shell_code
-- (questions 21 à 43), label 'reponse'
INSERT INTO question_choice (question_id, label, content, is_correct, order_index) VALUES
(21, 'reponse', 'date', true, 1),
(22, 'reponse', 'df', true, 1),
(23, 'reponse', 'free', true, 1),
(24, 'reponse', 'grep', true, 1),
(25, 'reponse', 'head', true, 1),
(26, 'reponse', 'tail', true, 1),
(27, 'reponse', 'chown', true, 1),
(28, 'reponse', 'whoami', true, 1),
(29, 'reponse', 'tar -czf backup.tar.gz /data', true, 1),
(30, 'reponse', 'man ls', true, 1),
(31, 'reponse', 'ls | sort', true, 1),
(32, 'reponse', 'ls | wc -l', true, 1),
(33, 'reponse', 'ps aux | grep ssh', true, 1),
(34, 'reponse', 'du -ah . | sort -rh | head -5', true, 1),
(35, 'reponse', 'grep ERROR access.log | wc -l', true, 1),
(36, 'reponse', 'ls', true, 1),
(37, 'reponse', '-r', true, 1),
(38, 'reponse', '+x', true, 1),
(39, 'reponse', '-mtime', true, 1),
(40, 'reponse', '>', true, 1),
(41, 'reponse', 'for i in {1..10}; do echo $i; done', true, 1),
(42, 'reponse', 'read -p "Quel est votre nom ? " nom; echo "Bienvenue, $nom !"', true, 1),
(43, 'reponse', 'if [ -f config.txt ]; then echo "Trouve"; else echo "Absent"; fi', true, 1);

-- =====================================================
-- 5. CONTEST
-- =====================================================
INSERT INTO contest (title, status, created_by, total_questions, start_time, end_time) VALUES
('Concours Linux - Promo Première Année 2026', 'waiting', 1, 43, NULL, NULL);

-- =====================================================
-- 6. CONTEST_PLAYER (les 18 joueurs rejoignent le concours)
-- =====================================================
-- contest_id = 1, player_id de 1 à 18 (ordre d'insertion ci-dessus)
INSERT INTO contest_player (contest_id, player_id, is_connected) VALUES
(1, 1, false), (1, 2, false), (1, 3, false), (1, 4, false), (1, 5, false),
(1, 6, false), (1, 7, false), (1, 8, false), (1, 9, false), (1, 10, false),
(1, 11, false), (1, 12, false), (1, 13, false), (1, 14, false), (1, 15, false),
(1, 16, false), (1, 17, false), (1, 18, false);

-- =====================================================
-- 7. CONTEST_QUESTION (43 questions réparties en 3 manches)
-- =====================================================
-- Round 1 : culture générale (questions 1-10)
INSERT INTO contest_question (contest_id, question_id, round_number, order_index) VALUES
(1,1,1,1),(1,2,1,2),(1,3,1,3),(1,4,1,4),(1,5,1,5),
(1,6,1,6),(1,7,1,7),(1,8,1,8),(1,9,1,9),(1,10,1,10);

-- Round 2 : commandes Linux (questions 11-40)
INSERT INTO contest_question (contest_id, question_id, round_number, order_index) VALUES
(1,11,2,1),(1,12,2,2),(1,13,2,3),(1,14,2,4),(1,15,2,5),
(1,16,2,6),(1,17,2,7),(1,18,2,8),(1,19,2,9),(1,20,2,10),
(1,21,2,11),(1,22,2,12),(1,23,2,13),(1,24,2,14),(1,25,2,15),
(1,26,2,16),(1,27,2,17),(1,28,2,18),(1,29,2,19),(1,30,2,20),
(1,31,2,21),(1,32,2,22),(1,33,2,23),(1,34,2,24),(1,35,2,25),
(1,36,2,26),(1,37,2,27),(1,38,2,28),(1,39,2,29),(1,40,2,30);

-- Round 3 : programmation Shell (questions 41-43)
INSERT INTO contest_question (contest_id, question_id, round_number, order_index) VALUES
(1,41,3,1),(1,42,3,2),(1,43,3,3);

-- =====================================================
-- 8. TWO_FACTOR_CHALLENGE (exemples pour tester le flux 2FA, RG13)
-- En réalité générés à la volée quand un joueur demande les
-- résultats finaux ; insérés ici uniquement pour pouvoir tester.
-- =====================================================
INSERT INTO two_factor_challenge (player_id, command, expected_answer, validated, expires_at) VALUES
(1, 'Donnez la commande qui affiche les 5 processus consommant le plus de mémoire, triés par ordre décroissant.', 'ps aux --sort=-%mem | head -5', false, NOW() + INTERVAL '10 minutes'),
(2, 'Donnez la commande qui recherche récursivement, dans /etc, tous les fichiers modifiés au cours des 7 derniers jours.', 'find /etc -type f -mtime -7', false, NOW() + INTERVAL '10 minutes'),
(3, 'Donnez la commande qui affiche le nombre total de connexions TCP actuellement à l''état ESTABLISHED.', 'netstat -ant | grep ESTABLISHED | wc -l', false, NOW() + INTERVAL '10 minutes');

COMMIT;