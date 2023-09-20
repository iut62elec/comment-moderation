import React from "react";
import MyIcon from "./MyIcon";
import { Flex, Image, Text } from "@aws-amplify/ui-react";

export default function CommentCard({ user, timestamp, comment, isPublished }) {
  return (
    <Flex
      gap="16px"
      direction="column"
      width="unset"
      height="unset"
      justifyContent="flex-start"
      alignItems="flex-start"
      position="relative"
      padding="16px 16px 16px 16px"
      backgroundColor="rgba(255,255,255,1)"
    >
      <Flex
        gap="16px"
        direction="row"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding="0px"
      >
        {/* User Image - Placeholder */}
        <Image
          width="80px"
          height="80px"
          display="block"
          gap="unset"
          alignItems="unset"
          justifyContent="unset"
          borderRadius="64px"
          objectFit="cover"
        ></Image>

        <Flex
          gap="8px"
          direction="column"
          width="unset"
          height="unset"
          justifyContent="flex-start"
          alignItems="flex-start"
          grow="1"
          padding="0px"
        >
          <Flex
            gap="16px"
            direction="row"
            width="unset"
            height="unset"
            justifyContent="flex-start"
            alignItems="flex-start"
            padding="0px"
          >
            <Text
              fontFamily="Inter"
              fontSize="16px"
              fontWeight="700"
              color="rgba(13,26,38,1)"
              lineHeight="24px"
              textAlign="left"
              padding="0px"
            >
              {user}
            </Text>
          </Flex>

          <Text
            fontFamily="Inter"
            fontSize="16px"
            fontWeight="400"
            color="rgba(13,26,38,1)"
            lineHeight="24px"
            textAlign="left"
            padding="0px"
          >
            {comment}
          </Text>
        </Flex>
      </Flex>

      <Flex
        gap="80px"
        direction="row"
        width="unset"
        height="unset"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding="0px"
      >
        {/* Add any additional content here like Like/Share icons */}
      </Flex>
    </Flex>
  );
}
