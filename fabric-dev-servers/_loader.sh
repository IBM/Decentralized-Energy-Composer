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

echo "Development only script for Hyperledger Fabric control"


# Grab the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
THIS_SCRIPT=`basename "$0"`
echo "Running '${THIS_SCRIPT}'"

if [ "${HL_FABRIC_VERSION}" ]; then
  export FABRIC_VERSION="${HL_FABRIC_VERSION}"
fi

if [ "${HL_FABRIC_START_TIMEOUT}" ]; then
  export FABRIC_START_TIMEOUT="${HL_FABRIC_START_TIMEOUT}"
fi

if [ -z ${FABRIC_VERSION+x} ]; then
 echo "FABRIC_VERSION is unset, assuming hlfv12"
 export FABRIC_VERSION="hlfv12"
else
 echo "FABRIC_VERSION is set to '$FABRIC_VERSION'"
fi


if [ -z ${FABRIC_START_TIMEOUT+x} ]; then
 echo "FABRIC_START_TIMEOUT is unset, assuming 15 (seconds)"
 export FABRIC_START_TIMEOUT=15
else

   re='^[0-9]+$'
   if ! [[ $FABRIC_START_TIMEOUT =~ $re ]] ; then
      echo "FABRIC_START_TIMEOUT: Not a number" >&2; exit 1
   fi

 echo "FABRIC_START_TIMEOUT is set to '$FABRIC_START_TIMEOUT'"
fi

"${DIR}"/fabric-scripts/"${FABRIC_VERSION}"/"${THIS_SCRIPT}" "$@"
