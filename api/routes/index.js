const router = require("express").Router()

const {
  getSynonyms,
  createDrawing,
  functionCalling,
  generateTasks,
  separateByRoles
} = require('../controllers/openAI.controller')

router.post("/synonyms", getSynonyms)
router.post("/tasks", generateTasks)
router.post("/roles", separateByRoles)
router.post("/drawing", createDrawing)
router.post("/chatbot", functionCalling)


module.exports = router;
