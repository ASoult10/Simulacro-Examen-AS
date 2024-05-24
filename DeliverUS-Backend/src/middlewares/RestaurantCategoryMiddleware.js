import { RestaurantCategory } from '../models/models.js'

const checkDifferentName = async (req, res, next) => {
  try {
    const numberOfRestCatsWithSameName = await RestaurantCategory.count({ where: { name: req.body.name } }) // *
    if (numberOfRestCatsWithSameName < 1) {
      return next()
    } else {
      return res.status(403).send('There is already a restaurant category with same name')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}

export {checkDifferentName}