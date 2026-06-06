#pragma once
#include <set>
#include <string>

/**
 * Represents user data
 */
class UserData
{
public:
    /**
     * Default constructor for map initialization
     */
    UserData() = default; 

    /**
     * Constructor with ID
     * @param id user id
     */
    UserData(const std::string& id);

    /**
     * Constructor
     * @param id user id
     * @param products set of watched products
     */
    UserData(const std::string& id, const std::set<std::string> &products);

    /**
     * Returns the user id
     * @return user id
     */
    std::string getUserId() const; // אפשר גם להחזיר const std::string&

    /**
     * Returns the set of watched products by the user
     * @return set of watched products
     */
    const std::set<std::string> &getWatchedProducts() const;

    /**
     * Adds a set of products to the set of watched products by the user
     * @param products set of products that has been watched
     */
    void addProducts(const std::set<std::string> &products);

    /**
     * Adds a product to the set of watched products by the user
     * @param productId product id
     */
    void addProduct(const std::string& productId);

     /**
     * Removes a product from the watched list.
     * Does nothing if the product was not watched.
     * @param productId product to remove
     */
    void removeProduct(const std::string& productId);

    /**
     * Checks if the user has watched the product
     * @param productId product id
     * @return true if the user has watched the product, false otherwise
     */
    bool hasProductWatched(const std::string& productId) const noexcept;

private:
    /**
     * User id
     */
    std::string userId;

    /**
     * Set of watched products by the user
     */
    std::set<std::string> watchedProducts;
};
