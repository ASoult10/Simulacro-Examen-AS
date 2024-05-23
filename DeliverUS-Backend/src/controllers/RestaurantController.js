import { Restaurant, Product, RestaurantCategory, ProductCategory } from '../models/models.js'

const index = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        include:
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      },
        order: [['promoted', 'ASC']]
      }
    )
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

const indexOwner = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        where: { userId: req.user.id },
        include: [{
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }],
        order: [['promoted', 'DESC']]
      })
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

const create = async function (req, res) {
  const newRestaurant = Restaurant.build(req.body)
  newRestaurant.userId = req.user.id // usuario actualmente autenticado
  try {
    const restaurant = await newRestaurant.save()
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  // Only returns PUBLIC information of restaurants
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId, {
      attributes: { exclude: ['userId'] },
      include: [{
        model: Product,
        as: 'products',
        include: { model: ProductCategory, as: 'productCategory' }
      },
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      }],
      order: [[{ model: Product, as: 'products' }, 'order', 'ASC']]
    }
    )
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const update = async function (req, res) {
  try {
    await Restaurant.update(req.body, { where: { id: req.params.restaurantId } })
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const promote = async function (req, res) {
  const t = await Restaurant.sequelize.transaction()
  try {
    const promRes = await Restaurant.findOne({ where: { promoted: true } })
    console.log(promRes)
    if(promRes){
      await Restaurant.update({promoted: false}, { where: { id: promRes.id }, transaction: t })
    }
    const updatedRestaurant = await Restaurant.update({promoted: true}, { where: { id: req.params.restaurantId }, transaction: t })
    console.log(updatedRestaurant)
    await t.commit()
    res.json(updatedRestaurant)
  } catch (err) {
    await t.rollback()
    res.status(500).send(err)
  }
}

const changeStatus = async function (req, res) {
  const t = await Restaurant.sequelize.transaction()
  try {
    const promRes = await Restaurant.findOne({ where: { id: req.params.restaurantId } })
    console.log(promRes)
    let updatedRestaurant
    if(promRes.status === 'online'){
      updatedRestaurant = await Restaurant.update({status: 'offline'}, { where: { id: promRes.id }, transaction: t })
    } else {
      updatedRestaurant = await Restaurant.update({status: 'online'}, { where: { id: promRes.id }, transaction: t })
    }
    console.log(updatedRestaurant)
    await t.commit()
    res.json(updatedRestaurant)
  } catch (err) {
    await t.rollback()
    res.status(500).send(err)
  }
}

const destroy = async function (req, res) {
  try {
    const result = await Restaurant.destroy({ where: { id: req.params.restaurantId } })
    let message = ''
    if (result === 1) {
      message = 'Sucessfuly deleted restaurant id.' + req.params.restaurantId
    } else {
      message = 'Could not delete restaurant.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

const RestaurantController = {
  index,
  indexOwner,
  create,
  show,
  update,
  destroy,
  promote,
  changeStatus
}
export default RestaurantController
