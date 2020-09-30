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
 *
 */

import _ from "lodash";
import {
    BasicProfileInterface,
    MultiValue,
    ProfileAttribute,
    ProfileCompletion,
    ProfileSchema,
    emptyProfileCompletion,
    PrimaryEmail
} from "../models";
import { store } from "../store";
import { setProfileCompletion } from "../store/actions";

/**
 * This function extracts the sub attributes from the schemas and appends them to the main schema iterable.
 * The returned iterable will have all the schema attributes in a flat structure so that
 * you can just iterate through them to display them.
 *
 * @param {ProfileSchema[]} schemas - Array of Profile schemas
 * @param {string} parentSchemaName - Name of the parent attribute.
 * @return {ProfileSchema[]}
 */
export const flattenSchemas = (schemas: ProfileSchema[], parentSchemaName?: string): ProfileSchema[] => {
    const tempSchemas: ProfileSchema[] = [];

    schemas.forEach((schema: ProfileSchema) => {
        if (schema.subAttributes && schema.subAttributes.length > 0) {
            /**
             * If the schema has sub attributes, then this function will be recursively called.
             * The returned attributes are pushed into the `tempSchemas` array.
             */
            tempSchemas.push(...flattenSchemas(schema.subAttributes, schema.name));
        } else {
            const tempSchema = { ...schema };

            if (parentSchemaName) {
                tempSchema.name = parentSchemaName + "." + schema.name;
            }

            tempSchemas.push(tempSchema);
        }
    });

    return tempSchemas;
};

/**
 * Type Guard to check if the passed in attribute is of type `MultiValue`.
 *
 * @param attribute - Profile attribute.
 * @return {attribute is MultiValue}
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const isMultiValuedProfileAttribute = (attribute: any): attribute is MultiValue => {
    return attribute.type !== undefined;
};

/**
 * Modifies the profile info object in to a flat level.
 *
 * @param profileInfo - Profile information.
 * @param {string} parentAttributeName - Name of the parent attribute.
 * @return {any[]}
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const flattenProfileInfo = (profileInfo: any, parentAttributeName?: string): any[] => {
    const tempProfile = [];

    for (let key in profileInfo) {
        const value = profileInfo[key];

        // Skip `associations`, `responseStatus` & `roles`.
        if (key === "associations" || key === "responseStatus") {
            continue;
        }

        // If `parentAttributeName` param is available,
        // append it to the existing attribute key.
        if (parentAttributeName) {
            key = parentAttributeName + "." + key;
        }

        // Check if the value is an array and if it's a string array
        // join and save it as a string, if it's of type `MultiValue`
        // recursively call the function.
        if (Array.isArray(value)) {
            if (value.length && value.length > 0) {
                if (typeof value[0] === "string") {
                    tempProfile.push({
                        [key]: value.join(",")
                    });

                    continue;
                }
            }

            tempProfile.push(...flattenProfileInfo(value, key));

            continue;
        }

        // Check if the value is of type `MultiValue`.
        if (isMultiValuedProfileAttribute(value)) {
            // If `parentAttributeName` param is available,
            // append it to the existing multi valued attribute key.
            if (parentAttributeName) {
                key = parentAttributeName + "." + value.type;
            }

            tempProfile.push({
                [key]: value.value
            });

            continue;
        }

        // If the value is of type object, recursively call the function.
        if (typeof value === "object") {
            tempProfile.push(...flattenProfileInfo(value, key));

            continue;
        }

        tempProfile.push({
            [key]: value
        });
    }

    return tempProfile;
};

/**
 * Returns `True` if profile image exists.
 * Returns `False` if the profile image doesn't exist.
 * @param {string} name Name of the schema
 * @param {BasicProfileInterface} profileInfo ProfileInfo from the store
 * @returns {boolean} Boolean
 */
const isProfileImageComplete = (name: string, profileInfo: BasicProfileInterface): boolean => {
    return !(_.isEmpty(profileInfo.profileUrl) && _.isEmpty(profileInfo.userImage));
};

/**
 * Calculates the profile completion.
 *
 * @param {BasicProfileInterface} profileInfo - Profile information.
 * @param {ProfileSchema[]} profileSchemas - Profile schemas.
 * @return {ProfileCompletion}
 */
export const getProfileCompletion = (
    profileInfo: BasicProfileInterface,
    profileSchemas: ProfileSchema[]
): ProfileCompletion => {
    const completion: ProfileCompletion = emptyProfileCompletion();

    for (const schema of flattenSchemas([...profileSchemas])) {
        // Skip `Roles`
        if (schema.displayName === "Role") {
            continue;
        }

        // Attribute to be stored as `completed` or `incomplete` attribute.
        const attribute: ProfileAttribute = {
            displayName: schema.name === "profileUrl" ? "Profile Image" : schema.displayName,
            name: schema.name
        };

        let isMapped = false;

        if (schema.required) {
            completion.required.totalCount++;
        } else {
            completion.optional.totalCount++;
        }

        for (const info of flattenProfileInfo(profileInfo)) {
            for (const [key, value] of Object.entries(info)) {
                if (schema.name === key) {
                    if (schema.required) {
                        if (
                            value ||
                            (schema.name === "profileUrl" && isProfileImageComplete(schema.name, profileInfo))
                        ) {
                            completion.required.completedCount++;
                            completion.required.completedAttributes.push(attribute);
                        } else {
                            completion.required.incompleteAttributes.push(attribute);
                        }
                    } else {
                        if (
                            value ||
                            (schema.name === "profileUrl" && isProfileImageComplete(schema.name, profileInfo))
                        ) {
                            completion.optional.completedCount++;
                            completion.optional.completedAttributes.push(attribute);
                        } else {
                            completion.optional.incompleteAttributes.push(attribute);
                        }
                    }

                    isMapped = true;
                }
            }
        }

        // If the schema couldn't be mapped, add it to in-completed list.
        if (!isMapped) {
            if (schema.required) {
                if (schema.name !== "profileUrl" || !isProfileImageComplete(schema.name, profileInfo)) {
                    completion.required.incompleteAttributes.push(attribute);
                }
            } else {
                if (schema.name !== "profileUrl" || !isProfileImageComplete(schema.name, profileInfo)) {
                    completion.optional.incompleteAttributes.push(attribute);
                }
            }
        }
    }

    // Calculate the profile completion percentage.
    completion.percentage =
        Math.ceil(
            (((completion.required.completedCount + completion.optional.completedCount) /
                (completion.required.totalCount + completion.optional.totalCount)) *
                100) /
                10
        ) * 10;

    // Set the redux state.
    store.dispatch(setProfileCompletion(completion));

    return completion;
};

/**
 * This function gets the email address from the profile info passed as the argument
 * and returns the email address.
 *
 * @param {BasicProfileInterface} profileInfo - The profile information.
 * @return {string} email - The email address.
 * @remark Temporarily the first element in the emails array is shown.
 * In the future, we need to decide whether or not to allow multiple recovery emails
 */
export const extractEmailAddress = (profileInfo: BasicProfileInterface): PrimaryEmail => {
    let emailAddress: string = "";
    let emailType: string = "";
    if (profileInfo.emails) {
        if (typeof profileInfo.emails[0] === "object" && profileInfo.emails[0] !== null) {
            emailAddress = profileInfo.emails[ 0 ].value;
            emailType = profileInfo.emails[ 0 ].type;
        } else {
            emailAddress = profileInfo.emails[0];
        }
    }

    return {
        email: emailAddress,
        type: emailType
    };
};
