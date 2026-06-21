#pragma once
#include "core/ICommand.h"
#include <string>
#include "commands/Status.h"

class HelpCommand : public ICommand {
public:
    // Display list of available commands
    std::string execute(const std::string& args) override;
};