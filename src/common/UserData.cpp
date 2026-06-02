#include "UserData.h"

UserData::UserData(const std::string& id) : userId(id) {}

UserData::UserData(const std::string& id, const std::set<std::string>& products)
    : userId(id), watchedProducts(products) {}

std::string UserData::getUserId() const {
    return userId;
}

const std::set<std::string>& UserData::getWatchedProducts() const {
    return watchedProducts;
}

void UserData::addProducts(const std::set<std::string>& products) {
    watchedProducts.insert(products.begin(), products.end());
}

void UserData::addProduct(const std::string& productId) {
    watchedProducts.insert(productId);
}

bool UserData::hasProductWatched(const std::string& productId) const noexcept {
    return watchedProducts.count(productId) > 0;
}