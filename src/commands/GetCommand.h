#pragma once
#include "ICommand.h"
#include "../Database/UsersRepository.h"
#include <string>
#include <map>
#include "Status.h"

/**
 * Handles the GET command.
 * Returns recommendations for a user based on a specific product.
 * Returns RES_200_OK followed by up to 10 recommended product IDs.
 * Returns "404 Not Found" if the user doesn't exist.
 * Returns "400 Bad Request" if input is malformed.
 */
class GetCommand : public ICommand {
private:
    /**
     * Reference to the users repository.
     */
    UsersRepository& repository;

    /**
     * Calculates similarity score (number of common products) between two users.
     */
    int getSimilarity(const std::string& u1, const std::string& u2);

public:
    /**
     * Constructor.
     * @param repo Reference to the users repository.
     */
    explicit GetCommand(UsersRepository& repo);

    /**
     * Executes the GET command.
     * @param args The arguments to the command.
     * @return The response to the command.
     */
    std::string execute(const std::string& args) override;
};