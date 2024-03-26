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

async function callProcedure(param1, param2, param3){
    return new Promise((resolve, reject) => {
        if (param3 === null) {
            resolve();
        }
        console.log("Je génère");
        pool.query(
            'CALL add_passage_date($1, $2, $3::timestamp with time zone)',
            [param1, param2, param3],
            (error, results, fields) => {
                if (error) {
                    //console.error('Error calling stored procedure: ' + error);
                    resolve('Error calling stored procedure: ' + error);
                }
                resolve();
            }
        );
    });
}

async function getNumberOfPeopleLastPassage(numsalle){
    return new Promise((resolve, reject
    ) => {
        pool.query(
            'SELECT nbpersonne FROM passage WHERE numerosalle = $1 ORDER BY datepassage DESC LIMIT 1',[numsalle],
            (error, results) => {
                if (error) {
                    console.error('Error calling stored procedure: ' + error);
                    resolve('Error calling stored procedure: ' + error);
                }
                console.log(results.rows[0].nbpersonne);
                resolve(results.rows[0].nbpersonne);
            }
        );
    });
}

// Function to generate fake data
async function generateFakeData() {
    let date = new Date('2024-01-01T08:10:00+01:00');

    for (let i = 0; i < 30000; i++) {
        // random number between 5 and 15 included
        let entryRoom = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        let enter = Math.random() < 0.46;
        if (enter) {
            await callProcedure(entryRoom, null, date);
            date = new Date(date.getTime() + 1000 * 60 * 5);
        } else {
           await callProcedure(null, entryRoom, date);
            date = new Date(date.getTime() + 1000 * 60 * 5);
        }
        if (date.getHours() >= 19) {
            for (let j = 5; j <= 15; j++) {
                let nb = await getNumberOfPeopleLastPassage(j);
                for (let k = 0; k < nb; k++) {
                    await callProcedure(null, j, date);
                    date = new Date(date.getTime() + 1000 * 60);
                }
            }
            date = new Date(date.getTime() + 1000 * 60 * 60 * 12)
        }
    }
}
generateFakeData().then(console.log("fini"));