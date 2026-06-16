// reccomendTest.cpp
#include <gtest/gtest.h>
#include "commands/GetCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>
#include <set>
#include <string>
#include <algorithm>
#include <map>

class RecommendCommandTest : public ::testing::Test {
protected:
    FileStorage* storage;
    UsersRepository* mockDb;

    void resetDb() {
        if (mockDb) delete mockDb;
        if (storage) delete storage;
        std::remove("rec_test_db.txt");
        storage = new FileStorage("rec_test_db.txt");
        mockDb = new UsersRepository(*storage);
    }

    void addData(const std::string& userId, std::initializer_list<std::string> products) {
        for (const std::string& p : products) {
            mockDb->addProductToUser(userId, p);
        }
    }

    void SetUp() override {
        storage = nullptr; mockDb = nullptr;
        resetDb();
        
        addData("1", {"100", "101", "102", "103"});
        addData("2", {"101", "102", "104", "105", "106"});
        addData("3", {"100", "104", "105", "107", "108"});
        addData("4", {"101", "105", "106", "107", "109", "110"});
        addData("5", {"100", "102", "103", "105", "108", "111"});
        addData("6", {"100", "103", "104", "110", "111", "112", "113"});
        addData("7", {"102", "105", "106", "107", "108", "109", "110"});
        addData("8", {"101", "104", "105", "106", "109", "111", "114"});
        addData("9", {"100", "103", "105", "107", "112", "113", "115"});
        addData("10", {"100", "102", "105", "106", "107", "109", "110", "116"});
    }

    void TearDown() override {
        delete mockDb;
        delete storage;
        std::remove("rec_test_db.txt");
    }
};

TEST_F(RecommendCommandTest, OfficialAssignmentExample) {
    RecommendCommand recCmd(*mockDb);

    testing::internal::CaptureStdout();
    recCmd.execute("1 104");
    std::string output = testing::internal::GetCapturedStdout();
    
    std::string expectedOutput = "105 106 111 110 112 113 107 108 109 114\n";
    EXPECT_EQ(output, expectedOutput);
}

TEST_F(RecommendCommandTest, TieBreakingRules) {
    resetDb(); 
    addData("1", {"10"}); 
    addData("2", {"10", "99", "50", "20"}); 
    addData("3", {"10", "99", "50", "20"}); 

    RecommendCommand recCmd(*mockDb);

    testing::internal::CaptureStdout();
    recCmd.execute("1 99"); 
    std::string output = testing::internal::GetCapturedStdout();

    EXPECT_EQ(output, "20 50\n");
}

TEST_F(RecommendCommandTest, MaxTenRecommendationsLimit) {
    resetDb();
    addData("1", {"1"});
    addData("2", {"1", "100", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"});

    RecommendCommand recCmd(*mockDb);

    testing::internal::CaptureStdout();
    recCmd.execute("1 100");
    std::string output = testing::internal::GetCapturedStdout();

    int spaces = std::count(output.begin(), output.end(), ' ');
    EXPECT_EQ(spaces, 9);
}

TEST_F(RecommendCommandTest, InvalidInputHandling) {
    RecommendCommand recCmd(*mockDb);

    testing::internal::CaptureStdout();
    recCmd.execute("");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    testing::internal::CaptureStdout();
    recCmd.execute("1");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    testing::internal::CaptureStdout();
    recCmd.execute("1 abc 104");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    testing::internal::CaptureStdout();
    recCmd.execute("1 104 abc");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");
}