const express = require('express');
const pg = require('pg');
const superagent =  require('superagent');
const cors = require('cors');
const override = require('method-override');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'));
client.connect();

app.get('/', searchJokes);
app.get('/favorite', favoriteJokes);
app.post('/favorite', saveJokes);
app.get('/favorite/:id', jokeDetails);
app.put('/favorite/:id', updateJoke);
app.delete('/favorite/:id', deleteJoke);
app.get('/random', randomJoke);


function searchJokes(req,res){
    superagent.get('https://official-joke-api.appspot.com/jokes/programming/ten').then(data =>{
        res.render('pages/index', {jokes:data.body});
    });
}
function favoriteJokes(req,res){
    let SQL = 'SELECT * FROM jokes;';
    return client.query(SQL).then(data => {
        res.render('pages/favorites', {jokes:data.rows})
    });
}
function saveJokes(req,res){
    let {id,type,setup,punchline} = req.body;
    let SQL = 'INSERT INTO jokes(id,type,setup,punchline) VALUES ($1,$2,$3,$4);';
    let values = [id,type,setup,punchline];
    return client.query(SQL,values).then( ()=> {
    res.redirect('/favorite');
    });
}
function jokeDetails(req,res){
    var jokeId = req.params.id;
    let SQL = 'SELECT * FROM jokes WHERE id = $1;';
    let values = [jokeId];
    return client.query(SQL,values).then(data => {
        res.render('pages/details', {joke: data.rows[0]})
    })
}
function updateJoke(req,res){
    let {id,type,setup,punchline} = req.body;
    let SQL = 'UPDATE jokes SET type=$2, setup=$3, punchline=$4 WHERE id=$1'
    let values=[id,type,setup,punchline];
    return client.query(SQL,values).then( ()=>{
        res.redirect(`/favorite/${id}`);
    })
}
function deleteJoke(req,res){
    let jokeId = req.params.id;
    let SQL = 'DELETE FROM jokes WHERE id = $1;';
    let values = [jokeId];
    return client.query(SQL,values).then( ()=>{
        res.redirect(`/favorite`);
    })
}
function randomJoke (req,res){
    superagent.get('https://official-joke-api.appspot.com/jokes/programming/random').then(data =>{
        res.render('pages/random', {joke:data.body[0]});
    })
}
app.listen(PORT, () => {console.log(`Listening on PORT ${PORT}`)})