import { Restaurant, Order } from '../models/models.js'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}
const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
const checkRestaurantOpen = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { id: req.params.restaurantId }
    })
    if (restaurant.status === 'closed' || restaurant.status === 'temporarily closed') {
      return res.status(409).send('This restaurant is closed.')
    }
    return next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
const checkOrdersNotDelivered = async (req, res, next) => {
  try {
    const numberOfNullRestaurantOrders = await Order.findAll({
      where: { restaurantId: req.params.restaurantId, deliveredAt: null }
    })
    if (numberOfNullRestaurantOrders.length === 0) {
      return next()
    }
    return res.status(409).send('Some orders have not been delivered yet.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkRestaurantOpen, checkOrdersNotDelivered }
