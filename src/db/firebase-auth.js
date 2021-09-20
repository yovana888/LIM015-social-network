/* ********LOG IN********* */
/* eslint no-undef: "off"*/
const loginEmail = (email, password) => firebase.auth().signInWithEmailAndPassword(email, password);

const loginGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
};

/**********REGISTER************/
const registerEmail = (email, password) => firebase.auth().createUserWithEmailAndPassword(email, password);

/**********RESET PASSWORD******/
const resetPassword = (emailLogin) => firebase.auth().sendPasswordResetEmail(emailLogin);

/**********SALIR***************/
const signOut = () => firebase.auth().signOut();


export { loginEmail, loginGoogle, resetPassword, registerEmail, signOut };