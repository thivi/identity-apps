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

import { IdentityAppsApiException } from "@wso2is/core/exceptions";
import { HttpMethods } from "@wso2is/core/models";
import { OAuth } from "@wso2is/oauth-web-worker";
import { AccessTokenPostBody, RegenerateAccessTokenPostBody } from "../models";
import { store } from "../store";

/**
 * Initialize an axios Http client.
 *
 * @type { AxiosHttpClientInstance }
 */
const httpClient = OAuth.getInstance().httpRequest;

/**
 * Create a token for a userstore domain.
 * 
 * @param {AccessTokenPostBody} data Request body data.
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
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

/**
 * Get a userstore domain's access token.
 * 
 * @param {string} domain The userstore domain.
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
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

/**
 * Deactivate an access token.
 * 
 * @param {string} domain The userstore domain.
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
export const deactivateToken = (domain: string): Promise<any> => {
    const requestConfig = {
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.PUT,
        url: `${store.getState().config.endpoints.remoteUserstoreTokenManagement}/revoke/${domain}`
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while deactivating the access token",
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
                "An error occurred while deactivating the access token",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};

/**
 * Regenerate an access token.
 * 
 * @param {RegenerateAccessTokenPostBody} data The request body.
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
export const regenerateToken = (data: RegenerateAccessTokenPostBody): Promise<any> => {
    const requestConfig = {
        data: data,
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: `${store.getState().config.endpoints.remoteUserstoreTokenManagement}/regenerate`
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while regenerating the access token",
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
                "An error occurred while regenerating the access token",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};

/**
 * List the agents belonging to a userstore domain. 
 * 
 * @param {string} domain The userstore domain.
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
export const listAgents = (domain: string): Promise<any> => {
    const requestConfig = {
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: `${store.getState().config.endpoints.remoteUserstoreAgentManagement}/${domain}`
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while retrieving the agents",
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
                "An error occurred while retrieving the agents",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};

/**
 * Delete an agent.
 * 
 * @param domain 
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
export const deleteAgent = (domain: string): Promise<any> => {
    const requestConfig = {
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.DELETE,
        url: `${store.getState().config.endpoints.remoteUserstoreAgentManagement}/${domain}`
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while deleting the agent",
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
                "An error occurred while deleting the agent",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};

/**
 * Get the file path of the agent app.
 * 
 * @return {Promise<any>} A promise that resolves with the returned data.
 */
export const retrieveFilePath = (): Promise<any> => {
    const requestConfig = {
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: `${store.getState().config.endpoints.remoteUserstoreAgentManagement}/filepath`
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    "An error occurred while retrieving the file path",
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
                "An error occurred while retrieving the file path",
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};
