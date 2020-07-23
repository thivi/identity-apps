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
import { CopyInputField, EmptyPlaceholder, Hint } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { Button, Divider, Grid, Icon, List, Message, Segment } from "semantic-ui-react";
import { listAgents, retrieveFilePath } from "../../../api";
import { EmptyPlaceholderIllustrations } from "../../../configs";
import { AccessTokenPostBody, ConnectedAgent } from "../../../models";

interface AgentRemoteUserstorePropsInterface extends TestableComponentInterface {
    userstoreData: AccessTokenPostBody;
}

export const AgentRemoteUserstore: FunctionComponent<AgentRemoteUserstorePropsInterface> = (
    props: AgentRemoteUserstorePropsInterface
): ReactElement => {
    const [ filePath, setFilePath ] = useState("");
    const { userstoreData, [ "data-testid" ]: testId } = props;
    const [ connectedAgents, setConnectedAgents ] = useState<ConnectedAgent[]>([]);
    const [ errorMessage, setErrorMessage ] = useState("");
    const [ errorDescription, setErrorDescription ] = useState("");

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
                setErrorMessage(error?.response?.message);
                setErrorDescription(error?.response?.description ?? error?.message);
            });
    }, [ userstoreData ]);

    useEffect(() => {
        retrieveFilePath().then((response) => {
            setFilePath(response?.location);
        });

        getListOfConnectedAgents();
    }, [ getListOfConnectedAgents ]);

    return (
        <Grid>
            <Grid.Row columns={ 1 }>
                <Grid.Column>
                    <Message info>
                        Download the onprem userstore agent and run it. Once the agent successfully establishes a
                        connection with our servers, you will be able to find it in the list below.
                    </Message>
                </Grid.Column>
            </Grid.Row>
            <Divider hidden />
            <Grid.Row columns={ 1 }>
                <Grid.Column textAlign="center">
                    <Button size="large" as="a" href={ filePath } download="wso2agent.zip">
                        <Icon name="download" />
                        <span>Download wso2agent.zip</span>
                    </Button>
                </Grid.Column>
            </Grid.Row>
            <Divider hidden />
            <Grid.Row>
                <Grid.Column width={ 8 }>
                    <CopyInputField
                        data-testid={ `${testId}-userstore-secret` }
                        value={ userstoreData?.token }
                        showSecretText="Show secret"
                        hideSecretText="Hide secret"
                        secret={ true }
                    />
                    <Hint>Copy the userstore secret and provide it to the agent during startup.</Hint>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={ 1 }>
                <Grid.Column>
                    <h4>Connected Agents</h4>
                    <Segment>
                        { connectedAgents.length > 0 ? (
                            <List data-testid={ `${testId}-agent-list` }>
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
                                    subtitle={ [ "Download the agent and run it to connect to our servers." ] }
                                    title="No agent is connected"
                                    image={ EmptyPlaceholderIllustrations.newList }
                                    imageSize="tiny"
                                    data-testid={ `${testId}-empty-agent-list` }
                                />
                            ) }
                    </Segment>
                    { (errorMessage || errorDescription) && (
                        <Message negative>
                            { errorMessage && <Message.Header>{ errorMessage }</Message.Header> }
                            <Message.Content>{ errorDescription }</Message.Content>
                        </Message>
                    ) }
                    <Button onClick={ getListOfConnectedAgents } data-testid={ `${testId}-refresh-list` }>
                        <Icon name="refresh" />
                        Refresh list
                    </Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

/**
 * The default props of the component
 */
AgentRemoteUserstore.defaultProps = {
    "data-testid": "remote-userstore-agent"
};
