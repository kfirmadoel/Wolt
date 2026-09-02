// models/searchModels.js
const db = require ('../database')

const search = (query) => {
    //Change to lower case so if user type in lower case i will find that too.
    const lowerQuery  = query.toLowerCase();

    //chained filter on all restaurants to find the ones contain query.
    const restaurants = db.getRestaurants().filter(r => 
        r.name.toLowerCase().includes(lowerQuery) ||
        r.description?.toLowerCase().includes(lowerQuery)
     );
    //chained filter on all producst to find the ones contain query.
    const products = db.getProducts().filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
     );
     
     return {restaurants, products};
};

module.exports = {
    search
};