// controllers/searchController.js
const searchModel = require('../models/searchModel');

const search = (req,res) => {
    const response = searchModel.search(req.params.query);
    res.status(200).json(response);
};
module.exports = {
    search
};