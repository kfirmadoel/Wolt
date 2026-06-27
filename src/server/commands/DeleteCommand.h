#pragma once
#include "core/ICommand.h"
#include "Database/UsersRepository.h"
#include <string>
#include "commands/Status.h"
/**
 * Handles the DELETE command.
 * Removes watched products from an existing user.
 * Valid only if the user exists and has watched all specified products.
 * Returns "204 No Content" on success, "404 Not Found" otherwise,
 * "400 Bad Request" if input is malformed.
 */
class DeleteCommand : public ICommand {
private:
    /**
     * @brief Reference to the UsersRepository
     */
    UsersRepository& repository;

public:
    /**
     * @brief Constructor for DeleteCommand
     * @param repo Reference to the UsersRepository
     */
    explicit DeleteCommand(UsersRepository& repo);

    /**
     * @brief Executes the delete command
     * @param args The arguments to the command
     * @return The response to the command.
     */
    std::string execute(const std::string& args) override;
};