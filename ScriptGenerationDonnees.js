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

function callProcedure(param1, param2, param3){
    if(param3 === null){
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
    let date = new Date('2024-03-20T18:00:00+01:00');

    for (let i = 0; i < 1000; i++) {
        let entryRoom = Math.random() < 0.5 ? 1 : 2;
        let enter = Math.random() < 0.46;
        let both = Math.random() < 0.2;
        if(both){
            callProcedure(entryRoom,entryRoom === 1 ? 2 : 1, date);
            date = new Date(date.getTime() + 1000*60*30);
            console.log("Insert entrant in : " + entryRoom + " and out in " + (entryRoom === 1 ? 2 : 1) + " at " + date);
        }
        if(entryRoom === 1) {
            if(enter) {
                callProcedure(1, null, date);
                date = new Date(date.getTime() + 1000*60*30);
            }
            else {
                callProcedure(null, 1, date);
                date = new Date(date.getTime() + 1000*60*30);
            }
        }
        if(entryRoom === 2) {
            if(enter) {
                callProcedure(2, null, date);
                date = new Date(date.getTime() + 1000*60*30);
            }
            else {
                callProcedure(null, 2, date);
                date = new Date(date.getTime() + 1000*60*30);
            }
        }
    }
    console.log("Data generated.");
}

generateFakeData();
