#include "HelpCommand.h"
#include <iostream>
#include <sstream>
#include <string>
#include <algorithm>
#include <vector>

// Execute the help command: print available commands exactly as requested 
std::string HelpCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string junk;
    // Check for input that is not empty or just whitespace
    if (iss >> junk) {
        return RES_400_BAD;
    }

    // Commands in alphabetical order, help will be last
    std::vector<std::string> cmds = {
        "DELETE, arguments: [userid] [productid1] [productid2] ...",
        "GET, arguments: [userid] [productid]",
        "PATCH, arguments: [userid] [productid1] [productid2] ...",
        "POST, arguments: [userid] [productid1] [productid2] ..."
    };

    std::sort(cmds.begin(), cmds.end());

    std::string result;
    for (const auto& c : cmds) {
        result += c + "\n";
    }
    result += "help\n";
    return result;
}