cmake_minimum_required(VERSION 3.10)
project(WoltProject)


set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/heads/main.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

include_directories(common Database Logic .)

file(GLOB_RECURSE PROJECT_SOURCES 
    "common/*.cpp" 
    "Database/*.cpp" 
    "Logic/*.cpp"
)

file(GLOB_RECURSE ALL_TEST_FILES "tests/*.cpp")
add_executable(runAllTests ${PROJECT_SOURCES} ${ALL_TEST_FILES})
target_link_libraries(runAllTests GTest::gtest_main)


foreach(test_file ${ALL_TEST_FILES})

    get_filename_component(target_name ${test_file} NAME_WE)
    
    add_executable(${target_name} ${PROJECT_SOURCES} ${test_file})
    target_link_libraries(${target_name} GTest::gtest_main)
endforeach()