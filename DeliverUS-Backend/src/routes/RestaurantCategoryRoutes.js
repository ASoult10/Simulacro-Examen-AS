import RestaurantCategoryControllere from '../controllers/RestaurantCategoryController.js'
import * as RestaurantCategoryMiddleware from '../middlewares/RestaurantCategoryMiddleware.js'
import RestaurantCategoryController from '../controllers/RestaurantCategoryController.js'

const loadFileRoutes = function (app) {
  app.route('/restaurantCategories')
    .get(RestaurantCategoryControllere.index)
    .post(
      RestaurantCategoryMiddleware.checkDifferentName,
      RestaurantCategoryController.create
    )
}
export default loadFileRoutes
