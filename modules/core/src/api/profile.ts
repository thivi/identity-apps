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

import { IdentityClient, SignInResponse } from "@asgardio/oidc-js";
import axios, { AxiosError, AxiosResponse } from "axios";
import { CommonServiceResourcesEndpoints } from "../configs";
import { ProfileConstants } from "../constants";
import { IdentityAppsApiException } from "../exceptions";
import { HTTPRequestHeaders } from "../helpers";
import {
    AcceptHeaderValues,
    ContentTypeHeaderValues,
    GravatarFallbackTypes,
    HttpMethods,
    LinkedAccountInterface,
    ProfileInfoInterface,
    ProfileSchemaInterface
} from "../models";
import { ContextUtils, ProfileUtils } from "../utils";

/**
 * auth instance.
 */
const auth = IdentityClient.getInstance();
/**
 * Get an http client instance.
 *
 */
const httpClient = auth.httpRequest.bind(auth);

/**
 * Get Gravatar image using the email address.
 *
 * @param {string} email - Email address.
 * @param {number} size - Size of the image from 1 up to 2048.
 * @param {string} defaultImage - Custom default fallback image URL.
 * @param {GravatarFallbackTypes} fallback - Built in fallback strategy.
 * @return {Promise<string>} Valid Gravatar URL as a Promise.
 * @throws {IdentityAppsApiException}
 */
export const getGravatarImage = (email: string,
                                 size?: number,
                                 defaultImage?: string,
                                 fallback: GravatarFallbackTypes = "404"): Promise<string> => {

    const requestConfig = {
        method: HttpMethods.GET,
        url: ProfileUtils.buildGravatarURL(email, size, defaultImage, fallback)
    };

    return axios.request(requestConfig)
        .then(() => {
            return Promise.resolve(requestConfig.url);
        })
        .catch((error: AxiosError) => {
            throw new IdentityAppsApiException(
                ProfileConstants.GRAVATAR_IMAGE_FETCH_REQUEST_ERROR,
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config);
        })
};

/**
 * Retrieve the user profile details of the currently authenticated user.
 *
 * @param {() => void} onSCIMDisabled - Callback to be fired if SCIM is disabled for the user store.
 * @returns {Promise<ProfileInfoInterface>} Profile information as a Promise.
 * @throws {IdentityAppsApiException}
 */
export const getProfileInfo = (onSCIMDisabled: () => void): Promise<ProfileInfoInterface> => {

    const orgKey = "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User";

    const requestConfig = {
        headers: HTTPRequestHeaders(ContextUtils.getRuntimeConfig().clientHost, AcceptHeaderValues.APP_JSON,
            ContentTypeHeaderValues.APP_SCIM),
        method: HttpMethods.GET,
        url: CommonServiceResourcesEndpoints(ContextUtils.getRuntimeConfig().serverHost).me
    };

    return httpClient(requestConfig)
        .then(async (response: AxiosResponse) => {

            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    ProfileConstants.PROFILE_INFO_FETCH_REQUEST_INVALID_RESPONSE_CODE_ERROR,
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config);
            }

            const profileResponse: ProfileInfoInterface = {
                emails: response.data.emails || "",
                name: response.data.name || { familyName: "", givenName: "" },
                organisation: response.data[orgKey] ? response.data[orgKey].organization : "",
                phoneNumbers: response.data.phoneNumbers || [],
                profileUrl: response.data.profileUrl || "",
                responseStatus: response.status || null,
                roles: response.data.roles || [],
                // TODO: Validate if necessary.
                userImage: response.data.userImage || response.data.profileUrl,
                userName: response.data.userName || "",
                ...response.data
            };

            return Promise.resolve(profileResponse);
        })
        .catch((error: AxiosError) => {
            // Check if the API responds with a `500` error, if it does,
            // navigate the user to the login error page.
            if (error.response
                && error.response.data
                && error.response.data.status
                && error.response.data.status === "500") {

                // Fire `onSCIMDisabled` callback which will navigate the
                // user to the corresponding error page.
                onSCIMDisabled();
            }

            throw new IdentityAppsApiException(
                ProfileConstants.PROFILE_INFO_FETCH_REQUEST_ERROR,
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config);
        });
};

