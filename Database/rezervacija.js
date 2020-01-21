const Sequelize = require("sequelize");
const Model = Sequelize.Model;

module.exports = (sequelize, DataTypes) => {

    class Rezervacija extends Model{}

    Rezervacija.init({
        
    },
    {
        sequelize,
        modelName: 'rezervacija'
    }); 

    return Rezervacija;
};
