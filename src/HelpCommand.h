#pragma once
#include "ICommand.h"
#include <string>

class HelpCommand : public ICommand {
public:
    // Display list of available commands
    void execute(const std::string& args) override;
};