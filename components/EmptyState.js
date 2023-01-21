import React from 'react';
import { Heading, Flex, Text } from '@chakra-ui/react';

import AddProjectModal from '@/components/AddProjectModal';

const EmptyState = () => (
    <Flex
        width="100%"
        backgroundColor="white"
        borderRadius="8px"
        p={16}
        justify="center"
        align="center"
        direction="column"
    >
        <Heading size="lg" mb={2}>
            You have not added any projects.
        </Heading>
        <Text mb={4}>Let us get started.</Text>
        <AddProjectModal>
            Add Your First Site
        </AddProjectModal>
    </Flex>
);

export default EmptyState;

// return <Box display="flex" flexDirection="column" maxWidth="700px" width="full" margin="0 auto">
//         <Box>{project.name}</Box>
//         <Box>{project.github}</Box>
//         <Box>{project.desc}</Box>
//         <Box>{project.domain}</Box>
//         <Box>{JSON.stringify(suggestions)}</Box>
//         <Button onClick={calcPercentandTotal}>Calculate</Button>
//         {/* check if es is empty  then only show below button */}
//         <Button onClick={handleSubmission}>Submit</Button>
//     </Box >