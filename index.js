const Pool = require('pg').Pool
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const cors = require('cors');


const secretKey = "2f5c8fd5bdc0757f43f970d88a65b3fbf93d858207c649c6d03eb836a312c718"; //Pas forcément le plus sécurisé, mais le code étant stocké sur le back d'un docker avec aucun entry point extérieur, ca devrait aller

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied. Token is required.' });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.username = decoded.username;
        req.role = decoded.role;
        next();
    });
}

const pool = new Pool({
    user: 'ptut-adm',
    host: 'ep-polished-violet-a2o4tams.eu-central-1.pg.koyeb.app',
    database: 'koyebdb',
    password: 'zWp1R6fJAnaI',
    port: 5432,
    ssl: true
})

// Configuration de nodemailer avec vos informations SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lois.garcion34@gmail.com',
        pass: 'feoi tnqa abfr ihhw'
    }
});

const generatePassword = (
    length = 20,
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
) =>
    Array.from(crypto.randomFillSync(new Uint32Array(length)))
        .map((x) => characters[x % characters.length])
        .join('')

const express = require('express')
const app = express()
const PORT = 8080
const corsOptions = {
    origin: ['https://ptut-front-leocorp.koyeb.app', 'http://localhost:8000'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json())

app.listen(
    PORT,
    () => { console.log('Serveur à lécoute') }
)

app.get("/etablissement",verifyToken, (req, res) => {
    if(req.role !== 'admin'){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    pool.query('SELECT * FROM ETABLISSEMENT', (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        res.status(200).json(results.rows)
    })
})

app.get("/etablissement/:idEtab",verifyToken, (req, res) => {
    if(req.role !== "admin" && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const id = req.params.idEtab
    pool.query('SELECT * FROM ETABLISSEMENT WHERE numeroEtab = $1', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        res.status(200).json(results.rows)
    })
})

app.get("/etablissement/:idEtab/salle", verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const id = req.params.idEtab;
    pool.query('SELECT * FROM SALLE WHERE numeroEtab = $1', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        res.status(200).json(results.rows)
    })
})

app.get("/etablissement/:idEtab/passage",verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const id = req.params.idEtab
    pool.query('SELECT * FROM PASSAGE p JOIN SALLE s ON s.numeroSalle = p.numeroSalle WHERE numeroEtab = $1 ORDER BY p.datePassage', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }
        // Adjust timestamps to desired format
        const adjustedResults = results.rows.map(row => {
            const datepassage = new Date(row.datepassage).toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }); // Adjust timezone here
            return {
                ...row,
                datepassage
            };
        });

        res.status(200).json(adjustedResults)
    })
})

app.get("/etablissement/:idEtab/lastpassage", verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const id = req.params.idEtab;
    pool.query(
        'SELECT E.nomEtab, S.nomSalle, P.* FROM Etablissement E JOIN Salle S ON E.numeroEtab = S.numeroEtab JOIN ( SELECT numeroSalle, MAX(datePassage) AS lastPassage FROM Passage GROUP BY numeroSalle ) LP ON S.numeroSalle = LP.numeroSalle JOIN Passage P ON LP.numeroSalle = P.numeroSalle AND LP.lastPassage = P.datePassage WHERE E.numeroEtab = $1',
        [id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error });
            }
            // Adjust timestamps to desired format
            const adjustedResults = results.rows.map(row => {
                const datepassage = new Date(row.datepassage).toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }); // Adjust timezone here
                return {
                    ...row,
                    datepassage
                };
            });

            res.status(200).json(adjustedResults);
        }
    );
});

app.get("/etablissement/:idEtab/passage/periode",verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const dateDebut = req.query.dateDebut;
    const dateFin = req.query.dateFin;
    const id = req.params.idEtab

    pool.query('SELECT * FROM SALLE s JOIN PASSAGE p ON p.numeroSalle = s.numeroSalle WHERE numeroEtab = $1 AND p.datePassage BETWEEN $2 AND $3 ORDER BY p.datePassage', [id, dateDebut, dateFin], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        // Adjust timestamps to desired format
        const adjustedResults = results.rows.map(row => {
            const datepassage = new Date(row.datepassage).toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }); // Adjust timezone here
            return {
                ...row,
                datepassage
            };
        });

        res.status(200).json(adjustedResults);
    })
})

