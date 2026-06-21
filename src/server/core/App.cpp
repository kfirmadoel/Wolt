#include "App.h"
#include <sstream>
#include <algorithm>

using namespace std;

App::App(map<string, ICommand *> injectedCommands) : commands(injectedCommands) {}

std::string App::handleLine(const std::string &rawLine)
{
    std::string line = rawLine;

    // Fix Windows line endings
    if (!line.empty() && line.back() == '\r')
    {
        line.pop_back();
    }

    if (line.empty())
        return "";

    // Ignore lines containing tabs
    if (line.find('\t') != string::npos)
        return "";

    // Parse the command name
    istringstream iss(line);
    string commandName;
    string args;

    // Parse the command name
    if (!(iss >> commandName))
        return "";

    // Case-insensitive command lookup
    for (char &c : commandName)
    {
        c = tolower(c);
    }

    // Get the rest of the string as arguments
    // Because 'args' is fresh, if this fails due to EOF, 'args' remains safely empty!
    getline(iss, args);
    if (!args.empty() && args[0] == ' ')
    {
        args = args.substr(1); // Clean leading space
    }

    auto foundCommand = commands.find(commandName);
    if (foundCommand != commands.end())
    {
        try
        {
            // Polymorphic call to execute command logic
            return foundCommand->second->execute(args);
        }
        catch (...)
        {
            return RES_400_BAD;
        }
    }

    return RES_400_BAD;
}

void App::run(std::istream &in)
{
    string line;
    while (getline(in, line))
    {
        std::string response = handleLine(line);
        if (!response.empty())
        {
            cout << response;
        }
    }
}