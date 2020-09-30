/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
  * Multi-valued attribute model
  */
export interface MultiValue {
    type: string;
    value: string;
}

/**
 * Name model
 */
export interface Name {
    givenName: string;
    familyName: string;
}

/**
 * Multi-valued pending emails model
 */
export interface PendingEmail {
    type?: string;
    value: string;
}

/**
 * Profile Model
 */
export interface BasicProfileInterface {
    emails?: string[] | MultiValue[] | any;
    email?: string;
    phoneNumbers: MultiValue[];
    organisation: string;
    responseStatus: number;
    roles?: MultiValue[];
    name: Name;
    profileUrl: string;
    pendingEmails?: string | PendingEmail[] | any;
    isSecurity?: boolean;
    userImage?: string;
    userName?: string;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [ key: string ]: any;
    isReadOnly: boolean;
}

/**
 * Linked account interface.
 */
export interface LinkedAccountInterface {
    /**
     * Associated user's email address.
     */
    email: string;
    /**
     * Associated user's last name.
     */
    lastName: string;
    /**
     * Tenant domain.
     */
    tenantDomain: string;
    /**
     * ID of the associated user.
     */
    userId: string;
    /**
     * User store domain.
     */
    userStoreDomain: string;
    /**
     * Username of the associated user.
     */
    username: string;
}

/**
 * Profile schema interface.
 */
export interface ProfileSchema {
    claimValue: string;
    uniqueness: string;
    displayName: string;
    name: string;
    displayOrder: string;
    description: string;
    mutability: string;
    type: string;
    multiValued: boolean;
    caseExact: boolean;
    returned: string;
    required: boolean;
    subAttributes?: ProfileSchema[];
}

/**
 * Enum for profile completion statuses.
 *
 * @readonly
 * @enum {string}
 */
export enum ProfileCompletionStatus {
    ERROR = "error",
    WARNING = "warning",
    SUCCESS = "success"
}

/**
 * Profile completion interface.
 */
export interface ProfileCompletion {
    optional: ProfileCompletionResult;
    required: ProfileCompletionResult;
    percentage: number;
}

/**
 * Interface to handle individual profile status types.
 */
interface ProfileCompletionResult {
    completedAttributes: ProfileAttribute[];
    completedCount: number;
    incompleteAttributes: ProfileAttribute[];
    totalCount: number;
}

/**
 * Interface to map the `completed` or `incomplete` attributes.
 */
export interface ProfileAttribute {
    displayName: string;
    name: string;
}

/**
 * Interface for Profile resucer state.
 */
export interface ProfileReducerStateInterface {
    completion: ProfileCompletion;
    isSCIMEnabled: boolean;
    linkedAccounts: LinkedAccountInterface[];
}

/**
 * Model of the is read only user status.
 */
export interface ReadOnlyUserStatus {
    id: string;
    schemas: string[];
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
        isReadOnlyUser: boolean;
    };
}

/**
 * Model of the object containing the email address and the type
 * returned by the `extractEmailAddress` util function.
 */
export interface PrimaryEmail{
    email: string;
    type: string;
}

/**
 * Empty profile completion object.
 *
 * @return {ProfileCompletion}
 */
export const emptyProfileCompletion = (): ProfileCompletion => ({
    optional: {
        completedAttributes: [],
        completedCount: 0,
        incompleteAttributes: [],
        totalCount: 0
    },
    percentage: 0,
    required: {
        completedAttributes: [],
        completedCount: 0,
        incompleteAttributes: [],
        totalCount: 0
    }
});

export const createEmptyProfile = (): BasicProfileInterface => ({
    email: "",
    emails: [],
    isReadOnly: true,
    isSecurity: false,
    name: {
        familyName: "",
        givenName: ""
    },
    organisation: "",
    phoneNumbers: [],
    profileUrl: "",
    responseStatus: null,
    roles: [],
    userImage: "",
    userName: ""
});
