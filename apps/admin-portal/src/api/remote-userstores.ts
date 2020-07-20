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

import { OAuth } from "@wso2is/oauth-web-worker";
import { HttpMethods } from "@wso2is/core/models";
import { store } from "../store";
import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { AccessTokenPostBody } from "../models";

/**
 * Initialize an axios Http client.
 *
 * @type { AxiosHttpClientInstance }
 */
const httpClient = OAuth.getInstance().httpRequest;

export const createToken = (data: AccessTokenPostBody): Promise<any> => {
    const requestConfig = {
        data: data,
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: store.getState().config.endpoints.remoteUserstoreTokenManagement
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while inserting an access token",
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config
                );
            }

            return Promise.resolve(response);
        })
        .catch((error) => {
            throw new IdentityAppsApiException(
                "An error occurred while inserting an access token",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};

export const retrieveToken = (domain: string): Promise<any> => {
    const requestConfig = {
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: `${store.getState().config.endpoints.remoteUserstoreTokenManagement}/${domain}`
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while retrieving the access token",
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config
                );
            }

            return Promise.resolve(response);
        })
        .catch((error) => {
            throw new IdentityAppsApiException(
                "An error occurred while retrieving the access token",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};

