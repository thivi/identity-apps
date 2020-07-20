/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

/**
 * The model of the post body of the request to add a new token.
 */
export interface AccessTokenPostBody {
    domain: string;
    token: string;
}

/**
 * The model of the response when the token of a domain is requested.
 */
export interface Token{
    accessToken: string;
}

/**
 * The model of the post body of the request to regenerate the token.
 */
export interface RegenerateAccessTokenPostBody {
    domain: string;
    oldToken: string;
    newToken: string;
}

/**
 * The model of the connected agent object.
 */
export interface ConnectedAgent{
    accessTokenId: number;
    accessToken: string;
    node: string;
    status: string;
    serverNode: string;
}

/**
 * The model of the file path object.
 */
export interface FilePath {
    location: string;
}
