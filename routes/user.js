const { login, register } = require('../controller/authController')
const { submitTest, getQuestions } = require('../controller/testController')

const router = require('express').Router()

router.post("/register",register)
router.post("/login",login)
router.get("/questions",getQuestions)
router.post("/submit-test",submitTest)

module.exports = router