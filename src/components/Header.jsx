import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Image, Heading, LinkBox, LinkOverlay, Text, Spacer } from "@chakra-ui/react";
import { useAuth } from "../hooks/auth";
import { supabase } from "../main";

function Header() {
  const { session } = useAuth();

  return (
    <Flex direction="column" align="start">
      <Flex direction="row" width="full" align="center">
        <LinkBox>
          <LinkOverlay as={Link} to="/">
            <Image src="/ec_logo.png" alt="EC Logo" htmlWidth="100px" htmlHeight="100px" mb={4} />
          </LinkOverlay>
        </LinkBox>
        <Spacer />
        {session && (
          <Text
            mb={4}
            fontFamily="Space Grotesk, sans-serif"
            color="rgb(16, 56, 48)"
            onClick={async () => {
              await supabase.auth.signOut();
            }}
            cursor="pointer"
          >
            Sign Out
          </Text>
        )}
      </Flex>

      <Heading mb={4} fontFamily="Space Grotesk, sans-serif" color="rgb(16, 56, 48)">
        EC Install
      </Heading>
    </Flex>
  );
}

export default Header;
