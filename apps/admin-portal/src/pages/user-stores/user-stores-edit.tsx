/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { AlertLevels, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { PageLayout, ResourceTab } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Image } from "semantic-ui-react";
import { getAType, getAUserStore, retrieveRemoteUserstore } from "../../api";
import {
    EditBasicDetailsUserStore,
    EditConnectionDetails,
    EditGroupDetails,
    EditRemoteUserstoreAgents,
    EditRemoteUserstoreGeneral,
    EditUserDetails
} from "../../components";
import { DatabaseAvatarGraphic } from "../../configs";
import { history } from "../../helpers";
import { AccessTokenPostBody, CategorizedProperties, UserStore, UserstoreType } from "../../models";
import { reOrganizeProperties } from "../../utils";

/**
 * Props for the Userstores edit page.
 */
type UserStoresEditPageInterface = TestableComponentInterface;

/**
 * Route parameters interface.
 */
interface RouteParams {
    id: string;
}

/**
 * This renders the userstore edit page.
 *
 * @param {UserStoresEditPageInterface & RouteComponentProps<RouteParams>} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
const UserStoresEditPage: FunctionComponent<UserStoresEditPageInterface> = (
    props: UserStoresEditPageInterface & RouteComponentProps<RouteParams>
): ReactElement => {
    const { match, [ "data-testid" ]: testId } = props;

    const userStoreId = match.params.id;

    const [ userStore, setUserStore ] = useState<UserStore>(null);
    const [ type, setType ] = useState<UserstoreType>(null);
    const [ properties, setProperties ] = useState<CategorizedProperties>(null);
    const [ isRemote, setIsRemote ] = useState(false);
    const [ remoteUserstore, setRemoteUserstore ] = useState<AccessTokenPostBody>(null);
    const [ remoteUserstoreId, setRemoteUserstoreId ] = useState<string>("");

    const dispatch = useDispatch();

    const { t } = useTranslation();

    /**
     * Fetches the userstore by its id
     */
    const getUserStore = useCallback(
        (id?: string) => {
            if (id) {
                retrieveRemoteUserstore(id).then((response: AccessTokenPostBody) => {
                    setRemoteUserstore(response);
                }).catch(error => {
                    addAlert({
                        description:
                            error?.description ||
                            t(
                                "adminPortal:components.userstores.notifications.fetchARemoteUserstore.genericError" +
                                ".description"
                            ),
                        level: AlertLevels.ERROR,
                        message:
                            error?.message ||
                            t(
                                "adminPortal:components.userstores.notifications.fetchARemoteUserstore." +
                                "genericError.message"
                            )
                    });
                });
            } else {
                getAUserStore(userStoreId)
                    .then((response) => {
                        setUserStore(response);
                    })
                    .catch((error) => {
                        dispatch(
                            addAlert({
                                description:
                                    error?.description ||
                                    t(
                                        "adminPortal:components.userstores.notifications.fetchUserstores.genericError" +
                                        ".description"
                                    ),
                                level: AlertLevels.ERROR,
                                message:
                                    error?.message ||
                                    t(
                                        "adminPortal:components.userstores.notifications.fetchUserstores." +
                                        "genericError.message"
                                    )
                            })
                        );
                    });
            }
        },
        [ dispatch, t, userStoreId ]
    );

    useEffect(() => {
        if (match.params.id) {
            const userstoreId = match.params.id.split("-");
            if (userstoreId.shift() === "remote") {
                const id = userstoreId.join("-");
                setRemoteUserstoreId(id);
                setIsRemote(true);
                //get remote userstore
                getUserStore(id);
            } else {
                setIsRemote(false);
                getUserStore();
            }
        }
    }, [ match.params.id, getUserStore ]);

    useEffect(() => {
        if (userStore) {
            getAType(userStore?.typeId, null)
                .then((response) => {
                    setType(response);
                })
                .catch((error) => {
                    dispatch(
                        addAlert({
                            description:
                                error?.description ||
                                t(
                                    "adminPortal:components.userstores.notifications.fetchUserstoreMetadata." +
                                    "genericError.description"
                                ),
                            level: AlertLevels.ERROR,
                            message:
                                error?.message ||
                                t(
                                    "adminPortal:components.userstores.notifications.fetchUserstoreMetadata" +
                                    ".genericError.message"
                                )
                        })
                    );
                });
        }
    }, [ userStore ]);

    useEffect(() => {
        if (type) {
            setProperties(reOrganizeProperties(type.properties, userStore.properties));
        }
    }, [ type ]);

    /**
     * The tab panes
     */
    const panes = isRemote
        ? [
            {
                menuItem: t("adminPortal:components.userstores.pageLayout.edit.tabs.general"),
                render: () => (
                    <EditRemoteUserstoreGeneral
                        userstoreData={ remoteUserstore }
                        onUpdate={ () => {
                            getUserStore(remoteUserstoreId);
                        } }
                    />
                )
            },
            {
                menuItem: t("adminPortal:components.userstores.pageLayout.edit.tabs.agents"),
                render: () => (
                    <EditRemoteUserstoreAgents
                        userstoreData={ remoteUserstore }
                    />
                )
            }
        ]
        : [
            {
                menuItem: t("adminPortal:components.userstores.pageLayout.edit.tabs.general"),
                render: () => (
                    <EditBasicDetailsUserStore
                        properties={ properties?.basic }
                        userStore={ userStore }
                        update={ getUserStore }
                        id={ userStoreId }
                        data-testid={ `${ testId }-userstore-basic-details-edit` }
                    />
                )
            },
            {
                menuItem: t("adminPortal:components.userstores.pageLayout.edit.tabs.connection"),
                render: () => (
                    <EditConnectionDetails
                        update={ getUserStore }
                        type={ type }
                        id={ userStoreId }
                        properties={ properties?.connection }
                        data-testid={ `${ testId }-userstore-connection-details-edit` }
                    />
                )
            },
            {
                menuItem: t("adminPortal:components.userstores.pageLayout.edit.tabs.user"),
                render: () => (
                    <EditUserDetails
                        update={ getUserStore }
                        type={ type }
                        id={ userStoreId }
                        properties={ properties?.user }
                        data-testid={ `${ testId }-userstore-user-details-edit` }
                    />
                )
            },
            {
                menuItem: t("adminPortal:components.userstores.pageLayout.edit.tabs.group"),
                render: () => (
                    <EditGroupDetails
                        update={ getUserStore }
                        type={ type }
                        id={ userStoreId }
                        properties={ properties?.group }
                        data-testid={ `${ testId }-userstore-group-details-edit` }
                    />
                )
            }
        ];

    return (
        <PageLayout
            image={
                <Image floated="left" verticalAlign="middle" rounded centered size="tiny">
                    <DatabaseAvatarGraphic />
                </Image>
            }
            title={ isRemote ? remoteUserstore?.domain : userStore?.name }
            description={ t("adminPortal:components.userstores.pageLayout.edit.description") }
            backButton={ {
                onClick: () => {
                    history.push("/user-stores");
                },
                text: t("adminPortal:components.userstores.pageLayout.edit.back")
            } }
            titleTextAlign="left"
            bottomMargin={ false }
            data-testid={ `${ testId }-page-layout` }
        >
            <ResourceTab panes={ panes } data-testid={ `${ testId }-tabs` } />
        </PageLayout>
    );
};

/**
 * Default props for the component.
 */
UserStoresEditPage.defaultProps = {
    "data-testid": "userstores-edit"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default UserStoresEditPage;
