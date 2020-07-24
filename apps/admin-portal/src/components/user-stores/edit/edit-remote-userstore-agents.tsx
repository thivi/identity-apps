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
import { EmptyPlaceholder } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Grid, Icon, List, Message, Segment } from "semantic-ui-react";
import { listAgents, retrieveFilePath } from "../../../api";
import { EmptyPlaceholderIllustrations } from "../../../configs";
import { AccessTokenPostBody, ConnectedAgent } from "../../../models";

interface EditRemoteUserstoreAgentsPropsInterface extends TestableComponentInterface {
    userstoreData: AccessTokenPostBody;
}

export const EditRemoteUserstoreAgents: FunctionComponent<EditRemoteUserstoreAgentsPropsInterface> = (
    props: EditRemoteUserstoreAgentsPropsInterface
): ReactElement => {
    const [ filePath, setFilePath ] = useState("");
    const { userstoreData, [ "data-testid" ]: testId } = props;
    const [ connectedAgents, setConnectedAgents ] = useState<ConnectedAgent[]>([]);
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ errorDescription, setErrorDescription ] = useState("");

    const { t } = useTranslation();

    /**
     * Fetches the list of connected agents.
     */
    const getListOfConnectedAgents = useCallback((): void => {
        listAgents(userstoreData.domain)
            .then((response: ConnectedAgent[]) => {
                setConnectedAgents(response);
                setErrorDescription("");
                setErrorMessage("");
            })
            .catch((error) => {
                setErrorMessage(error?.response?.message
                    ?? t("adminPortal:components.userstores.notifications.fetchAgents.genericError" +
                        ".message"));
                setErrorDescription(error?.response?.description
                    ?? error?.message
                    ?? t("adminPortal:components.userstores.notifications.fetchAgents.genericError" +
                        ".description"));
            });
    }, [ userstoreData, t ]);

    useEffect(() => {
        retrieveFilePath().then((response) => {
            setFilePath(response?.location);
        });

        getListOfConnectedAgents();
    }, [ getListOfConnectedAgents ]);

    return (
        <Grid>
            <Grid.Row columns={ 1 }>
                <Grid.Column mobile={ 16 } computer={ 8 }>
                    <Message info>
                        { t("adminPortal:components.userstores.remoteUserstore.downloadAgentInstruction") }
                    </Message>
                </Grid.Column>
            </Grid.Row>
            <Divider hidden />
            <Grid.Row columns={ 1 }>
                <Grid.Column textAlign="center" mobile={ 16 } computer={ 8 }>
                    <Button size="large" as="a" href={ filePath } download="wso2agent.zip">
                        <Icon name="download" />
                        <span>{ t("adminPortal:components.userstores.remoteUserstore.downloadAgentButton",
                            { fileName: "wso2agent.zip" }) }</span>
                    </Button>
                </Grid.Column>
            </Grid.Row>

            <Divider hidden />

            <Grid.Row columns={ 1 }>
                <Grid.Column mobile={ 16 } computer={ 8 }>
                    <h4>{ t("adminPortal:components.userstores.remoteUserstore.connectedAgents") }</h4>
                    <Segment>
                        { connectedAgents.length > 0 ? (
                            <List data-testid={ `${ testId }-agent-list` }>
                                { connectedAgents.map((agent: ConnectedAgent, index: number) => {
                                    return (
                                        <List.Item key={ index }>
                                            <List.Icon name="circle" color={ agent.status === "C" ? "green" : "red" } />
                                            <List.Content>
                                                <List.Header>{ agent.node }</List.Header>
                                            </List.Content>
                                        </List.Item>
                                    );
                                }) }
                            </List>
                        ) : (
                                <EmptyPlaceholder
                                    subtitle={ [ t("adminPortal:components.userstores.placeholders" +
                                        + ".emptyAgents.subtitles") ] }
                                    title={ t("adminPortal:components.userstores.placeholders.emptyAgents.title") }
                                    image={ EmptyPlaceholderIllustrations.newList }
                                    imageSize="tiny"
                                    data-testid={ `${ testId }-empty-agent-list` }
                                />
                            ) }
                    </Segment>
                    { (errorMessage || errorDescription) && (
                        <Message negative>
                            { errorMessage && <Message.Header>{ errorMessage }</Message.Header> }
                            <Message.Content>{ errorDescription }</Message.Content>
                        </Message>
                    ) }
                    <Button onClick={ getListOfConnectedAgents } data-testid={ `${ testId }-refresh-list` }>
                        <Icon name="refresh" />
                        { t("adminPortal:components.userstores.remoteUserstore.refreshList") }
                    </Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

EditRemoteUserstoreAgents.defaultProps = {
    "data-testid": "edit-remote-userstore-agents"
};
