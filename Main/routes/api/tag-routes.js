const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get ('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
    try {
      const tagData = await Tag.findAll({
        include: [{ model: Product, through: ProductTag }],
        attributes: ['tag_name'],
      });
    
      res.status(200).json(tagData)
    } catch (err) {
      res.status(500).json(err);
    }
  });


router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag}],
      attributes: ['tag_name'],
    });

    if (!tagData) {
      res.status(404).json({ message: 'No route'})
      return;
    }

    res.status(200).json(tagData)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
  .then((product) => {
    if (req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
          };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  })
  .then ((productTagIds) => res.status(200).json(productTagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', async (req, res) => {
  try {
    // Update the tag's name by its `id` value
    await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // Check and handle associated tags
    if (req.body.tagIds && Array.isArray(req.body.tagIds.length) && req.body.tagIds.length > 0) {
      const productTags = await Tag.findAll({
        where: { product_id: req.params.id },
      });

      // Create filtered list of new tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      // Figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // Run both actions
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    // Return a success response
    res.status(200).json({ message: 'Tag updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating tag', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ messeage: 'No Tags found'});
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
