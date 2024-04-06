const Pool = require('pg').Pool
const pool = new Pool({
    user: 'ptut-adm',
    host: 'ep-polished-violet-a2o4tams.eu-central-1.pg.koyeb.app',
    database: 'koyebdb',
    password: 'zWp1R6fJAnaI',
    port: 5432,
    ssl: true
})

/*
pool.query('CALL ADD_PASSAGE($1, $2)', [1, 2], (error, results, fields) => {
    if (error) {
        console.error('Error calling stored procedure: ' + error);
        return;
    }
    console.log(results);
});
*/

/*pool.query(
    'CALL add_passage_date($1, $2, $3::timestamp with time zone)',
    [1, null, '2024-03-14 18:20:00+01'],
    (error, results, fields) => {
        if (error) {
            console.error('Error calling stored procedure: ' + error);
            return;
        }
        console.log(results);
    }
);
*/

function callProcedure(param1, param2, param3) {
    if (param3 === null) {
        return;
    }
    pool.query(
        'CALL add_passage_date($1, $2, $3::timestamp with time zone)',
        [param1, param2, param3],
        (error, results, fields) => {
            if (error) {
                console.error('Error calling stored procedure: ' + error);
                return;
            }
        }
    );
}

// Function to generate fake data
function generateFakeData() {
    let date = new Date('2024-03-15T08:00:00+01:00');

    for (let i = 0; i < 2000; i++) {
        // random number between 8 and 14
        let entryRoom = Math.floor(Math.random() * (15 - 8 + 1)) + 8;
        let enter = Math.random() < 0.46;
        if (date.getHours() >= 8 && date.getHours() < 20) {
            if (enter) {

                callProcedure(entryRoom, null, date);

                date = new Date(date.getTime() + 1000 * 60 * 30);
            }
            else {
                callProcedure(null, entryRoom, date);
                date = new Date(date.getTime() + 1000 * 60 * 30);
            }
        }

        if (date.getHours() >= 20) {
            date = new Date(date.getTime() + 1000 * 60 * 60 * 12)
        }
    }
    console.log("Data generated.");
}

generateFakeData();
