const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type:DataTypes.STRING, unique: true, allowNull: false},
    password: {type:DataTypes.STRING, allowNull: false},
    role: {type:DataTypes.STRING, defaultValue: "USER"}
})

const Dish = sequelize.define('dish', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type:DataTypes.STRING, unique: true, allowNull: false},
    anons: {type:DataTypes.STRING, allowNull: false},
    text: {type:DataTypes.STRING, allowNull: false},
    tags: {type:DataTypes.STRING},
    img: {type: DataTypes.STRING, allowNull: false, defaultValue:'default.jpg'}
})

const Comment = sequelize.define('comment', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    comment: {type:DataTypes.STRING, allowNull: false},
    author: {type:DataTypes.STRING, allowNull: false}
})

Dish.hasMany(Comment)
Comment.belongsTo(Dish)

User.hasMany(Comment)
Comment.belongsTo(User)

module.exports = {
    User,
    Dish,
    Comment
}