#pragma once
#include "core/ICommand.h"
#include "Database/UsersRepository.h"
#include <string>
#include "Status.h"

/**
 * Handles the PATCH command.
 * Adds watched products to an existing user.
 * Valid only if the user ALREADY exists.
 * Returns "204 No Content" on success, "404 Not Found" if user doesn't exist,
 * "400 Bad Request" if input is malformed.
 */
class PatchCommand : public ICommand
{
private:
    /**
     *  Reference to the UsersRepository
     */
    UsersRepository &repository;

public:
    /**
     * Constructor for PatchCommand
     * @param repo Reference to the UsersRepository
     */
    explicit PatchCommand(UsersRepository &repo);

    /**
     * Executes the patch command
     * @param args The arguments to the command
     * @return The response to the command.
     */
    std::string execute(const std::string &args) override;
};