const Sequelize = require("sequelize");
const Model = Sequelize.Model;


module.exports = function (sequelize, DataTypes) {

    class Termin extends Model {}
    Termin.init({
          
        redovni:Sequelize.BOOLEAN,
        dan:Sequelize.INTEGER,
        datum:Sequelize.STRING,
        semestar:Sequelize.STRING,
        pocetak:Sequelize.TIME,
        kraj:Sequelize.TIME

    }, {
        sequelize,
        modelName: 'termin'
    });

    return Termin;
};