#pragma once
#include "ICommand.h"
#include <string>
#include "UsersRepository.h"

class AddCommand : public ICommand {
private:
    // Reference to the main database
    UsersRepository& repository;

public:
    // Constructor
    AddCommand(UsersRepository& repo);

    // Execute the add command
    void execute(const std::string& args) override;
};