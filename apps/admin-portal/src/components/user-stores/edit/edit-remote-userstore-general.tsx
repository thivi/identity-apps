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

import { AlertLevels, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { Field, FormValue, Forms } from "@wso2is/forms";
import {
    ConfirmationModal,
    CopyInputField,
    DangerZone,
    DangerZoneGroup,
    LinkButton,
    PrimaryButton
} from "@wso2is/react-components";
import { generate } from "generate-password";
import React, { FunctionComponent, ReactElement, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Button, Divider, Form, Grid, Segment } from "semantic-ui-react";
import { deleteAgent, regenerateToken } from "../../../api";
import { AccessTokenPostBody } from "../../../models";

/**
 * New secret.
 *
 * @constant
 *
 * @type {string}
 */
const NEW_SECRET = "newSecret";

interface EditRemoteUserstoreGeneralPropsInterface extends TestableComponentInterface {
    userstoreData: AccessTokenPostBody;
    onUpdate: () => void;
}

export const EditRemoteUserstoreGeneral: FunctionComponent<EditRemoteUserstoreGeneralPropsInterface> = (
    props: EditRemoteUserstoreGeneralPropsInterface
): ReactElement => {
    const { userstoreData, [ "data-testid" ]: testId, onUpdate } = props;

    const [ changeSecret, setChangeSecret ] = useState(false);
    const [ secret, setSecret ] = useState("");
    const [ confirmDelete, setConfirmDelete ] = useState(false);

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const deleteConfirmation = (): ReactElement => (
        <ConfirmationModal
            onClose={ (): void => setConfirmDelete(false) }
            type="warning"
            open={ confirmDelete }
            assertion={ userstoreData?.domain }
            assertionHint={
                <p>
                    <Trans i18nKey="adminPortal:components.userstores.confirmation.hint">
                        Please type
                        <strong data-testid={ `${ testId }-delete-confirmation-modal-assertion` }>
                            { { name: userstoreData?.domain } }
                        </strong>{ " " }
                        to confirm.
                    </Trans>
                </p>
            }
            assertionType="input"
            primaryAction={ t("adminPortal:components.userstores.confirmation.confirm") }
            secondaryAction={ t("common:cancel") }
            onSecondaryActionClick={ (): void => setConfirmDelete(false) }
            onPrimaryActionClick={ (): void => {
                deleteAgent(userstoreData?.domain)
                    .then(() => {
                        dispatch(
                            addAlert({
                                description: t(
                                    "adminPortal:components.userstores.notifications." +
                                    "deleteRemoteUserstore.success.description"
                                ),
                                level: AlertLevels.SUCCESS,
                                message: t(
                                    "adminPortal:components.userstores.notifications." +
                                    "deleteRemoteUserstore.success.message"
                                )
                            })
                        );
                        /*
                        dispatch(
                            addAlert({
                                description: t(
                                    "adminPortal:components.userstores.notifications." + "delay.description"
                                ),
                                level: AlertLevels.WARNING,
                                message: t("adminPortal:components.userstores.notifications." + "delay.message")
                            })
                        ); */
                        onUpdate();
                    })
                    .catch((error) => {
                        dispatch(
                            addAlert({
                                description:
                                    error?.description ??
                                    t(
                                        "adminPortal:components.userstores.notifications." +
                                        "deleteRemoteUserstore.genericError.description"
                                    ),
                                level: AlertLevels.ERROR,
                                message:
                                    error?.message ??
                                    t(
                                        "adminPortal:components.userstores.notifications." +
                                        "deleteRemoteUserstore.genericError.message"
                                    )
                            })
                        );
                    })
                    .finally(() => {
                        setConfirmDelete(false);
                    });
            } }
            data-testid={ `${ testId }-delete-confirmation-modal` }
        >
            <ConfirmationModal.Header data-testid={ `${ testId }-delete-confirmation-modal-header` }>
                { t("adminPortal:components.userstores.confirmation.header") }
            </ConfirmationModal.Header>
            <ConfirmationModal.Message attached warning data-testid={ `${ testId }-delete-confirmation-modal-message` }>
                { t("adminPortal:components.userstores.confirmation.message") }
            </ConfirmationModal.Message>
            <ConfirmationModal.Content data-testid={ `${ testId }-delete-confirmation-modal-content` }>
                { t("adminPortal:components.userstores.confirmation.content") }
            </ConfirmationModal.Content>
        </ConfirmationModal>
    );

    return (
        <>
            { confirmDelete && deleteConfirmation() }
            <Grid>
                <Grid.Row>
                    <Grid.Column mobile={ 16 } computer={ 8 }>
                        <Form>
                            <Form.Input
                                type="text"
                                value={ userstoreData?.domain }
                                label="Userstore Domain"
                                data-testid={ `${ testId }-userstore-domain` }
                                disabled
                            />
                        </Form>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column mobile={ 16 } computer={ 8 }>
                        <Grid>
                            { changeSecret ? (
                                <Grid.Row>
                                    <Grid.Column mobile={ 16 } computer={ 16 }>
                                        <Segment secondary>
                                            <Forms
                                                onSubmit={ (values: Map<string, FormValue>) => {
                                                    regenerateToken({
                                                        domain: userstoreData.domain,
                                                        newToken: values.get(NEW_SECRET).toString(),
                                                        oldToken: userstoreData.token
                                                    })
                                                        .then(() => {
                                                            dispatch(
                                                                addAlert({
                                                                    description: t(
                                                                        "adminPortal:components.userstores." +
                                                                        "notifications.changeSecret.success.description"
                                                                    ),
                                                                    level: AlertLevels.SUCCESS,
                                                                    message: t(
                                                                        "adminPortal:components.userstores." +
                                                                        "notifications.changeSecret.success.message"
                                                                    )
                                                                })
                                                            );

                                                            onUpdate();
                                                        })
                                                        .catch((error) => {
                                                            dispatch(
                                                                addAlert({
                                                                    description:
                                                                        error?.response?.description ??
                                                                        t(
                                                                            "adminPortal:components.userstores" +
                                                                            ".notifications.changeSecret." +
                                                                            "genericError.description"
                                                                        ),
                                                                    level: AlertLevels.ERROR,
                                                                    message:
                                                                        error?.response?.message ??
                                                                        t(
                                                                            "adminPortal:components.userstores" +
                                                                            ".notifications.changeSecret." +
                                                                            "genericError.message"
                                                                        )
                                                                })
                                                            );
                                                        });
                                                } }
                                            >
                                                <Field
                                                    type="password"
                                                    label={ t("adminPortal:components.userstores.forms." +
                                                        "remoteUserstore.newSecret.label") }
                                                    placeholder={ t("adminPortal:components.userstores.forms." +
                                                        "remoteUserstore.newSecret.placeholder") }
                                                    name={ NEW_SECRET }
                                                    data-testid={ `${ testId }-userstore-new-secret` }
                                                    requiredErrorMessage={ t("adminPortal:components.userstores" +
                                                        ".forms.remoteUserstore.newSecret.requiredErrorMessage") }
                                                    required={ true }
                                                    showPassword={ t("adminPortal:components.userstores.forms." +
                                                        "remoteUserstore.showSecret") }
                                                    hidePassword={ t("adminPortal:components.userstores.forms." +
                                                        "remoteUserstore.hideSecret") }
                                                    value={ secret }
                                                />
                                                <Grid>
                                                    <Grid.Row>
                                                        <Grid.Column textAlign="right">
                                                            <Button
                                                                onClick={ () => {
                                                                    setSecret(generate({ length: 10, numbers: true }));
                                                                } }
                                                            >
                                                                { t("adminPortal:components.userstores.forms." +
                                                                    "remoteUserstore.generateSecret") }
                                                            </Button>
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                                <Divider hidden />
                                                <Form.Group grouped>
                                                    <PrimaryButton type="submit">{ t("adminPortal:components." +
                                                        "userstores.forms.remoteUserstore.changeSecret") }
                                                    </PrimaryButton>
                                                    <LinkButton
                                                        type="button"
                                                        onClick={ () => {
                                                            setChangeSecret(false);
                                                        } }
                                                    >
                                                        { t("common:cancel") }
                                                    </LinkButton>
                                                </Form.Group>
                                            </Forms>
                                        </Segment>
                                    </Grid.Column>
                                </Grid.Row>
                            ) : (
                                    <Grid.Row columns={ 2 }>
                                        <Grid.Column width={ 10 }>
                                            <Form>
                                                <Form.Field>
                                                    <label>{ t("adminPortal:components.userstores.forms." +
                                                        "remoteUserstore.secret.label") }</label>
                                                    <CopyInputField
                                                        value={ userstoreData?.token }
                                                        secret={ true }
                                                        showSecretText={ t("adminPortal:components.userstores.forms." +
                                                            "remoteUserstore.showSecret") }
                                                        hideSecretText={ t("adminPortal:components.userstores.forms." +
                                                            "remoteUserstore.hideSecret") }
                                                        data-testid={ `${ testId }-userstore-token` }
                                                    />
                                                </Form.Field>
                                            </Form>
                                        </Grid.Column>
                                        <Grid.Column verticalAlign="bottom" width={ 6 } textAlign="right">
                                            <LinkButton
                                                onClick={ () => {
                                                    setChangeSecret(true);
                                                } }
                                            >
                                                { t("adminPortal:components.userstores.forms." +
                                                    "remoteUserstore.changeSecret") }
                                            </LinkButton>
                                        </Grid.Column>
                                    </Grid.Row>
                                ) }
                        </Grid>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Divider hidden />
            <Divider hidden />

            <Grid columns={ 1 }>
                <Grid.Column width={ 16 }>
                    <DangerZoneGroup
                        sectionHeader={ t("common:dangerZone") }
                        data-testid={ `${ testId }-danger-zone-group` }
                    >
                        <DangerZone
                            actionTitle={ t("adminPortal:components.userstores.dangerZone.actionTitle") }
                            header={ t("adminPortal:components.userstores.dangerZone.header") }
                            subheader={ t("adminPortal:components.userstores.dangerZone.subheader") }
                            onActionClick={ () => setConfirmDelete(true) }
                            data-testid={ `${ testId }-delete-danger-zone` }
                        />
                    </DangerZoneGroup>
                </Grid.Column>
            </Grid>
        </>
    );
};

EditRemoteUserstoreGeneral.defaultProps = {
    "data-testid": "edit-remote-userstore-general"
};
