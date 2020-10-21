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

import { AlertLevels } from "@wso2is/core/models";
import { I18n } from "@wso2is/i18n";
import { Markdown } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
    Grid,
    Icon,
    Menu,
    Segment
} from "semantic-ui-react";
import { getHelp } from "../../api";
import { addAlert } from "../../store/actions";

interface TableOfContent {
    text: string;
    slug: string;
    level: number;
}

const flatten = (text: string, child) => {
    return typeof child === "string"
        ? text + child
        : React.Children.toArray(child.props.children).reduce(flatten, text);
};

/**
 * HeadingRenderer is a custom renderer
 * It parses the heading and attaches an id to it to be used as an anchor
 */
const HeadingRenderer = (props): ReactElement => {
    const children = React.Children.toArray(props.children);
    const text = children.reduce(flatten, "");
    const slug = text.toLowerCase().replace(/\W/g, "-");

    return React.createElement("h" + props.level, { id: slug }, props.children);
};

const CodeRenderer = ({ language, value }: { language: string; value: string }): ReactElement => {
    if (language === "info") {
        const title = value?.toString().match(/^\*{1}[^*]+\*{1}\s*/)?.toString().replace(/\*/g, "");
        const content = value.replace(value?.toString().match(/^\*{1}[^*]+\*{1}\s*/)?.toString(), "");

        return (
            <Segment.Group piled className="info">
                <Segment inverted color="teal">
                    <Icon name="info circle" />
                    { title ?? "Info" }
                </Segment>
                <Segment raised padded>
                    <Markdown source={ content?.trim() } />
                </Segment>
            </Segment.Group>

        );
    }

    if (language === "tip") {
        const title = value?.toString().match(/^\*{1}[^*]+\*{1}\s*/)?.toString().replace(/\*/g, "");
        const content = value.replace(value?.toString().match(/^\*{1}[^*]+\*{1}\s*/)?.toString(), "");
        return (
            <Segment.Group piled className="tip">
                <Segment inverted color="yellow">
                    <Icon name="fire" />
                    { title ?? "Tip" }
                </Segment>
                <Segment raised padded>
                    <Markdown source={ content?.trim() } />
                </Segment>
            </Segment.Group>
        );
    }

    return <div>{ value }</div>;
};
export const Help: FunctionComponent = (): ReactElement => {
    const [ doc, setDoc ] = useState<string>("");
    const [ toc, setToc ] = useState<TableOfContent[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);

    const dispatch = useDispatch();
    const { t } = useTranslation();

    /**
     * Sanitizes the document and builds headings.
     *
     * @param {string} response - The document.
     */
    const transformMD = (response: string): void => {
        const headings: TableOfContent[] = [];

        const md = response
            .replace(/#+\s.+/g, (heading: string) => {
                const level = heading.match(/#/g)?.length ?? 0;
                const text = heading.match(/[^#\s].+/)[ 0 ];
                const slug = text.replace(/\s/g, "-").toLowerCase();
                level > 1 && headings.push({
                    level,
                    slug,
                    text
                });
                return heading;
            });

        setToc(headings);
        setDoc(md);
    };
    useEffect(() => {

        setIsLoading(true);
        getHelp(I18n.instance.language)
            .then((response: string) => {
                transformMD(response);
            })
            .catch((error) => {
                if (error?.response?.status === 404) {
                    getHelp("en-USs").then((response: string) => {
                        transformMD(response);
                    }).catch(() => {
                        dispatch(
                            addAlert({
                                description: t(
                                    "userPortal:components.help.notifications.error.description"
                                ),
                                level: AlertLevels.ERROR,
                                message: t("userPortal:components.help.notifications." +
                                    "error.message")
                            })
                        );
                    });
                }

            }).finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        !isLoading && doc
        && <Grid columns={ 2 }>
            <Grid.Column computer={ 4 } tablet={ 6 } mobile={ 16 } className="sticky scrollable">
                <Menu secondary vertical>
                    {
                        toc.map((heading: TableOfContent, index: number) => {
                            return (
                                <Menu.Item
                                    key={ index }
                                    name={ heading.slug }
                                    className={ `level${ heading.level }` }
                                    onClick={ () => {
                                        location.hash = heading.slug;
                                    } }
                                >
                                    { heading.text }
                                </Menu.Item>
                            );
                        })
                    }
                </Menu>
            </Grid.Column>
            <Grid.Column computer={ 4 } tablet={ 6 } mobile={ 16 }>

            </Grid.Column>
            <Grid.Column computer={ 12 } tablet={ 10 } mobile={ 16 }>
                <Segment padded>
                    <Markdown
                        source={ doc }
                        renderers={ {
                            code: CodeRenderer,
                            heading: HeadingRenderer
                        } }
                    />
                </Segment>
            </Grid.Column>
        </Grid>
    );
};
