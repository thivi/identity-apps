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

import { TestableComponentInterface } from "@wso2is/core/models";
import { Field, FormValue, Forms } from "@wso2is/forms";
import { generate } from "generate-password";
import React, { FunctionComponent, ReactElement, useState } from "react";
import { Button, Grid, Message } from "semantic-ui-react";
import { createToken } from "../../../api";
import { AccessTokenPostBody } from "../../../models";

/**
 * Userstore domain name.
 *
 * @constant
 *
 * @type {string}
 */
const USERSTORE_DOMAIN = "userstore-domain";

/**
 * Userstore secret.
 *
 * @constant
 *
 * @type {string}
 */
const USERSTORE_SECRET = "userstore-secret";

/**
 * Proptypes of `GeneralRemoteUserstore` component.
 */
interface GeneralRemoteUserstorePropsInterface extends TestableComponentInterface {
    /**
     * Called when the form is submitted.
     */
    onSubmit: (values: AccessTokenPostBody) => void;
    /**
     * Triggers submit.
     */
    triggerSubmit: boolean;
}

/**
 * Renders the general step of the remote userstore wizard.
 *
 * @param {GeneralRemoteUserstorePropsInterface} props Component props.
 *
 * @return {ReactElement} General step of the remote userstore wizard.
 */
export const GeneralRemoteUserstore: FunctionComponent<GeneralRemoteUserstorePropsInterface> = (
    props: GeneralRemoteUserstorePropsInterface
): ReactElement => {
    const { [ "data-testid" ]: testId, onSubmit, triggerSubmit } = props;

    const [ secret, setSecret ] = useState("");

    const [ error, setError ] = useState<string>("");
    const [ errorMessage, setErrorMessage ] = useState<string>("");

    return (
        <Forms
            onSubmit={ (values: Map<string, FormValue>) => {
                const data: AccessTokenPostBody = {
                    domain: values.get(USERSTORE_DOMAIN).toString(),
                    token: values.get(USERSTORE_SECRET).toString()
                };
                /* createToken(data)
                    .then(() => {
                        onSubmit(data);
                        setError("");
                        setErrorMessage("");
                    })
                    .catch((error) => {
                        setError(error?.response?.data?.description ?? error?.message);
                        setErrorMessage(error?.response?.data?.message ?? "");
                    }); */
                onSubmit(data);
            } }
            submitState={ triggerSubmit }
        >
            <Grid>
                <Grid.Row>
                    <Grid.Column width={ 8 }>
                        <Field
                            type="text"
                            required={ true }
                            requiredErrorMessage="Required"
                            placeholder="Enter a userstore domain name"
                            label="Userstore domain name"
                            data-testid={ `${testId}-userstore-domain-name` }
                            name={ USERSTORE_DOMAIN }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 2 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            type="password"
                            required={ true }
                            requiredErrorMessage="Required"
                            placeholder="Enter a userstore secret"
                            label="Userstore secret"
                            data-testid={ `${testId}-userstore-secret` }
                            name={ USERSTORE_SECRET }
                            showPassword="Show secret"
                            hidePassword="Hide secret"
                            value={ secret }
                        />
                    </Grid.Column>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Button
                            type="button"
                            onClick={ () => {
                                setSecret(generate({ length: 10, numbers: true }));
                            } }
                            className="generate-password-button"
                            data-testid={ `${testId}-generate-secret` }
                        >
                            Generate Secret
                        </Button>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column>
                        { (error || errorMessage) && (
                            <Message data-testid={ `${testId}-error-message` } negative>
                                { errorMessage && <Message.Header>{ errorMessage }</Message.Header> }
                                { error }
                            </Message>
                        ) }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Forms>
    );
};

/**
 * Default proptypes of the component
 */
GeneralRemoteUserstore.defaultProps = {
    "data-testid": "remote-userstore-general-details"
};
