'use strict'
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING
    },
    {
      underscored: true,
      freezeTableName: true
    }
  )

  user.associate = (models) =>{
    user.hasOne(models.image,{onDelete: 'CASCADE',onUpdate: 'CASCADE', hooks: true})
  }
  return user
}
