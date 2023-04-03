const express = require('express');
const serviceController = require('../controller/serviceController');
const serviceRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer');

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "./uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, (new Date()).getTime() + file.originalname.substr(file.originalname.indexOf('.'),file.originalname.length));
    }
});
const upload = multer({storage: storageConfig});


serviceRouter.post('/auth', serviceController.authentication);

serviceRouter.post('/logout ',authMiddleware, serviceController.logout);

serviceRouter.post('/posts', authMiddleware, upload.single('file'), serviceController.addDish);
serviceRouter.post('/posts/:id',authMiddleware, upload.single('file'), serviceController.updateDish);
serviceRouter.delete('/posts/:id',authMiddleware, serviceController.deleteDish);
serviceRouter.get('/posts', serviceController.getAllDishes);
serviceRouter.get('/posts/:id', serviceController.getOneDish);
serviceRouter.post('/posts/:id/comments', serviceController.addComment);
serviceRouter.delete('/posts/:dishId/comments/:commentId', authMiddleware, serviceController.deleteComment);
serviceRouter.get('/posts/tag/:tagName', serviceController.getDishByTag);

module.exports = serviceRouter;