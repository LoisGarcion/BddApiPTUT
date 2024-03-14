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

/*
pool.query('CALL ADD_PASSAGE($1, $2)', [1, 2], (error, results, fields) => {
    if (error) {
        console.error('Error calling stored procedure: ' + error);
        return;
    }
    console.log(results);
});
*/

pool.query(
    'CALL add_passage_date($1, $2, $3::timestamp with time zone)',
    [1, null, '2024-03-14 10:00:00+01'],
    (error, results, fields) => {
        if (error) {
            console.error('Error calling stored procedure: ' + error);
            return;
        }
        console.log(results);
    }
);