/**
 * Update the required details of the user profile.
 *
 * @param {object} info - Information that needs to ber updated.
 * @return {Promise<ProfileInfoInterface>} Updated profile info as a Promise.
 * @throws {IdentityAppsApiException}
 */
export const updateProfileInfo = (info: object): Promise<ProfileInfoInterface> => {

    const requestConfig = {
        data: info,
        headers: HTTPRequestHeaders(ContextUtils.getRuntimeConfig().clientHost, null),
        method: HttpMethods.PATCH,
        url: CommonServiceResourcesEndpoints(ContextUtils.getRuntimeConfig().serverHost).me
    };

    return httpClient(requestConfig)
        .then((response: AxiosResponse) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    ProfileConstants.PROFILE_INFO_UPDATE_REQUEST_INVALID_RESPONSE_CODE_ERROR,
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config);
            }

            return Promise.resolve(response.data);
        })
        .catch((error: AxiosError) => {
            throw new IdentityAppsApiException(
                ProfileConstants.PROFILE_INFO_UPDATE_REQUEST_ERROR,
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config);
        });
};

/**
 * Update the logged in user's profile image URL.
 *
 * @param {string} url - Image URL.
 * @return {Promise<ProfileInfoInterface>} Updated profile info as a Promise.
 * @throws {IdentityAppsApiException}
 */
export const updateProfileImageURL = (url: string): Promise<ProfileInfoInterface> => {
    const data = {
        Operations: [
            {
                op: "replace",
                value: {
                    profileUrl: url
                }
            }
        ],
        schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"]
    };

    return updateProfileInfo(data);
};

/**
 * Retrieve the profile schemas of the user claims of the currently authenticated user.
 *
 * @return {Promise<ProfileSchemaInterface[]>} Array of profile schemas as a Promise.
 * @throws {IdentityAppsApiException}
 */
export const getProfileSchemas = (): Promise<ProfileSchemaInterface[]> => {

    const requestConfig = {
        headers: HTTPRequestHeaders(ContextUtils.getRuntimeConfig().clientHost, null, ContentTypeHeaderValues.APP_JSON),
        method: HttpMethods.GET,
        url: CommonServiceResourcesEndpoints(ContextUtils.getRuntimeConfig().serverHost).profileSchemas
    };

    return httpClient(requestConfig)
        .then((response) => {
            if (response.status !== 200) {
                throw new IdentityAppsApiException(
                    ProfileConstants.SCHEMA_FETCH_REQUEST_INVALID_RESPONSE_CODE_ERROR,
                    null,
                    response.status,
                    response.request,
                    response,
                    response.config);
            }

            return Promise.resolve(response.data[0].attributes as ProfileSchemaInterface[]);
        })
        .catch((error) => {
            throw new IdentityAppsApiException(
                ProfileConstants.SCHEMA_FETCH_REQUEST_ERROR,
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config);
        });
};

/**
 * Switches the logged in user's account to one of the linked accounts
 * associated to the corresponding user.
 *
 * @param {LinkedAccountInterface} account - The target account.
 * @param {string[]} scopes - Required scopes array.
 * @param {string} clientID - Client ID.
 * @param {string} clientHost - Client Host URL.
 * @return {Promise<any>}
 * @throws {IdentityAppsApiException}
 */
export const switchAccount = (account: LinkedAccountInterface): Promise<any> => {
    return auth
        .customGrant({
            attachToken: false,
            data: {
                clientId: "{{clientId}}",
                grantType: "account_switch",
                scope: "{{scope}}",
                "tenant-domain": account.tenantDomain,
                token: "{{token}}",
                username: account.username,
                "userstore-domain": account.userStoreDomain
            },
            id: "switch-account",
            returnResponse: true,
            returnsSession: true,
            signInRequired: true
        })
        .then((response: SignInResponse) => {
            return Promise.resolve(response?.data);
        })
        .catch((error: AxiosError) => {
            throw new IdentityAppsApiException(
                ProfileConstants.ACCOUNT_SWITCH_REQUEST_ERROR,
                error.stack,
                error.code,
                error.request,
                error.response,
                error.config
            );
        });
};
