const Pool = require('pg').Pool
const pool = new Pool({
    user: 'ptut-adm',
    host: 'ep-polished-violet-a2o4tams.eu-central-1.pg.koyeb.app',
    database: 'koyebdb',
    password: 'zWp1R6fJAnaI',
    port: 5432,
    ssl: true
})

const express = require('express')
const app = express()
const PORT = 8080

app.use(express.json())

app.listen(
    PORT,
    () => { console.log('Serveur à lécoute') }
)

app.get("/etablissement/:idEtab", (req, res) => {
    const id = req.params.idEtab
    pool.query('SELECT * FROM ETABLISSEMENT WHERE numeroEtab = $1', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }

        res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

        res.status(200).json(results.rows)
    })
})

app.get("/etablissement/:idEtab/salle", (req, res) => {     //Ici on récupérera chaque salle et on ajoutera le nbPersonne du passage le plus récent
    const id = req.params.idEtab
    pool.query('SELECT * FROM SALLE WHERE numeroEtab = $1', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error });
        }
        res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

        res.status(200).json(results.rows)
    })
})

app.get("/etablissement/:idEtab/passage", (req, res) => {     //Ici on récupérera chaque salle et on ajoutera le nbPersonne du passage le plus récent
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
        res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

        res.status(200).json(adjustedResults)
    })
})

app.get("/etablissement/:idEtab/lastpassage", (req, res) => {
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

            res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

            res.status(200).json(adjustedResults);
        }
    );
});

app.get("/etablissement/:idEtab/passage/periode", (req, res) => {
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

        res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

        res.status(200).json(adjustedResults);
    })
})


app.get("/etablissement/:idEtab/salle/:idSalle", (req, res) => {
    res.status(200).send({
        //Ici on récupérera la salle et on ajoutera le nbPersonne du passage le plus récent
        nomSalle: "Salle test",
        numeroSalle: req.params['idSalle'],
        nbPersonne: 10
    })
})

app.get("/etablissement/:idEtab/salle/:idSalle/passage", (req, res) => {
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
            res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

            res.status(200).json(adjustedResults);
        }
    );
});

app.get("/etablissement/:idEtab/salle/:idSalle/lastpassage", (req, res) => {
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
            res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

            res.status(200).json(adjustedResults);
        }
    );
});

app.get("/etablissement/:idEtab/salle/:idSalle/passage/periode", (req, res) => {
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

        res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

        res.status(200).json(adjustedResults);
    })
})



app.post('/createpassage', (req, res) => {
    // Assuming your stored procedure requires some parameters, you can access them from the request body
    const numeroSalleEntrante = req.body.numeroSalleEntrante !== undefined ? req.body.numeroSalleEntrante : null;
    const numeroSalleSortante = req.body.numeroSalleSortante !== undefined ? req.body.numeroSalleSortante : null;
    console.log(numeroSalleEntrante);
    console.log(numeroSalleSortante);

    // Call your stored procedure with parameters
    pool.query('CALL ADD_PASSAGE($1, $2)', [numeroSalleEntrante, numeroSalleSortante], (error, results, fields) => {
        if (error) {
            console.error('Error calling stored procedure: ' + error);
            res.status(500).json({ error: 'Error calling stored procedure' });
            return;
        }
        res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

        res.json(results); // Return results from the stored procedure
    });
});