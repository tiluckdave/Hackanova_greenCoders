import firebase from "@/lib/firebase";

const firestore = firebase.firestore();

export function createUser(uid, data) {
    return firestore
        .collection("users")
        .doc(uid)
        .set({ uid, ...data }, { merge: true });
}

export function createProject(data) {
    return firestore.collection('projects').add(data);
}

export function updateProject(id, data) {
    return firestore.collection('projects').doc(id).update(data);
}

export function updateProjectByGithub(github, data) {
    return firestore.collection('projects').where('github', '==', github).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            doc.ref.update(data);
        });
    });
}