#ifndef USERDATA_H
#define USERDATA_H

#include <set>

/**
 * Represents user data
 */
class UserData
{
public:
    /**
     * Default constructor
     * @param id user id
     */
    UserData(int id);

    /**
     * Constructor
     * @param id user id
     * @param products set of watched products
     */
    UserData(int id, const std::set<int> &products);

    /**
     * Returns the user id
     * @return user id
     */
    int getUserId() const;

    /**
     * Returns the set of watched products by the user
     * @return set of watched products
     */
    const std::set<int> &getWatchedProducts() const;

    /**
     * Adds a set of products to the set of watched products by the user
     * @param products set of products that has been watched
     */
    void addProducts(const std::set<int> &products);

    /**
     * Adds a product to the set of watched products by the user
     * @param productId product id
     */
    void addProduct(int productId);

    /**
     * Checks if the user has watched the product
     * @param productId product id
     * @return true if the user has watched the product, false otherwise
     */
    bool hasProductWatched(int productId) const noexcept;

private:
    /**
     * User id
     */
    int userId = -1;

    /**
     * Set of watched products by the user
     */
    std::set<int> watchedProducts;
};

#endif
