import React from 'react';
import {
    Box,
    Button,
    Flex,
    Link,
    Avatar
} from '@chakra-ui/react';
import { useAuth } from '@/lib/auth';
const ProjectShell = ({ children }) => {
    const { user, signout } = useAuth();

    return (
        <Box backgroundColor="gray.100" minH='100vh'>
            <Flex backgroundColor="white" mb={16} w="full">
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    pt={4}
                    pb={4}
                    maxW="1250px"
                    margin="0 auto"
                    w="full"
                    px={8}
                >
                    <Flex>
                        <Link mr={4}>Green IT</Link>
                    </Flex>
                    <Flex justifyContent="center" alignItems="center">
                        {user && <Button variant="ghost" mr={2} onClick={() => signout()}>
                            Log Out
                        </Button>}
                        <Avatar size="sm" src={user?.photoUrl} />
                    </Flex>
                </Flex>
            </Flex>
            <Flex margin="0 auto" direction="column" maxW="1250px" px={8}>
                {children}
            </Flex>
        </Box >
    );
};

export default ProjectShell;