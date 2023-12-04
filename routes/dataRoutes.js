const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Tuyến đường đăng nhập
router.post('/create', dataController.createData);
router.post('/getdefault', dataController.getDataDefault);
router.post('/setstatus', dataController.setStatusData);
router.post('/setedit', dataController.setEditData  );
router.post('/getreportdata', dataController.getAllDataReport);
router.post('/setnote', dataController.setNote);
router.post('/getdepartmentdata', dataController.getDepartmentData);


module.exports = router;