app.get("/etablissement/:idEtab/salle/:idSalle/passage",verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const id = req.params.idEtab;
    const idSalle = req.params.idSalle;
    pool.query(
        'SELECT * FROM PASSAGE p JOIN SALLE s ON s.numeroSalle = p.numeroSalle WHERE s.numeroEtab = $1 AND s.numeroSalle = $2 ORDER BY p.datePassage',
        [id, idSalle],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error });
            }
            // Adjust timestamps to desired timezone format
            const adjustedResults = results.rows.map(row => {
                const datepassage = new Date(row.datepassage).toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }); // Adjust timezone here
                return {
                    ...row,
                    datepassage
                };
            });

            res.status(200).json(adjustedResults);
        }
    );
});

app.get("/etablissement/:idEtab/salle/:idSalle/lastpassage",verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const id = req.params.idEtab;
    const idSalle = req.params.idSalle;
    pool.query(
        'SELECT * FROM PASSAGE p JOIN SALLE s ON s.numeroSalle = p.numeroSalle WHERE s.numeroEtab = $1 AND s.numeroSalle = $2 ORDER BY p.datePassage DESC LIMIT 1',
        [id, idSalle],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error: error });
            }
            // Adjust timestamps to desired format
            const adjustedResults = results.rows.map(row => {
                const datepassage = new Date(row.datepassage).toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }); // Adjust timezone here
                return {
                    ...row,
                    datepassage
                };
            });

            res.status(200).json(adjustedResults);
        }
    );
});

app.get("/etablissement/:idEtab/salle/:idSalle/passage/periode",verifyToken, (req, res) => {
    if(req.role !== 'admin' && req.role !== req.params.idEtab){
        return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
    }
    const dateDebut = req.query.dateDebut;
    const dateFin = req.query.dateFin;
    const idEtab = req.params.idEtab;
    const idSalle = req.params.idSalle;

    pool.query('SELECT * FROM SALLE s JOIN PASSAGE p ON p.numeroSalle = s.numeroSalle WHERE numeroEtab = $1 AND s.numeroSalle = $2 AND p.datePassage BETWEEN $3 AND $4 ORDER BY p.datePassage', [idEtab, idSalle, dateDebut, dateFin], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        // Adjust timestamps to desired format
        const adjustedResults = results.rows.map(row => {
            const datepassage = new Date(row.datepassage).toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }); // Adjust timezone here
            return {
                ...row,
                datepassage
            };
        });

        res.status(200).json(adjustedResults);
    })
})

///API POST

app.post('/createpassage', (req, res) => {
    // Assuming your stored procedure requires some parameters, you can access them from the request body
    const numeroSalleEntrante = req.body.numeroSalleEntrante !== undefined ? req.body.numeroSalleEntrante : null;
    const numeroSalleSortante = req.body.numeroSalleSortante !== undefined ? req.body.numeroSalleSortante : null;

    // Call your stored procedure with parameters
    pool.query('CALL ADD_PASSAGE($1, $2)', [numeroSalleEntrante, numeroSalleSortante], (error, results, fields) => {
        if (error) {
            console.error('Error calling stored procedure: ' + error);
            res.status(500).json({ error: 'Error calling stored procedure' });
            return;
        }

        res.json(results); // Return results from the stored procedure
    });
});

//POST USERS

app.post('/user/register', verifyToken,async (req, res) => {
    try {
        if(req.role !== 'admin'){
            return res.status(403).json({ error: "Vous n'avez pas les droits pour effectuer cette action" });
        }
        //random hash password
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = req.body.username;
        const role = req.body.role;
        pool.query('INSERT INTO ApiUser VALUES ($1, $2, $3, false)', [username, hashedPassword, role], (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Erreur de requête : " + error });
            }

            //Envoie un mail avec le mot de passe
            // Configuration de l'e-mail
            const mailOptions = {
                from: 'lois.garcion34@gmail.com',
                to: username,
                subject: "Votre compte à ptut comptage a été créé",
                text: "Votre compte a été crée avec l'adresse mail : " + username + " et le mot de passe temporaire : " + password + " . Vous devez changer votre mot de passe dès votre première connexion."
            };

            // Envoi de l'e-mail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({error: "Erreur dans l'envoie du mail : " + error.message });
                }
            });

            res.status(200).json({ message: "User registered" });
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erreur try catch : " + error });
    }
});

