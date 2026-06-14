#pragma once
#include <string>
class ICommand {
public:
    virtual ~ICommand() = default;    
    virtual std::string execute(const std::string& args) = 0;
};