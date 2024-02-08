const express = require('express')
const app = express()
const PORT = 8080

app.use(express.json())

const mysql = require('mysql');

app.listen(
    PORT,
    () => {  console.log('Serveur à lécoute')}
    )

app.get("/etablissement/:id",(req, res) => {
    res.status(200).send({
        nomEtablissement: "Etab test",
        numeroEtablissement: req.params['id']
    })
})

app.get("/etablissement/:id/salle",(req, res) => {
    res.status(200).send({
        //Ici on récupérera chaque salle et on ajoutera le nbPersonne du passage le plus récent
        salles: [
            {
                nomSalle: "Salle test",
                numeroSalle: 1,
                nbPersonne: 10
            },
            {
                nomSalle: "Salle test",
                numeroSalle: 2,
                nbPersonne: 5
            }
        ]
    })
})

app.get("/etablissement/:id/salle/periode",(req, res) => {
    const  dateDebut = req.query.dateDebut;
    const  dateFin = req.query.dateFin;

    res.status(200).send({
        //On récupère pour chaque passage de notre salle les passages entre la date de début et la date de fin
        //A voir si on remplace le boolean pour les entrants par des int (1 et -1)
        salle1: [
            {
                date: dateDebut,
                nbPersonne: 10,
                entrant: true
            },
            {
                date: "2020-12-01 01:00:00",
                nbPersonne: 9,
                entrant: false
            }
        ],
        salle2:[
            {
                date: "2020-12-01 00:00:00",
                nbPersonne: 7,
                entrant: true
            },
            {
                date: "2020-12-01 00:01:00",
                nbPersonne: 6,
                entrant: false
            }
        ]
    })
})

app.get("/etablissement/:id/salle/:idSalle",(req, res) => {
    res.status(200).send({
        //Ici on récupérera la salle et on ajoutera le nbPersonne du passage le plus récent
        nomSalle: "Salle test",
        numeroSalle: req.params['idSalle'],
        nbPersonne: 10
    })
})

app.get("/etablissement/:id/salle/:id/periode",(req, res) => {
    const  dateDebut = req.query.dateDebut;
    const  dateFin = req.query.dateFin;

    res.status(200).send({
        //On récupère pour chaque passage de notre salle les passages entre la date de début et la date de fin
        //A voir si on remplace le boolean pour les entrants par des int (1 et -1)
        passages: [
            {
                date: dateDebut,
                nbPersonne: 10,
                entrant: true
            },
            {
                date: "2020-12-01 01:00:00",
                nbPersonne: 9,
                entrant: false
            }
        ],
    })
})

app.post("url:id", (req, res) => {

    const { id } = req.params.id
    const { body } = req.body

    if(!body){
        res.status(400).send({
            message: "Le body est vide"
        })
    }
    res.send({
    })
})