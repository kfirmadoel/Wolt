#include "HelpCommand.h"
#include <iostream>

// Execute the help command: print available commands exactly as requested
void HelpCommand::execute(const std::string& args) {
    std::cout << "add [userid] [productid1] [productid2] ..." << std::endl;
    std::cout << "recommend [userid] [productid]" << std::endl;
    std::cout << "help" << std::endl;
}