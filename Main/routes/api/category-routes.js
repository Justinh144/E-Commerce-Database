const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
      attributes: ['id', 'category_name'],
    });

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
      attributes: ['id', 'category_name'],
    });

   if (!categoryData) {
    res.status(404).json({ message: 'No Route'})
    return;
   }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const categoryData = await Category.create ({
      category_name: req.body.category_name,
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
   try {

    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({ message: 'name required'})
    }
    

    const [rowsAffected, updatedCategories] = await Category.update(
      { category_name }, 
      {
        where: {
          id: req.params.id,
        },
        returning: true,
      }
    );

    if (rowsAffected > 0) {
      res.json(updatedCategories[0]);
    } else {
      res.status(404).json({ message: 'Category created' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err); // Use 500 for internal server error
  }
});


router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!readerData) {
      res.status(404).json({ message: 'No reader'});
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;



// {
//   "id": 5,
//   "category_name": "Shoes",
//   "products": [
//     {
//       "id": 2,
//       "product_name": "Running Sneakers",
//       "price": 90,
//       "stock": 25,
//       "category_id": 5
//     }
//   ]
// }
