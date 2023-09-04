/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TextMatchTransformer } from '@lexical/markdown';
import type { Spread } from 'lexical';

import {
    type DOMConversionMap,
    type DOMConversionOutput,
    type DOMExportOutput,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type SerializedTextNode,
    $applyNodeReplacement,
    TextNode,
} from 'lexical';

export type SerializedMentionNode = Spread<
    {
        id: string;
        href: string;
    },
    SerializedTextNode
>;

function convertMentionElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const textContent = domNode.textContent;
    const href = domNode.getAttribute('href');

    if (textContent !== null && href !== null) {
        const node = $createMentionNode(href, textContent);
        return {
            node,
        };
    }

    return null;
}

const mentionStyle = 'background-color: rgba(24, 119, 232, 0.2)';
export class MentionNode extends TextNode {
    __href: string;

    static getType(): string {
        return 'mention';
    }

    getHref(): string {
        return this.__href;
    }

    getId(): string {
        return this.__href.replace("#", "")
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__href, node.__text, node.__key);
    }
    static importJSON(serializedNode: SerializedMentionNode): MentionNode {
        const node = $createMentionNode(serializedNode.text, serializedNode.href);
        node.setTextContent(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    constructor(href: string, text?: string, key?: NodeKey) {
        super(text ?? href, key);
        this.__href = href;
    }


    exportJSON(): SerializedMentionNode {
        return {
            ...super.exportJSON(),
            id: this.getId(),
            href: this.getHref(),
            type: 'mention',
            version: 1,
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.style.cssText = mentionStyle;
        dom.className = 'mention';
        dom.setAttribute('href', this.__href);
        return dom
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('a');
        element.setAttribute('href', this.__href);
        element.setAttribute('data-lexical-mention', 'true');
        element.textContent = this.__text;
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            a: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute('data-lexical-mention')) {
                    return null;
                }
                return {
                    conversion: convertMentionElement,
                    priority: 1,
                };
            },
        };
    }

    isTextEntity(): true {
        return true;
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    canInsertTextAfter(): boolean {
        return false;
    }
}

export function $createMentionNode(text: string, href: string): MentionNode {
    const mentionNode = new MentionNode(href, text);
    mentionNode.setMode('segmented').toggleDirectionless();
    return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
    node: LexicalNode | null | undefined,
): node is MentionNode {
    return node instanceof MentionNode;
}

export const CUSTOM_LINK_NODE_TRANSFORMER: TextMatchTransformer = {
    dependencies: [MentionNode],
    export: (node: LexicalNode) => {
        if (!$isMentionNode(node)) {
            return null;
        }

        const linkContent = `[${node.getTextContent()}](${node.__href})`;

        return linkContent;
    },
    importRegExp:
        /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
    regExp:
        /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
    replace: (textNode, match) => {
        const linkUrl = match[2],
            linkText = match[1];

        const linkNode = $createMentionNode(
            linkText,
            linkUrl,
        );
        textNode.replace(linkNode);
    },
    trigger: ")",
    type: "text-match",
};