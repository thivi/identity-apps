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

import { TestableComponentInterface } from "@wso2is/core/models";
import React, { FunctionComponent, ReactElement, useEffect, useRef, useState } from "react";
import { Button, Input, Popup } from "semantic-ui-react";

/**
 * Copy to clipboard input field props.
 */
export interface CopyInputFieldPropsInterface extends TestableComponentInterface {
    /**
     * Input value.
     */
    value: string;
    /**
     * Additional CSS classes.
     */
    className?: string;
    /**
     * Specifies if the content should be hidden or not
     */
    secret?: boolean;
    /**
     * Hide secret text
     */
    hideSecretText?: string;
    /**
     * Show secret text
     */
    showSecretText?: string;
    /**
     * Copy to clipboard text
     */
    copyToClipBoardText?: string;
    /**
     * Copied text
     */
    copiedText?: string;
}

/**
 * Copy to clipboard input field component.
 *
 * @param {CopyInputFieldPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const CopyInputField: FunctionComponent<CopyInputFieldPropsInterface> = (
    props: CopyInputFieldPropsInterface
): ReactElement => {
    const {
        value,
        className,
        secret,
        copiedText,
        copyToClipBoardText,
        showSecretText,
        hideSecretText,
        [ "data-testid" ]: testId
    } = props;

    const claimURIText = useRef<Input>(null);
    const copyButton = useRef(null);

    const [ copied, setCopied ] = useState(false);
    const [ show, setShow ] = useState(false);
    const [ copy, setCopy ] = useState(false);

    useEffect(() => {
        if (copied) {
            copyButton.current.focus();
        }
    }, [ copied ]);

    useEffect(() => {
        if (copy && show) {
            claimURIText.current?.select();
            setCopied(true);
            document.execCommand("copy");
            setShow(false);
            setCopy(false);
            copyButton.current.ref.current.blur();
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        }
    }, [ copy, show ]);

    return (
        <Input
            ref={ claimURIText }
            value={ value }
            labelPosition="right"
            readOnly
            action
            fluid
            className={ className }
            data-testid={ `${testId}-wrapper` }
            type={ secret ? (show ? "text" : "password") : "text" }
        >
            <input data-testid={ testId } />
            { secret && (
                <Popup
                    trigger={
                        <Button
                            icon={ show ? "eye slash" : "eye" }
                            type="button"
                            onClick={ () => {
                                setShow(!show);
                            } }
                        />
                    }
                    position="top center"
                    content={ show ? hideSecretText : showSecretText }
                    inverted
                />
            ) }
            <Popup
                trigger={
                    <Button
                        icon="copy"
                        type="button"
                        onMouseEnter={ () => {
                            setCopied(false);
                        } }
                        ref={ copyButton as React.RefObject<Button> }
                        onClick={ () => {
                            if (show) {
                                claimURIText.current?.select();
                                setCopied(true);
                                document.execCommand("copy");
                                copyButton.current.ref.current.blur();
                                if (window.getSelection) {
                                    window.getSelection().removeAllRanges();
                                }
                            } else {
                                setShow(true);
                                setCopy(true);
                            }
                        } }
                    />
                }
                openOnTriggerFocus
                closeOnTriggerBlur
                position="top center"
                content={ copied ? copiedText : copyToClipBoardText }
                inverted
            />
        </Input>
    );
};

/**
 * Default proptypes for the copy input component.
 */
CopyInputField.defaultProps = {
    copiedText: "Copied",
    copyToClipBoardText: "Copy to clipboard",
    "data-testid": "copy-input"
};
