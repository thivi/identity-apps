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

import { I18n, LanguageChangeException, SupportedLanguagesMeta } from "@wso2is/i18n";
import { Footer, ThemeContext } from "@wso2is/react-components";
import React, { ReactElement, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { AppConstants } from "../../constants";
import { ConfigReducerStateInterface } from "../../models";
import { AppState } from "../../store";

/**
 * Footer component prop types.
 */
interface AppFooterProps {
    fluid?: boolean;
}

/**
 * Footer component.
 *
 * @param {AppFooterProps} props - Props supplied to the footer component.
 * @return {ReactElement}
 */
export const AppFooter: React.FunctionComponent<AppFooterProps> = (): ReactElement => {

    const { t } = useTranslation();

    const { state } = useContext(ThemeContext);
    const supportedI18nLanguages: SupportedLanguagesMeta = useSelector(
        (state: AppState) => state.global.supportedI18nLanguages);
    const config: ConfigReducerStateInterface = useSelector((state: AppState) => state.config);

    /**
     * Handles language switch action.
     * @param {string} language - Selected language.
     */
    const handleLanguageSwitch = (language: string): void => {
        I18n.instance.changeLanguage(language)
            .catch((error) => {
                throw new LanguageChangeException(language, error);
            });
    };

    return (
        <Footer
            showLanguageSwitcher
            currentLanguage={ I18n.instance?.language }
            supportedLanguages={ supportedI18nLanguages }
            onLanguageChange={ handleLanguageSwitch }
            copyright={ state.copyrightText && state.copyrightText !== "" ?
                state.copyrightText
                :
                config.ui.copyrightText
                    ? config.ui.copyrightText
                    : null
            }
            fixed="bottom"
            links={ [
                {
                    name: t("common:privacy"),
                    to: AppConstants.getPaths().get("PRIVACY")
                },
                {
                    name: "Help",
                    to: AppConstants.getPaths().get("HELP")
                }
            ] }
        />
    );
};

/**
 * Default proptypes for the footer component.
 */
AppFooter.defaultProps = {
    fluid: true
};
