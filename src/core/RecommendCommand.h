#pragma once
#include "ICommand.h"
#include "UsersRepository.h"
#include <string>
#include <vector>

class RecommendCommand : public ICommand {
private:
   UsersRepository& repository;

    // Helper to calculate similarity score between two users
    int getSimilarity(int user1, int user2);

public:
    // Constructor
    RecommendCommand(UsersRepository& repo);

    // Execute recommendation algorithm
    void execute(const std::string& args) override;
};