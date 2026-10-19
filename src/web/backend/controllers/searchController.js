// controllers/searchController.js
const searchService = require('../services/searchService');

const search = async (req, res) => {
    const response = await searchService.search(req.params.query);
    res.status(200).json(response);
};

module.exports = {
    search
};