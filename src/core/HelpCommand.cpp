#include "HelpCommand.h"
#include <iostream>
#include <sstream>
#include <string>

// Execute the help command: print available commands exactly as requested
void HelpCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string junk;

    // Check for input that is not empty or just whitespace
    if (iss >> junk) {
        return; 
    }

    std::cout << "add [userid] [productid1] [productid2] ..." << std::endl;
    std::cout << "recommend [userid] [productid]" << std::endl;
    std::cout << "help" << std::endl;
}