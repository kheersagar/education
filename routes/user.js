const { userStats } = require('../controller/statsController')
const { submitTest, getQuestions, getTestInformation, getRecommendedQuestions } = require('../controller/testController')

const router = require('express').Router()


router.get("/questions",getQuestions)
router.post("/submit-test",submitTest)
router.get("/stats",userStats)
router.get("/recommended-questions",getRecommendedQuestions)
router.get("/test-information/:id",getTestInformation)

module.exports = router