app.post('/user/login', async (req, res) => {
    try{
        pool.query('SELECT * FROM ApiUser WHERE apiUsername = $1', [req.body.username], (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Request error : " + error });
            }
            if (results.rows.length === 0) {
                return res.status(400).json({ error: "Cannot find user" });
            }
            const user = results.rows[0];
            bcrypt.compare(req.body.password,user.apipasswordhash , (error, result) => {
                if (error) {
                    return res.status(500).json({ error: "bcrypt compare error : " + error });
                }
                if (result) {
                    if(user.passwordchanged){
                        const token = jwt.sign({ username: user.apiusername, role: user.apirole, passwordChanged: user.passwordchanged }, secretKey, { expiresIn: '1h' });
                        return res.status(200).json({ message: "Logged in", token: token });
                    }
                    else{
                        return res.status(201).json({ message: "Vous devez modifier votre mot de passe pour vous connecter" });
                    }
                }
                return res.status(400).json({ error: "Incorrect password" });
            });
        });
    }
    catch (error) {
        res.status(500).json({ error: "try catch error : " + error });
    }
});

app.post('/user/resetpassword', async (req, res) => {
    try{
        const newPassword = generatePassword();
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        const username = req.body.username;
        //Remplace le mot de passe en base de données par un hash d'un mot de passe random
        pool.query('UPDATE ApiUser SET apiPasswordHash = $1, passwordChanged = false WHERE apiUsername = $2', [newHashedPassword, username], (error, results) => {
            if (error) {
                return res.status(500).json({error: error});
            }
            //Envoie un mail avec le mot de passe
            // Configuration de l'e-mail
            const mailOptions = {
                from: 'lois.garcion34@gmail.com',
                to: username,
                subject: "Votre mot de passe à ptut comptage a été réinitialisé",
                text: "Votre mot de passe a été réinitialisé. Votre nouveau mot de passe temporaire est : " + newPassword + " . Vous devez changer votre mot de passe dès votre première connexion."
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({error: "Erreur dans l'envoi du mail : " + error.message});
                }
            });
            return res.status(200).json({message: "Mot de passe reset"});
        });
    }
    catch (error) {
        res.status(500).json({ error: "Erreur dans le try catch : " + error });
    }
});

app.post('/user/changepassword', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const newPassword = req.body.newPassword;
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        pool.query('SELECT apipasswordhash FROM ApiUser WHERE apiUsername = $1', [username], (error, results) => {
            if (error) {
                // Handle query error
                return res.status(500).json({ error: "Error occurred while querying database: " + error });
            }

            if (results.rows.length === 0) {
                // If no user found, send error response
                return res.status(400).json({ error: "User not found" });
            }

            // Compare passwords
            bcrypt.compare(password, results.rows[0].apipasswordhash, (error, result) => {
                if (error) {
                    // Handle bcrypt compare error
                    return res.status(500).json({ error: "bcrypt compare error : " + error });
                }

                if (result) {
                    // If password matches, update password
                    pool.query('UPDATE ApiUser SET apiPasswordHash = $1, passwordChanged = true WHERE apiUsername = $2', [newPasswordHash, username], (error, results) => {
                        if (error) {
                            // Handle update query error
                            return res.status(500).json({ error: "Error occurred while updating password: " + error });
                        }
                        // Send success response
                        return res.status(200).json({ message: "Password changed" });
                    });
                } else {
                    // If password does not match, send error response
                    return res.status(400).json({ error: "Incorrect password" });
                }
            });
        });
    } catch (error) {
        // Handle other errors
        res.status(500).json({ error: "Error occurred: " + error });
    }
});