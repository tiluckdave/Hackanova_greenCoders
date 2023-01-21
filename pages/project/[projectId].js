import {
    Box, Heading, Button, Tag, Link, Stack, StackDivider, Text, Card, CardHeader, CardBody, CardFooter, Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    StatGroup,
    SimpleGrid
} from "@chakra-ui/react";
import { Engine } from 'json-rules-engine';
import { getAllProjects, getProjectById } from "@/lib/db-admin";
import { useEffect, useState } from "react";

import Energy from '../rules/Energy.json'
import Time from '../rules/Time.json'
import Memory from '../rules/Memory.json'
import Suggestion from '../rules/Suggestion.json'
import { updateProjectByGithub } from "@/lib/db";
import { set } from "date-fns";
import ProjectShell from "@/components/ProjectShell";

export async function getStaticProps(context) {
    const projectId = context.params.projectId;
    const project = await getProjectById(projectId);
    return {
        props: {
            project: project,
        },
    }
}

export async function getStaticPaths() {
    const { projects } = await getAllProjects();
    const paths = projects.map((project) => ({
        params: {
            projectId: project.id.toString()
        }
    }))
    return {
        paths,
        fallback: false,
    }
}

const AnalysisPage = ({ project }) => {
    const [ suggestions, setSuggestions ] = useState({})
    const [ es, setEs ] = useState({})
    const [ ts, setTs ] = useState({})
    const [ ms, setMs ] = useState({})

    let e = {}
    let t = {}
    let m = {}
    let cf
    let cfs

    const processSuggestionEnergy = (inputs, decisions) => {
        const engine = new Engine(decisions);

        engine.run(inputs)
            .then(results => {
                if (results.events[ 0 ] != undefined) {
                    setEs(prevState => ({
                        ...prevState,
                        [ inputs.language ]: parseFloat(results.events[ 0 ][ 'type' ])
                    }))
                }
            })
    };
    const processSuggestionTime = (inputs, decisions) => {
        const engine = new Engine(decisions);

        engine.run(inputs)
            .then(results => {
                if (results.events[ 0 ] != undefined) {
                    setTs(prevState => ({
                        ...prevState,
                        [ inputs.language ]: parseFloat(results.events[ 0 ][ 'type' ])
                    }))
                }
            })
    };
    const processSuggestionMemory = (inputs, decisions) => {
        const engine = new Engine(decisions);

        engine.run(inputs)
            .then(results => {
                if (results.events[ 0 ] != undefined) {
                    setMs(prevState => ({
                        ...prevState,
                        [ inputs.language ]: parseFloat(results.events[ 0 ][ 'type' ])
                    }))
                }
            })
    };

    const processEnergy = (inputs, decisions) => {
        const engine = new Engine(decisions);

        engine.run(inputs)
            .then(results => {
                if (results.events[ 0 ] != undefined) {
                    e[ inputs.language ] = parseFloat(results.events[ 0 ][ 'type' ]);
                }
            })
    };
    const processTime = (inputs, decisions) => {
        const engine = new Engine(decisions);

        engine.run(inputs)
            .then(results => {
                if (results.events[ 0 ] != undefined) {
                    t[ inputs.language ] = parseFloat(results.events[ 0 ][ 'type' ]);
                }
            })
    };
    const processMemory = (inputs, decisions) => {
        const engine = new Engine(decisions);

        engine.run(inputs)
            .then(results => {
                if (results.events[ 0 ] != undefined) {
                    m[ inputs.language ] = parseFloat(results.events[ 0 ][ 'type' ]);
                }
            })
    };

    const calcPercentandTotal = async () => {
        let totalE = 0
        let totalT = 0
        let totalM = 0
        Object.keys(project.languages_used).forEach((key) => {
            if (e[ key.toLowerCase() ] != undefined && t[ key.toLowerCase() ] != undefined & m[ key.toLowerCase() ] != undefined) {
                e[ key.toLowerCase().concat('Percent') ] = (e[ key.toLowerCase() ] * project.languages_used[ key ] / 100.0).toFixed(2)
                t[ key.toLowerCase().concat('Percent') ] = (t[ key.toLowerCase() ] * project.languages_used[ key ] / 100.0).toFixed(2)
                m[ key.toLowerCase().concat('Percent') ] = (m[ key.toLowerCase() ] * project.languages_used[ key ] / 100.0).toFixed(2)
                totalE += parseFloat(e[ key.toLowerCase().concat('Percent') ])
                totalT += parseFloat(t[ key.toLowerCase().concat('Percent') ])
                totalM += parseFloat(m[ key.toLowerCase().concat('Percent') ])
            }
        })
        e[ 'total' ] = totalE
        t[ 'total' ] = totalT
        m[ 'total' ] = totalM
        cf = (e[ 'total' ] + t[ 'total' ] + m[ 'total' ]) / 100

        // check languages_used and domain and create a new object of newly suggested languages using Suggestion.json
        let newSuggestions = {}
        Object.keys(project.languages_used).forEach((key) => {
            if (Suggestion[ key.toLowerCase() ]) {
                Object.keys(Suggestion[ key.toLowerCase() ]).forEach((key2) => {
                    if (project.domain.toString().trim() == key2.toString().trim()) {
                        newSuggestions[ key.toLowerCase() ] = Suggestion[ key.toLowerCase() ][ key2 ]
                    }
                })
            }
        })
        Object.keys(newSuggestions).forEach((key) => {
            processSuggestionEnergy({ language: newSuggestions[ key ] }, Energy.decisions)
            processSuggestionTime({ language: newSuggestions[ key ] }, Time.decisions)
            processSuggestionMemory({ language: newSuggestions[ key ] }, Memory.decisions)
        })

        setSuggestions(newSuggestions);
        updateProjectByGithub(project.github, {
            energy: e,
            time: t,
            memory: m,
            carbon_footprint: cf,
            suggestions: newSuggestions,
        })
    }

    const handleSubmission = () => {
        let totalE = 0
        let totalT = 0
        let totalM = 0
        Object.keys(suggestions).forEach((key) => {
            console.log("Hello1", suggestions)
            console.log("Hello2", es[ 'go' ]);
            es[ suggestions[ key ].concat('Percent') ] = (es[ suggestions[ key ] ] * project.languages_used[ key ] / 100.0).toFixed(2)
            ts[ suggestions[ key ].concat('Percent') ] = (ts[ suggestions[ key ] ] * project.languages_used[ key ] / 100.0).toFixed(2)
            ms[ suggestions[ key ].concat('Percent') ] = (ms[ suggestions[ key ] ] * project.languages_used[ key ] / 100.0).toFixed(2)
            totalE += parseFloat(es[ suggestions[ key ].concat('Percent') ])
            totalT += parseFloat(ts[ suggestions[ key ].concat('Percent') ])
            totalM += parseFloat(ms[ suggestions[ key ].concat('Percent') ])
            console.log("Energy", es, totalE)
            console.log("Time", ts, totalT)
            console.log("Memory", ms, totalM)
        })
        es[ 'total' ] = totalE
        ts[ 'total' ] = totalT
        ms[ 'total' ] = totalM
        cfs = (es[ 'total' ] + ts[ 'total' ] + ms[ 'total' ]) / 100

        updateProjectByGithub(project.github, {
            suggestion_energy: es,
            suggestion_time: ts,
            suggestion_memory: ms,
            suggestion_carbon_footprint: cfs
        })

    }




    useEffect(() => {
        Object.keys(project?.language_lines).forEach((key) => {
            processEnergy({ language: key.toLowerCase() }, Energy.decisions)
            processTime({ language: key.toLowerCase() }, Time.decisions)
            processMemory({ language: key.toLowerCase() }, Memory.decisions)
        })

    }, [])

    // design an great ui in chakra ui to showcase all the analysis from database
    return <ProjectShell>
        <Card>
            <CardHeader>
                <Heading size='md'>Project Analysis</Heading>
            </CardHeader>

            <CardBody>
                <Stack divider={<StackDivider />} spacing='4'>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            {project.name}
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {project.desc}
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            GitHub Link
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            <Link>
                                {project.github}
                            </Link>
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Current Technologies
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {Object.keys(project.languages_used).map((key) => {
                                return <Tag key={key} size='md' colorScheme='green' mr='2'>{key}</Tag>
                            })}
                        </Text>
                    </Box>
                </Stack>
            </CardBody>
            <CardFooter>
                <Button backgroundColor="#99FFFE"
                    color="#194D4C"
                    fontWeight="medium" onClick={calcPercentandTotal}>Calculate</Button>
                <Button backgroundColor="#99FFFE" ml={2}
                    color="#194D4C"
                    fontWeight="medium" onClick={handleSubmission}>Suggest</Button>
            </CardFooter>
        </Card>
        {project?.energy && project?.time && project?.memory && <>
            <SimpleGrid spacing={4} mt={4} templateColumns='repeat(auto-fill, minmax(300px, 1fr))'>
                <Card>
                    <CardBody>
                        <Heading mb={2} size='md'>Current Energy Consumption</Heading>
                        <Text>{project?.energy.total || ''} unit</Text>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Heading mb={2} size='md'>Current Execution Time</Heading>
                        <Text>{project?.time.total || ' '} unit</Text>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Heading mb={2} size='md'>Current Memory Usage</Heading>
                        <Text>{project?.memory.total || ' '} unit</Text>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card mt={4}>
                <CardBody>
                    <Heading mb={2} size='sm'>Suggested Technologies</Heading>
                    <Text pt='2' fontSize='sm'>
                        {Object.keys(project.suggestions).map((key) => {

                            return <Tag key={key} size='md' colorScheme='green' mr='2'>{project.suggestions[ key ] || ""}</Tag>
                        })}
                    </Text>
                </CardBody>
            </Card>

            <SimpleGrid spacing={4} mt={4} templateColumns='repeat(auto-fill, minmax(300px, 1fr))'>
                <Card>
                    <CardBody>
                        <Heading mb={2} size='md'>Reduced Energy Consumption</Heading>
                        <Text>{project.suggestion_energy.total || ' '} unit</Text>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Heading mb={2} size='md'>Reduced Execution Time</Heading>
                        <Text>{project.suggestion_time.total || ' '} unit</Text>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <Heading mb={2} size='md'>Reduced Memory Usage</Heading>
                        <Text>{project.suggestion_memory.total || ' '} unit</Text>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Card mt={4}>
                <CardBody>
                    <Heading mb={4} size='sm'>Change in Carbon Emmission</Heading>

                    <StatGroup>
                        <Stat>
                            <StatLabel>Current Carbon Emmission</StatLabel>
                            <StatNumber>{project.carbon_footprint || ' '}</StatNumber>
                            <StatHelpText>
                                <StatArrow type="increase" />
                                0%
                            </StatHelpText>
                        </Stat>

                        <Stat>
                            <StatLabel>After Carbon Emmission</StatLabel>
                            <StatNumber>{project.suggestion_carbon_footprint}</StatNumber>
                            <StatHelpText>
                                <StatArrow type="decrease" />
                                {((project.suggestion_carbon_footprint - project.carbon_footprint) / project.carbon_footprint * 100) || 0}%
                            </StatHelpText>
                        </Stat>
                    </StatGroup>
                </CardBody>
            </Card>
            <Card align='center' mt={4}>
                <CardHeader>
                    <Heading size='md'> Visulization</Heading>
                </CardHeader>
                <CardBody>
                    <Text>Download the below csv and import to Power BI to visualize</Text>
                </CardBody>
                <CardFooter>
                    {/* link to analysis.xlsx file */}
                    <a href='/analysis.xlsx' download>
                        <Button backgroundColor="#99FFFE"
                            color="#194D4C"
                            fontWeight="medium">Download</Button>
                    </a>

                </CardFooter>
            </Card>

            <Card align='center' mt={4}>
                <CardHeader>
                    Power BI Embed
                </CardHeader>
                <CardBody>

                    <iframe width="800" height="600" src="https://app.powerbi.com/view?r=eyJrIjoiZjQwZjQ0ZjktZjQwZS00ZjQ0LWI2ZjUtZjY0ZjQ2ZjQ4ZjQ2IiwidCI6IjYwZjY0ZjQwLWY0ZjktNDQ2Zi1hZjQxLWY0ZjQ2ZjQ4ZjQ2MiJ9" frameborder="0" allowFullScreen="true"></iframe>
                </CardBody>
            </Card>
        </>
        }
    </ProjectShell >
}

export default AnalysisPage;