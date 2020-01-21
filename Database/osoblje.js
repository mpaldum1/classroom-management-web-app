const Sequelize = require("sequelize");
const Model = Sequelize.Model;

module.exports = function (sequelize, DataTypes) {
    class Osoblje extends Model { }

    Osoblje.init({
        ime: Sequelize.STRING,
        prezime: Sequelize.STRING,
        uloga: Sequelize.STRING
    }, {
        sequelize,
        modelName: 'osoblje'
    });

    return Osoblje;
};