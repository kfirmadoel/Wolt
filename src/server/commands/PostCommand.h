#pragma once
#include "core/ICommand.h"
#include "Database/UsersRepository.h"
#include <string>
#include "Status.h"

/**
 * Handles the POST command.
 * Creates a new user and adds watched products.
 * Valid only if the user does NOT already exist.
 * Returns "201 Created" on success, "404 Not Found" if user exists,
 * "400 Bad Request" if input is malformed.
 */
class PostCommand : public ICommand
{
private:
    /**
     * Reference to the UsersRepository
     */
    UsersRepository &repository;

public:
    /**
     * Constructor.
     * @param repo Reference to the UsersRepository
     */

    explicit PostCommand(UsersRepository &repo);
    /**
     * Executes the POST command.
     * @param args The arguments to the command.
     * @return The response to the command.
     */
    std::string execute(const std::string &args) override;
};