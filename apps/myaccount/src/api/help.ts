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

import { HttpMethods } from "@wso2is/core/models";
import axios from "axios";

/**
 * This fetches the md doc of the my account from the github repo and returns it.
 *
 * @return {Promise<any>} MD doc - The MD help doc.
 */
export const getHelp = (): Promise<any> => {
    const config = {
        method: HttpMethods.GET,
        url: "https://raw.githubusercontent.com/wso2/docs-is/master/en/docs/learn/my-account.md"
    };

    return axios(config).then((response) => {
        return Promise.resolve(response?.data);
    }).catch((error) => {
        return Promise.reject(error);
    });
};
