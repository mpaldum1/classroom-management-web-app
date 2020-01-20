const Sequelize = require("sequelize");
const sequelize = new Sequelize("DBWT19","root","",{host:"127.0.0.1",dialect:"mariadb",logging:false});
// mysql -> mariadb

const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//import modela
db.osoblje = sequelize.import(__dirname+'/osoblje.js');
db.termin = sequelize.import(__dirname+'/termin.js');
db.sala = sequelize.import(__dirname+'/sala.js');
db.rezervacija = sequelize.import(__dirname+'/rezervacija.js');

//relacije



// Veza 1-na-vise Osoblje-Rezervaicija 

db.osoblje.hasMany(db.rezervacija, {as:'rezervacijaOsoblje',foreignKey:'osoba'});

// Veza vise - na - 1 Rezervacija - Sala 
db.sala.hasMany(db.rezervacija, {as:'rezervacijaSala',foreignKey:'sala'});

// Veza 1-1 Rezervaicija - Termin
db.termin.hasOne(db.rezervacija, {as:'rezervacijaSTermin',foreignKey:'termin'});


// Veza 1-1 Sala - Osoblje
db.sala.belongsTo(db.osoblje, {as:'odgovornaOsoba',foreignKey:'zaduzenaOsoba'});


module.exports=db;