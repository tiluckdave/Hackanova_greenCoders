import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Engine } from 'json-rules-engine';
import { getAllProjects, getProjectById } from "@/lib/db-admin";
import { useEffect, useState } from "react";

import Energy from '../../public/Energy.json'
import Time from '../../public/Time.json'
import Memory from '../../public/Memory.json'
import Suggestion from '../../public/Suggestion.json'
import { updateProjectByGithub } from "@/lib/db";
import { set } from "date-fns";

export async function getStaticProps(context) {
    const projectId = context.params.projectId;
    const project = await getProjectById(projectId);
    return {
        props: {
            project: project
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

    return <Box display="flex" flexDirection="column" maxWidth="700px" width="full" margin="0 auto">
        <Box>{project.name}</Box>
        <Box>{project.github}</Box>
        <Box>{project.desc}</Box>
        <Box>{project.domain}</Box>
        <Box>{JSON.stringify(suggestions)}</Box>
        <Button onClick={calcPercentandTotal}>Calculate</Button>
        {/* check if es is empty  then only show below button */}
        <Button onClick={handleSubmission}>Submit</Button>
    </Box >
}

export default AnalysisPage;