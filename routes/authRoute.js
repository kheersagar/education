const { login, register, logout } = require('../controller/authController')
const { submitTest, getQuestions } = require('../controller/testController')

const router = require('express').Router()

router.post("/register",register)
router.post("/login",login)
router.get("/logout",logout)

module.exports = router