#pragma once
#include <string>
class ICommand {
public:
    virtual ~ICommand() = default;    
    virtual void execute(const std::string& args) = 0;
};