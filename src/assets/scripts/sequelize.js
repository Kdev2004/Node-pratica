//========== [VARIABLES] ==========
const {Sequelize, DataTypes} = require('sequelize');
const configSQL = require('../../../config/database.js');
const sequelize = new Sequelize(configSQL.local.db, configSQL.local.user, configSQL.local.pass, {
  host: configSQL.local.host,
  dialect: configSQL.local.dialect
})
//========== [VARIABLES] ==========

//========== [TABLES] ==========
const registers = sequelize.define('registers', {
    user: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    pass: {
        type: DataTypes.STRING,
        allowNull: false
    }
})
//========== [TABLES] ==========

module.exports = {sequelize, registers};