const { submitTest, getQuestions } = require('../controller/testController')

const router = require('express').Router()


router.get("/questions",getQuestions)
router.post("/submit-test",submitTest)

module.exports = router