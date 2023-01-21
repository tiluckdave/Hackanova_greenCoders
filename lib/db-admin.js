import firestore from "@/lib/firebase-admin";

export async function getAllProjects() {
    try {
        const snapshot = await firestore.collection("projects").get();
        const projects = []
        snapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() })
        })
        return { projects }
    } catch (error) {
        return { error }
    }
}

// get specific project
export async function getProjectById(id) {
    try {
        const project = await firestore.collection("projects").doc(id).get();
        return project.data();
    } catch (error) {
        return { error }
    }
}
