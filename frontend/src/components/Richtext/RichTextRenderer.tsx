"use client";

import {
  Anchor,
  Blockquote,
  CSSProperties,
  Code,
  Divider,
  Image,
  List,
  ListItem,
  Text,
  TextProps,
  Title,
} from "@mantine/core";
import { JSONContent } from "@tiptap/react";
import Link from "next/link";
import React, { FC, ReactNode, useMemo } from "react";

type NodeRendererProps = {
  children?: ReactNode;
  attrs?: Record<string, any>;
  text?: string;
  [key: string]: any;
};

const parseComponents: Record<string, FC<NodeRendererProps>> = {
  paragraph: ({ children, ...others }) => {
    const style: CSSProperties = {};
    if (others?.textAlign) style.textAlign = others.textAlign;

    return <Text style={style}>{children}</Text>;
  },
  heading: ({ children, ...others }) => {
    const style: CSSProperties = {};
    if (others?.textAlign) style.textAlign = others.textAlign;
    if (others?.level) style.level = others.level;
    return (
      <Title order={style?.level ?? 1} style={style}>
        {children}
      </Title>
    );
  },
  blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
  horizontalRule: () => <Divider my="sm" />,
  bulletList: ({ children }) => <List withPadding>{children}</List>,
  orderedList: ({ children }) => (
    <List type="ordered" withPadding>
      {children}
    </List>
  ),
  listItem: ({ children }) => <ListItem>{children}</ListItem>,
  image: ({ attrs }) => <Image src={attrs?.src} alt={attrs?.alt || "Image"} radius="md" />,
  codeBlock: ({ children }) => <Code>{children}</Code>, // Basic text, marks handled separately
  text: ({ text }) => <>{text}</>, // Basic text, marks handled separately
};

interface RichTextRendererProps extends TextProps {
  content?: string;
}

const RichTextRenderer = ({ content, ...props }: RichTextRendererProps) => {
  const renderMarks = (text: string, marks?: JSONContent["marks"]): ReactNode => {
    if (!marks || marks.length === 0) return text;

    return marks.reduce<ReactNode>((wrappedText, mark) => {
      const { type, attrs } = mark;

      switch (type) {
        case "bold":
          return (
            <Text span fw={700}>
              {wrappedText}
            </Text>
          );
        case "italic":
          return (
            <Text span fs="italic">
              {wrappedText}
            </Text>
          );
        case "underline":
          return (
            <Text span td="underline">
              {wrappedText}
            </Text>
          );
        case "strike":
          return (
            <Text span td="line-through">
              {wrappedText}
            </Text>
          );
        case "superscript":
          return <sup>{wrappedText}</sup>;
        case "subscript":
          return <sub>{wrappedText}</sub>;
        case "code":
          return <Code>{wrappedText}</Code>;
        case "highlight":
          return (
            <Text span bg="yellow.2">
              {wrappedText}
            </Text>
          );
        case "textStyle":
          return (
            <Text span c={attrs?.color} fw="inherit">
              {wrappedText}
            </Text>
          );
        case "link":
          return (
            <Anchor
              component={Link}
              href={attrs?.href}
              target={attrs?.target || "_self"}
              rel={attrs?.rel || "noopener noreferrer"}
            >
              {wrappedText}
            </Anchor>
          );
        default:
          return wrappedText; // Unsupported marks
      }
    }, text);
  };

  const renderNode = (node: JSONContent, index: number): ReactNode => {
    const Component = node.type ? parseComponents[node.type] : null;

    if (!Component) {
      console.warn(`Unsupported node type: ${node.type}`);
      return null;
    }
    // Recursively render child nodes
    const children = node.content?.map((childrenNode, childrenIndex) => renderNode(childrenNode, childrenIndex));

    // Handle text nodes with marks
    if (node.type === "text" && node.text) {
      return (
        <span key={`richtext-node-mark-${node.type}-${node.text}-${index}`}>{renderMarks(node.text, node.marks)}</span>
      );
    }

    return (
      <Component key={`richtext-node-${node.type}-${node.text}-${index}`} {...node.attrs}>
        {children}
      </Component>
    );
  };

  // Parse content and render
  const parsedContent = useMemo(() => {
    try {
      return content ? (JSON.parse(content) as JSONContent) : null;
    } catch (e) {
      console.error(e);
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              textAlign: "left",
            },
            content: [
              {
                type: "text",
                text: content,
              },
            ],
          },
        ],
      };
    }
  }, [content]);

  if (!parsedContent?.content) {
    return content?.toString() ?? null;
  }

  return (
    <Text span style={{ wordWrap: "break-word" }} {...props}>
      {parsedContent.content.map((node, index) => renderNode(node, index))}
    </Text>
  );
};

export default RichTextRenderer;
