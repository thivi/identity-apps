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

import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Grid, Header, Popup } from "semantic-ui-react";
import {
    fetchUserSessions,
    getMetaData,
    getSecurityQs
}from "../../../api";
import { AccountStatusShields } from "../../../configs";
import { BasicProfileInterface, ProfileCompletionStatus,  UserSession, UserSessions } from "../../../models";
import { AppState } from "../../../store";
import { extractEmailAddress } from "../../../utils";
import { ThemeIcon } from "../../shared";

interface SecurityStatus {
    type: string;
    status: boolean;
    label: string;
}

/**
 * Account status widget.
 *
 * @return {JSX.Element}
 */
export const AccountStatusWidget: FunctionComponent<{}> = (): JSX.Element => {
    const { t } = useTranslation();

    const profileInfo: BasicProfileInterface = useSelector(
        (state: AppState) => state.authenticationInformation.profileInfo);
    const [ isSecurityQuestionsComplete, setIsSecurityQuestionsComplete ] = useState<boolean>(false);
    const [ isEmailRecoveryComplete, setIsEmailRecoveryComplete ] = useState<boolean>(false);
    const [ isAuthenticationSMSComplete, setIsAuthenticationSMSComplete ] = useState<boolean>(false);
    const [ isFIDOCompleted, setIsFIDOCompleted ] = useState<boolean>(false);
    const [ isMFACompleted, setIsMFACompleted ] = useState<boolean>(false);
    const [ status, setStatus ] = useState<ProfileCompletionStatus>(ProfileCompletionStatus.ERROR);
    const [ isNoOldSession, setIsNoOldSession ] = useState<boolean>(false);

    useEffect(() => {

        extractEmailAddress(profileInfo)?.email && setIsEmailRecoveryComplete(true);

        profileInfo.phoneNumbers.map((mobileNo) => {
            mobileNo?.value && setIsAuthenticationSMSComplete(true);
        });

        getSecurityQs().then((response) => {
            const questions = response[ 0 ];
            const answers = response[ 1 ];

            setIsSecurityQuestionsComplete(questions.length === answers.length);
        }).catch(() => {
            setIsSecurityQuestionsComplete(false);
        });

        getMetaData().then((response) => {
            response?.data?.length > 0 && setIsFIDOCompleted(true);
        }).catch(() => {
            setIsFIDOCompleted(false);
        });

        fetchUserSessions().then((response: UserSessions) => {
            const sessions: UserSession[] = response?.sessions;

            const safe: boolean = true;

            for (const session of sessions) {
                const daysSinceLAstLogin = Math.ceil(
                    Math.abs(
                        (new Date(session.lastAccessTime).getTime() - new Date().getTime())
                    ) / (1000 * 60 * 60 * 24)
                );

                if (daysSinceLAstLogin > 30) {
                    setIsNoOldSession(false);
                    break;
                }
            }

            setIsNoOldSession(safe);
        }).catch(() => {
            setIsNoOldSession(false);
        });

    }, [ profileInfo ]);

    useEffect(() => {
        setIsMFACompleted(isAuthenticationSMSComplete || isFIDOCompleted ? true : false);
    }, [ isAuthenticationSMSComplete, isFIDOCompleted ]);

    useEffect(() => {
        const completed: boolean[] = [];
        isSecurityQuestionsComplete && completed.push(true);
        isMFACompleted && completed.push(true);
        isEmailRecoveryComplete && completed.push(true);
        isNoOldSession && completed.push(true);

        if (completed.length === 4) {
            setStatus(ProfileCompletionStatus.SUCCESS);
        } else if (completed.length > 2) {
            setStatus(ProfileCompletionStatus.WARNING);
        } else {
            setStatus(ProfileCompletionStatus.ERROR);
        }
    }, [ isSecurityQuestionsComplete, isMFACompleted, isEmailRecoveryComplete, isNoOldSession ]);

    /**
     * Resolved the type of account status shield based on the completion status.
     *
     * @return {any}
     */
    const resolveStatusShield = () => {
        if (status === ProfileCompletionStatus.SUCCESS) {
            return AccountStatusShields.good;
        } else if (status === ProfileCompletionStatus.ERROR) {
            return AccountStatusShields.danger;
        } else if (status === ProfileCompletionStatus.WARNING) {
            return AccountStatusShields.warning;
        }

        return AccountStatusShields.good;
    };

    const resolvePopupContent = (type: string, status: boolean): string => {
        switch (type) {
            case "email":
                return status
                    ? "You have a recovery email. Well done!"
                    : "You have not set a recovery email. Go to the Security page to set one.";
            case "securityQuestions":
                return status
                    ? "You have security questions configured. " +
                    "You can use them to recover your account in case you forget your password."
                    : "You have not configured any security questions. Configure them on the Security page.";
            case "session":
                return status
                    ? "There are no sessions that you haven't accessed in a month. Great going!"
                    : "You have user sessions that haven't been accessed during the last one month." +
                    " Terminate those sessions to avoid security issues.";
            case "mfa":
                return status
                    ? "You have multi-factor authentication configured." +
                    " This adds an extra layer of security to your account."
                    : "You haven not configured multi-factor authentication. " +
                    "Configure a multi-factor authentication option on the Security page. ";
            default:
                return "";
        }
    };

    /**
     * Generates the profile completion pre=ogress bar and steps.
     * @return {JSX.Element}
     */
    const generateCompletionProgress = (): ReactElement => {
        const progress: SecurityStatus[] = [
            {
                label: "Recovery email",
                status: isEmailRecoveryComplete,
                type: "email"
            },
            {
                label: "Security Questions",
                status: isSecurityQuestionsComplete,
                type: "securityQuestions"
            },
            {
                label: "No old user sessions",
                status: isNoOldSession,
                type: "session"
            },
            {
                label: "Multi-factor Authentication",
                status: isMFACompleted,
                type: "mfa"
            }
        ];

        progress.sort((a: SecurityStatus, b: SecurityStatus) => {
            return a.status > b.status ? -1 : 1;
        });

        return (
            <div>
                <ul className="horizontal-step-progress">
                    {
                        progress.map((item: SecurityStatus, index: number) => {
                            return (
                                <li
                                    className={ item.status ? "success" : "error" }
                                    key={ index }
                                >
                                    <Popup
                                        content={ resolvePopupContent(item.type, item.status) }
                                        trigger={ <div>{ item.label }</div> }
                                        inverted
                                    />
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    };

    return (
        <div className="widget account-status">
            <Grid>
                <Grid.Row>
                    <Grid.Column largeScreen={ 4 } computer={ 3 } tablet={ 3 } mobile={ 16 }>
                        <div className="status-shield-container">
                            <ThemeIcon icon={ resolveStatusShield() } size="tiny" transparent />
                        </div>
                    </Grid.Column>
                    <Grid.Column largeScreen={ 12 } computer={ 13 } tablet={ 13 } mobile={ 16 } verticalAlign="middle">
                        <div className="description">
                            <Header className="status-header" as="h3">
                                {
                                    status === ProfileCompletionStatus.SUCCESS
                                        ? "Your account is secure"
                                        : status === ProfileCompletionStatus.WARNING
                                            ? "Your account is not secure"
                                            : "You account is at risk"
                                }
                            </Header>
                        </div>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        {
                            generateCompletionProgress()
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
};
