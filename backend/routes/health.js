const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
  })
})

module.exports = router