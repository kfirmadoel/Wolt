#pragma once
#include "ICommand.h"

class HelpCommand : public ICommand {
public:
    // Display list of available commands
    void execute(const std::string& args) override;
};