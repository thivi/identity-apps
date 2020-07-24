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
import { CopyInputField, EmptyPlaceholder } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, List, Segment } from "semantic-ui-react";
import { listAgents } from "../../../api";
import { EmptyPlaceholderIllustrations } from "../../../configs";
import { AccessTokenPostBody, ConnectedAgent } from "../../../models";

interface SummaryRemoteUserstorePropsInterface extends TestableComponentInterface {
    userstoreData: AccessTokenPostBody;
}

export const SummaryRemoteUserstore: FunctionComponent<SummaryRemoteUserstorePropsInterface> = (
    props: SummaryRemoteUserstorePropsInterface
): ReactElement => {
    const { userstoreData, [ "data-testid" ]: testId } = props;

    const [ connectedAgents, setConnectedAgents ] = useState<ConnectedAgent[]>([]);

    const { t } = useTranslation();

    useEffect(() => {
        listAgents(userstoreData.domain).then((response: ConnectedAgent[]) => {
            setConnectedAgents(response);
        });
    }, [ userstoreData.domain ]);

    return (
        <Grid className="wizard-summary" data-testid={ testId }>
            <Grid.Row>
                <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 16 } textAlign="center">
                    <div className="general-details">
                        <h3 data-testid={ `${ testId }-userstore-domain` }>{ userstoreData?.domain }</h3>
                    </div>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row className="summary-field" columns={ 2 }>
                <Grid.Column mobile={ 16 } tablet={ 8 } computer={ 7 } textAlign="right">
                    <div className="label">{ t("adminPortal:components.userstores.forms." +
                        "remoteUserstore.secret.label") }</div>
                </Grid.Column>
                <Grid.Column className="overflow-wrap" mobile={ 16 } tablet={ 8 } computer={ 8 } textAlign="left">
                    <div className="value">
                        <CopyInputField
                            data-testid={ `${ testId }-userstore-secret` }
                            value={ userstoreData?.token }
                            showSecretText={ t("adminPortal:components.userstores.forms." +
                                "remoteUserstore.showSecret") }
                            hideSecretText={ t("adminPortal:components.userstores.forms." +
                                "remoteUserstore.hideSecret") }
                            secret={ true }
                        />
                    </div>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={ 2 }>
                <Grid.Column mobile={ 16 } tablet={ 8 } computer={ 7 } textAlign="right">
                    <div className="label">
                        { t("adminPortal:components.userstores.remoteUserstore.connectedAgents") }
                    </div>
                </Grid.Column>
                <Grid.Column className="overflow-wrap" mobile={ 16 } tablet={ 8 } computer={ 8 } textAlign="left">
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
                            <Segment placeholder>
                                <EmptyPlaceholder
                                    subtitle={ null }
                                    title={ t("adminPortal:components.userstores.placeholders.emptyAgents.title") }
                                    image={ EmptyPlaceholderIllustrations.newList }
                                    imageSize="tiny"
                                    data-testid={ `${ testId }-empty-agent-list` }
                                />
                            </Segment>
                        ) }
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

SummaryRemoteUserstore.defaultProps = {
    "data-testid": "remote-userstore-summary"
};
