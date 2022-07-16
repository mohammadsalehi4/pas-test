var express = require('express');
var router = express.Router();
const userController=require('../controllers/controllers')
router.post('/signup',userController.signup)
router.post('/login',userController.login)
router.post('/confirm',userController.PasAutorization)
router.post('/pascode',userController.pasCode)
router.post('/checkcode',userController.checkPasCode)
module.exports=router;