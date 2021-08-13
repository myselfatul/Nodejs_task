'use strict'
module.exports = (sequelize, DataTypes) => {
  const image = sequelize.define(
    'image',
    {
      user_id: DataTypes.INTEGER,
      image_url: DataTypes.STRING,
      public_id: DataTypes.STRING
    },
    {
      underscored: true,
      freezeTableName: true
    }
  )

  image.associate = (models) =>{
    image.belongsTo(models.user, {
      foreignKey: 'user_id'
    })
  }
  return image
}
