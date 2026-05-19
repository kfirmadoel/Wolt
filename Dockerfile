FROM gcc:latest

RUN apt-get update && apt-get install -y cmake

COPY . /usr/src/wolt_tests
WORKDIR /usr/src/wolt_tests

RUN mkdir build
WORKDIR /usr/src/wolt_tests/build

RUN cmake .. && make

# Run tests
CMD ["./runAllTests"]