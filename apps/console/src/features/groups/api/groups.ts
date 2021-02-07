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

import { IdentityClient } from "@asgardeo/auth-spa";
import { HttpMethods } from "@wso2is/core/models";
import { AxiosError, AxiosResponse } from "axios";
import { store } from "../../core";
import {
    CreateGroupInterface,
    GroupListInterface,
    PatchGroupDataInterface,
    SearchGroupInterface
} from "../models";

/**
 * Initialize an axios Http client.
 */
const httpClient = IdentityClient.getInstance()
    .httpRequest.bind(IdentityClient.getInstance())
    .bind(IdentityClient.getInstance());

/**
 * Retrieve the list of groups in the system.
 *
 * @param domain user store
 */
export const getGroupList = (domain: string): Promise<GroupListInterface | any> => {

    const requestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        params: {
            domain
        },
        url: store.getState().config.endpoints.groups
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            if (response.status == 200) {
                return Promise.resolve(response);
            }
        })
        .catch((error: AxiosError) => {
            return Promise.reject(error);
        });
};

/**
 * Retrieve Group details for a give group id.
 *
 * @param groupId group id to retrieve group details
 */
export const getGroupById = (groupId: string): Promise<any> => {
    const requestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        url: store.getState().config.endpoints.groups + "/" + groupId
    };

    return httpClient(requestConfig).then((response) => {
        return Promise.resolve(response);
    }).catch((error) => {
        return Promise.reject(error);
    });
};

/**
 * Update Data of the matched ID or the group
 *
 * @param groupId group id to update group details
 * @param groupData Data that needs to be updated.
 */
export const updateGroupDetails = (groupId: string, groupData: PatchGroupDataInterface): Promise<any> => {
    const requestConfig = {
        data: groupData,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.PATCH,
        url: store.getState().config.endpoints.groups + "/" + groupId
    };

    return httpClient(requestConfig).then((response) => {
        return Promise.resolve(response);
    }).catch((error) => {
        return Promise.reject(error);
    });
};

/**
 * Retrieve a list of matched groups according to the search query.
 *
 * @param searchData - search query data
 */
export const searchGroupList = (searchData: SearchGroupInterface): Promise<any> => {
    const requestConfig = {
        data: searchData,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: store.getState().config.endpoints.groups + "/.search"
    };

    return httpClient(requestConfig).then((response) => {
        return Promise.resolve(response);
    }).catch((error) => {
        return Promise.reject(error);
    });
};

/**
 * Delete a selected group with a given group ID.
 *
 * @param groupId - Id of the group which needs to be deleted.
 * @returns {Promise<any>} a promise containing the status of the delete.
 */
export const deleteGroupById = (groupId: string): Promise<any> => {
    const requestConfig = {
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.DELETE,
        url: store.getState().config.endpoints.groups + "/" + groupId
    };

    return httpClient(requestConfig).then((response) => {
        return Promise.resolve(response);
    }).catch((error) => {
        return Promise.reject(error);
    });
};

/**
 * Create a group in the system with group.
 *
 * @param data - data object used to create the group
 */
export const createGroup = (data: CreateGroupInterface): Promise<any> => {
    const requestConfig = {
        data,
        headers: {
            "Access-Control-Allow-Origin": store.getState().config.deployment.clientHost,
            "Content-Type": "application/json"
        },
        method: HttpMethods.POST,
        url: store.getState().config.endpoints.groups
    };

    return httpClient(requestConfig).then((response) => {
        return Promise.resolve(response);
    }).catch((error) => {
        return Promise.reject(error);
    });
};
