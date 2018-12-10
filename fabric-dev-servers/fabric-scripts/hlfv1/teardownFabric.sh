#!/bin/bash

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Exit on first error, print all commands.
set -ev

#Detect architecture
ARCH=`uname -m`

# Grab the current directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Shut down the Docker containers for the system tests.
cd "${DIR}"/composer
ARCH=$ARCH docker-compose -f docker-compose.yml kill && docker-compose -f docker-compose.yml down

# remove the local state
#rm -fr ~/.composer
#rm -rf ~/.composer-connection-profiles/hlfv1
#rm -f ~/.composer-credentials/*

# remove chaincode docker images
# docker rmi $(docker images dev-* -q)

# Your system is now clean
